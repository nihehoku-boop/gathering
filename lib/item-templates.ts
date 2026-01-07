export interface TemplateField {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  placeholder?: string
  options?: string[] // For select fields
  required?: boolean
  min?: number // For number fields
  max?: number // For number fields
}

export interface ItemTemplate {
  id: string
  name: string
  description: string
  icon?: string
  fields: TemplateField[]
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  {
    id: 'comic-book',
    name: 'Comic Book',
    description: 'For comic books and graphic novels',
    icon: '📚',
    fields: [
      {
        id: 'publisher',
        label: 'Publisher',
        type: 'text',
        placeholder: 'e.g., Marvel, DC, Image',
      },
      {
        id: 'writer',
        label: 'Writer',
        type: 'text',
        placeholder: 'Writer name',
      },
      {
        id: 'artist',
        label: 'Artist',
        type: 'text',
        placeholder: 'Artist name',
      },
      {
        id: 'releaseDate',
        label: 'Release Date',
        type: 'date',
      },
      {
        id: 'variant',
        label: 'Variant Cover',
        type: 'select',
        options: ['Standard', 'Variant A', 'Variant B', 'Variant C', 'Other'],
      },
      {
        id: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['Mint', 'Near Mint', 'Very Fine', 'Fine', 'Very Good', 'Good', 'Fair', 'Poor'],
      },
    ],
  },
  {
    id: 'trading-card',
    name: 'Trading Card',
    description: 'For trading cards (sports, TCG, etc.)',
    icon: '🃏',
    fields: [
      {
        id: 'set',
        label: 'Set',
        type: 'text',
        placeholder: 'e.g., Base Set, Series 1',
      },
      {
        id: 'cardNumber',
        label: 'Card Number',
        type: 'text',
        placeholder: 'e.g., 42/150',
      },
      {
        id: 'rarity',
        label: 'Rarity',
        type: 'select',
        options: ['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Secret Rare', 'Promo'],
      },
      {
        id: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['Mint', 'Near Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'graded',
        label: 'Graded',
        type: 'select',
        options: ['Ungraded', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 10', 'BGS 9.5', 'BGS 9', 'Other'],
      },
      {
        id: 'player',
        label: 'Player/Character',
        type: 'text',
        placeholder: 'Player or character name',
      },
    ],
  },
  {
    id: 'book',
    name: 'Book',
    description: 'For books and novels',
    icon: '📖',
    fields: [
      {
        id: 'author',
        label: 'Author',
        type: 'text',
        placeholder: 'Author name',
      },
      {
        id: 'isbn',
        label: 'ISBN',
        type: 'text',
        placeholder: 'ISBN-13 or ISBN-10',
      },
      {
        id: 'publisher',
        label: 'Publisher',
        type: 'text',
        placeholder: 'Publisher name',
      },
      {
        id: 'publicationDate',
        label: 'Publication Date',
        type: 'date',
      },
      {
        id: 'edition',
        label: 'Edition',
        type: 'text',
        placeholder: 'e.g., First Edition, Hardcover',
      },
      {
        id: 'pages',
        label: 'Pages',
        type: 'number',
        min: 1,
      },
    ],
  },
  {
    id: 'vinyl-record',
    name: 'Vinyl Record',
    description: 'For vinyl records and albums',
    icon: '💿',
    fields: [
      {
        id: 'artist',
        label: 'Artist',
        type: 'text',
        placeholder: 'Artist or band name',
      },
      {
        id: 'label',
        label: 'Record Label',
        type: 'text',
        placeholder: 'Record label',
      },
      {
        id: 'releaseYear',
        label: 'Release Year',
        type: 'number',
        min: 1900,
        max: new Date().getFullYear(),
      },
      {
        id: 'format',
        label: 'Format',
        type: 'select',
        options: ['LP', 'EP', 'Single', '7"', '10"', '12"', 'Other'],
      },
      {
        id: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'e.g., Black, Red, Colored',
      },
    ],
  },
  {
    id: 'video-game',
    name: 'Video Game',
    description: 'For video games and consoles',
    icon: '🎮',
    fields: [
      {
        id: 'platform',
        label: 'Platform',
        type: 'select',
        options: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Nintendo 3DS', 'Nintendo DS', 'Wii U', 'Wii', 'GameCube', 'Other'],
      },
      {
        id: 'developer',
        label: 'Developer',
        type: 'text',
        placeholder: 'Developer name',
      },
      {
        id: 'publisher',
        label: 'Publisher',
        type: 'text',
        placeholder: 'Publisher name',
      },
      {
        id: 'releaseDate',
        label: 'Release Date',
        type: 'date',
      },
      {
        id: 'edition',
        label: 'Edition',
        type: 'text',
        placeholder: 'e.g., Standard, Deluxe, Collector\'s',
      },
      {
        id: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor'],
      },
    ],
  },
  {
    id: 'film',
    name: 'Film / Blu-ray',
    description: 'For movies, Blu-rays, DVDs, and physical media',
    icon: '🎬',
    fields: [
      {
        id: 'director',
        label: 'Director',
        type: 'text',
        placeholder: 'Director name',
      },
      {
        id: 'year',
        label: 'Release Year',
        type: 'number',
        min: 1888,
        max: new Date().getFullYear() + 1,
      },
      {
        id: 'format',
        label: 'Format',
        type: 'select',
        options: ['Blu-ray', '4K UHD Blu-ray', 'DVD', 'HD DVD', 'VHS', 'Laserdisc', 'Digital'],
      },
      {
        id: 'edition',
        label: 'Edition',
        type: 'select',
        options: ['Standard', 'Steelbook', 'Collector\'s Edition', 'Limited Edition', 'Special Edition', 'Criterion', 'Arrow Video', 'Shout Factory', 'Other'],
      },
      {
        id: 'region',
        label: 'Region',
        type: 'select',
        options: ['Region A (Americas)', 'Region B (Europe, Africa, Oceania)', 'Region C (Asia)', 'Region Free', 'Region 1 (DVD)', 'Region 2 (DVD)', 'Region 4 (DVD)', 'PAL', 'NTSC'],
      },
      {
        id: 'runtime',
        label: 'Runtime (minutes)',
        type: 'number',
        min: 1,
        placeholder: 'e.g., 120',
      },
      {
        id: 'rating',
        label: 'Rating',
        type: 'select',
        options: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR', 'Unrated', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'],
      },
      {
        id: 'genre',
        label: 'Genre',
        type: 'text',
        placeholder: 'e.g., Action, Drama, Comedy',
      },
      {
        id: 'studio',
        label: 'Studio/Distributor',
        type: 'text',
        placeholder: 'e.g., Criterion, Arrow Video, Warner Bros',
      },
    ],
  },
  {
    id: 'tv-show',
    name: 'TV Show',
    description: 'For TV series and seasons (streaming or physical)',
    icon: '📺',
    fields: [
      { id: 'showrunner', label: 'Showrunner', type: 'text', placeholder: 'Showrunner name' },
      { id: 'network', label: 'Network/Service', type: 'text', placeholder: 'e.g., HBO, Netflix, BBC' },
      { id: 'seasons', label: 'Seasons', type: 'number', min: 1, placeholder: 'e.g., 6' },
      { id: 'firstAirDate', label: 'First Air Date', type: 'date' },
      {
        id: 'format',
        label: 'Format',
        type: 'select',
        options: ['Streaming', 'Blu-ray', '4K UHD Blu-ray', 'DVD', 'Digital', 'Other'],
      },
      { id: 'genre', label: 'Genre', type: 'text', placeholder: 'e.g., Drama, Comedy, Sci-Fi' },
    ],
  },
  {
    id: 'music',
    name: 'Music (CD/Cassette/Digital)',
    description: 'For music releases that are not vinyl records',
    icon: '🎵',
    fields: [
      { id: 'artist', label: 'Artist', type: 'text', placeholder: 'Artist or band name' },
      { id: 'album', label: 'Album/Release', type: 'text', placeholder: 'Album or release title' },
      { id: 'label', label: 'Label', type: 'text', placeholder: 'Record label' },
      { id: 'releaseYear', label: 'Release Year', type: 'number', min: 1900, max: new Date().getFullYear() },
      {
        id: 'format',
        label: 'Format',
        type: 'select',
        options: ['CD', 'Cassette', 'Digital', 'MiniDisc', 'SACD', 'Other'],
      },
      { id: 'genre', label: 'Genre', type: 'text', placeholder: 'e.g., Rock, Pop, Jazz' },
      {
        id: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor'],
      },
    ],
  },
  {
    id: 'board-game',
    name: 'Board Game',
    description: 'For board games, expansions, and tabletop boxes',
    icon: '🎲',
    fields: [
      { id: 'publisher', label: 'Publisher', type: 'text', placeholder: 'Publisher name' },
      { id: 'designer', label: 'Designer', type: 'text', placeholder: 'Designer name' },
      { id: 'players', label: 'Players', type: 'text', placeholder: 'e.g., 1–4' },
      { id: 'playtime', label: 'Playtime (minutes)', type: 'number', min: 1, placeholder: 'e.g., 60' },
      { id: 'edition', label: 'Edition', type: 'text', placeholder: 'e.g., 2nd Edition, Deluxe' },
      {
        id: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['New (sealed)', 'Like New', 'Complete', 'Missing Pieces', 'Worn', 'Damaged'],
      },
    ],
  },
  {
    id: 'sports-card',
    name: 'Sports Card',
    description: 'For sports trading cards',
    icon: '🏅',
    fields: [
      { id: 'sport', label: 'Sport', type: 'select', options: ['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 'Other'] },
      { id: 'set', label: 'Set', type: 'text', placeholder: 'e.g., Topps Series 1' },
      { id: 'cardNumber', label: 'Card Number', type: 'text', placeholder: 'e.g., #42' },
      { id: 'player', label: 'Player', type: 'text', placeholder: 'Player name' },
      { id: 'team', label: 'Team', type: 'text', placeholder: 'Team name' },
      { id: 'year', label: 'Year', type: 'number', min: 1900, max: new Date().getFullYear() },
      {
        id: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['Mint', 'Near Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'graded',
        label: 'Graded',
        type: 'select',
        options: ['Ungraded', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 10', 'BGS 9.5', 'BGS 9', 'Other'],
      },
    ],
  },
  {
    id: 'toy',
    name: 'Toy',
    description: 'For toys (general)',
    icon: '🧸',
    fields: [
      { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., LEGO, Mattel, Hasbro' },
      { id: 'series', label: 'Series/Line', type: 'text', placeholder: 'e.g., Star Wars, City' },
      { id: 'year', label: 'Year', type: 'number', min: 1900, max: new Date().getFullYear() },
      { id: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Plastic, Metal, Plush' },
      { id: 'boxed', label: 'Boxed', type: 'select', options: ['Yes', 'No'] },
      { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Good', 'Fair', 'Poor'] },
    ],
  },
  {
    id: 'action-figure',
    name: 'Action Figure',
    description: 'For action figures and character figures',
    icon: '🤖',
    fields: [
      { id: 'character', label: 'Character', type: 'text', placeholder: 'Character name' },
      { id: 'franchise', label: 'Franchise', type: 'text', placeholder: 'e.g., Marvel, Star Wars' },
      { id: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g., Hasbro, Bandai' },
      { id: 'scale', label: 'Scale', type: 'text', placeholder: 'e.g., 1/12, 6-inch' },
      { id: 'year', label: 'Year', type: 'number', min: 1900, max: new Date().getFullYear() },
      { id: 'boxed', label: 'Boxed', type: 'select', options: ['Yes', 'No'] },
      { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Good', 'Fair', 'Poor'] },
    ],
  },
  {
    id: 'art',
    name: 'Art',
    description: 'For original artworks (paintings, drawings, etc.)',
    icon: '🎨',
    fields: [
      { id: 'artist', label: 'Artist', type: 'text', placeholder: 'Artist name' },
      { id: 'year', label: 'Year', type: 'number', min: 1000, max: new Date().getFullYear() },
      { id: 'medium', label: 'Medium', type: 'text', placeholder: 'e.g., Oil, Acrylic, Pencil' },
      { id: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 40×50 cm' },
      { id: 'signed', label: 'Signed', type: 'select', options: ['Yes', 'No'] },
      { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any provenance, framing info, etc.' },
    ],
  },
  {
    id: 'collectible',
    name: 'Collectible',
    description: 'For general collectibles (pins, memorabilia, etc.)',
    icon: '🧩',
    fields: [
      { id: 'brand', label: 'Brand', type: 'text', placeholder: 'Brand or maker' },
      { id: 'series', label: 'Series/Line', type: 'text', placeholder: 'Series name' },
      { id: 'year', label: 'Year', type: 'number', min: 1900, max: new Date().getFullYear() },
      { id: 'limited', label: 'Limited Edition', type: 'select', options: ['No', 'Yes'] },
      { id: 'editionSize', label: 'Edition Size', type: 'text', placeholder: 'e.g., 500, 1/250' },
      { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Good', 'Fair', 'Poor'] },
    ],
  },
  {
    id: 'coin',
    name: 'Coin',
    description: 'For coins and numismatics',
    icon: '🪙',
    fields: [
      { id: 'country', label: 'Country', type: 'text', placeholder: 'e.g., Germany' },
      { id: 'denomination', label: 'Denomination', type: 'text', placeholder: 'e.g., 1€, 2€, 1 Dollar' },
      { id: 'year', label: 'Year', type: 'number', min: 1000, max: new Date().getFullYear() },
      { id: 'mint', label: 'Mint', type: 'text', placeholder: 'e.g., A, D, F, G, J' },
      { id: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Copper-nickel, Silver' },
      { id: 'grade', label: 'Grade', type: 'select', options: ['Uncirculated', 'XF', 'VF', 'F', 'G', 'P', 'Other'] },
    ],
  },
  {
    id: 'stamp',
    name: 'Stamp',
    description: 'For postage stamps',
    icon: '✉️',
    fields: [
      { id: 'country', label: 'Country', type: 'text', placeholder: 'Country' },
      { id: 'year', label: 'Year', type: 'number', min: 1000, max: new Date().getFullYear() },
      { id: 'denomination', label: 'Denomination', type: 'text', placeholder: 'e.g., 0.85€, 55c' },
      { id: 'theme', label: 'Theme', type: 'text', placeholder: 'e.g., Animals, Space' },
      { id: 'used', label: 'Used', type: 'select', options: ['Unused', 'Used'] },
      { id: 'condition', label: 'Condition', type: 'select', options: ['Mint', 'Very Fine', 'Fine', 'Good', 'Fair', 'Poor'] },
    ],
  },
  {
    id: 'poster',
    name: 'Poster',
    description: 'For posters (movie posters, concert posters, etc.)',
    icon: '🖼️',
    fields: [
      { id: 'title', label: 'Title', type: 'text', placeholder: 'Poster title' },
      { id: 'artist', label: 'Artist', type: 'text', placeholder: 'Artist name (if known)' },
      { id: 'year', label: 'Year', type: 'number', min: 1000, max: new Date().getFullYear() },
      { id: 'size', label: 'Size', type: 'text', placeholder: 'e.g., 24×36 in' },
      { id: 'signed', label: 'Signed', type: 'select', options: ['No', 'Yes'] },
      { id: 'condition', label: 'Condition', type: 'select', options: ['Mint', 'Near Mint', 'Very Good', 'Good', 'Fair', 'Poor'] },
    ],
  },
  {
    id: 'art-print',
    name: 'Art Print',
    description: 'For art prints (giclée, screenprint, lithograph, etc.)',
    icon: '🖨️',
    fields: [
      { id: 'artist', label: 'Artist', type: 'text', placeholder: 'Artist name' },
      { id: 'title', label: 'Title', type: 'text', placeholder: 'Print title' },
      { id: 'technique', label: 'Technique', type: 'select', options: ['Giclée', 'Screenprint', 'Lithograph', 'Etching', 'Other'] },
      { id: 'year', label: 'Year', type: 'number', min: 1000, max: new Date().getFullYear() },
      { id: 'size', label: 'Size', type: 'text', placeholder: 'e.g., A2, 50×70 cm' },
      { id: 'edition', label: 'Edition Number', type: 'text', placeholder: 'e.g., 12/200' },
      { id: 'signed', label: 'Signed', type: 'select', options: ['No', 'Yes'] },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    description: 'A simple starter template for anything else',
    icon: '📦',
    fields: [
      { id: 'type', label: 'Type', type: 'text', placeholder: 'What kind of item is this?' },
      { id: 'brand', label: 'Brand', type: 'text', placeholder: 'Brand/maker (optional)' },
      { id: 'year', label: 'Year', type: 'number', min: 0, max: new Date().getFullYear() + 1 },
      { id: 'details', label: 'Details', type: 'textarea', placeholder: 'Anything useful to remember' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'No predefined fields, use standard fields only',
    icon: '📝',
    fields: [],
  },
]

export function getTemplateById(id: string | null | undefined): ItemTemplate | null {
  if (!id) return null
  return ITEM_TEMPLATES.find(t => t.id === id) || null
}

export function getTemplateFields(templateId: string | null | undefined): TemplateField[] {
  const template = getTemplateById(templateId)
  return template?.fields || []
}



