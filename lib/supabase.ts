// =====================================================
// RESTAURANT OWNERS FEATURE - TypeScript Types
// =====================================================
// Add these to your lib/supabase.ts file

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Minimal Profile type used across the app
export interface Profile {
  id: string
  name: string
  avatar_url?: string
  email?: string
  total_likes?: number
  created_at?: string
}

// Minimal Group type used by DiningRequest and UI
export interface Group {
  id: string
  name: string
  description?: string
  cover_image_url?: string
  join_code?: string
  created_by?: string
  member_count?: number
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role?: 'member' | 'admin'
  joined_at?: string
  user?: Profile
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

export interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  postal_code?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  website?: string
  google_place_id?: string
  google_business_verified: boolean
  verification_status: 'unverified' | 'pending' | 'verified' | 'premium'
  verification_method?: string
  verified_at?: string
  logo_url?: string
  cover_image_url?: string
  cuisine_types?: string[]
  price_range?: number
  capacity?: number
  operating_hours?: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  features?: string[]
  owner_id?: string
  is_active: boolean
  is_accepting_deals: boolean
  created_at: string
  updated_at: string
  owner?: Profile
}

export interface RestaurantDeal {
  id: string
  restaurant_id: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed_amount' | 'free_item'
  discount_value: number
  min_party_size: number
  max_party_size?: number
  min_spend?: number
  valid_days?: number[] // 1-7 (Monday-Sunday)
  valid_time_start?: string
  valid_time_end?: string
  starts_at: string
  expires_at?: string
  max_redemptions?: number
  redemptions_count: number
  max_per_user: number
  is_active: boolean
  created_at: string
  updated_at: string
  restaurant?: Restaurant
}

export interface DealRedemption {
  id: string
  deal_id: string
  dining_request_id?: string
  user_id: string
  restaurant_id: string
  party_size: number
  discount_applied: number
  redeemed_at: string
  verification_code?: string
  verified_by_restaurant: boolean
  verified_at?: string
  status: 'pending' | 'verified' | 'cancelled' | 'expired'
  user?: Profile
  deal?: RestaurantDeal
  restaurant?: Restaurant
}

// Update DiningRequest interface to include restaurant
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
  restaurant_id?: string  // ADD THIS
  restaurant?: Restaurant  // ADD THIS
}
