
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = 'https://tabkttykminuwvoaohno.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYmt0dHlrbWludXd2b2FvaG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTk1MzAsImV4cCI6MjA2OTQ5NTUzMH0.bDZWYCdAjP0ih2EONVWCz3bbxSZfg8UwSOcxw2VhthY'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
