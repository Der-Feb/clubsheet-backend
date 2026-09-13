-- ================================================================
-- Rename Player → Athlete everywhere: tables, enum types, enum values,
-- indexes/constraints, and seeded data (permissions, features, roles,
-- audit categories, coach responsibilities).
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Rename enum TYPES
-- ----------------------------------------------------------------
ALTER TYPE "ENPlayerPosition" RENAME TO "ENAthletePosition";

-- ----------------------------------------------------------------
-- 2. Rename enum VALUES (PostgreSQL 12+ supports ALTER TYPE RENAME VALUE)
-- ----------------------------------------------------------------
ALTER TYPE "ENFeature" RENAME VALUE 'PLAYER' TO 'ATHLETE';
ALTER TYPE "ENCoachResponsibility" RENAME VALUE 'PLAYER_DEVELOPMENT' TO 'ATHLETE_DEVELOPMENT';
ALTER TYPE "ENAuditCategory" RENAME VALUE 'PLAYER' TO 'ATHLETE';

-- ----------------------------------------------------------------
-- 3. Rename TABLES
-- ----------------------------------------------------------------
ALTER TABLE "players" RENAME TO "athletes";
ALTER TABLE "player_profiles" RENAME TO "athlete_profiles";

-- ----------------------------------------------------------------
-- 4. Rename indexes on the renamed tables
-- ----------------------------------------------------------------
-- players
ALTER INDEX "players_pkey" RENAME TO "athletes_pkey";
ALTER INDEX "players_membership_id_team_id_key" RENAME TO "athletes_membership_id_team_id_key";
-- player_profiles
ALTER INDEX "player_profiles_pkey" RENAME TO "athlete_profiles_pkey";
ALTER INDEX "player_profiles_profile_id_key" RENAME TO "athlete_profiles_profile_id_key";

-- ----------------------------------------------------------------
-- 5. Rename FOREIGN KEY constraints on the renamed tables
-- ----------------------------------------------------------------
-- athletes → memberships / teams
ALTER TABLE "athletes" RENAME CONSTRAINT "players_membership_id_fkey" TO "athletes_membership_id_fkey";
ALTER TABLE "athletes" RENAME CONSTRAINT "players_team_id_fkey" TO "athletes_team_id_fkey";
-- athlete_profiles → profiles
ALTER TABLE "athlete_profiles" RENAME CONSTRAINT "player_profiles_profile_id_fkey" TO "athlete_profiles_profile_id_fkey";

-- ----------------------------------------------------------------
-- 6. Data migration: permission codes + display data
-- ----------------------------------------------------------------
UPDATE "permissions"
SET
  "code"        = CASE "code"
                    WHEN 'PLAYER_READ'     THEN 'ATHLETE_READ'
                    WHEN 'PLAYER_WRITE'    THEN 'ATHLETE_WRITE'
                    WHEN 'PLAYER_ASSIGN'   THEN 'ATHLETE_ASSIGN'
                    WHEN 'PLAYER_UNASSIGN' THEN 'ATHLETE_UNASSIGN'
                    ELSE "code"
                  END,
  "name"        = CASE "code"
                    WHEN 'PLAYER_READ'     THEN 'Read Athlete Information'
                    WHEN 'PLAYER_WRITE'    THEN 'Write Athlete Information'
                    WHEN 'PLAYER_ASSIGN'   THEN 'Move athlete to team'
                    WHEN 'PLAYER_UNASSIGN' THEN 'Remove athlete from team'
                    ELSE "name"
                  END,
  "description" = CASE "code"
                    WHEN 'PLAYER_READ'     THEN 'View athlete details'
                    WHEN 'PLAYER_WRITE'    THEN 'Write athlete details'
                    WHEN 'PLAYER_ASSIGN'   THEN 'Move athlete to team'
                    WHEN 'PLAYER_UNASSIGN' THEN 'Remove athlete from team'
                    ELSE "description"
                  END,
  "module"      = CASE WHEN "module"::text = 'PLAYER' THEN 'ATHLETE'::"ENFeature" ELSE "module" END,
  "updated_at"  = now()
WHERE "code" IN ('PLAYER_READ', 'PLAYER_WRITE', 'PLAYER_ASSIGN', 'PLAYER_UNASSIGN')
   OR "module"::text = 'PLAYER';

-- ----------------------------------------------------------------
-- 7. Data migration: features
-- ----------------------------------------------------------------
UPDATE "features"
SET
  "code"        = CASE WHEN "code"::text = 'PLAYER' THEN 'ATHLETE'::"ENFeature" ELSE "code" END,
  "name"        = CASE WHEN "name" = 'Player' THEN 'Athlete'
                       WHEN "name" = 'Player Management' THEN 'Athlete Management'
                       ELSE "name" END,
  "description" = CASE WHEN "description" = 'Manage player records and team assignment'
                          THEN 'Manage athlete records and team assignment'
                       ELSE "description" END,
  "updated_at"  = now()
WHERE "code"::text = 'PLAYER'
   OR "name" ILIKE '%player%';

-- ----------------------------------------------------------------
-- 8. Data migration: roles
-- ----------------------------------------------------------------
UPDATE "roles"
SET
  "code"        = CASE WHEN "code" = 'PLAYER' THEN 'ATHLETE' ELSE "code" END,
  "name"        = CASE WHEN "name" = 'Player' THEN 'Athlete' ELSE "name" END,
  "description" = CASE WHEN "description" ILIKE '%player%'
                          THEN regexp_replace("description", 'player', 'athlete', 'gi')
                       ELSE "description" END,
  "updated_at"  = now()
WHERE "code" = 'PLAYER'
   OR "description" ILIKE '%player%';
