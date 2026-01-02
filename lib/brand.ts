/**
 * Brand constants for Colletro
 * Centralized location for all brand-related text and metadata
 */

export const BRAND = {
  name: 'Colletro',
  tagline: 'Your collection trove.',
  shortClaim: 'Build your trove. Catalog books, comics, movies, and cards — with tags, editions, and wishlists.',
  description: 'Colletro is your collection trove — a home for books, comics, movies, and cards.',
  longDescription: 'Track and manage your collections with ease. Organize comics, cards, books, and more. Discover community collections and track your progress.',
  
  // SEO & Metadata
  seo: {
    title: 'Colletro - Your Collection Trove',
    description: 'Build your trove. Catalog books, comics, movies, and cards — with tags, editions, and wishlists.',
    keywords: ['collection', 'collector', 'collections', 'tracking', 'organize', 'comics', 'cards', 'books', 'collectibles', 'trove'],
  },
  
  // UI Text
  ui: {
    homePageTitle: 'My Trove',
    welcomeMessage: 'Welcome back, {name}! Your trove awaits.',
    emptyTrove: 'Your trove is empty',
    startBuilding: 'Start building your trove',
    createFirstCollection: 'Start your trove',
    collectionEmpty: 'This collection is empty',
    addToTrove: 'Add to your trove',
  },
  
  // Feature Names
  features: {
    trove: 'Trove',
    collections: 'Collections',
    wishlist: 'Wishlist',
    vault: 'Vault', // For favorites/rare items (future)
  },
} as const

