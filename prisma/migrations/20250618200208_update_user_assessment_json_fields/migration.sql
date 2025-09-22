/*
  Warnings:

  - You are about to alter the column `answers` on the `user_assessments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `detailedResults` on the `user_assessments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `user_assessments` MODIFY `answers` JSON NULL,
    MODIFY `detailedResults` JSON NULL;
