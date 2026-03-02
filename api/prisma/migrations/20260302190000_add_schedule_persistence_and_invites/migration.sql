-- CreateEnum
CREATE TYPE "ScheduleCoverageMode" AS ENUM ('FULL_DAY', 'CUSTOM_WINDOW');

-- CreateEnum
CREATE TYPE "ProfessionalInviteStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- AlterTable
ALTER TABLE "schedules"
ADD COLUMN "coverageMode" "ScheduleCoverageMode" NOT NULL DEFAULT 'FULL_DAY',
ADD COLUMN "coverageStartTime" TEXT,
ADD COLUMN "coverageEndTime" TEXT,
ADD COLUMN "shiftDurationHours" INTEGER,
ADD COLUMN "professionalsPerShift" INTEGER,
ADD COLUMN "shiftValue" INTEGER NOT NULL DEFAULT 140000,
ADD COLUMN "requireSwapApproval" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "geofenceLat" DOUBLE PRECISION,
ADD COLUMN "geofenceLng" DOUBLE PRECISION,
ADD COLUMN "geofenceRadiusMeters" INTEGER,
ADD COLUMN "geofenceAutoCheckInEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "geofenceLabel" TEXT;

-- CreateTable
CREATE TABLE "professional_invites" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sectorName" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "status" "ProfessionalInviteStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" DATE NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" TEXT,
    "usedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_invites_code_key" ON "professional_invites"("code");

-- CreateIndex
CREATE INDEX "professional_invites_organizationId_status_idx" ON "professional_invites"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "professional_invites" ADD CONSTRAINT "professional_invites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
