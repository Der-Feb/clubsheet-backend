/*
  Warnings:

  - You are about to drop the column `type` on the `memberships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "MembershipType" (
    "membershipId" TEXT NOT NULL,
    "type" "ENMembershipType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipType_membershipId_type_key" ON "MembershipType"("membershipId", "type");

-- AddForeignKey
ALTER TABLE "MembershipType" ADD CONSTRAINT "MembershipType_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
