/*
  Warnings:

  - The values [UPDATE] on the enum `ENPermissionAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ENUserTokenStatus" AS ENUM ('PENDING', 'DISRUPTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ENPermissionAction_new" AS ENUM ('CREATE', 'READ', 'WRITE', 'DELETE', 'APPROVE', 'EXPORT', 'ASSIGN');
ALTER TABLE "permissions" ALTER COLUMN "action" TYPE "ENPermissionAction_new" USING ("action"::text::"ENPermissionAction_new");
ALTER TYPE "ENPermissionAction" RENAME TO "ENPermissionAction_old";
ALTER TYPE "ENPermissionAction_new" RENAME TO "ENPermissionAction";
DROP TYPE "public"."ENPermissionAction_old";
COMMIT;

-- AlterTable
ALTER TABLE "user_tokens" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "ENUserTokenStatus" NOT NULL DEFAULT 'PENDING';
