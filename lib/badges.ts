import { ACHIEVEMENTS } from './achievements'

// 5 Basic badges available to all users
export const BASIC_BADGES = [
  { emoji: '🌟', name: 'Star', id: 'basic_star' },
  { emoji: '⭐', name: 'Star 2', id: 'basic_star2' },
  { emoji: '💫', name: 'Dizzy', id: 'basic_dizzy' },
  { emoji: '✨', name: 'Sparkles', id: 'basic_sparkles' },
  { emoji: '🎯', name: 'Target', id: 'basic_target' },
]

// Get badge for an achievement (uses the achievement's badge emoji)
export function getBadgeForAchievement(achievementId: string): string | null {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
  return achievement ? achievement.badge : null
}

// Get all available badges for a user based on their unlocked achievements
export function getAvailableBadges(unlockedAchievementIds: string[]): Array<{ emoji: string; name: string; id: string; source: 'basic' | 'achievement'; achievementId?: string }> {
  const badges: Array<{ emoji: string; name: string; id: string; source: 'basic' | 'achievement'; achievementId?: string }> = []

  // Add basic badges (always available)
  badges.push(...BASIC_BADGES.map(b => ({ ...b, source: 'basic' as const })))

  // Add achievement badges
  unlockedAchievementIds.forEach(achievementId => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (achievement) {
      badges.push({
        emoji: achievement.badge,
        name: achievement.name,
        id: `achievement_${achievementId}`,
        source: 'achievement',
        achievementId: achievementId,
      })
    } else {
      console.warn(`[Badges] Achievement not found: ${achievementId}`)
    }
  })

  console.log(`[Badges] Generated ${badges.length} badges (${badges.filter(b => b.source === 'basic').length} basic, ${badges.filter(b => b.source === 'achievement').length} achievement) from ${unlockedAchievementIds.length} achievements`)

  return badges
}

// Get badge emoji from badge ID or emoji string
export function getBadgeEmoji(badge: string | null | undefined): string | null {
  if (!badge || badge.trim() === '') return null
  
  // Trim whitespace
  const trimmedBadge = badge.trim()
  
  // If it's already an emoji (check if it contains emoji characters)
  // Emojis are typically 1-2 characters but can be longer with modifiers
  const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/u
  if (emojiRegex.test(trimmedBadge)) {
    return trimmedBadge
  }

  // If it's a basic badge ID
  const basicBadge = BASIC_BADGES.find(b => b.id === trimmedBadge)
  if (basicBadge) {
    return basicBadge.emoji
  }

  // If it's an achievement badge ID
  if (trimmedBadge.startsWith('achievement_')) {
    const achievementId = trimmedBadge.replace('achievement_', '')
    const emoji = getBadgeForAchievement(achievementId)
    if (emoji) {
      return emoji
    }
  }

  // If we still don't have an emoji, return null
  console.warn(`[Badges] Could not resolve badge: "${trimmedBadge}"`)
  return null
}

// Check if a badge is available to a user
export function isBadgeAvailable(badgeId: string, unlockedAchievementIds: string[]): boolean {
  // Basic badges are always available
  if (BASIC_BADGES.some(b => b.id === badgeId)) {
    return true
  }

  // Achievement badges require the achievement to be unlocked
  if (badgeId.startsWith('achievement_')) {
    const achievementId = badgeId.replace('achievement_', '')
    return unlockedAchievementIds.includes(achievementId)
  }

  // Legacy support: if it's just an emoji, allow it (for backwards compatibility)
  if (badgeId.length <= 2 || /[\p{Emoji}]/u.test(badgeId)) {
    return true
  }

  return false
}

