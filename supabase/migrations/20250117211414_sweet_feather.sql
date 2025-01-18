/*
  # Fix dashboard configuration duplicates and ensure single config per gym

  1. Changes
    - Create a temporary table to store the latest config for each gym
    - Clean up any duplicate configurations
    - Ensure proper constraints and indexes
    - Add trigger to handle upserts properly

  2. Notes
    - Uses ON CONFLICT to handle upserts
    - Preserves the most recent configuration data
    - Adds proper indexing for performance
*/

-- First, create a temporary table to store the latest config for each gym
CREATE TEMP TABLE latest_configs AS
SELECT DISTINCT ON (gym_id)
  id,
  gym_id,
  today_metrics,
  overview_metrics,
  removed_metrics,
  created_at,
  updated_at
FROM dashboard_config
ORDER BY gym_id, updated_at DESC;

-- Delete all existing configs
DELETE FROM dashboard_config;

-- Reinsert only the latest configs
INSERT INTO dashboard_config (
  id,
  gym_id,
  today_metrics,
  overview_metrics,
  removed_metrics,
  created_at,
  updated_at
)
SELECT
  id,
  gym_id,
  today_metrics,
  overview_metrics,
  COALESCE(removed_metrics, '[]'::jsonb),
  created_at,
  updated_at
FROM latest_configs;

-- Drop existing constraints and indexes
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

DROP INDEX IF EXISTS idx_dashboard_config_gym_id;

-- Add unique constraint and index
ALTER TABLE dashboard_config ADD CONSTRAINT dashboard_config_gym_id_key UNIQUE (gym_id);
CREATE INDEX idx_dashboard_config_gym_id ON dashboard_config(gym_id);

-- Create or replace the upsert function
CREATE OR REPLACE FUNCTION handle_dashboard_config_upsert()
RETURNS trigger AS $$
BEGIN
  -- Set the updated_at timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS dashboard_config_upsert_trigger ON dashboard_config;

-- Create trigger for upserts
CREATE TRIGGER dashboard_config_upsert_trigger
  BEFORE INSERT OR UPDATE ON dashboard_config
  FOR EACH ROW
  EXECUTE FUNCTION handle_dashboard_config_upsert();

-- Drop the temporary table
DROP TABLE latest_configs;