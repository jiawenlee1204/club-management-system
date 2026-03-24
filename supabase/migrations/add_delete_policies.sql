-- Add DELETE policies for profiles and activities

-- Allow authenticated users to delete profiles
DROP POLICY IF EXISTS "Authenticated users can delete profiles" ON profiles;
CREATE POLICY "Authenticated users can delete profiles"
  ON profiles FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Update activities DELETE policy to allow any authenticated user to delete
DROP POLICY IF EXISTS "Activity creators can delete their activities" ON activities;
CREATE POLICY "Authenticated users can delete activities"
  ON activities FOR DELETE
  USING (auth.uid() IS NOT NULL);
