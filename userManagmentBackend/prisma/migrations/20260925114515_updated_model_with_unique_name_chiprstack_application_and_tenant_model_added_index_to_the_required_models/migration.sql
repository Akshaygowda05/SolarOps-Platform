/*
  Warnings:

  - You are about to drop the column `chirpstackId` on the `ChirpstackApplication` table. All the data in the column will be lost.
  - You are about to drop the column `chirpstackId` on the `ChirpstackTenant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chirpstackAppId]` on the table `ChirpstackApplication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chirpstackTenantId]` on the table `ChirpstackTenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERADMIN';

-- DropForeignKey
ALTER TABLE "ChirpstackApplication" DROP CONSTRAINT "ChirpstackApplication_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceState" DROP CONSTRAINT "DeviceState_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "RobotData" DROP CONSTRAINT "RobotData_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "SchedularData" DROP CONSTRAINT "SchedularData_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "SiteConfiguration" DROP CONSTRAINT "SiteConfiguration_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_applicationId_fkey";

-- DropIndex
DROP INDEX "ChirpstackApplication_chirpstackId_key";

-- DropIndex
DROP INDEX "ChirpstackTenant_chirpstackId_key";

-- AlterTable
ALTER TABLE "ChirpstackApplication" DROP COLUMN "chirpstackId",
ADD COLUMN     "chirpstackAppId" TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ChirpstackTenant" DROP COLUMN "chirpstackId",
ADD COLUMN     "chirpstackTenantId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tenantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChirpstackApplication_chirpstackAppId_key" ON "ChirpstackApplication"("chirpstackAppId");

-- CreateIndex
CREATE UNIQUE INDEX "ChirpstackTenant_chirpstackTenantId_key" ON "ChirpstackTenant"("chirpstackTenantId");

-- CreateIndex
CREATE INDEX "SchedularData_jobType_time_idx" ON "SchedularData"("jobType", "time");

-- CreateIndex
CREATE INDEX "User_tenantId_createdAt_idx" ON "User"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "User_applicationId_createdAt_idx" ON "User"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "RobotData" ADD CONSTRAINT "RobotData_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackAppId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceState" ADD CONSTRAINT "DeviceState_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackAppId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackAppId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "ChirpstackTenant"("chirpstackTenantId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChirpstackApplication" ADD CONSTRAINT "ChirpstackApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "ChirpstackTenant"("chirpstackTenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteConfiguration" ADD CONSTRAINT "SiteConfiguration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackAppId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedularData" ADD CONSTRAINT "SchedularData_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackAppId") ON DELETE CASCADE ON UPDATE CASCADE;
