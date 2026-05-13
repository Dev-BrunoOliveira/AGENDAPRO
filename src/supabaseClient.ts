import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kokuthzksiygmpmrmqss.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtva3V0aHprc2l5Z21wbXJtcXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYwMTIsImV4cCI6MjA5NDI1MjAxMn0.SIV8fTGeYsJY9M1U_taPPC3mnl-mAYvAf30wnqu5GHk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
