-- CreateEnum
CREATE TYPE "ENClubFeatureStatus" AS ENUM ('ENABLED', 'DISABLED');

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "code" "ENFeature" NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_features" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "status" "ENClubFeatureStatus" NOT NULL DEFAULT 'DISABLED',
    "enabled_by" TEXT,
    "enabled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "features_code_key" ON "features"("code");

-- CreateIndex
CREATE INDEX "club_features_club_id_idx" ON "club_features"("club_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_features_club_id_feature_id_key" ON "club_features"("club_id", "feature_id");

-- AddForeignKey
ALTER TABLE "club_features" ADD CONSTRAINT "club_features_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_features" ADD CONSTRAINT "club_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_features" ADD CONSTRAINT "club_features_enabled_by_fkey" FOREIGN KEY ("enabled_by") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
