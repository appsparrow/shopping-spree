
-- Create the trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  base_location TEXT,
  start_date DATE,
  end_date DATE,
  number_of_people INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the trip_cities table
CREATE TABLE public.trip_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  city_name TEXT NOT NULL,
  planned_days INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the trip_activities table
CREATE TABLE public.trip_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES public.trip_cities(id) ON DELETE CASCADE,
  place_name TEXT NOT NULL,
  notes TEXT,
  photo_url TEXT,
  photo_metadata JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  day_number INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips
CREATE POLICY "Users can view their own trips" 
  ON public.trips 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" 
  ON public.trips 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
  ON public.trips 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
  ON public.trips 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for trip_cities
CREATE POLICY "Users can view cities from their trips" 
  ON public.trip_cities 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_cities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can create cities for their trips" 
  ON public.trip_cities 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_cities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can update cities from their trips" 
  ON public.trip_cities 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_cities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete cities from their trips" 
  ON public.trip_cities 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_cities.trip_id 
    AND trips.user_id = auth.uid()
  ));

-- Create RLS policies for trip_activities
CREATE POLICY "Users can view activities from their trips" 
  ON public.trip_activities 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_activities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can create activities for their trips" 
  ON public.trip_activities 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_activities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can update activities from their trips" 
  ON public.trip_activities 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_activities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete activities from their trips" 
  ON public.trip_activities 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_activities.trip_id 
    AND trips.user_id = auth.uid()
  ));
