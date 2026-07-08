/*
  Warnings:

  - You are about to drop the `Runningata` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACTIVE', 'NONE');

-- AlterTable
ALTER TABLE "ChirpstackApplication" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'NONE';

-- DropTable
DROP TABLE "Runningata";

-- CreateTable
CREATE TABLE "RunningData" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "autoCount" INTEGER NOT NULL DEFAULT 0,
    "manualCount" INTEGER NOT NULL DEFAULT 0,
    "TotalmanualCount" INTEGER NOT NULL DEFAULT 0,
    "TotalautoCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunningData_pkey" PRIMARY KEY ("id")
);
