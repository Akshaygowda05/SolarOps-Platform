/*
  Warnings:

  - Made the column `applicationId` on table `ChatMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "applicationId" SET NOT NULL;
