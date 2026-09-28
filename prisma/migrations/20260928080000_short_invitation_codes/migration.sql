-- Six-digit invitation codes are not globally unique. Scope lookup by email
-- and track failed guesses instead of requiring a globally unique code hash.
DROP INDEX "invitations_token_hash_key";

CREATE INDEX "invitations_email_token_hash_status_idx"
ON "invitations"("email", "token_hash", "status");

ALTER TABLE "invitations"
ADD COLUMN "failed_attempts" INTEGER NOT NULL DEFAULT 0;

-- Previously issued 43-character tokens cannot be entered as six-digit codes.
UPDATE "invitations"
SET "status" = 'DISRUPTED'
WHERE "status" = 'PENDING';
