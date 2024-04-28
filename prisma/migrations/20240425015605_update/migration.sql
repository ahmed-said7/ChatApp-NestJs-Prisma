/*
  Warnings:

  - You are about to drop the column `authorId` on the `conversation` table. All the data in the column will be lost.
  - You are about to drop the `_conversationTouser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorId` to the `conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_conversationTouser" DROP CONSTRAINT "_conversationTouser_A_fkey";

-- DropForeignKey
ALTER TABLE "_conversationTouser" DROP CONSTRAINT "_conversationTouser_B_fkey";

-- DropForeignKey
ALTER TABLE "conversation" DROP CONSTRAINT "conversation_authorId_fkey";

-- AlterTable
ALTER TABLE "conversation" DROP COLUMN "authorId",
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "lastmessageId" INTEGER,
ADD COLUMN     "recipientId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_conversationTouser";

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "sid" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Sessions" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
