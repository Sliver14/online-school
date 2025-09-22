/*
  Warnings:

  - You are about to drop the `assessment_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assessment_scores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assessments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enrollments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examination_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examination_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examinations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `assessment_questions` DROP FOREIGN KEY `assessment_questions_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `assessment_scores` DROP FOREIGN KEY `assessment_scores_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `assessment_scores` DROP FOREIGN KEY `assessment_scores_userId_fkey`;

-- DropForeignKey
ALTER TABLE `assessments` DROP FOREIGN KEY `assessments_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_userId_fkey`;

-- DropForeignKey
ALTER TABLE `examination_attempts` DROP FOREIGN KEY `examination_attempts_examinationId_fkey`;

-- DropForeignKey
ALTER TABLE `examination_attempts` DROP FOREIGN KEY `examination_attempts_userId_fkey`;

-- DropForeignKey
ALTER TABLE `examination_questions` DROP FOREIGN KEY `examination_questions_examinationId_fkey`;

-- DropForeignKey
ALTER TABLE `video_progress` DROP FOREIGN KEY `video_progress_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `video_progress` DROP FOREIGN KEY `video_progress_userId_fkey`;

-- DropTable
DROP TABLE `assessment_questions`;

-- DropTable
DROP TABLE `assessment_scores`;

-- DropTable
DROP TABLE `assessments`;

-- DropTable
DROP TABLE `courses`;

-- DropTable
DROP TABLE `enrollments`;

-- DropTable
DROP TABLE `examination_attempts`;

-- DropTable
DROP TABLE `examination_questions`;

-- DropTable
DROP TABLE `examinations`;

-- DropTable
DROP TABLE `users`;

-- DropTable
DROP TABLE `video_progress`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `progress` JSON NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `videoUrl` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessmentId` INTEGER NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `correct` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Examination` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `score` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExaminationQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `examinationId` INTEGER NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `correct` INTEGER NOT NULL,
    `userAnswer` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Examination` ADD CONSTRAINT `Examination_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExaminationQuestion` ADD CONSTRAINT `ExaminationQuestion_examinationId_fkey` FOREIGN KEY (`examinationId`) REFERENCES `Examination`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
