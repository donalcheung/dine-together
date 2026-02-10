// Progression UI Components
// Reusable components for displaying user level, XP, and achievements

import { Star, Trophy, TrendingUp } from 'lucide-react'
import { ACHIEVEMENTS, getLevelTitle, xpProgress } from './achievements'

interface UserProgressionBadgeProps {
  level: number
  totalXp: number
  displayedAchievementKey?: string | null
  size?: 'small' | 'medium' | 'large'
  showXP?: boolean
}

/**
 * Display user level + achievement title badge
 * Used on: Dashboard cards, Request cards, Profile headers
 */
export function UserProgressionBadge({
  level,
  totalXp,
  displayedAchievementKey,
  size = 'medium',
  showXP = false
}: UserProgressionBadgeProps) {
  const levelTitle = getLevelTitle(level)
  const achievement = displayedAchievementKey ? ACHIEVEMENTS[displayedAchievementKey] : null
  
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {/* Level Badge */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold">
        <TrendingUp className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'}`} />
        <span>Level {level}</span>
      </div>

      {/* Achievement Title */}
      {achievement && (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium border border-amber-300">
          <span>{achievement.icon}</span>
          <span>{achievement.name}</span>
        </div>
      )}

      {/* XP (optional) */}
      {showXP && (
        <span className="text-gray-600 font-medium">
          {totalXp.toLocaleString()} XP
        </span>
      )}
    </div>
  )
}

interface LevelProgressBarProps {
  totalXp: number
  showDetails?: boolean
}

/**
 * XP Progress bar showing progress to next level
 * Used on: Profile page
 */
export function LevelProgressBar({ totalXp, showDetails = true }: LevelProgressBarProps) {
  const progress = xpProgress(totalXp)
  
  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Level {progress.currentLevel}
          </span>
          <span className="text-xs text-gray-500">
            {progress.xpIntoLevel.toLocaleString()} / {progress.xpNeededForNext.toLocaleString()} XP
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>
      
      {showDetails && (
        <div className="text-center mt-1 text-xs text-gray-500">
          {progress.progressPercent}% to Level {progress.currentLevel + 1}
        </div>
      )}
    </div>
  )
}

interface AchievementGridProps {
  achievements: Array<{
    key: string
    progress: number
    isUnlocked: boolean
    progressPercent: number
  }>
  onSelect?: (achievementKey: string) => void
  selectedKey?: string | null
}

/**
 * Grid display of achievements with progress
 * Used on: Profile page
 */
export function AchievementGrid({ achievements, onSelect, selectedKey }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {achievements.map((achievement) => {
        const achievementData = ACHIEVEMENTS[achievement.key]
        if (!achievementData) return null
        
        const isUnlocked = achievement.isUnlocked
        const isSelected = selectedKey === achievement.key

        return (
          <button
            key={achievement.key}
            onClick={() => onSelect?.(achievement.key)}
            disabled={!isUnlocked}
            className={`p-4 rounded-xl border-2 transition-all ${
              isUnlocked
                ? isSelected
                  ? 'bg-amber-50 border-amber-400 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-md'
                : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <div className={`text-4xl mb-2 ${!isUnlocked && 'grayscale'}`}>
                {achievementData.icon}
              </div>
              <div className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                {achievementData.name}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {achievementData.description}
              </div>
              
              {/* Progress Bar */}
              {!isUnlocked && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${achievement.progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {achievement.progress}/{achievementData.target}
                  </div>
                </div>
              )}
              
              {isUnlocked && (
                <div className="flex items-center justify-center gap-1 text-xs text-green-600 font-medium mt-2">
                  <Trophy className="w-3 h-3" />
                  <span>Unlocked!</span>
                </div>
              )}
              
              {isSelected && (
                <div className="text-xs text-amber-600 font-bold mt-2">
                  ✓ Displayed
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

interface XPTransactionListProps {
  transactions: Array<{
    amount: number
    reason: string
    created_at: string
  }>
}

/**
 * List of recent XP gains
 * Used on: Profile page
 */
export function XPTransactionList({ transactions }: XPTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No XP activity yet</p>
        <p className="text-sm">Complete meals to start earning XP!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">
              {transaction.reason}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div
            className={`font-bold ${
              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {transaction.amount > 0 ? '+' : ''}{transaction.amount} XP
          </div>
        </div>
      ))}
    </div>
  )
}

interface LevelUpModalProps {
  isOpen: boolean
  oldLevel: number
  newLevel: number
  onClose: () => void
}

/**
 * Modal shown when user levels up
 * Used: After meal completion
 */
export function LevelUpModal({ isOpen, oldLevel, newLevel, onClose }: LevelUpModalProps) {
  if (!isOpen) return null

  const levelTitle = getLevelTitle(newLevel)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Level Up!</h2>
        <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Level {newLevel}
        </div>
        
        {levelTitle && (
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-2xl mb-1">{levelTitle.icon}</div>
            <div className="text-lg font-bold text-amber-800">{levelTitle.title}</div>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">
          Keep dining to unlock more achievements and rewards!
        </p>
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Awesome!
        </button>
      </div>
    </div>
  )
}

interface AchievementUnlockToastProps {
  achievement: {
    name: string
    icon: string
    description: string
  }
  onClose: () => void
}

/**
 * Toast notification for achievement unlock
 * Used: After meal completion
 */
export function AchievementUnlockToast({ achievement, onClose }: AchievementUnlockToastProps) {
  return (
    <div className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl p-4 max-w-sm animate-slide-in-right z-50 border-2 border-amber-400">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{achievement.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 uppercase">Achievement Unlocked!</span>
          </div>
          <div className="font-bold text-gray-800 mb-1">{achievement.name}</div>
          <div className="text-sm text-gray-600">{achievement.description}</div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
