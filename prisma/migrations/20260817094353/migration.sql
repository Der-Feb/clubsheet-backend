-- AlterTable
ALTER TABLE "audit_logs" RENAME CONSTRAINT "AuditLog_pkey" TO "audit_logs_pkey";

-- AlterTable
ALTER TABLE "notifications" RENAME CONSTRAINT "Notification_pkey" TO "notifications_pkey";

-- AlterTable
ALTER TABLE "profiles" RENAME CONSTRAINT "Profile_pkey" TO "profiles_pkey";

-- AlterTable
ALTER TABLE "teams" RENAME CONSTRAINT "Team_pkey" TO "teams_pkey";
