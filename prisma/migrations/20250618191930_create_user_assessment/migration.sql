/*
  Warnings:

  - You are about to drop the `userassessment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `userassessment` DROP FOREIGN KEY `UserAssessment_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `userassessment` DROP FOREIGN KEY `UserAssessment_userId_fkey`;

-- DropTable
DROP TABLE `userassessment`;

-- CreateTable
CREATE TABLE `user_assessments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `assessmentId` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `isPassed` BOOLEAN NOT NULL DEFAULT false,
    `answers` VARCHAR(191) NULL,
    `detailedResults` VARCHAR(191) NULL,
    `attemptCount` INTEGER NOT NULL DEFAULT 1,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_assessments_userId_assessmentId_key`(`userId`, `assessmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_assessments` ADD CONSTRAINT `user_assessments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_assessments` ADD CONSTRAINT `user_assessments_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
