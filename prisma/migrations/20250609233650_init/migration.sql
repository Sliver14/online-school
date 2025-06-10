/*
  Warnings:

  - Added the required column `classNumber` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoPosterUrl` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `video` ADD COLUMN `classNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `videoPosterUrl` VARCHAR(191) NOT NULL;
