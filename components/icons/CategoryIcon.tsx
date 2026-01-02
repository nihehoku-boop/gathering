import { BookOpen, Book, Film, CreditCard, Gamepad2, Music, Palette, Trophy, Package } from 'lucide-react'

interface CategoryIconProps {
  category: string | null
  className?: string
}

/**
 * Category Icon Component
 * Returns appropriate icon based on collection category
 */
export default function CategoryIcon({ category, className = "h-4 w-4" }: CategoryIconProps) {
  if (!category) return null

  const categoryLower = category.toLowerCase()

  // Map categories to icons
  if (categoryLower.includes('book')) {
    return <BookOpen className={className} />
  }
  if (categoryLower.includes('comic')) {
    return <Book className={className} />
  }
  if (categoryLower.includes('movie') || categoryLower.includes('film')) {
    return <Film className={className} />
  }
  if (categoryLower.includes('card') || categoryLower.includes('trading')) {
    return <CreditCard className={className} />
  }
  if (categoryLower.includes('game') || categoryLower.includes('video game')) {
    return <Gamepad2 className={className} />
  }
  if (categoryLower.includes('music') || categoryLower.includes('vinyl') || categoryLower.includes('cd')) {
    return <Music className={className} />
  }
  if (categoryLower.includes('art')) {
    return <Palette className={className} />
  }
  if (categoryLower.includes('sport') || categoryLower.includes('trophy')) {
    return <Trophy className={className} />
  }

  // Default icon
  return <Package className={className} />
}

