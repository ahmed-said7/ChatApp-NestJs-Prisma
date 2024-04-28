/*
  Warnings:

  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_creatorId_fkey";

-- DropTable
DROP TABLE "message";

-- CreateTable
CREATE TABLE "group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groupMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversationMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_groupTouser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_groupTouser_AB_unique" ON "_groupTouser"("A", "B");

-- CreateIndex
CREATE INDEX "_groupTouser_B_index" ON "_groupTouser"("B");

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupMessage" ADD CONSTRAINT "groupMessage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupMessage" ADD CONSTRAINT "groupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversationMessage" ADD CONSTRAINT "conversationMessage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversationMessage" ADD CONSTRAINT "conversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_groupTouser" ADD CONSTRAINT "_groupTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_groupTouser" ADD CONSTRAINT "_groupTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
