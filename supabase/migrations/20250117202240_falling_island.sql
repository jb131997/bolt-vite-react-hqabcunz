/*
  # Add member notes functionality

  1. New Tables
    - `member_notes`
      - `id` (uuid, primary key)
      - `member_id` (uuid, references members)
      - `content` (text)
      - `category` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `member_notes` table
    - Add policies for gym owners to manage notes
*/

CREATE TABLE IF NOT EXISTS member_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;

-- Allow gym owners to read notes for their members
CREATE POLICY "Gym owners can read their members' notes"
  ON member_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_notes.member_id
      AND members.gym_id = auth.uid()
    )
  );

-- Allow gym owners to create notes for their members
CREATE POLICY "Gym owners can create notes for their members"
  ON member_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_notes.member_id
      AND members.gym_id = auth.uid()
    )
  );