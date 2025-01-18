/*
  # Update members table constraints

  1. Changes
    - Makes address fields optional
    - Makes phone optional if email is provided
    - Adds check constraint to ensure either phone or email is provided
*/

-- First make the fields nullable
ALTER TABLE members
ALTER COLUMN phone DROP NOT NULL,
ALTER COLUMN street DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL,
ALTER COLUMN zip_code DROP NOT NULL;

-- Add check constraint to ensure either phone or email is provided
ALTER TABLE members
ADD CONSTRAINT members_contact_check 
CHECK (
  COALESCE(TRIM(email), '') != '' OR 
  COALESCE(TRIM(phone), '') != ''
);