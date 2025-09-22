/*
  Warnings:

  - You are about to drop the column `courseId` on the `assessment` table. All the data in the column will be lost.
  - You are about to drop the column `questions` on the `assessment` table. All the data in the column will be lost.
  - You are about to alter the column `score` on the `userassessment` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `completed` on the `userprogress` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `userprogress` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `userprogress` table. All the data in the column will be lost.
  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examination` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `classId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `assessment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoId` to the `UserProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assessment` DROP FOREIGN KEY `Assessment_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `examination` DROP FOREIGN KEY `Examination_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userassessment` DROP FOREIGN KEY `UserAssessment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userprogress` DROP FOREIGN KEY `UserProgress_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `userprogress` DROP FOREIGN KEY `UserProgress_userId_fkey`;

-- DropIndex
DROP INDEX `Assessment_courseId_fkey` ON `assessment`;

-- DropIndex
DROP INDEX `UserAssessment_userId_assessmentId_key` ON `userassessment`;

-- DropIndex
DROP INDEX `UserProgress_courseId_fkey` ON `userprogress`;

-- DropIndex
DROP INDEX `UserProgress_userId_courseId_key` ON `userprogress`;

-- AlterTable
ALTER TABLE `assessment` DROP COLUMN `courseId`,
    DROP COLUMN `questions`,
    ADD COLUMN `classId` INTEGER NOT NULL,
    MODIFY `title` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `userassessment` MODIFY `score` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `userprogress` DROP COLUMN `completed`,
    DROP COLUMN `courseId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `videoId` INTEGER NOT NULL,
    ADD COLUMN `watchedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `course`;

-- DropTable
DROP TABLE `examination`;

-- CreateTable
CREATE TABLE `Class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `videoUrl` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessmentId` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `correctAnswer` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `examId` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `correctAnswer` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserExam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `examId` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `takenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAssessment` ADD CONSTRAINT `UserAssessment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamQuestion` ADD CONSTRAINT `ExamQuestion_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserExam` ADD CONSTRAINT `UserExam_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserExam` ADD CONSTRAINT `UserExam_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
