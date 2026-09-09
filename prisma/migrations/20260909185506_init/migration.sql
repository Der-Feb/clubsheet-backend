-- 1. Convert column to text (drops dependency on the old enum type)
ALTER TABLE "permissions" ALTER COLUMN "module" TYPE TEXT USING "module"::TEXT;

-- 2. Drop the old enum type
DROP TYPE "ENPermissionFeature";

-- 3. Remap the renamed value while the column is still text
UPDATE "permissions" SET "module" = 'IAM' WHERE "module" = 'ACCESS';

-- 4. Cast the column to the EXISTING ENFeature enum (no CREATE TYPE needed)
ALTER TABLE "permissions" ALTER COLUMN "module" TYPE "ENFeature" USING "module"::"ENFeature";