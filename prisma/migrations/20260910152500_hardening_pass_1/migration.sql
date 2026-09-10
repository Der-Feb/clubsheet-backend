-- =============================================================================
-- Hardening Pass 1
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Remove SUSPENDED from ENMembershipStatus (safe remap pattern per todo.md)
--    Must drop the column default before dropping the enum type, because
--    the default expression references the old enum type.
-- ---------------------------------------------------------------------------

-- Step 1: drop the column default (references the old enum type)
ALTER TABLE "memberships" ALTER COLUMN "status" DROP DEFAULT;

-- Step 2: cast column to TEXT so we can remap values freely
ALTER TABLE "memberships" ALTER COLUMN "status" TYPE TEXT;

-- Step 3: remap any SUSPENDED rows → ENDED
UPDATE "memberships" SET "status" = 'ENDED' WHERE "status" = 'SUSPENDED';

-- Step 4: now safe to drop the old enum type
DROP TYPE "ENMembershipStatus";

-- Step 5: create the narrowed enum
CREATE TYPE "ENMembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED');

-- Step 6: cast column back to the new enum
ALTER TABLE "memberships"
  ALTER COLUMN "status" TYPE "ENMembershipStatus"
  USING "status"::"ENMembershipStatus";

-- Step 7: restore the default using the new enum
ALTER TABLE "memberships"
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"ENMembershipStatus";

-- ---------------------------------------------------------------------------
-- 2. Fix Player unique constraints (Bug C)
--    Remove both bad individual uniques; add the correct composite unique.
-- ---------------------------------------------------------------------------

DROP INDEX IF EXISTS "players_membership_id_key";
DROP INDEX IF EXISTS "players_team_id_key";

CREATE UNIQUE INDEX "players_membership_id_team_id_key"
  ON "players" ("membership_id", "team_id");

-- ---------------------------------------------------------------------------
-- 3. Add FK from roles.club_id → clubs.id (Bug H)
-- ---------------------------------------------------------------------------

ALTER TABLE "roles"
  ADD CONSTRAINT "roles_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "clubs"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 4. Expand notifications.title VARCHAR(20) → VARCHAR(100) (Design 9)
-- ---------------------------------------------------------------------------

ALTER TABLE "notifications"
  ALTER COLUMN "title" TYPE VARCHAR(100);
