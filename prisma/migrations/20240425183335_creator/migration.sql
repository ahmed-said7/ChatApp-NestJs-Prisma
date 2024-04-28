/*
  Warnings:

  - You are about to drop the column `recipientId` on the `message` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_recipientId_fkey";

-- AlterTable
ALTER TABLE "message" DROP COLUMN "recipientId",
ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
