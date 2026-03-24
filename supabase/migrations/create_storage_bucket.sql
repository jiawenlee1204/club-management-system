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