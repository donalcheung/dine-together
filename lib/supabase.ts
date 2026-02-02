import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export interface Profile {
  id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  dietary_restrictions?: string
  food_preferences?: string
  rating: number
  total_ratings: number
  created_at: string
}

export interface DiningRequest {
  id: string
  host_id: string
  restaurant_name: string
  restaurant_address: string
  latitude?: number
  longitude?: number
  dining_time: string
  seats_available: number
  total_seats: number
  description?: string
  status: 'open' | 'closed' | 'completed'
  created_at: string
  host?: Profile
}

export interface DiningJoin {
  id: string
  request_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'declined'
  message?: string
  created_at: string
  user?: Profile
}

export interface Rating {
  id: string
  from_user_id: string
  to_user_id: string
  request_id: string
  rating: number
  comment?: string
  created_at: string
}
