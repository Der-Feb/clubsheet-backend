/*
  Warnings:

  - The `status` column on the `clubs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `memberships` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `scope` on the `membership_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `module` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gender` on the `persons` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `scope` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `user_tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ENGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ENUserTokenType" AS ENUM ('EMAIL_VERIFICATION', 'CHANGE_PASSWORD', 'INVITATION');

-- CreateEnum
CREATE TYPE "ENMembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'ENDED');

-- CreateEnum
CREATE TYPE "ENMembershipType" AS ENUM ('PERSONNEL', 'ATHLETE', 'GUARDIAN', 'BOARD');

-- CreateEnum
CREATE TYPE "ENPermissionModule" AS ENUM ('ACCESS', 'TRAINING', 'PLAYER', 'MEDICAL', 'FINANCE', 'MATCH');

-- CreateEnum
CREATE TYPE "ENPermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT', 'ASSIGN');

-- CreateEnum
CREATE TYPE "ENPermissionScope" AS ENUM ('ANY', 'CLUB', 'TEAM', 'OWN');

-- CreateEnum
CREATE TYPE "ENClubStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "ENAuditCategory" AS ENUM ('AUTH', 'IAM', 'CLUB', 'PLAYER', 'TRAINING', 'MATCH', 'MEDICAL', 'FINANCE', 'SYSTEM');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "category",
ADD COLUMN     "category" "ENAuditCategory" NOT NULL;

-- AlterTable
ALTER TABLE "clubs" DROP COLUMN "status",
ADD COLUMN     "status" "ENClubStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "membership_permissions" DROP COLUMN "scope",
ADD COLUMN     "scope" "ENPermissionScope" NOT NULL;

-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "status",
ADD COLUMN     "status" "ENMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "type",
ADD COLUMN     "type" "ENMembershipType" NOT NULL;

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "module",
ADD COLUMN     "module" "ENPermissionModule" NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "ENPermissionAction" NOT NULL;

-- AlterTable
ALTER TABLE "persons" DROP COLUMN "gender",
ADD COLUMN     "gender" "ENGender" NOT NULL;

-- AlterTable
ALTER TABLE "role_permissions" DROP COLUMN "scope",
ADD COLUMN     "scope" "ENPermissionScope" NOT NULL;

-- AlterTable
ALTER TABLE "user_tokens" DROP COLUMN "type",
ADD COLUMN     "type" "ENUserTokenType" NOT NULL;

-- DropEnum
DROP TYPE "AuditCategory";

-- DropEnum
DROP TYPE "ClubStatus";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "MembershipStatus";

-- DropEnum
DROP TYPE "MembershipType";

-- DropEnum
DROP TYPE "PermissionAction";

-- DropEnum
DROP TYPE "PermissionModule";

-- DropEnum
DROP TYPE "PermissionScope";

-- DropEnum
DROP TYPE "UserTokenType";

-- CreateIndex
CREATE UNIQUE INDEX "membership_permissions_membership_id_permission_id_scope_key" ON "membership_permissions"("membership_id", "permission_id", "scope");

-- CreateIndex
CREATE INDEX "memberships_status_idx" ON "memberships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_scope_key" ON "role_permissions"("role_id", "permission_id", "scope");
