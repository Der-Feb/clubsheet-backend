-- Rename PascalCase tables to plural snake_case naming convention
-- Tables to rename: AuditLog, MembershipType, Notification, Profile, Team

-- ============================================================
-- 1. Rename the tables
-- ============================================================

ALTER TABLE "AuditLog" RENAME TO "audit_logs";
ALTER TABLE "MembershipType" RENAME TO "membership_types";
ALTER TABLE "Notification" RENAME TO "notifications";
ALTER TABLE "Profile" RENAME TO "profiles";
ALTER TABLE "Team" RENAME TO "teams";

-- ============================================================
-- 2. Rename columns that still have PascalCase names
-- ============================================================

-- audit_logs: fix PascalCase columns
ALTER TABLE "audit_logs" RENAME COLUMN "entityType" TO "entity_type";
ALTER TABLE "audit_logs" RENAME COLUMN "createdBy" TO "created_by";
ALTER TABLE "audit_logs" RENAME COLUMN "createdAt" TO "created_at";

-- membership_types: fix PascalCase columns
ALTER TABLE "membership_types" RENAME COLUMN "membershipId" TO "membership_id";

-- notifications: fix PascalCase columns  
ALTER TABLE "notifications" RENAME COLUMN "createdBy" TO "created_by";
ALTER TABLE "notifications" RENAME COLUMN "createdAt" TO "created_at";

-- profiles: fix PascalCase columns
ALTER TABLE "profiles" RENAME COLUMN "profilePic" TO "profile_pic";

-- users: fix PascalCase columns
ALTER TABLE "users" RENAME COLUMN "isEmailVerified" TO "is_email_verified";

-- player_profiles: fix PascalCase columns
ALTER TABLE "player_profiles" RENAME COLUMN "preferredFoot" TO "preferred_foot";

-- ============================================================
-- 3. Rename indexes/constraints to follow new naming convention
-- ============================================================

-- MembershipType unique index
ALTER INDEX "MembershipType_membershipId_type_key" RENAME TO "membership_types_membership_id_type_key";

-- Profile person_id unique index
ALTER INDEX "Profile_person_id_key" RENAME TO "profiles_person_id_key";

-- ============================================================
-- 4. Rename foreign key constraints for consistency
-- ============================================================

-- MembershipType -> memberships
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'MembershipType_membershipId_fkey'
    ) THEN
        ALTER TABLE "membership_types" RENAME CONSTRAINT "MembershipType_membershipId_fkey" TO "membership_types_membership_id_fkey";
    END IF;
END $$;

-- Profile -> persons
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Profile_person_id_fkey'
    ) THEN
        ALTER TABLE "profiles" RENAME CONSTRAINT "Profile_person_id_fkey" TO "profiles_person_id_fkey";
    END IF;
END $$;

-- Team -> clubs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Team_club_id_fkey'
    ) THEN
        ALTER TABLE "teams" RENAME CONSTRAINT "Team_club_id_fkey" TO "teams_club_id_fkey";
    END IF;
END $$;

-- trainings -> Team (now teams)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'trainings_team_id_fkey'
    ) THEN
        -- Constraint name already has snake_case table reference, leave as is
        NULL;
    END IF;
END $$;
