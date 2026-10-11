import { createClient } from '@supabase/supabase-js';
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

export const supabase = HAS_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
