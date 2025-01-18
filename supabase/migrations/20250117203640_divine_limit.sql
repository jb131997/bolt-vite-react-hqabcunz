/*
  # Create member activities table

  1. New Tables
    - `member_activities`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key to members)
      - `type` (text, enum: Check-in, Payment, Class, Note, Plan Change)
      - `description` (text)
      - `category` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for gym owners to read and create activities
*/

-- Create member_activities table
CREATE TABLE IF NOT EXISTS member_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT member_activities_member_id_fkey 
    FOREIGN KEY (member_id) 
    REFERENCES members(id) 
    ON DELETE CASCADE,
  CONSTRAINT member_activities_type_check 
    CHECK (type IN ('Check-in', 'Payment', 'Class', 'Note', 'Plan Change'))
);

-- Enable RLS
ALTER TABLE member_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Gym owners can read their members activities" ON member_activities;
  DROP POLICY IF EXISTS "Gym owners can create activities for their members" ON member_activities;
  
  -- Create new policies
  CREATE POLICY "Gym owners can read their members activities"
    ON member_activities
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM members
        WHERE members.id = member_activities.member_id
        AND members.gym_id = auth.uid()
      )
    );

  CREATE POLICY "Gym owners can create activities for their members"
    ON member_activities
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM members
        WHERE members.id = member_activities.member_id
        AND members.gym_id = auth.uid()
      )
    );
END $$;