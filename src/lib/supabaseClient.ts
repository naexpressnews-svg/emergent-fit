import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Atenção: Chaves do Supabase não encontradas no ambiente.")
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)