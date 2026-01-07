import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Eurozone countries with their coin designs and image URLs
const eurozoneCountries = [
  {
    country: 'Austria',
    code: 'AT',
    oneEuro: {
      name: 'Austria 1 Euro',
      description: 'Wolfgang Amadeus Mozart, Austrian composer',
      design: 'Portrait of Mozart',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Austria 2 Euro',
      description: 'Bertha von Suttner, Austrian pacifist and Nobel Peace Prize winner',
      design: 'Portrait of Bertha von Suttner',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Belgium',
    code: 'BE',
    oneEuro: {
      name: 'Belgium 1 Euro',
      description: 'King Philippe of Belgium',
      design: 'Portrait of King Philippe',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Belgium 2 Euro',
      description: 'King Philippe of Belgium',
      design: 'Portrait of King Philippe',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Cyprus',
    code: 'CY',
    oneEuro: {
      name: 'Cyprus 1 Euro',
      description: 'Idol of Pomos, a prehistoric sculpture',
      design: 'Idol of Pomos',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Cyprus 2 Euro',
      description: 'Idol of Pomos, a prehistoric sculpture',
      design: 'Idol of Pomos',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Estonia',
    code: 'EE',
    oneEuro: {
      name: 'Estonia 1 Euro',
      description: 'Map of Estonia',
      design: 'Geographic outline of Estonia',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Estonia 2 Euro',
      description: 'Map of Estonia',
      design: 'Geographic outline of Estonia',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Finland',
    code: 'FI',
    oneEuro: {
      name: 'Finland 1 Euro',
      description: 'Two swans flying over Finnish landscape',
      design: 'Swans in flight',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Finland 2 Euro',
      description: 'Cloudberry flowers and leaves',
      design: 'Cloudberry plant',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'France',
    code: 'FR',
    oneEuro: {
      name: 'France 1 Euro',
      description: 'Tree symbolizing life, growth, and continuity',
      design: 'Stylized tree',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'France 2 Euro',
      description: 'Tree symbolizing life, growth, and continuity',
      design: 'Stylized tree',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Germany',
    code: 'DE',
    oneEuro: {
      name: 'Germany 1 Euro',
      description: 'Federal Eagle, symbol of German sovereignty',
      design: 'German Federal Eagle',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Germany 2 Euro',
      description: 'Federal Eagle, symbol of German sovereignty',
      design: 'German Federal Eagle',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Greece',
    code: 'GR',
    oneEuro: {
      name: 'Greece 1 Euro',
      description: 'Owl, ancient symbol of Athens',
      design: 'Ancient Athenian owl',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Greece 2 Euro',
      description: 'Scene from the myth of Europa and Zeus',
      design: 'Europa and the bull',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Ireland',
    code: 'IE',
    oneEuro: {
      name: 'Ireland 1 Euro',
      description: 'Celtic harp, traditional symbol of Ireland',
      design: 'Irish harp',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Ireland 2 Euro',
      description: 'Celtic harp, traditional symbol of Ireland',
      design: 'Irish harp',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Italy',
    code: 'IT',
    oneEuro: {
      name: 'Italy 1 Euro',
      description: 'Vitruvian Man by Leonardo da Vinci',
      design: 'Vitruvian Man',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Italy 2 Euro',
      description: 'Portrait of Dante Alighieri by Raphael',
      design: 'Portrait of Dante',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Latvia',
    code: 'LV',
    oneEuro: {
      name: 'Latvia 1 Euro',
      description: 'Latvian maiden, symbol of Latvia',
      design: 'Latvian maiden',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Latvia 2 Euro',
      description: 'Latvian maiden, symbol of Latvia',
      design: 'Latvian maiden',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Lithuania',
    code: 'LT',
    oneEuro: {
      name: 'Lithuania 1 Euro',
      description: 'Vytis (the Knight), coat of arms of Lithuania',
      design: 'Vytis knight',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Lithuania 2 Euro',
      description: 'Vytis (the Knight), coat of arms of Lithuania',
      design: 'Vytis knight',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Luxembourg',
    code: 'LU',
    oneEuro: {
      name: 'Luxembourg 1 Euro',
      description: 'Grand Duke Henri of Luxembourg',
      design: 'Portrait of Grand Duke Henri',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Luxembourg 2 Euro',
      description: 'Grand Duke Henri of Luxembourg',
      design: 'Portrait of Grand Duke Henri',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Malta',
    code: 'MT',
    oneEuro: {
      name: 'Malta 1 Euro',
      description: 'Maltese Cross, emblem of the Order of St. John',
      design: 'Maltese Cross',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Malta 2 Euro',
      description: 'Mnajdra Prehistoric Temples',
      design: 'Mnajdra Temples',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Netherlands',
    code: 'NL',
    oneEuro: {
      name: 'Netherlands 1 Euro',
      description: 'King Willem-Alexander of the Netherlands',
      design: 'Portrait of King Willem-Alexander',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Netherlands 2 Euro',
      description: 'King Willem-Alexander of the Netherlands',
      design: 'Portrait of King Willem-Alexander',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Portugal',
    code: 'PT',
    oneEuro: {
      name: 'Portugal 1 Euro',
      description: 'Royal seal of 1142 with the country\'s name',
      design: 'Royal seal',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Portugal 2 Euro',
      description: 'Royal seal of 1142 with the country\'s name',
      design: 'Royal seal',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Slovakia',
    code: 'SK',
    oneEuro: {
      name: 'Slovakia 1 Euro',
      description: 'Double cross on three hills, Slovak coat of arms',
      design: 'Slovak coat of arms',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Slovakia 2 Euro',
      description: 'Double cross on three hills, Slovak coat of arms',
      design: 'Slovak coat of arms',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Slovenia',
    code: 'SI',
    oneEuro: {
      name: 'Slovenia 1 Euro',
      description: 'Primož Trubar, Slovenian Protestant reformer',
      design: 'Portrait of Primož Trubar',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Slovenia 2 Euro',
      description: 'France Prešeren, Slovenian poet',
      design: 'Portrait of France Prešeren',
      image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=400&fit=crop',
    },
  },
  {
    country: 'Spain',
    code: 'ES',
    oneEuro: {
      name: 'Spain 1 Euro',
      description: 'King Felipe VI of Spain',
      design: 'Portrait of King Felipe VI',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    twoEuro: {
      name: 'Spain 2 Euro',
      description: 'King Felipe VI of Spain',
      design: 'Portrait of King Felipe VI',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
  },
]

async function main() {
  console.log('Creating Euro coin collections...')

  // Find or create a dedicated user for coin collections (not admin)
  let coinUser = await prisma.user.findFirst({
    where: {
      email: 'coin-collector@colletro.app',
    },
  })

  if (!coinUser) {
    coinUser = await prisma.user.create({
      data: {
        email: 'coin-collector@colletro.app',
        name: 'Euro Coin Collector',
        isAdmin: false,
      },
    })
    console.log('Created dedicated user for coin collections')
  } else {
    console.log('Using existing coin collector user')
  }

  // Create 1 Euro collection
  const existingOneEuro = await prisma.communityCollection.findFirst({
    where: { name: 'Euro 1 Euro Coins' },
  })

  if (!existingOneEuro) {
    const oneEuroCollection = await prisma.communityCollection.create({
      data: {
        name: 'Euro 1 Euro Coins',
        description: 'Complete collection of 1 Euro coins from all Eurozone countries. Each country has its own unique design on the reverse side.',
        category: 'Coins',
        template: 'custom',
        customFieldDefinitions: JSON.stringify([
          { name: 'Country', type: 'text', required: true },
          { name: 'Country Code', type: 'text', required: false },
          { name: 'Design', type: 'text', required: false },
          { name: 'Year', type: 'number', required: false },
          { name: 'Condition', type: 'text', required: false },
        ]),
        tags: JSON.stringify(['coins', 'euro', 'numismatics', 'currency', 'europe']),
        userId: coinUser.id,
        items: {
          create: eurozoneCountries.map((country, index) => ({
            name: country.oneEuro.name,
            number: index + 1,
            notes: country.oneEuro.description,
            image: country.oneEuro.image,
            customFields: JSON.stringify({
              'Country': country.country,
              'Country Code': country.code,
              'Design': country.oneEuro.design,
            }),
          })),
        },
      },
    })
    console.log(`Created 1 Euro collection with ${eurozoneCountries.length} coins`)
  } else {
    console.log('1 Euro collection already exists, skipping...')
  }

  // Create 2 Euro collection
  const existingTwoEuro = await prisma.communityCollection.findFirst({
    where: { name: 'Euro 2 Euro Coins' },
  })

  if (!existingTwoEuro) {
    const twoEuroCollection = await prisma.communityCollection.create({
      data: {
        name: 'Euro 2 Euro Coins',
        description: 'Complete collection of 2 Euro coins from all Eurozone countries. Each country has its own unique design on the reverse side.',
        category: 'Coins',
        template: 'custom',
        customFieldDefinitions: JSON.stringify([
          { name: 'Country', type: 'text', required: true },
          { name: 'Country Code', type: 'text', required: false },
          { name: 'Design', type: 'text', required: false },
          { name: 'Year', type: 'number', required: false },
          { name: 'Condition', type: 'text', required: false },
        ]),
        tags: JSON.stringify(['coins', 'euro', 'numismatics', 'currency', 'europe']),
        userId: coinUser.id,
        items: {
          create: eurozoneCountries.map((country, index) => ({
            name: country.twoEuro.name,
            number: index + 1,
            notes: country.twoEuro.description,
            image: country.twoEuro.image,
            customFields: JSON.stringify({
              'Country': country.country,
              'Country Code': country.code,
              'Design': country.twoEuro.design,
            }),
          })),
        },
      },
    })
    console.log(`Created 2 Euro collection with ${eurozoneCountries.length} coins`)
  } else {
    console.log('2 Euro collection already exists, skipping...')
  }

  console.log('Euro coin collections created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
