-- AlterTable
ALTER TABLE "ChirpstackApplication" ADD COLUMN     "maxUserCount" INTEGER DEFAULT 2;

-- AlterTable
ALTER TABLE "ChirpstackTenant" ADD COLUMN     "maxUserCount" INTEGER DEFAULT 2;

-- AddForeignKey
ALTER TABLE "RobotData" ADD CONSTRAINT "RobotData_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackAppId") ON DELETE RESTRICT ON UPDATE CASCADE;
