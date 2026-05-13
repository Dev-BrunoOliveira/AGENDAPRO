import { createClient } from '@supabase/supabase-js'

// Certifique-se de que a URL começa com https://
const supabaseUrl = 'https://xyz.supabase.co' 
const supabaseAnonKey = 'sua-chave-anon-longa-aqui'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)