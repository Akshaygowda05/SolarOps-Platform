/*
  Warnings:

  - You are about to drop the column `userId` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "userId",
ADD COLUMN     "applicationId" TEXT;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackId") ON DELETE CASCADE ON UPDATE CASCADE;
