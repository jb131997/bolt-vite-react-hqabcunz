/*
  # Create members table

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `street` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `status` (text)
      - `plan` (text, nullable)
      - `last_visit` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `members` table
    - Add policy for authenticated users to read their own gym's members
    - Add policy for authenticated users to insert members for their gym
    - Add policy for authenticated users to update their own gym's members
*/

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES profiles(id) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive')),
  plan text,
  last_visit timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own gym's members
CREATE POLICY "Users can read own gym members"
  ON members FOR SELECT
  TO authenticated
  USING (auth.uid() = gym_id);

-- Allow users to insert members for their gym
CREATE POLICY "Users can insert members for their gym"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = gym_id);

-- Allow users to update their own gym's members
CREATE POLICY "Users can update own gym members"
  ON members FOR UPDATE
  TO authenticated
  USING (auth.uid() = gym_id);