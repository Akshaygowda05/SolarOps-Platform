/*
  Warnings:

  - Made the column `chirpstackAppId` on table `ChirpstackApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chirpstackTenantId` on table `ChirpstackTenant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "SchedularData_jobType_time_idx";

-- AlterTable
ALTER TABLE "ChirpstackApplication" ALTER COLUMN "chirpstackAppId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ChirpstackTenant" ALTER COLUMN "chirpstackTenantId" SET NOT NULL;
