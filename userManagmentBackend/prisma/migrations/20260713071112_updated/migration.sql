-- AddForeignKey
ALTER TABLE "RobotData" ADD CONSTRAINT "RobotData_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceState" ADD CONSTRAINT "DeviceState_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackId") ON DELETE RESTRICT ON UPDATE CASCADE;
