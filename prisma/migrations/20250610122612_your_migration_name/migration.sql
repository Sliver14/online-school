/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `church` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `verificationCode` VARCHAR(191) NULL,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `zone` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;
