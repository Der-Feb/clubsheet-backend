/*
  Warnings:

  - Added the required column `message` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "createdBy" TEXT DEFAULT 'system',
ADD COLUMN     "message" TEXT NOT NULL;
