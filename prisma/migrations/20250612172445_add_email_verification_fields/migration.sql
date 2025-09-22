-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastVerificationSent` DATETIME(3) NULL,
    ADD COLUMN `verificationTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL;
