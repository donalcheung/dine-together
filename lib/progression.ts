// Progression Service
// Handles XP awards, achievement unlocks, and progression updates

import { supabase } from './supabase'
import { XP_REWARDS, ACHIEVEMENTS, checkAchievementUnlocks, detectCuisineType } from './achievements'

export interface ProgressionData {
  total_xp: number
  current_level: number
  meals_completed: number
  meals_hosted: number
  unique_dining_partners: number
  cities_visited: string[]
}

export interface AchievementData {
  achievement_key: string
  progress: number
  target: number
  unlocked_at: string | null
  is_displayed: boolean
}

export interface LevelUpResult {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  newTotalXp: number
}

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  requestId?: string
): Promise<LevelUpResult | null> {
  try {
    // Call the database function to award XP
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_request_id: requestId || null
    })

    if (error) throw error

    if (data && data.length > 0) {
      const result = data[0]
      return {
        leveledUp: result.leveled_up,
        oldLevel: result.old_level,
        newLevel: result.new_level,
        newTotalXp: result.new_total_xp
      }
    }

    return null
  } catch (error) {
    console.error('Error awarding XP:', error)
    return null
  }
}

/**
 * Get user's progression data
 */
export async function getUserProgression(userId: string): Promise<ProgressionData | null> {
  try {
    const { data, error } = await supabase
      .from('user_progression')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user progression:', error)
    return null
  }
}

/**
 * Get user's achievements
 */
export async function getUserAchievements(userId: string): Promise<AchievementData[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false, nullsFirst: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting user achievements:', error)
    return []
  }
}

/**
 * Get user's displayed achievement (title)
 */
export async function getDisplayedAchievement(userId: string): Promise<AchievementData | null> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('is_displayed', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error
    return data || null
  } catch (error) {
    console.error('Error getting displayed achievement:', error)
    return null
  }
}

/**
 * Set which achievement to display on profile
 */
export async function setDisplayedAchievement(
  userId: string,
  achievementKey: string | null
): Promise<boolean> {
  try {
    if (!achievementKey) {
      // Clear all displayed achievements
      const { error } = await supabase
        .from('user_achievements')
        .update({ is_displayed: false })
        .eq('user_id', userId)
        .eq('is_displayed', true)

      if (error) throw error
      return true
    }

    // Set the selected achievement as displayed
    const { error } = await supabase
      .from('user_achievements')
      .update({ is_displayed: true })
      .eq('user_id', userId)
      .eq('achievement_key', achievementKey)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error setting displayed achievement:', error)
    return false
  }
}

/**
 * Track cuisine type for a user
 */
export async function trackCuisine(
  userId: string,
  cuisineType: string
): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('track_cuisine', {
      p_user_id: userId,
      p_cuisine_type: cuisineType
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error tracking cuisine:', error)
    return null
  }
}

/**
 * Update achievement progress
 */
export async function updateAchievementProgress(
  userId: string,
  achievementKey: string,
  progress: number,
  target: number
): Promise<void> {
  try {
    const unlocked = progress >= target

    const { error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_key: achievementKey,
        progress,
        target,
        unlocked_at: unlocked ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,achievement_key'
      })

    if (error) throw error

    // Award bonus XP for unlocking achievement
    if (unlocked) {
      const achievement = ACHIEVEMENTS[achievementKey]
      if (achievement) {
        await awardXP(
          userId,
          achievement.xpBonus,
          `Unlocked achievement: ${achievement.name}`
        )
      }
    }
  } catch (error) {
    console.error('Error updating achievement progress:', error)
  }
}

/**
 * Process meal completion and award XP + check achievements
 */
export async function processMealCompletion(
  userId: string,
  requestId: string,
  isHost: boolean,
  restaurantName: string,
  restaurantAddress: string,
  diningTime: string,
  description?: string
): Promise<{ levelUpResult: LevelUpResult | null; newAchievements: string[] }> {
  try {
    // Award XP for meal completion
    const xpAmount = isHost ? XP_REWARDS.COMPLETE_MEAL_HOST : XP_REWARDS.COMPLETE_MEAL_GUEST
    const reason = isHost ? 'Completed meal as host' : 'Completed meal as guest'
    const levelUpResult = await awardXP(userId, xpAmount, reason, requestId)

    // Update progression stats
    const { error: progressError } = await supabase
      .from('user_progression')
      .update({
        meals_completed: supabase.raw('meals_completed + 1'),
        meals_hosted: isHost ? supabase.raw('meals_hosted + 1') : supabase.raw('meals_hosted')
      })
      .eq('user_id', userId)

    if (progressError) console.error('Error updating progression:', progressError)

    // Detect and track cuisine type
    const cuisineType = detectCuisineType(restaurantName, description)
    if (cuisineType) {
      await trackCuisine(userId, cuisineType)
    }

    // Extract city from address
    const cityMatch = restaurantAddress.match(/,\s*([^,]+),\s*[A-Z]{2}/)
    if (cityMatch) {
      const city = cityMatch[1].trim()
      const { data: currentProgression } = await supabase
        .from('user_progression')
        .select('cities_visited')
        .eq('user_id', userId)
        .single()

      const cities = currentProgression?.cities_visited || []
      if (!cities.includes(city)) {
        await supabase
          .from('user_progression')
          .update({
            cities_visited: [...cities, city]
          })
          .eq('user_id', userId)
      }
    }

    // Check for time-based achievements
    const mealDate = new Date(diningTime)
    const hour = mealDate.getHours()
    const dayOfWeek = mealDate.getDay()

    // Early bird (before 11 AM)
    if (hour < 11) {
      const { data: earlyBirdData } = await supabase
        .from('user_achievements')
        .select('progress')
        .eq('user_id', userId)
        .eq('achievement_key', 'early_bird')
        .single()

      const progress = (earlyBirdData?.progress || 0) + 1
      await updateAchievementProgress(userId, 'early_bird', progress, 5)
    }

    // Night owl (after 9 PM)
    if (hour >= 21) {
      const { data: nightOwlData } = await supabase
        .from('user_achievements')
        .select('progress')
        .eq('user_id', userId)
        .eq('achievement_key', 'night_owl')
        .single()

      const progress = (nightOwlData?.progress || 0) + 1
      await updateAchievementProgress(userId, 'night_owl', progress, 5)
    }

    // Weekend warrior (Saturday or Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const { data: weekendData } = await supabase
        .from('user_achievements')
        .select('progress')
        .eq('user_id', userId)
        .eq('achievement_key', 'weekend_warrior')
        .single()

      const progress = (weekendData?.progress || 0) + 1
      await updateAchievementProgress(userId, 'weekend_warrior', progress, 10)
    }

    // Get all user data for achievement checking
    const progression = await getUserProgression(userId)
    const { data: cuisineData } = await supabase
      .from('cuisine_tracking')
      .select('cuisine_type, meal_count')
      .eq('user_id', userId)

    const cuisineCount: Record<string, number> = {}
    if (cuisineData) {
      cuisineData.forEach(c => {
        cuisineCount[c.cuisine_type] = c.meal_count
      })
    }

    const userData = {
      ...progression,
      cuisineCount,
      mealsCompleted: progression?.meals_completed || 0,
      mealsHosted: progression?.meals_hosted || 0,
      uniqueDiningPartners: progression?.unique_dining_partners || 0
    }

    // Check all achievements
    const unlockedAchievements = checkAchievementUnlocks(userData)
    const newAchievements: string[] = []

    for (const achievementKey of unlockedAchievements) {
      const achievement = ACHIEVEMENTS[achievementKey]
      if (!achievement) continue

      // Check if this achievement was just unlocked
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('unlocked_at')
        .eq('user_id', userId)
        .eq('achievement_key', achievementKey)
        .single()

      if (!existingAchievement || !existingAchievement.unlocked_at) {
        const progress = achievement.getProgress(userData)
        await updateAchievementProgress(userId, achievementKey, progress, achievement.target)
        newAchievements.push(achievementKey)
      }
    }

    return { levelUpResult, newAchievements }
  } catch (error) {
    console.error('Error processing meal completion:', error)
    return { levelUpResult: null, newAchievements: [] }
  }
}

/**
 * Get recent XP transactions for a user
 */
export async function getRecentXPTransactions(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting XP transactions:', error)
    return []
  }
}

/**
 * Initialize progression for a new user
 */
export async function initializeUserProgression(userId: string): Promise<void> {
  try {
    // Award welcome XP
    await awardXP(userId, 10, 'Welcome to TableMesh!')

    // Check if they have profile data filled
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url, bio')
      .eq('id', userId)
      .single()

    if (profile?.avatar_url) {
      await awardXP(userId, XP_REWARDS.ADD_PROFILE_PHOTO, 'Added profile photo')
    }

    if (profile?.bio && profile.bio.length > 0) {
      await awardXP(userId, XP_REWARDS.FILL_PROFILE_BIO, 'Completed profile bio')
    }
  } catch (error) {
    console.error('Error initializing user progression:', error)
  }
}
