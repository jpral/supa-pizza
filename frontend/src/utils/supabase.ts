import { createClient } from '@supabase/supabase-js';
import { Database } from './../types/database';
const supabaseUrl = process.env.REACT_APP_API_URL;
const supabaseKey = process.env.REACT_APP_ANON_KEY;
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
