/*
  Warnings:

  - The values [INVITATION] on the enum `ENUserTokenType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `user_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ENInvitationStatus" AS ENUM ('PENDING', 'DISRUPTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ENUserTokenType_new" AS ENUM ('EMAIL_VERIFICATION', 'CHANGE_PASSWORD');
ALTER TABLE "user_tokens" ALTER COLUMN "type" TYPE "ENUserTokenType_new" USING ("type"::text::"ENUserTokenType_new");
ALTER TYPE "ENUserTokenType" RENAME TO "ENUserTokenType_old";
ALTER TYPE "ENUserTokenType_new" RENAME TO "ENUserTokenType";
DROP TYPE "public"."ENUserTokenType_old";
COMMIT;

-- DropIndex
DROP INDEX "user_tokens_hash_idx";

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "type" "ENMembershipType" NOT NULL,
    "status" "ENInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "club_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "accepted_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "invitations"("token_hash");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_club_id_idx" ON "invitations"("club_id");

-- CreateIndex
CREATE INDEX "invitations_expires_at_idx" ON "invitations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_hash_key" ON "user_tokens"("hash");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
