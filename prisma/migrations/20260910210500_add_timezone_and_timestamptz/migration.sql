-- =============================================================================
-- Migration: Add Timezone Context & Convert Timestamps to TIMESTAMPTZ / DATE
-- =============================================================================

-- 1. Add optional timezone to clubs
ALTER TABLE "clubs" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';

-- 2. Convert person dob to DATE (calendar date without timezone shifts)
ALTER TABLE "persons" ALTER COLUMN "dob" TYPE DATE USING "dob"::DATE;

-- 3. Convert all lifecycle and audit timestamps to TIMESTAMPTZ(3)
--    Using explicit "AT TIME ZONE 'UTC'" ensures safe, timezone-neutral conversion.

-- persons
ALTER TABLE "persons"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- users
ALTER TABLE "users"
  ALTER COLUMN "last_login" TYPE TIMESTAMPTZ(3) USING "last_login" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- user_tokens
ALTER TABLE "user_tokens"
  ALTER COLUMN "expires_at" TYPE TIMESTAMPTZ(3) USING "expires_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "used_at" TYPE TIMESTAMPTZ(3) USING "used_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

-- memberships
ALTER TABLE "memberships"
  ALTER COLUMN "joined_at" TYPE TIMESTAMPTZ(3) USING "joined_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "ended_at" TYPE TIMESTAMPTZ(3) USING "ended_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- clubs
ALTER TABLE "clubs"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- invitations
ALTER TABLE "invitations"
  ALTER COLUMN "expires_at" TYPE TIMESTAMPTZ(3) USING "expires_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "accepted_at" TYPE TIMESTAMPTZ(3) USING "accepted_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- features
ALTER TABLE "features"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- club_features
ALTER TABLE "club_features"
  ALTER COLUMN "enabled_at" TYPE TIMESTAMPTZ(3) USING "enabled_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- trainings
ALTER TABLE "trainings"
  ALTER COLUMN "starts_at" TYPE TIMESTAMPTZ(3) USING "starts_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "ends_at" TYPE TIMESTAMPTZ(3) USING "ends_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- players
ALTER TABLE "players"
  ALTER COLUMN "joined_at" TYPE TIMESTAMPTZ(3) USING "joined_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "left_at" TYPE TIMESTAMPTZ(3) USING "left_at" AT TIME ZONE 'UTC';

-- teams
ALTER TABLE "teams"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- permissions
ALTER TABLE "permissions"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- roles
ALTER TABLE "roles"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- membership_roles
ALTER TABLE "membership_roles"
  ALTER COLUMN "assigned_at" TYPE TIMESTAMPTZ(3) USING "assigned_at" AT TIME ZONE 'UTC';

-- profiles
ALTER TABLE "profiles"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- player_profiles
ALTER TABLE "player_profiles"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- coach_assignments
ALTER TABLE "coach_assignments"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- audit_logs
ALTER TABLE "audit_logs"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

-- notifications
ALTER TABLE "notifications"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';
