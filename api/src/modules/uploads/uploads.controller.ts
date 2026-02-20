import {
    Controller,
    Post,
    Delete,
    Param,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Req,
    BadRequestException,
    Get,
    Query,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { StorageService, StorageFolder } from '../storage/storage.service'
import { PrismaService } from '../../prisma/prisma.service'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
]
const ALLOWED_DOC_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
]

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
    constructor(
        private readonly storage: StorageService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Upload user avatar
     * POST /uploads/avatar
     */
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo enviado')
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                'Formato não suportado. Use JPEG, PNG ou WebP.',
            )
        }

        if (file.size > MAX_AVATAR_SIZE) {
            throw new BadRequestException('Imagem muito grande. Máximo: 2MB.')
        }

        const userId = req.user.id
        const organizationId = req.user.organizationId

        // Upload to S3
        const result = await this.storage.uploadAvatar(
            userId,
            file.buffer,
            file.mimetype,
            organizationId,
        )

        // Update user record with new avatar URL
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: result.url },
        })

        return {
            message: 'Avatar atualizado com sucesso',
            url: result.url,
            key: result.key,
        }
    }

    /**
     * Upload organization logo
     * POST /uploads/org-logo
     */
    @Post('org-logo')
    @UseInterceptors(FileInterceptor('file'))
    async uploadOrgLogo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo enviado')
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                'Formato não suportado. Use JPEG, PNG ou WebP.',
            )
        }

        if (file.size > MAX_AVATAR_SIZE) {
            throw new BadRequestException('Imagem muito grande. Máximo: 2MB.')
        }

        const organizationId = req.user.organizationId

        // Only admins/managers can upload org logo
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            throw new BadRequestException('Sem permissão para alterar o logo.')
        }

        const result = await this.storage.uploadOrgLogo(
            organizationId,
            file.buffer,
            file.mimetype,
        )

        // Update organization record
        await this.prisma.organization.update({
            where: { id: organizationId },
            data: { logoUrl: result.url },
        })

        return {
            message: 'Logo atualizado com sucesso',
            url: result.url,
            key: result.key,
        }
    }

    /**
     * Upload a document
     * POST /uploads/document
     */
    @Post('document')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo enviado')
        }

        if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                'Formato não suportado. Use JPEG, PNG, WebP, PDF, XLSX ou CSV.',
            )
        }

        if (file.size > MAX_DOCUMENT_SIZE) {
            throw new BadRequestException('Arquivo muito grande. Máximo: 10MB.')
        }

        const userId = req.user.id
        const organizationId = req.user.organizationId
        const timestamp = Date.now()
        const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${organizationId}/${userId}/${timestamp}-${safeFileName}`

        const result = await this.storage.upload(
            StorageFolder.DOCUMENTS,
            fileName,
            file.buffer,
            file.mimetype,
            { userId, organizationId, originalName: file.originalname },
        )

        return {
            message: 'Documento enviado com sucesso',
            url: result.url,
            key: result.key,
        }
    }

    /**
     * Get a pre-signed URL for secure download (LGPD: time-limited access)
     * GET /uploads/presigned?key=avatars/user123.jpg
     */
    @Get('presigned')
    async getPresignedUrl(@Query('key') key: string, @Req() req: any) {
        if (!key) {
            throw new BadRequestException('Key é obrigatória')
        }

        const url = await this.storage.getPresignedUrl(key, { expiresIn: 3600 })

        return { url, expiresIn: 3600 }
    }

    /**
     * Delete a file
     * DELETE /uploads/:key
     */
    @Delete(':key(*)')
    async deleteFile(@Param('key') key: string, @Req() req: any) {
        // Only allow users to delete their own files or admins
        if (req.user.role !== 'ADMIN' && !key.includes(req.user.id)) {
            throw new BadRequestException('Sem permissão para deletar este arquivo.')
        }

        await this.storage.delete(key)

        return { message: 'Arquivo deletado com sucesso' }
    }

    /**
     * LGPD: Delete all user data from storage
     * DELETE /uploads/lgpd/user/:userId
     */
    @Delete('lgpd/user/:userId')
    async deleteUserData(@Param('userId') userId: string, @Req() req: any) {
        // Only the user themselves or an admin can request data deletion
        if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
            throw new BadRequestException('Sem permissão.')
        }

        const deletedCount = await this.storage.deleteAllUserData(userId)

        return {
            message: `${deletedCount} arquivo(s) deletado(s) conforme LGPD`,
            deletedCount,
        }
    }

    /**
     * Health check for storage service
     * GET /uploads/health
     */
    @Get('health')
    async healthCheck() {
        return this.storage.healthCheck()
    }
}
