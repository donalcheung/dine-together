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
  // Progression data (joined)
  progression?: UserProgression
  displayed_achievement?: UserAchievement
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
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  host?: Profile
  group_id?: string
  group?: Group
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

export interface Group {
  id: string
  name: string
  description?: string
  cover_image_url?: string
  is_public: boolean
  member_count: number
  created_by: string
  created_at: string
}

// NEW: Progression Types
export interface UserProgression {
  id: string
  user_id: string
  total_xp: number
  current_level: number
  meals_completed: number
  meals_hosted: number
  unique_dining_partners: number
  cities_visited: string[]
  created_at: string
  updated_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_key: string
  progress: number
  target: number
  unlocked_at: string | null
  is_displayed: boolean
  created_at: string
}

export interface XPTransaction {
  id: string
  user_id: string
  amount: number
  reason: string
  related_request_id?: string
  created_at: string
}

export interface CuisineTracking {
  id: string
  user_id: string
  cuisine_type: string
  meal_count: number
  last_meal_at: string
  created_at: string
}

// Helper to get profile with progression data
export async function getProfileWithProgression(userId: string): Promise<Profile | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    const { data: progression, error: progressionError } = await supabase
      .from('user_progression')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (progressionError && progressionError.code !== 'PGRST116') {
      console.error('Error fetching progression:', progressionError)
    }

    const { data: displayedAchievement, error: achievementError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('is_displayed', true)
      .maybeSingle()

    if (achievementError && achievementError.code !== 'PGRST116') {
      console.error('Error fetching achievement:', achievementError)
    }

    return {
      ...profile,
      progression: progression || undefined,
      displayed_achievement: displayedAchievement || undefined
    }
  } catch (error) {
    console.error('Error getting profile with progression:', error)
    return null
  }
}
