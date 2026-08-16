/*
  Warnings:

  - You are about to alter the column `code` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `name` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `description` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterEnum
ALTER TYPE "ENAuditCategory" ADD VALUE 'MEMBERSHIP';

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "club_id" TEXT,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(100);

ALTER TABLE "roles" 
  ADD CONSTRAINT "code_min_length" CHECK (char_length("code") >= 3),
  ADD CONSTRAINT "name_min_length" CHECK (char_length("name") >= 3),
  ADD CONSTRAINT "description_min_length" CHECK (char_length("description") >= 3);