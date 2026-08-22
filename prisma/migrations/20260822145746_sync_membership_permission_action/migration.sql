/*
  Warnings:

  - You are about to drop the column `scope` on the `membership_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `role_permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[membership_id,permission_id]` on the table `membership_permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role_id,permission_id]` on the table `role_permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ENMembershipPermissionAction" AS ENUM ('GRANT', 'REVOKE');

-- DropIndex
DROP INDEX "membership_permissions_membership_id_permission_id_scope_key";

-- DropIndex
DROP INDEX "role_permissions_role_id_permission_id_scope_key";

-- AlterTable
ALTER TABLE "membership_permissions" DROP COLUMN "scope",
ADD COLUMN     "action" "ENMembershipPermissionAction" NOT NULL DEFAULT 'REVOKE';

-- AlterTable
ALTER TABLE "role_permissions" DROP COLUMN "scope";

-- DropEnum
DROP TYPE "ENPermissionScope";

-- CreateIndex
CREATE UNIQUE INDEX "membership_permissions_membership_id_permission_id_key" ON "membership_permissions"("membership_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");
