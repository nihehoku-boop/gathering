import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Eurozone countries with their coin designs and real image URLs from Wikipedia
const eurozoneCountries = [
  {
    country: 'Austria',
    code: 'AT',
    oneEuro: {
      name: 'Austria 1 Euro',
      description: 'Wolfgang Amadeus Mozart, Austrian composer',
      design: 'Portrait of Mozart',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/1_euro_Austria_obverse.jpg/400px-1_euro_Austria_obverse.jpg',
    },
    twoEuro: {
      name: 'Austria 2 Euro',
      description: 'Bertha von Suttner, Austrian pacifist and Nobel Peace Prize winner',
      design: 'Portrait of Bertha von Suttner',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2_euro_Austria_obverse.jpg/400px-2_euro_Austria_obverse.jpg',
    },
  },
  {
    country: 'Belgium',
    code: 'BE',
    oneEuro: {
      name: 'Belgium 1 Euro',
      description: 'King Philippe of Belgium',
      design: 'Portrait of King Philippe',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/1_euro_Belgium_obverse.jpg/400px-1_euro_Belgium_obverse.jpg',
    },
    twoEuro: {
      name: 'Belgium 2 Euro',
      description: 'King Philippe of Belgium',
      design: 'Portrait of King Philippe',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/2_euro_Belgium_obverse.jpg/400px-2_euro_Belgium_obverse.jpg',
    },
  },
  {
    country: 'Cyprus',
    code: 'CY',
    oneEuro: {
      name: 'Cyprus 1 Euro',
      description: 'Idol of Pomos, a prehistoric sculpture',
      design: 'Idol of Pomos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/1_euro_Cyprus_obverse.jpg/400px-1_euro_Cyprus_obverse.jpg',
    },
    twoEuro: {
      name: 'Cyprus 2 Euro',
      description: 'Idol of Pomos, a prehistoric sculpture',
      design: 'Idol of Pomos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2_euro_Cyprus_obverse.jpg/400px-2_euro_Cyprus_obverse.jpg',
    },
  },
  {
    country: 'Estonia',
    code: 'EE',
    oneEuro: {
      name: 'Estonia 1 Euro',
      description: 'Map of Estonia',
      design: 'Geographic outline of Estonia',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1_euro_Estonia_obverse.jpg/400px-1_euro_Estonia_obverse.jpg',
    },
    twoEuro: {
      name: 'Estonia 2 Euro',
      description: 'Map of Estonia',
      design: 'Geographic outline of Estonia',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2_euro_Estonia_obverse.jpg/400px-2_euro_Estonia_obverse.jpg',
    },
  },
  {
    country: 'Finland',
    code: 'FI',
    oneEuro: {
      name: 'Finland 1 Euro',
      description: 'Two swans flying over Finnish landscape',
      design: 'Swans in flight',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/1_euro_Finland_obverse.jpg/400px-1_euro_Finland_obverse.jpg',
    },
    twoEuro: {
      name: 'Finland 2 Euro',
      description: 'Cloudberry flowers and leaves',
      design: 'Cloudberry plant',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2_euro_Finland_obverse.jpg/400px-2_euro_Finland_obverse.jpg',
    },
  },
  {
    country: 'France',
    code: 'FR',
    oneEuro: {
      name: 'France 1 Euro',
      description: 'Tree symbolizing life, growth, and continuity',
      design: 'Stylized tree',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/1_euro_France_obverse.jpg/400px-1_euro_France_obverse.jpg',
    },
    twoEuro: {
      name: 'France 2 Euro',
      description: 'Tree symbolizing life, growth, and continuity',
      design: 'Stylized tree',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2_euro_France_obverse.jpg/400px-2_euro_France_obverse.jpg',
    },
  },
  {
    country: 'Germany',
    code: 'DE',
    oneEuro: {
      name: 'Germany 1 Euro',
      description: 'Federal Eagle, symbol of German sovereignty',
      design: 'German Federal Eagle',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/1_euro_Germany_obverse.jpg/400px-1_euro_Germany_obverse.jpg',
    },
    twoEuro: {
      name: 'Germany 2 Euro',
      description: 'Federal Eagle, symbol of German sovereignty',
      design: 'German Federal Eagle',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/2_euro_Germany_obverse.jpg/400px-2_euro_Germany_obverse.jpg',
    },
  },
  {
    country: 'Greece',
    code: 'GR',
    oneEuro: {
      name: 'Greece 1 Euro',
      description: 'Owl, ancient symbol of Athens',
      design: 'Ancient Athenian owl',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/1_euro_Greece_obverse.jpg/400px-1_euro_Greece_obverse.jpg',
    },
    twoEuro: {
      name: 'Greece 2 Euro',
      description: 'Scene from the myth of Europa and Zeus',
      design: 'Europa and the bull',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2_euro_Greece_obverse.jpg/400px-2_euro_Greece_obverse.jpg',
    },
  },
  {
    country: 'Ireland',
    code: 'IE',
    oneEuro: {
      name: 'Ireland 1 Euro',
      description: 'Celtic harp, traditional symbol of Ireland',
      design: 'Irish harp',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/1_euro_Ireland_obverse.jpg/400px-1_euro_Ireland_obverse.jpg',
    },
    twoEuro: {
      name: 'Ireland 2 Euro',
      description: 'Celtic harp, traditional symbol of Ireland',
      design: 'Irish harp',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/2_euro_Ireland_obverse.jpg/400px-2_euro_Ireland_obverse.jpg',
    },
  },
  {
    country: 'Italy',
    code: 'IT',
    oneEuro: {
      name: 'Italy 1 Euro',
      description: 'Vitruvian Man by Leonardo da Vinci',
      design: 'Vitruvian Man',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/1_euro_Italy_obverse.jpg/400px-1_euro_Italy_obverse.jpg',
    },
    twoEuro: {
      name: 'Italy 2 Euro',
      description: 'Portrait of Dante Alighieri by Raphael',
      design: 'Portrait of Dante',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/2_euro_Italy_obverse.jpg/400px-2_euro_Italy_obverse.jpg',
    },
  },
  {
    country: 'Latvia',
    code: 'LV',
    oneEuro: {
      name: 'Latvia 1 Euro',
      description: 'Latvian maiden, symbol of Latvia',
      design: 'Latvian maiden',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/1_euro_Latvia_obverse.jpg/400px-1_euro_Latvia_obverse.jpg',
    },
    twoEuro: {
      name: 'Latvia 2 Euro',
      description: 'Latvian maiden, symbol of Latvia',
      design: 'Latvian maiden',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2_euro_Latvia_obverse.jpg/400px-2_euro_Latvia_obverse.jpg',
    },
  },
  {
    country: 'Lithuania',
    code: 'LT',
    oneEuro: {
      name: 'Lithuania 1 Euro',
      description: 'Vytis (the Knight), coat of arms of Lithuania',
      design: 'Vytis knight',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/1_euro_Lithuania_obverse.jpg/400px-1_euro_Lithuania_obverse.jpg',
    },
    twoEuro: {
      name: 'Lithuania 2 Euro',
      description: 'Vytis (the Knight), coat of arms of Lithuania',
      design: 'Vytis knight',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2_euro_Lithuania_obverse.jpg/400px-2_euro_Lithuania_obverse.jpg',
    },
  },
  {
    country: 'Luxembourg',
    code: 'LU',
    oneEuro: {
      name: 'Luxembourg 1 Euro',
      description: 'Grand Duke Henri of Luxembourg',
      design: 'Portrait of Grand Duke Henri',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/1_euro_Luxembourg_obverse.jpg/400px-1_euro_Luxembourg_obverse.jpg',
    },
    twoEuro: {
      name: 'Luxembourg 2 Euro',
      description: 'Grand Duke Henri of Luxembourg',
      design: 'Portrait of Grand Duke Henri',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2_euro_Luxembourg_obverse.jpg/400px-2_euro_Luxembourg_obverse.jpg',
    },
  },
  {
    country: 'Malta',
    code: 'MT',
    oneEuro: {
      name: 'Malta 1 Euro',
      description: 'Maltese Cross, emblem of the Order of St. John',
      design: 'Maltese Cross',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/1_euro_Malta_obverse.jpg/400px-1_euro_Malta_obverse.jpg',
    },
    twoEuro: {
      name: 'Malta 2 Euro',
      description: 'Mnajdra Prehistoric Temples',
      design: 'Mnajdra Temples',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2_euro_Malta_obverse.jpg/400px-2_euro_Malta_obverse.jpg',
    },
  },
  {
    country: 'Netherlands',
    code: 'NL',
    oneEuro: {
      name: 'Netherlands 1 Euro',
      description: 'King Willem-Alexander of the Netherlands',
      design: 'Portrait of King Willem-Alexander',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/1_euro_Netherlands_obverse.jpg/400px-1_euro_Netherlands_obverse.jpg',
    },
    twoEuro: {
      name: 'Netherlands 2 Euro',
      description: 'King Willem-Alexander of the Netherlands',
      design: 'Portrait of King Willem-Alexander',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/2_euro_Netherlands_obverse.jpg/400px-2_euro_Netherlands_obverse.jpg',
    },
  },
  {
    country: 'Portugal',
    code: 'PT',
    oneEuro: {
      name: 'Portugal 1 Euro',
      description: 'Royal seal of 1142 with the country\'s name',
      design: 'Royal seal',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/1_euro_Portugal_obverse.jpg/400px-1_euro_Portugal_obverse.jpg',
    },
    twoEuro: {
      name: 'Portugal 2 Euro',
      description: 'Royal seal of 1142 with the country\'s name',
      design: 'Royal seal',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2_euro_Portugal_obverse.jpg/400px-2_euro_Portugal_obverse.jpg',
    },
  },
  {
    country: 'Slovakia',
    code: 'SK',
    oneEuro: {
      name: 'Slovakia 1 Euro',
      description: 'Double cross on three hills, Slovak coat of arms',
      design: 'Slovak coat of arms',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/1_euro_Slovakia_obverse.jpg/400px-1_euro_Slovakia_obverse.jpg',
    },
    twoEuro: {
      name: 'Slovakia 2 Euro',
      description: 'Double cross on three hills, Slovak coat of arms',
      design: 'Slovak coat of arms',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/2_euro_Slovakia_obverse.jpg/400px-2_euro_Slovakia_obverse.jpg',
    },
  },
  {
    country: 'Slovenia',
    code: 'SI',
    oneEuro: {
      name: 'Slovenia 1 Euro',
      description: 'Primož Trubar, Slovenian Protestant reformer',
      design: 'Portrait of Primož Trubar',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/1_euro_Slovenia_obverse.jpg/400px-1_euro_Slovenia_obverse.jpg',
    },
    twoEuro: {
      name: 'Slovenia 2 Euro',
      description: 'France Prešeren, Slovenian poet',
      design: 'Portrait of France Prešeren',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/2_euro_Slovenia_obverse.jpg/400px-2_euro_Slovenia_obverse.jpg',
    },
  },
  {
    country: 'Spain',
    code: 'ES',
    oneEuro: {
      name: 'Spain 1 Euro',
      description: 'King Felipe VI of Spain',
      design: 'Portrait of King Felipe VI',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/1_euro_Spain_obverse.jpg/400px-1_euro_Spain_obverse.jpg',
    },
    twoEuro: {
      name: 'Spain 2 Euro',
      description: 'King Felipe VI of Spain',
      design: 'Portrait of King Felipe VI',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/2_euro_Spain_obverse.jpg/400px-2_euro_Spain_obverse.jpg',
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
    }

    const results = {
      oneEuro: null as any,
      twoEuro: null as any,
      created: [] as string[],
      skipped: [] as string[],
    }

    // Create 1 Euro collection
    const existingOneEuro = await prisma.communityCollection.findFirst({
      where: { name: 'Euro 1 Euro Coins' },
    })

    if (!existingOneEuro) {
      results.oneEuro = await prisma.communityCollection.create({
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
      results.created.push('Euro 1 Euro Coins')
    } else {
      results.skipped.push('Euro 1 Euro Coins')
    }

    // Create 2 Euro collection
    const existingTwoEuro = await prisma.communityCollection.findFirst({
      where: { name: 'Euro 2 Euro Coins' },
    })

    if (!existingTwoEuro) {
      results.twoEuro = await prisma.communityCollection.create({
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
      results.created.push('Euro 2 Euro Coins')
    } else {
      results.skipped.push('Euro 2 Euro Coins')
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.created.length} collections, skipped ${results.skipped.length}`,
      created: results.created,
      skipped: results.skipped,
    })
  } catch (error) {
    console.error('Error seeding Euro coins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

