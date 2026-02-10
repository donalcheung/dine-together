// Achievement System Configuration
// Defines all achievements, their requirements, and XP rewards

export interface Achievement {
  key: string
  name: string
  description: string
  icon: string
  type: 'cuisine' | 'behavior' | 'milestone'
  target: number
  xpBonus: number
  checkCondition: (userData: any) => boolean
  getProgress: (userData: any) => number
}

// XP Award Amounts
export const XP_REWARDS = {
  COMPLETE_MEAL_HOST: 50,
  COMPLETE_MEAL_GUEST: 30,
  CREATE_REQUEST: 10,
  UPLOAD_PHOTO: 10,
  LEAVE_REVIEW: 5,
  ADD_PROFILE_PHOTO: 5,
  FILL_PROFILE_BIO: 5,
  RECEIVE_LIKE: 3,
  MONTHLY_HOST_BONUS: 30,
  MONTHLY_GUEST_BONUS: 20,
  ACHIEVEMENT_UNLOCK: 50, // Bonus XP when unlocking any achievement
} as const

// Level Calculation
export function calculateLevel(totalXp: number): number {
  let level = 1
  let xpThreshold = 50
  
  while (totalXp >= xpThreshold) {
    level++
    xpThreshold += (50 * level)
  }
  
  return level
}

// XP needed to reach a specific level
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  
  let totalXp = 0
  for (let i = 2; i <= level; i++) {
    totalXp += (50 * i)
  }
  return totalXp
}

// XP progress to next level
export function xpProgress(currentXp: number): {
  currentLevel: number
  xpIntoLevel: number
  xpNeededForNext: number
  progressPercent: number
} {
  const currentLevel = calculateLevel(currentXp)
  const xpForCurrentLevel = xpForLevel(currentLevel)
  const xpForNextLevel = xpForLevel(currentLevel + 1)
  const xpIntoLevel = currentXp - xpForCurrentLevel
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel
  const progressPercent = Math.round((xpIntoLevel / xpNeededForNext) * 100)
  
  return {
    currentLevel,
    xpIntoLevel,
    xpNeededForNext,
    progressPercent
  }
}

// Level Titles (based on level milestones)
export const LEVEL_TITLES: Record<number, { title: string; icon: string }> = {
  1: { title: 'Newcomer', icon: '🌱' },
  5: { title: 'Regular Diner', icon: '🍽️' },
  10: { title: 'Veteran Diner', icon: '🏆' },
  15: { title: 'Elite Foodie', icon: '💎' },
  20: { title: 'TableMesh Legend', icon: '👑' }
}

export function getLevelTitle(level: number): { title: string; icon: string } | null {
  const milestones = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a)
  const milestone = milestones.find(m => level >= m)
  return milestone ? LEVEL_TITLES[milestone] : null
}

// Cuisine Type Mapping (for achievement detection)
export const CUISINE_KEYWORDS: Record<string, string[]> = {
  dim_sum: ['dim sum', 'dimsum', 'yum cha'],
  sushi: ['sushi', 'japanese', 'sashimi'],
  tacos: ['taco', 'mexican', 'burrito', 'quesadilla'],
  pizza: ['pizza', 'pizzeria', 'italian'],
  bbq: ['bbq', 'korean bbq', 'kbbq', 'barbecue'],
  ramen: ['ramen', 'noodle'],
  burger: ['burger', 'hamburger'],
  thai: ['thai', 'pad thai'],
  indian: ['indian', 'curry'],
  chinese: ['chinese', 'szechuan', 'cantonese'],
}

export function detectCuisineType(restaurantName: string, description?: string): string | null {
  const searchText = `${restaurantName} ${description || ''}`.toLowerCase()
  
  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return cuisine
    }
  }
  
  return null
}

// Achievement Definitions
export const ACHIEVEMENTS: Record<string, Achievement> = {
  // Cuisine-Specific Achievements
  dim_sum_master: {
    key: 'dim_sum_master',
    name: 'Dim Sum Master',
    description: 'Complete 5 meals at dim sum restaurants',
    icon: '🥟',
    type: 'cuisine',
    target: 5,
    xpBonus: 50,
    checkCondition: (userData) => (userData.cuisineCount?.dim_sum || 0) >= 5,
    getProgress: (userData) => userData.cuisineCount?.dim_sum || 0
  },
  
  sushi_sensei: {
    key: 'sushi_sensei',
    name: 'Sushi Sensei',
    description: 'Complete 5 meals at sushi restaurants',
    icon: '🍣',
    type: 'cuisine',
    target: 5,
    xpBonus: 50,
    checkCondition: (userData) => (userData.cuisineCount?.sushi || 0) >= 5,
    getProgress: (userData) => userData.cuisineCount?.sushi || 0
  },
  
  taco_connoisseur: {
    key: 'taco_connoisseur',
    name: 'Taco Connoisseur',
    description: 'Complete 5 meals at taco/Mexican restaurants',
    icon: '🌮',
    type: 'cuisine',
    target: 5,
    xpBonus: 50,
    checkCondition: (userData) => (userData.cuisineCount?.tacos || 0) >= 5,
    getProgress: (userData) => userData.cuisineCount?.tacos || 0
  },
  
  pizza_pro: {
    key: 'pizza_pro',
    name: 'Pizza Pro',
    description: 'Complete 5 meals at pizza/Italian restaurants',
    icon: '🍕',
    type: 'cuisine',
    target: 5,
    xpBonus: 50,
    checkCondition: (userData) => (userData.cuisineCount?.pizza || 0) >= 5,
    getProgress: (userData) => userData.cuisineCount?.pizza || 0
  },
  
  bbq_baron: {
    key: 'bbq_baron',
    name: 'BBQ Baron',
    description: 'Complete 3 Korean BBQ meals',
    icon: '🥩',
    type: 'cuisine',
    target: 3,
    xpBonus: 50,
    checkCondition: (userData) => (userData.cuisineCount?.bbq || 0) >= 3,
    getProgress: (userData) => userData.cuisineCount?.bbq || 0
  },
  
  ramen_ronin: {
    key: 'ramen_ronin',
    name: 'Ramen Ronin',
    description: 'Complete 5 ramen meals',
    icon: '🍜',
    type: 'cuisine',
    target: 5,
    xpBonus: 50,
    checkCondition: (userData) => (userData.cuisineCount?.ramen || 0) >= 5,
    getProgress: (userData) => userData.cuisineCount?.ramen || 0
  },

  // Behavior-Based Achievements
  social_butterfly: {
    key: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Dine with 10 different people',
    icon: '🦋',
    type: 'behavior',
    target: 10,
    xpBonus: 100,
    checkCondition: (userData) => (userData.uniqueDiningPartners || 0) >= 10,
    getProgress: (userData) => userData.uniqueDiningPartners || 0
  },
  
  generous_host: {
    key: 'generous_host',
    name: 'Generous Host',
    description: 'Host 10 successful meals',
    icon: '🎩',
    type: 'behavior',
    target: 10,
    xpBonus: 100,
    checkCondition: (userData) => (userData.mealsHosted || 0) >= 10,
    getProgress: (userData) => userData.mealsHosted || 0
  },
  
  perfect_guest: {
    key: 'perfect_guest',
    name: 'Perfect Guest',
    description: 'Complete 10 meals as a guest',
    icon: '⭐',
    type: 'behavior',
    target: 10,
    xpBonus: 100,
    checkCondition: (userData) => {
      const mealsAsGuest = (userData.mealsCompleted || 0) - (userData.mealsHosted || 0)
      return mealsAsGuest >= 10
    },
    getProgress: (userData) => {
      const mealsAsGuest = (userData.mealsCompleted || 0) - (userData.mealsHosted || 0)
      return Math.max(0, mealsAsGuest)
    }
  },
  
  early_bird: {
    key: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 breakfast meals (before 11 AM)',
    icon: '🌅',
    type: 'behavior',
    target: 5,
    xpBonus: 25,
    checkCondition: (userData) => (userData.breakfastMeals || 0) >= 5,
    getProgress: (userData) => userData.breakfastMeals || 0
  },
  
  night_owl: {
    key: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 5 meals after 9 PM',
    icon: '🦉',
    type: 'behavior',
    target: 5,
    xpBonus: 25,
    checkCondition: (userData) => (userData.lateMeals || 0) >= 5,
    getProgress: (userData) => userData.lateMeals || 0
  },
  
  foodie_explorer: {
    key: 'foodie_explorer',
    name: 'Foodie Explorer',
    description: 'Try 10 different cuisine types',
    icon: '🗺️',
    type: 'behavior',
    target: 10,
    xpBonus: 200,
    checkCondition: (userData) => {
      const cuisineTypes = Object.keys(userData.cuisineCount || {})
      return cuisineTypes.length >= 10
    },
    getProgress: (userData) => {
      const cuisineTypes = Object.keys(userData.cuisineCount || {})
      return cuisineTypes.length
    }
  },
  
  weekend_warrior: {
    key: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 weekend meals',
    icon: '🎉',
    type: 'behavior',
    target: 10,
    xpBonus: 50,
    checkCondition: (userData) => (userData.weekendMeals || 0) >= 10,
    getProgress: (userData) => userData.weekendMeals || 0
  },
}

// Get all achievements for a user with progress
export function getUserAchievementProgress(userData: any): Array<Achievement & { 
  progress: number
  isUnlocked: boolean 
  progressPercent: number
}> {
  return Object.values(ACHIEVEMENTS).map(achievement => {
    const progress = achievement.getProgress(userData)
    const isUnlocked = achievement.checkCondition(userData)
    const progressPercent = Math.min(100, Math.round((progress / achievement.target) * 100))
    
    return {
      ...achievement,
      progress,
      isUnlocked,
      progressPercent
    }
  })
}

// Check which achievements should be unlocked
export function checkAchievementUnlocks(userData: any): string[] {
  const unlockedKeys: string[] = []
  
  for (const achievement of Object.values(ACHIEVEMENTS)) {
    if (achievement.checkCondition(userData)) {
      unlockedKeys.push(achievement.key)
    }
  }
  
  return unlockedKeys
}
