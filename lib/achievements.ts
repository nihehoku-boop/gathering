// Achievement definitions with badges
export interface Achievement {
  id: string
  name: string
  description: string
  badge: string // Badge emoji or identifier
  category: 'collection' | 'items' | 'progress' | 'variety' | 'social' | 'special'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Collection Milestones
  { id: 'first_collection', name: 'Getting Started', description: 'Create your first collection', badge: '🎯', category: 'collection', rarity: 'common' },
  { id: 'five_collections', name: 'Collector', description: 'Create 5 collections', badge: '📚', category: 'collection', rarity: 'common' },
  { id: 'ten_collections', name: 'Bibliophile', description: 'Create 10 collections', badge: '📖', category: 'collection', rarity: 'uncommon' },
  { id: 'twenty_five_collections', name: 'Archivist', description: 'Create 25 collections', badge: '📚', category: 'collection', rarity: 'rare' },
  { id: 'fifty_collections', name: 'Curator', description: 'Create 50 collections', badge: '🏛️', category: 'collection', rarity: 'epic' },
  { id: 'hundred_collections', name: 'Master Collector', description: 'Create 100 collections', badge: '👑', category: 'collection', rarity: 'legendary' },

  // Item Milestones
  { id: 'ten_items', name: 'Small Collection', description: 'Add 10 items to your collections', badge: '📦', category: 'items', rarity: 'common' },
  { id: 'fifty_items', name: 'Growing Collection', description: 'Add 50 items to your collections', badge: '📊', category: 'items', rarity: 'common' },
  { id: 'hundred_items', name: 'Century Club', description: 'Add 100 items to your collections', badge: '💯', category: 'items', rarity: 'uncommon' },
  { id: 'five_hundred_items', name: 'Half a Thousand', description: 'Add 500 items to your collections', badge: '📈', category: 'items', rarity: 'rare' },
  { id: 'thousand_items', name: 'Millennium', description: 'Add 1,000 items to your collections', badge: '🌟', category: 'items', rarity: 'epic' },
  { id: 'five_thousand_items', name: 'Ultimate Collector', description: 'Add 5,000 items to your collections', badge: '🏆', category: 'items', rarity: 'legendary' },

  // Owned Item Milestones
  { id: 'ten_owned', name: 'First Steps', description: 'Mark 10 items as owned', badge: '✅', category: 'items', rarity: 'common' },
  { id: 'fifty_owned', name: 'Building Up', description: 'Mark 50 items as owned', badge: '📝', category: 'items', rarity: 'common' },
  { id: 'hundred_owned', name: 'Centurion', description: 'Mark 100 items as owned', badge: '💎', category: 'items', rarity: 'uncommon' },
  { id: 'five_hundred_owned', name: 'Half Grand', description: 'Mark 500 items as owned', badge: '💍', category: 'items', rarity: 'rare' },
  { id: 'thousand_owned', name: 'Grand Master', description: 'Mark 1,000 items as owned', badge: '🎖️', category: 'items', rarity: 'epic' },
  { id: 'five_thousand_owned', name: 'Legendary Owner', description: 'Mark 5,000 items as owned', badge: '⚡', category: 'items', rarity: 'legendary' },

  // Completion Achievements
  { id: 'first_complete', name: 'Completionist', description: 'Complete your first collection (100%)', badge: '🎉', category: 'progress', rarity: 'uncommon' },
  { id: 'five_complete', name: 'Perfectionist', description: 'Complete 5 collections (100%)', badge: '✨', category: 'progress', rarity: 'rare' },
  { id: 'ten_complete', name: 'Master Completer', description: 'Complete 10 collections (100%)', badge: '🏅', category: 'progress', rarity: 'epic' },
  { id: 'twenty_complete', name: 'Ultimate Perfectionist', description: 'Complete 20 collections (100%)', badge: '💫', category: 'progress', rarity: 'legendary' },

  // Progress Milestones
  { id: 'fifty_percent', name: 'Halfway There', description: 'Reach 50% completion in a collection', badge: '📊', category: 'progress', rarity: 'common' },
  { id: 'seventy_five_percent', name: 'Almost There', description: 'Reach 75% completion in a collection', badge: '📈', category: 'progress', rarity: 'uncommon' },
  { id: 'ninety_percent', name: 'So Close', description: 'Reach 90% completion in a collection', badge: '🎯', category: 'progress', rarity: 'rare' },
  { id: 'overall_fifty', name: 'Half Master', description: 'Reach 50% overall completion across all collections', badge: '🌟', category: 'progress', rarity: 'rare' },
  { id: 'overall_seventy_five', name: 'Three Quarters', description: 'Reach 75% overall completion across all collections', badge: '💫', category: 'progress', rarity: 'epic' },
  { id: 'overall_ninety', name: 'Near Perfect', description: 'Reach 90% overall completion across all collections', badge: '✨', category: 'progress', rarity: 'legendary' },

  // Variety Achievements
  { id: 'three_categories', name: 'Diverse Collector', description: 'Create collections in 3 different categories', badge: '🌈', category: 'variety', rarity: 'common' },
  { id: 'five_categories', name: 'Eclectic Tastes', description: 'Create collections in 5 different categories', badge: '🎨', category: 'variety', rarity: 'uncommon' },
  { id: 'ten_categories', name: 'Renaissance Collector', description: 'Create collections in 10 different categories', badge: '🎭', category: 'variety', rarity: 'rare' },
  { id: 'all_tags', name: 'Tag Master', description: 'Use all available tags across your collections', badge: '🏷️', category: 'variety', rarity: 'epic' },

  // Community Collections
  { id: 'first_recommended', name: 'Community Member', description: 'Add your first community collection', badge: '⭐', category: 'special', rarity: 'common' },
  { id: 'five_recommended', name: 'Community Enthusiast', description: 'Add 5 community collections', badge: '🌟', category: 'special', rarity: 'uncommon' },
  { id: 'ten_recommended', name: 'Community Champion', description: 'Add 10 community collections', badge: '💫', category: 'special', rarity: 'rare' },
  { id: 'sync_collection', name: 'Staying Updated', description: 'Sync a recommended collection with updates', badge: '🔄', category: 'special', rarity: 'uncommon' },

  // Social Achievements
  { id: 'public_profile', name: 'Going Public', description: 'Make your profile public', badge: '🌐', category: 'social', rarity: 'common' },
  { id: 'top_ten', name: 'Top Ten', description: 'Reach top 10 on the leaderboard', badge: '🥇', category: 'social', rarity: 'rare' },
  { id: 'top_three', name: 'Podium Finish', description: 'Reach top 3 on the leaderboard', badge: '🏆', category: 'social', rarity: 'epic' },
  { id: 'number_one', name: 'Champion', description: 'Reach #1 on the leaderboard', badge: '👑', category: 'social', rarity: 'legendary' },

  // Special Achievements
  { id: 'bulk_import', name: 'Efficient Collector', description: 'Use bulk import to add items', badge: '⚡', category: 'special', rarity: 'common' },
  { id: 'hundred_bulk', name: 'Bulk Master', description: 'Import 100+ items using bulk import', badge: '📦', category: 'special', rarity: 'rare' },
  { id: 'cover_images', name: 'Visual Collector', description: 'Add cover images to 5 collections', badge: '🖼️', category: 'special', rarity: 'uncommon' },
  { id: 'all_covers', name: 'Picture Perfect', description: 'Add cover images to all your collections', badge: '🎨', category: 'special', rarity: 'epic' },
  { id: 'item_images', name: 'Detail Oriented', description: 'Add images to 50 items', badge: '📸', category: 'special', rarity: 'rare' },
  { id: 'notes_master', name: 'Note Taker', description: 'Add notes to 25 items', badge: '📝', category: 'special', rarity: 'uncommon' },
  { id: 'rating_master', name: 'Critic', description: 'Rate 50 items', badge: '⭐', category: 'special', rarity: 'rare' },
  { id: 'log_dates', name: 'Historian', description: 'Log dates for 25 items', badge: '📅', category: 'special', rarity: 'uncommon' },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Join within the first month', badge: '🚀', category: 'special', rarity: 'rare' },
  { id: 'veteran', name: 'Veteran Collector', description: 'Be active for 6 months', badge: '🎖️', category: 'special', rarity: 'epic' },
  { id: 'dedicated', name: 'Dedicated', description: 'Be active for 1 year', badge: '💎', category: 'special', rarity: 'legendary' },
]

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return '#969696'
    case 'uncommon': return '#34C759'
    case 'rare': return '#007AFF'
    case 'epic': return '#AF52DE'
    case 'legendary': return '#FFD60A'
    default: return '#969696'
  }
}

export function parseAchievements(achievementsJson: string): string[] {
  try {
    const parsed = JSON.parse(achievementsJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function stringifyAchievements(achievements: string[]): string {
  return JSON.stringify(achievements)
}

