/*
  Warnings:

  - The values [PERSONNEL] on the enum `ENMembershipType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ENMembershipType_new" AS ENUM ('OWNER', 'STAFF', 'ATHLETE', 'GUARDIAN', 'BOARD');
ALTER TABLE "MembershipType" ALTER COLUMN "type" TYPE "ENMembershipType_new" USING ("type"::text::"ENMembershipType_new");
ALTER TYPE "ENMembershipType" RENAME TO "ENMembershipType_old";
ALTER TYPE "ENMembershipType_new" RENAME TO "ENMembershipType";
DROP TYPE "public"."ENMembershipType_old";
COMMIT;
