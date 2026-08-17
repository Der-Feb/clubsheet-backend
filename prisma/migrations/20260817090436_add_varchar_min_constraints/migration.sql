-- Add minimum length constraints for VarChar fields

-- Notification table constraints
ALTER TABLE "Notification" ADD CONSTRAINT "chk_notification_title_min_length" 
  CHECK (LENGTH(title) >= 3);

ALTER TABLE "Notification" ADD CONSTRAINT "chk_notification_description_min_length" 
  CHECK (LENGTH(description) >= 10);

-- Team table constraints
ALTER TABLE "Team" ADD CONSTRAINT "chk_team_name_min_length" 
  CHECK (LENGTH(name) >= 2);

-- Role table constraints
ALTER TABLE "roles" ADD CONSTRAINT "chk_role_code_min_length" 
  CHECK (LENGTH(code) >= 2);

ALTER TABLE "roles" ADD CONSTRAINT "chk_role_name_min_length" 
  CHECK (LENGTH(name) >= 2);

ALTER TABLE "roles" ADD CONSTRAINT "chk_role_description_min_length" 
  CHECK (LENGTH(description) >= 10);
