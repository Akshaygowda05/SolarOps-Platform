-- CreateTable
CREATE TABLE "DeviceState" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3),
    "batteryVoltage" TEXT,
    "error" TEXT,
    "odometer" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceState_deviceId_key" ON "DeviceState"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceState_applicationId_idx" ON "DeviceState"("applicationId");

-- CreateIndex
CREATE INDEX "DeviceState_tenantId_idx" ON "DeviceState"("tenantId");
