
-- Create a table for shopping items
CREATE TABLE public.shopping_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  photo TEXT NOT NULL,
  price_original DECIMAL(10,2) NOT NULL,
  price_converted DECIMAL(10,2) NOT NULL,
  original_currency TEXT NOT NULL DEFAULT 'JPY',
  converted_currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10,4) NOT NULL,
  liked BOOLEAN NOT NULL DEFAULT false,
  purchased BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own shopping items
CREATE POLICY "Users can view their own shopping items" 
  ON public.shopping_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping items" 
  ON public.shopping_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items" 
  ON public.shopping_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items" 
  ON public.shopping_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for offline sync
ALTER TABLE public.shopping_items REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE shopping_items;
