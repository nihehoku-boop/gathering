/**
 * Category/use-case landing pages for SEO at /collect/[slug].
 * Each entry is crawlable and targets relevant search intent.
 */

export interface CollectPageConfig {
  slug: string
  label: string // Short label for landing page chips
  title: string
  description: string
  heading: string
  subheading: string
  body: string[]
  keywords: string
}

export const COLLECT_PAGES: CollectPageConfig[] = [
  {
    slug: 'books',
    label: 'Books',
    title: 'Book Collection Tracker | Reading Lists & Library Manager – Colletro',
    description:
      'Track your book collection, reading lists, first editions, and signed copies. Free book collection manager with progress tracking and recommendations.',
    heading: 'Track Your Book Collection',
    subheading: 'Reading lists, first editions, signed copies — all in one place',
    body: [
      'Whether you collect first editions, keep a reading list, or track every book on your shelf, Colletro helps you organize your library. Create collections by genre, award winners, or your own categories.',
      'Mark what you’ve read, add notes and ratings, and see your progress at a glance. Discover curated recommended collections like Pulitzer or Nobel winners and add them to your trove with one click.',
    ],
    keywords: 'book collection tracker, reading list app, library manager, first edition tracker, book collection app',
  },
  {
    slug: 'trading-cards',
    label: 'Trading Cards',
    title: 'Trading Card Collection Tracker | Pokémon, Magic, Sports – Colletro',
    description:
      'Track Pokémon, Magic: The Gathering, sports cards, and more. Checklist and collection tracker with progress, images, and community collections.',
    heading: 'Trading Card Collection Tracker',
    subheading: 'Pokémon, Magic, sports cards — checklists and progress in one place',
    body: [
      'Manage your trading card collections with checklists, progress bars, and optional images. Colletro supports Pokémon TCG, Magic: The Gathering, Yu-Gi-Oh!, sports cards, and any other set you collect.',
      'Browse community collections for full set checklists, mark what you own, and keep track of condition and notes. Sync with curated recommended sets when admins add new cards.',
    ],
    keywords: 'pokemon card tracker, magic the gathering collection, trading card checklist, sports cards collection app',
  },
  {
    slug: 'comics',
    label: 'Comics',
    title: 'Comic Book Collection Manager | Track & Organize Your Comics – Colletro',
    description:
      'Organize and track your comic book collection. Series checklists, progress tracking, and bulk import for single issues and graphic novels.',
    heading: 'Comic Book Collection Manager',
    subheading: 'Series checklists, single issues, and graphic novels in one trove',
    body: [
      'Built by a collector, for collectors: track runs, complete sets, and graphic novels with custom fields and progress tracking. Bulk import makes it easy to add long series.',
      'Use recommended collections for popular runs or browse community collections for checklists. Mark owned issues, add notes and condition, and see your collection grow.',
    ],
    keywords: 'comic book collection app, comic tracker, graphic novel collection, comic checklist',
  },
  {
    slug: 'movies',
    label: 'Movies',
    title: 'Movie & Film Collection Tracker | Blu-ray, DVD, Watchlist – Colletro',
    description:
      'Track your movie and film collection: Blu-rays, DVDs, and watchlists. Collection manager with progress tracking and curated lists.',
    heading: 'Movie & Film Collection Tracker',
    subheading: 'Blu-rays, DVDs, and watchlists — all in one place',
    body: [
      'Catalog your physical media and watchlists in one place. Track what you own, what you’ve watched, and what you want to see. Add custom notes and ratings.',
      'Discover curated collections like Oscar Best Picture winners or Studio Ghibli and add them to your account. Progress bars show how much of each list you’ve completed.',
    ],
    keywords: 'movie collection tracker, film collection app, blu ray collection, dvd collection manager',
  },
  {
    slug: 'video-games',
    label: 'Video Games',
    title: 'Video Game Collection Tracker | Backlog & Game Library – Colletro',
    description:
      'Track your video game collection and backlog. Organize by platform, completion status, and wishlist. Free game collection manager.',
    heading: 'Video Game Collection Tracker',
    subheading: 'Backlogs, libraries, and wishlists — one place for your games',
    body: [
      'Keep track of every game you own, your backlog, and your wishlist. Organize by platform, mark completion, and add personal ratings and notes.',
      'Create collections for franchises, genres, or platforms. Progress tracking helps you see how much you’ve played and what’s still waiting.',
    ],
    keywords: 'video game collection tracker, game backlog app, game library manager',
  },
  {
    slug: 'vinyl-records',
    label: 'Vinyl Records',
    title: 'Vinyl Record Collection Tracker | Catalog Your Records – Colletro',
    description:
      'Catalog and track your vinyl record collection. Organize by artist, genre, or custom collections. Free vinyl collection manager.',
    heading: 'Vinyl Record Collection Tracker',
    subheading: 'Catalog your records by artist, genre, or collection',
    body: [
      'Build a searchable catalog of your vinyl collection. Add details, condition, and notes. Organize by artist, genre, or your own collections.',
      'Track what you have and what you’re looking for. Progress and tags make it easy to browse and manage a growing collection.',
    ],
    keywords: 'vinyl collection tracker, record collection app, vinyl catalog',
  },
]

const slugToConfig = new Map(COLLECT_PAGES.map((p) => [p.slug, p]))

export function getCollectPageBySlug(slug: string): CollectPageConfig | undefined {
  return slugToConfig.get(slug.toLowerCase())
}

export function getAllCollectSlugs(): string[] {
  return COLLECT_PAGES.map((p) => p.slug)
}
