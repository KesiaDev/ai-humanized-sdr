import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ujypxavysrxbdkdapenv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqeXB4YXZ5c3J4YmRrZGFwZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Njg0OTgsImV4cCI6MjA5MTA0NDQ5OH0.DdyTqAFUw-K13xBW2G-WhI8-hGODCwawTwz4_2nVb0w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
