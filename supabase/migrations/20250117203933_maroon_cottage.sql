/*
  # Enhance member notes functionality

  1. Changes to member_notes table
    - Add metadata column for additional note data
    - Add tags support
    - Add importance level
    - Add follow_up_date

  2. Security
    - Maintain existing RLS policies
    - Add policy for updating notes
*/

ALTER TABLE member_notes
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS importance text CHECK (importance IN ('low', 'medium', 'high')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS follow_up_date timestamptz;

-- Add policy for updating notes
CREATE POLICY "Gym owners can update their members notes"
  ON member_notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_notes.member_id
      AND members.gym_id = auth.uid()
    )
  );