
-- Create trips table to store trip information
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  base_location TEXT,
  number_of_people INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cities table to store city information for each trip
CREATE TABLE public.trip_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  city_name TEXT NOT NULL,
  planned_days INTEGER NOT NULL DEFAULT 1,
  start_date DATE,
  end_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table to store Go-Do items
CREATE TABLE public.trip_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES public.trip_cities(id) ON DELETE CASCADE NOT NULL,
  place_name TEXT NOT NULL,
  preferred_date DATE,
  time_window TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  day_number INTEGER, -- Which day within the city (1, 2, 3, etc)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips
CREATE POLICY "Users can view their own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for trip_cities
CREATE POLICY "Users can view cities in their trips" ON public.trip_cities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_cities.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can create cities in their trips" ON public.trip_cities
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_cities.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can update cities in their trips" ON public.trip_cities
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_cities.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete cities in their trips" ON public.trip_cities
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_cities.trip_id AND trips.user_id = auth.uid()
  ));

-- Create RLS policies for trip_activities
CREATE POLICY "Users can view activities in their trips" ON public.trip_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_activities.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can create activities in their trips" ON public.trip_activities
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_activities.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can update activities in their trips" ON public.trip_activities
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_activities.trip_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete activities in their trips" ON public.trip_activities
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.trips WHERE trips.id = trip_activities.trip_id AND trips.user_id = auth.uid()
  ));

-- Create function to automatically calculate city dates based on trip start date and planned days
CREATE OR REPLACE FUNCTION public.update_city_dates()
RETURNS TRIGGER AS $$
DECLARE
  current_date DATE;
  city_record RECORD;
BEGIN
  -- Get the trip start date
  SELECT start_date INTO current_date 
  FROM public.trips 
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  -- Update all cities for this trip with calculated dates
  FOR city_record IN 
    SELECT id, planned_days 
    FROM public.trip_cities 
    WHERE trip_id = COALESCE(NEW.trip_id, OLD.trip_id)
    ORDER BY sort_order, created_at
  LOOP
    UPDATE public.trip_cities 
    SET 
      start_date = current_date,
      end_date = current_date + (city_record.planned_days - 1)
    WHERE id = city_record.id;
    
    -- Move to next city's start date
    current_date := current_date + city_record.planned_days;
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to auto-update city dates
CREATE TRIGGER update_city_dates_on_insert
  AFTER INSERT ON public.trip_cities
  FOR EACH ROW EXECUTE FUNCTION public.update_city_dates();

CREATE TRIGGER update_city_dates_on_update
  AFTER UPDATE ON public.trip_cities
  FOR EACH ROW EXECUTE FUNCTION public.update_city_dates();
