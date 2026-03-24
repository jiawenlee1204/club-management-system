-- Create a function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, student_id, major, contact, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '新用户'),
    COALESCE(NEW.raw_user_meta_data->>'student_id', '未设置'),
    COALESCE(NEW.raw_user_meta_data->>'major', '未设置'),
    COALESCE(NEW.raw_user_meta_data->>'contact', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the activities table policy to allow authenticated users to create activities
DROP POLICY IF EXISTS "Authenticated users can create activities" ON activities;
CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure the user's profile exists before creating activities
-- This policy checks that the user has a profile in the profiles table
DROP POLICY IF EXISTS "Authenticated users can create activities" ON activities;
CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
  );
