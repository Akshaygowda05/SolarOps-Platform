/*
  Warnings:

  - The `triggeringAction` column on the `SiteConfiguration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `time` on the `SchedularData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Blocktriggering" AS ENUM ('UNICAST', 'MULTICAST', 'BOTH');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('DAILY', 'ONE_TIME');

-- AlterTable
ALTER TABLE "SchedularData" ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'ONE_TIME',
DROP COLUMN "time",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SiteConfiguration" ADD COLUMN     "gatewayId" TEXT[],
DROP COLUMN "triggeringAction",
ADD COLUMN     "triggeringAction" "Blocktriggering" NOT NULL DEFAULT 'UNICAST';

-- DropEnum
DROP TYPE "blocktriggering";
