/*
  Warnings:

  - A unique constraint covering the columns `[gatewayId]` on the table `GatewayState` will be added. If there are existing duplicate values, this will fail.
  - Made the column `gatewayId` on table `GatewayState` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GatewayState" ALTER COLUMN "gatewayId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GatewayState_gatewayId_key" ON "GatewayState"("gatewayId");
