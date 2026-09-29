// Import Supabase client directly via CDN for vanilla ES Modules
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// IMPORTANT: Replace these with your actual Supabase Project URL and Anon Key
// Since we use vanilla JS without a bundler, we insert the public keys directly here.
const supabaseUrl = "https://sodrrogqfbnfhbwphmxj.supabase.co";
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZHJyb2dxZmJuZmhid3BobXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzM0MTksImV4cCI6MjEwNjI0OTQxOX0.s3vgL4EcghK1m-5SmEgRXVIpX5y09I_MHcP1nDaD1Gs";

// Initialize and export the Supabase client (Single Source of Truth)
export const supabase = createClient(supabaseUrl, supabaseKey);
