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



