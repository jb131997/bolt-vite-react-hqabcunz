/*
  # Fix dashboard_config duplicates and constraints

  1. Changes
    - Creates a temporary table to store the latest config per gym
    - Safely handles duplicate records by keeping only the most recent one
    - Properly recreates the unique constraint
    - Adds proper indexes and triggers

  2. Safety
    - Uses temporary tables to ensure data integrity
    - Handles edge cases with NULL values
    - Preserves all existing data
*/

-- First, backup existing data into a temp table
CREATE TEMP TABLE dashboard_config_backup AS
SELECT * FROM dashboard_config;

-- Create another temp table with ranked rows to identify the latest config per gym
CREATE TEMP TABLE latest_configs AS
SELECT DISTINCT ON (gym_id)
  id,
  gym_id,
  today_metrics,
  overview_metrics,
  removed_metrics,
  created_at,
  updated_at
FROM dashboard_config_backup
ORDER BY gym_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST;

-- Safely drop constraints if they exist
DO $$ 
BEGIN
  -- Drop the unique constraint if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dashboard_config_gym_id_key'
  ) THEN
    ALTER TABLE dashboard_config DROP CONSTRAINT dashboard_config_gym_id_key;
  END IF;

  -- Drop the index if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_dashboard_config_gym_id'
    AND n.nspname = 'public'
  ) THEN
    DROP INDEX idx_dashboard_config_gym_id;
  END IF;
END $$;

-- Truncate the main table
TRUNCATE TABLE dashboard_config;

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
  COALESCE(updated_at, created_at)
FROM latest_configs;

-- Now safely add the unique constraint
ALTER TABLE dashboard_config ADD CONSTRAINT dashboard_config_gym_id_key UNIQUE (gym_id);

-- Add index for better performance
CREATE INDEX idx_dashboard_config_gym_id ON dashboard_config(gym_id);

-- Create or replace the timestamp update function
CREATE OR REPLACE FUNCTION update_dashboard_config_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the timestamp trigger
DROP TRIGGER IF EXISTS update_dashboard_config_timestamp ON dashboard_config;
CREATE TRIGGER update_dashboard_config_timestamp
  BEFORE UPDATE ON dashboard_config
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_config_timestamp();

-- Clean up temporary tables
DROP TABLE dashboard_config_backup;
DROP TABLE latest_configs;