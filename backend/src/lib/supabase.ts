import { createClient } from '@supabase/supabase-js'

// Validar que las variables de entorno existen
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables. Check your .env file.'
  )
}

// Cliente público (usa anon key, respeta RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin (usa service_role key, bypassa RLS)
// ⚠️ SOLO usar para operaciones administrativas
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Tipos para TypeScript (opcional pero recomendado)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'player' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      matches: {
        Row: {
          id: string
          created_by: string | null
          match_date: string
          match_time: string | null
          location: string
          max_players: number
          status: 'open' | 'full' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      match_players: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team: number | null
          score: number
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_players']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['match_players']['Insert']>
      }
    }
  }
}
