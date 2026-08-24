/*
  Warnings:

  - You are about to drop the column `batteryVoltage` on the `DeviceState` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `DeviceState` table. All the data in the column will be lost.
  - You are about to drop the column `odometer` on the `DeviceState` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChirpstackApplication" ADD COLUMN     "TotalDeviceCount" INTEGER;

-- AlterTable
ALTER TABLE "DeviceState" DROP COLUMN "batteryVoltage",
DROP COLUMN "error",
DROP COLUMN "odometer",
ADD COLUMN     "gatewayId" TEXT;

-- AlterTable
ALTER TABLE "RobotData" ADD COLUMN     "error" TEXT;

-- CreateTable
CREATE TABLE "GatewayState" (
    "id" SERIAL NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "gatewayName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isOnline" BOOLEAN NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GatewayState_pkey" PRIMARY KEY ("id")
);
