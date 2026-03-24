-- ========================================
-- 社团管理系统 - 完整数据库设置脚本
-- 生成时间: 2026/3/24 15:09:54
-- ========================================

-- 注意: 此脚本会创建所有必要的表、索引、触发器和策略
-- 请在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- ========================================
-- 文件: schema.sql
-- ========================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  major TEXT NOT NULL,
  contact TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(activity_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_activity_id ON registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for activities
CREATE POLICY "Activities are viewable by everyone"
  ON activities FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Activity creators can update their activities"
  ON activities FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Activity creators can delete their activities"
  ON activities FOR DELETE
  USING (auth.uid() = created_by);

-- Create policies for registrations
CREATE POLICY "Registrations are viewable by everyone"
  ON registrations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
  ON registrations FOR DELETE
  USING (auth.uid() = user_id);


-- ========================================
-- 文件: migrations/add_contact_column.sql
-- ========================================

-- Add contact column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS contact TEXT;

-- ========================================
-- 文件: migrations/fix_foreign_keys.sql
-- ========================================

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


-- ========================================
-- 文件: migrations/fix_profile_creation.sql
-- ========================================

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


-- ========================================
-- 文件: migrations/create_storage_bucket.sql
-- ========================================

-- Create storage bucket for activity images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('activity-images', 'activity-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public access to activity images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-images');

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-images' AND 
  auth.role() = 'authenticated'
);

-- ========================================
-- 执行完成
-- ========================================

-- 验证表是否创建成功
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'activities', 'registrations')
ORDER BY table_name;

-- 验证策略是否创建成功
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 验证触发器是否创建成功
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
