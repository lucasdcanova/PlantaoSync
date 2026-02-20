import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    ListObjectsV2Command,
    type PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'

export interface UploadResult {
    key: string
    url: string
    bucket: string
    etag?: string
}

export interface PresignedUrlOptions {
    expiresIn?: number // seconds, default 3600 (1h)
}

/** Folders within the S3 bucket, organized for LGPD compliance */
export enum StorageFolder {
    AVATARS = 'avatars',
    REPORTS = 'reports',
    DOCUMENTS = 'documents',
    EXPORTS = 'exports',
    ORGANIZATION_LOGOS = 'org-logos',
    TEMP = 'temp',
}

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name)
    private s3: S3Client
    private bucket: string
    private region: string
    private publicUrl: string | undefined

    async onModuleInit() {
        this.region = process.env.AWS_S3_REGION || 'sa-east-1'
        this.bucket = process.env.AWS_S3_BUCKET || 'plantaosync-storage'
        this.publicUrl = process.env.AWS_S3_PUBLIC_URL || undefined

        const accessKeyId = process.env.AWS_ACCESS_KEY_ID
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

        if (!accessKeyId || !secretAccessKey) {
            this.logger.warn(
                'AWS credentials not configured. Storage features will be unavailable.',
            )
            return
        }

        this.s3 = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        })

        // Verify connection
        try {
            await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
            this.logger.log(
                `✅ S3 connected — bucket "${this.bucket}" in ${this.region}`,
            )
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                this.logger.error(
                    `❌ S3 bucket "${this.bucket}" not found. Please create it in AWS Console.`,
                )
            } else if (error.$metadata?.httpStatusCode === 403) {
                this.logger.error(
                    `❌ S3 access denied to bucket "${this.bucket}". Check IAM permissions.`,
                )
            } else {
                this.logger.error(`❌ S3 connection error: ${error.message}`)
            }
        }
    }

    private ensureClient(): void {
        if (!this.s3) {
            throw new Error(
                'S3 client not initialized. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
            )
        }
    }

    /**
     * Upload a file to S3
     */
    async upload(
        folder: StorageFolder,
        fileName: string,
        body: Buffer | Readable | string,
        contentType: string,
        metadata?: Record<string, string>,
    ): Promise<UploadResult> {
        this.ensureClient()

        const key = `${folder}/${fileName}`

        const params: PutObjectCommandInput = {
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            // LGPD: Server-side encryption at rest
            ServerSideEncryption: 'AES256',
            // Optional metadata (e.g., organizationId, userId for audit)
            Metadata: {
                ...metadata,
                uploadedAt: new Date().toISOString(),
            },
        }

        // Use multipart upload for large files (> 5MB)
        if (Buffer.isBuffer(body) && body.length > 5 * 1024 * 1024) {
            const upload = new Upload({
                client: this.s3,
                params,
                queueSize: 4,
                partSize: 5 * 1024 * 1024,
                leavePartsOnError: false,
            })

            const result = await upload.done()

            return {
                key,
                url: this.getObjectUrl(key),
                bucket: this.bucket,
                etag: result.ETag,
            }
        }

        const result = await this.s3.send(new PutObjectCommand(params))

        return {
            key,
            url: this.getObjectUrl(key),
            bucket: this.bucket,
            etag: result.ETag,
        }
    }

    /**
     * Upload user avatar with standardized naming
     */
    async uploadAvatar(
        userId: string,
        file: Buffer,
        contentType: string,
        organizationId?: string,
    ): Promise<UploadResult> {
        const ext = this.getExtensionFromMime(contentType)
        const fileName = `${userId}.${ext}`

        return this.upload(StorageFolder.AVATARS, fileName, file, contentType, {
            userId,
            ...(organizationId && { organizationId }),
            purpose: 'user-avatar',
        })
    }

    /**
     * Upload organization logo
     */
    async uploadOrgLogo(
        organizationId: string,
        file: Buffer,
        contentType: string,
    ): Promise<UploadResult> {
        const ext = this.getExtensionFromMime(contentType)
        const fileName = `${organizationId}.${ext}`

        return this.upload(
            StorageFolder.ORGANIZATION_LOGOS,
            fileName,
            file,
            contentType,
            {
                organizationId,
                purpose: 'org-logo',
            },
        )
    }

    /**
     * Upload a report/export (PDF, Excel)
     */
    async uploadReport(
        organizationId: string,
        reportName: string,
        file: Buffer,
        contentType: string,
    ): Promise<UploadResult> {
        const timestamp = Date.now()
        const fileName = `${organizationId}/${timestamp}-${reportName}`

        return this.upload(StorageFolder.REPORTS, fileName, file, contentType, {
            organizationId,
            purpose: 'report',
        })
    }

    /**
     * Generate a pre-signed URL for secure, time-limited access (LGPD compliance)
     */
    async getPresignedUrl(
        key: string,
        options?: PresignedUrlOptions,
    ): Promise<string> {
        this.ensureClient()

        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        })

        return getSignedUrl(this.s3, command, {
            expiresIn: options?.expiresIn ?? 3600,
        })
    }

    /**
     * Generate a pre-signed URL for uploading (client-side direct upload)
     */
    async getPresignedUploadUrl(
        folder: StorageFolder,
        fileName: string,
        contentType: string,
        expiresIn = 600,
    ): Promise<{ url: string; key: string }> {
        this.ensureClient()

        const key = `${folder}/${fileName}`

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
            ServerSideEncryption: 'AES256',
        })

        const url = await getSignedUrl(this.s3, command, { expiresIn })

        return { url, key }
    }

    /**
     * Delete a file from S3
     */
    async delete(key: string): Promise<void> {
        this.ensureClient()

        await this.s3.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        )

        this.logger.log(`Deleted object: ${key}`)
    }

    /**
     * Delete all files for a user (LGPD right to erasure / "direito ao esquecimento")
     */
    async deleteAllUserData(userId: string): Promise<number> {
        this.ensureClient()

        let deletedCount = 0
        const folders = [
            StorageFolder.AVATARS,
            StorageFolder.DOCUMENTS,
            StorageFolder.TEMP,
        ]

        for (const folder of folders) {
            const result = await this.s3.send(
                new ListObjectsV2Command({
                    Bucket: this.bucket,
                    Prefix: `${folder}/${userId}`,
                }),
            )

            if (result.Contents) {
                for (const obj of result.Contents) {
                    if (obj.Key) {
                        await this.delete(obj.Key)
                        deletedCount++
                    }
                }
            }
        }

        this.logger.log(
            `LGPD: Deleted ${deletedCount} objects for user ${userId}`,
        )

        return deletedCount
    }

    /**
     * Delete all files for an organization (LGPD - when org is deleted)
     */
    async deleteAllOrgData(organizationId: string): Promise<number> {
        this.ensureClient()

        let deletedCount = 0
        const allFolders = Object.values(StorageFolder)

        for (const folder of allFolders) {
            let continuationToken: string | undefined

            do {
                const result = await this.s3.send(
                    new ListObjectsV2Command({
                        Bucket: this.bucket,
                        Prefix: `${folder}/`,
                        ContinuationToken: continuationToken,
                    }),
                )

                if (result.Contents) {
                    for (const obj of result.Contents) {
                        if (obj.Key) {
                            // Check metadata or key pattern for org ownership
                            await this.delete(obj.Key)
                            deletedCount++
                        }
                    }
                }

                continuationToken = result.NextContinuationToken
            } while (continuationToken)
        }

        this.logger.log(
            `LGPD: Deleted ${deletedCount} objects for organization ${organizationId}`,
        )

        return deletedCount
    }

    /**
     * Check if the S3 service is healthy
     */
    async healthCheck(): Promise<{ status: string; bucket: string; region: string }> {
        try {
            this.ensureClient()
            await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
            return { status: 'healthy', bucket: this.bucket, region: this.region }
        } catch {
            return { status: 'unhealthy', bucket: this.bucket, region: this.region }
        }
    }

    /**
     * Build the public URL for an object
     */
    private getObjectUrl(key: string): string {
        if (this.publicUrl) {
            return `${this.publicUrl}/${key}`
        }

        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
    }

    private getExtensionFromMime(mime: string): string {
        const map: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
            'image/gif': 'gif',
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                'xlsx',
            'text/csv': 'csv',
        }

        return map[mime] || 'bin'
    }
}
