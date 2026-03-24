-- Drop the foreign key constraint on profiles.id
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;

-- Make profiles.id independent (not referencing auth.users)
ALTER TABLE profiles ALTER COLUMN id SET NOT NULL;

-- Update activities table to allow NULL created_by
ALTER TABLE activities ALTER COLUMN created_by DROP NOT NULL;

-- Update registrations table to allow NULL user_id  
ALTER TABLE registrations ALTER COLUMN user_id DROP NOT NULL;

-- Update the foreign key on activities to be less restrictive
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_created_by_fkey;
ALTER TABLE activities ADD CONSTRAINT activities_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Update the foreign key on registrations to be less restrictive
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE registrations ADD CONSTRAINT registrations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update policies to allow members without auth users
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Authenticated users can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create activities" ON activities;
CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (created_by IS NULL OR EXISTS (SELECT 1 FROM profiles WHERE id = created_by))
  );
