/*
  Warnings:

  - You are about to drop the column `lastmessageId` on the `conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conversation" DROP COLUMN "lastmessageId";
