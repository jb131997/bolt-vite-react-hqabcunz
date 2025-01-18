/*
  # Fix user creation trigger

  1. Changes
    - Update handle_new_user() function to properly handle metadata
    - Add error handling for missing metadata
    - Add proper type casting for metadata fields

  2. Security
    - Maintains existing RLS policies
    - Function remains security definer
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    full_name,
    gym_name
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'gym_name', NULL)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;