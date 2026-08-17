-- CreateEnum
CREATE TYPE "ENTrainingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ENTrainingType" AS ENUM ('PHYSICAL', 'MENTAL', 'TECHNICAL', 'TACTICAL');

-- CreateEnum
CREATE TYPE "ENNotificationType" AS ENUM ('SYSTEM', 'TRAINING', 'MATCH');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "send_email_notification" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "types" "ENTrainingType"[],
    "title" TEXT,
    "description" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" "ENTrainingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "ENNotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(20) NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "createdBy" TEXT DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NotificationSeenBy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NotificationSeenBy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_NotificationSentFor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NotificationSentFor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "trainings_club_id_idx" ON "trainings"("club_id");

-- CreateIndex
CREATE INDEX "trainings_team_id_idx" ON "trainings"("team_id");

-- CreateIndex
CREATE INDEX "trainings_starts_at_idx" ON "trainings"("starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "players_membership_id_key" ON "players"("membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_team_id_key" ON "players"("team_id");

-- CreateIndex
CREATE INDEX "_NotificationSeenBy_B_index" ON "_NotificationSeenBy"("B");

-- CreateIndex
CREATE INDEX "_NotificationSentFor_B_index" ON "_NotificationSentFor"("B");

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationSeenBy" ADD CONSTRAINT "_NotificationSeenBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationSeenBy" ADD CONSTRAINT "_NotificationSeenBy_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationSentFor" ADD CONSTRAINT "_NotificationSentFor_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationSentFor" ADD CONSTRAINT "_NotificationSentFor_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
