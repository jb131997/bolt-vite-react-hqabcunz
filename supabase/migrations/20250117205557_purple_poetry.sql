/*
  # Add dashboard configuration table

  1. New Tables
    - `dashboard_config`
      - `id` (uuid, primary key)
      - `gym_id` (uuid, references profiles)
      - `today_metrics` (jsonb array of metrics)
      - `overview_metrics` (jsonb array of metrics)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for gym owners to manage their dashboard config
*/

CREATE TABLE IF NOT EXISTS dashboard_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES profiles(id) NOT NULL,
  today_metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  overview_metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Policies for dashboard_config
CREATE POLICY "Gym owners can manage their dashboard config"
  ON dashboard_config
  FOR ALL
  TO authenticated
  USING (gym_id = auth.uid())
  WITH CHECK (gym_id = auth.uid());

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_dashboard_config_updated_at
  BEFORE UPDATE ON dashboard_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();