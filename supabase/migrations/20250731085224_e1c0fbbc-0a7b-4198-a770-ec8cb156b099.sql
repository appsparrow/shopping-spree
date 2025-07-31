
-- Create storage bucket for travel photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('travel-photos', 'travel-photos', true);

-- Create RLS policies for the travel-photos bucket
CREATE POLICY "Anyone can view travel photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'travel-photos');

CREATE POLICY "Authenticated users can upload travel photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'travel-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own travel photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'travel-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own travel photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'travel-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add photo_url column to trip_activities table
ALTER TABLE public.trip_activities 
ADD COLUMN photo_url TEXT;

-- Update the trip_activities table to include photo metadata
ALTER TABLE public.trip_activities 
ADD COLUMN photo_metadata JSONB DEFAULT '{}';
