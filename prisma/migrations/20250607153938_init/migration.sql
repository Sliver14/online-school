/*
  Warnings:

  - You are about to drop the column `endTime` on the `examination` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `examination` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `examination` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `passed` on the `userassessment` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `userassessment` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentPassed` on the `userprogress` table. All the data in the column will be lost.
  - You are about to drop the column `videoWatched` on the `userprogress` table. All the data in the column will be lost.
  - You are about to drop the `examinationquestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,assessmentId]` on the table `UserAssessment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questions` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `examinationquestion` DROP FOREIGN KEY `ExaminationQuestion_examinationId_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_assessmentId_fkey`;

-- AlterTable
ALTER TABLE `assessment` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `questions` JSON NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `course` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `posterUrl` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `duration` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `examination` DROP COLUMN `endTime`,
    DROP COLUMN `startTime`,
    DROP COLUMN `status`,
    ADD COLUMN `completed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `score` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `progress`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `userassessment` DROP COLUMN `passed`,
    DROP COLUMN `submittedAt`,
    ADD COLUMN `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `score` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `userprogress` DROP COLUMN `assessmentPassed`,
    DROP COLUMN `videoWatched`,
    ADD COLUMN `completed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `examinationquestion`;

-- DropTable
DROP TABLE `question`;

-- CreateIndex
CREATE UNIQUE INDEX `UserAssessment_userId_assessmentId_key` ON `UserAssessment`(`userId`, `assessmentId`);
