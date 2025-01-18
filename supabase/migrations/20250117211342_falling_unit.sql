/*
  # Fix dashboard configuration duplicates and add removed metrics

  1. Changes
    - Properly handle duplicate configurations by keeping only the latest one
    - Add removed_metrics column
    - Ensure unique constraint on gym_id
    - Add index for faster lookups

  2. Notes
    - Uses a more robust approach to handle duplicates
    - Preserves all data while cleaning up duplicates
*/

-- First, create a temporary table with row numbers for each config
CREATE TEMP TABLE ranked_configs AS
SELECT 
  id,
  gym_id,
  today_metrics,
  overview_metrics,
  created_at,
  updated_at,
  ROW_NUMBER() OVER (
    PARTITION BY gym_id 
    ORDER BY updated_at DESC, created_at DESC
  ) as rn
FROM dashboard_config;

-- Delete all but the most recent config for each gym
DELETE FROM dashboard_config
WHERE id IN (
  SELECT id 
  FROM ranked_configs 
  WHERE rn > 1
);

-- Add removed_metrics column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'dashboard_config' 
    AND column_name = 'removed_metrics'
  ) THEN
    ALTER TABLE dashboard_config
    ADD COLUMN removed_metrics jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Drop existing unique constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dashboard_config_gym_id_key'
  ) THEN
    ALTER TABLE dashboard_config DROP CONSTRAINT dashboard_config_gym_id_key;
  END IF;
END $$;

-- Add unique constraint
ALTER TABLE dashboard_config
ADD CONSTRAINT dashboard_config_gym_id_key UNIQUE (gym_id);

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_dashboard_config_gym_id;

-- Create index for faster lookups
CREATE INDEX idx_dashboard_config_gym_id ON dashboard_config(gym_id);

-- Drop temporary table
DROP TABLE ranked_configs;