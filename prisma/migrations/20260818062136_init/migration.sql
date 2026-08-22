-- CreateEnum
CREATE TYPE "ENFeature" AS ENUM ('IAM', 'CLUB', 'TEAM', 'PLAYER', 'TRAINING', 'MATCH', 'SIGNING', 'MEDICAL', 'FINANCE');

-- CreateEnum
CREATE TYPE "ENCoachPosition" AS ENUM ('HEAD_COACH', 'ASSISTANT_COACH', 'GOALKEEPER_COACH', 'FITNESS_COACH', 'TECHNICAL_COACH', 'ANALYST');

-- CreateEnum
CREATE TYPE "ENCoachResponsibility" AS ENUM ('TRAINING', 'TACTICS', 'PLAYER_DEVELOPMENT', 'MATCH_ANALYSIS', 'FITNESS', 'GOALKEEPING', 'SCOUTING');

-- AlterEnum
ALTER TYPE "ENAuditCategory" ADD VALUE 'TEAM';

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "coach_assignments" (
    "id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "responsabilities" "ENCoachResponsibility"[] DEFAULT ARRAY[]::"ENCoachResponsibility"[],
    "position" "ENCoachPosition" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "specialization" TEXT,
    "license" TEXT,
    "profile_id" TEXT NOT NULL,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_assignments_membership_id_team_id_key" ON "coach_assignments"("membership_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "coach_profiles_profile_id_key" ON "coach_profiles"("profile_id");

-- AddForeignKey
ALTER TABLE "coach_assignments" ADD CONSTRAINT "coach_assignments_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_assignments" ADD CONSTRAINT "coach_assignments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
