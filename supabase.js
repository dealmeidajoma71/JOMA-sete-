import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const supabaseUrl = "https://rngdtpkakxvunrkyvquo.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZ2R0cGtha3h2dW5ya3l2cXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDU1NDgsImV4cCI6MjEwMDY4MTU0OH0.OXwz09TkEmZ_r8QZlRAZd2yq50-3IudyDeYngF1n76g";


export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);