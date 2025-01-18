/*
  # Fix dashboard configuration schema

  1. Changes
    - Add removed_metrics column to dashboard_config table
    - Clean up duplicate configurations
    - Add unique constraint on gym_id
    - Add index for faster lookups

  2. Notes
    - Keeps the most recently updated configuration when duplicates exist
    - Ensures data integrity with unique constraint
*/

-- First, create a temporary table to store the latest config for each gym
CREATE TEMP TABLE latest_configs AS
SELECT DISTINCT ON (gym_id)
  id,
  gym_id,
  today_metrics,
  overview_metrics,
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
  created_at,
  updated_at
)
SELECT
  id,
  gym_id,
  today_metrics,
  overview_metrics,
  created_at,
  updated_at
FROM latest_configs;

-- Add removed_metrics column
ALTER TABLE dashboard_config
ADD COLUMN IF NOT EXISTS removed_metrics jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Now that we have only one config per gym, add the unique constraint
ALTER TABLE dashboard_config
ADD CONSTRAINT dashboard_config_gym_id_key UNIQUE (gym_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_config_gym_id ON dashboard_config(gym_id);

-- Drop the temporary table
DROP TABLE latest_configs;