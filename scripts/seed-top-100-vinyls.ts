/**
 * Seed script to create "Top 100 Vinyls of All Time" community collection
 * Run with: npx tsx scripts/seed-top-100-vinyls.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Top 100 Vinyl Records of All Time (based on various authoritative lists)
const top100Vinyls = [
  { number: 1, name: "Sgt. Pepper's Lonely Hearts Club Band", artist: "The Beatles", year: 1967 },
  { number: 2, name: "Pet Sounds", artist: "The Beach Boys", year: 1966 },
  { number: 3, name: "Revolver", artist: "The Beatles", year: 1966 },
  { number: 4, name: "Highway 61 Revisited", artist: "Bob Dylan", year: 1965 },
  { number: 5, name: "Rubber Soul", artist: "The Beatles", year: 1965 },
  { number: 6, name: "What's Going On", artist: "Marvin Gaye", year: 1971 },
  { number: 7, name: "Exile on Main St.", artist: "The Rolling Stones", year: 1972 },
  { number: 8, name: "London Calling", artist: "The Clash", year: 1979 },
  { number: 9, name: "Blonde on Blonde", artist: "Bob Dylan", year: 1966 },
  { number: 10, name: "The Beatles", artist: "The Beatles", year: 1968 },
  { number: 11, name: "The Sun Sessions", artist: "Elvis Presley", year: 1976 },
  { number: 12, name: "Kind of Blue", artist: "Miles Davis", year: 1959 },
  { number: 13, name: "The Velvet Underground & Nico", artist: "The Velvet Underground", year: 1967 },
  { number: 14, name: "Abbey Road", artist: "The Beatles", year: 1969 },
  { number: 15, name: "Are You Experienced", artist: "The Jimi Hendrix Experience", year: 1967 },
  { number: 16, name: "Blood on the Tracks", artist: "Bob Dylan", year: 1975 },
  { number: 17, name: "Nevermind", artist: "Nirvana", year: 1991 },
  { number: 18, name: "Born to Run", artist: "Bruce Springsteen", year: 1975 },
  { number: 19, name: "Astral Weeks", artist: "Van Morrison", year: 1968 },
  { number: 20, name: "Thriller", artist: "Michael Jackson", year: 1982 },
  { number: 21, name: "The Great Twenty-Eight", artist: "Chuck Berry", year: 1982 },
  { number: 22, name: "John Lennon/Plastic Ono Band", artist: "John Lennon", year: 1970 },
  { number: 23, name: "Innervisions", artist: "Stevie Wonder", year: 1973 },
  { number: 24, name: "Live at the Apollo", artist: "James Brown", year: 1963 },
  { number: 25, name: "Rumours", artist: "Fleetwood Mac", year: 1977 },
  { number: 26, name: "The Joshua Tree", artist: "U2", year: 1987 },
  { number: 27, name: "King of the Delta Blues Singers", artist: "Robert Johnson", year: 1961 },
  { number: 28, name: "Who's Next", artist: "The Who", year: 1971 },
  { number: 29, name: "Led Zeppelin", artist: "Led Zeppelin", year: 1969 },
  { number: 30, name: "Blue", artist: "Joni Mitchell", year: 1971 },
  { number: 31, name: "Bringing It All Back Home", artist: "Bob Dylan", year: 1965 },
  { number: 32, name: "Let It Bleed", artist: "The Rolling Stones", year: 1969 },
  { number: 33, name: "Ramones", artist: "Ramones", year: 1976 },
  { number: 34, name: "Music from Big Pink", artist: "The Band", year: 1968 },
  { number: 35, name: "The Rise and Fall of Ziggy Stardust", artist: "David Bowie", year: 1972 },
  { number: 36, name: "Tapestry", artist: "Carole King", year: 1971 },
  { number: 37, name: "Hotel California", artist: "Eagles", year: 1976 },
  { number: 38, name: "The Anthology", artist: "Muddy Waters", year: 2001 },
  { number: 39, name: "Please Please Me", artist: "The Beatles", year: 1963 },
  { number: 40, name: "Forever Changes", artist: "Love", year: 1967 },
  { number: 41, name: "Never Mind the Bollocks", artist: "Sex Pistols", year: 1977 },
  { number: 42, name: "The Doors", artist: "The Doors", year: 1967 },
  { number: 43, name: "The Dark Side of the Moon", artist: "Pink Floyd", year: 1973 },
  { number: 44, name: "Horses", artist: "Patti Smith", year: 1975 },
  { number: 45, name: "The Band", artist: "The Band", year: 1969 },
  { number: 46, name: "Legend", artist: "Bob Marley and the Wailers", year: 1984 },
  { number: 47, name: "A Love Supreme", artist: "John Coltrane", year: 1965 },
  { number: 48, name: "It Takes a Nation of Millions", artist: "Public Enemy", year: 1988 },
  { number: 49, name: "At Fillmore East", artist: "The Allman Brothers Band", year: 1971 },
  { number: 50, name: "Here's Little Richard", artist: "Little Richard", year: 1957 },
  { number: 51, name: "Bridge Over Troubled Water", artist: "Simon & Garfunkel", year: 1970 },
  { number: 52, name: "Greatest Hits", artist: "Al Green", year: 1975 },
  { number: 53, name: "The Birth of Soul", artist: "Ray Charles", year: 1991 },
  { number: 54, name: "Electric Ladyland", artist: "The Jimi Hendrix Experience", year: 1968 },
  { number: 55, name: "There's a Riot Goin' On", artist: "Sly and the Family Stone", year: 1971 },
  { number: 56, name: "Moondance", artist: "Van Morrison", year: 1970 },
  { number: 57, name: "My Generation", artist: "The Who", year: 1965 },
  { number: 58, name: "Howlin' Wolf", artist: "Howlin' Wolf", year: 1962 },
  { number: 59, name: "After the Gold Rush", artist: "Neil Young", year: 1970 },
  { number: 60, name: "Star Time", artist: "James Brown", year: 1991 },
  { number: 61, name: "Purple Rain", artist: "Prince", year: 1984 },
  { number: 62, name: "Back in Black", artist: "AC/DC", year: 1980 },
  { number: 63, name: "Otis Blue", artist: "Otis Redding", year: 1965 },
  { number: 64, name: "Led Zeppelin II", artist: "Led Zeppelin", year: 1969 },
  { number: 65, name: "Meet the Beatles!", artist: "The Beatles", year: 1964 },
  { number: 66, name: "The Best of Little Walter", artist: "Little Walter", year: 1967 },
  { number: 67, name: "Trout Mask Replica", artist: "Captain Beefheart", year: 1969 },
  { number: 68, name: "At Folsom Prison", artist: "Johnny Cash", year: 1968 },
  { number: 69, name: "Superfly", artist: "Curtis Mayfield", year: 1972 },
  { number: 70, name: "Physical Graffiti", artist: "Led Zeppelin", year: 1975 },
  { number: 71, name: "Aftermath", artist: "The Rolling Stones", year: 1966 },
  { number: 72, name: "Johnny Cash at San Quentin", artist: "Johnny Cash", year: 1969 },
  { number: 73, name: "Like a Prayer", artist: "Madonna", year: 1989 },
  { number: 74, name: "The Notorious B.I.G.", artist: "The Notorious B.I.G.", year: 1994 },
  { number: 75, name: "Goodbye Yellow Brick Road", artist: "Elton John", year: 1973 },
  { number: 76, name: "20 Golden Greats", artist: "Buddy Holly", year: 1978 },
  { number: 77, name: "The Complete Recordings", artist: "Robert Johnson", year: 1990 },
  { number: 78, name: "Aretha Arrives", artist: "Aretha Franklin", year: 1967 },
  { number: 79, name: "The Chronic", artist: "Dr. Dre", year: 1992 },
  { number: 80, name: "Paid in Full", artist: "Eric B. & Rakim", year: 1987 },
  { number: 81, name: "Enter the Wu-Tang", artist: "Wu-Tang Clan", year: 1993 },
  { number: 82, name: "The Low End Theory", artist: "A Tribe Called Quest", year: 1991 },
  { number: 83, name: "Illmatic", artist: "Nas", year: 1994 },
  { number: 84, name: "Straight Outta Compton", artist: "N.W.A", year: 1988 },
  { number: 85, name: "The Miseducation of Lauryn Hill", artist: "Lauryn Hill", year: 1998 },
  { number: 86, name: "Ready to Die", artist: "The Notorious B.I.G.", year: 1994 },
  { number: 87, name: "All Eyez on Me", artist: "2Pac", year: 1996 },
  { number: 88, name: "The Score", artist: "Fugees", year: 1996 },
  { number: 89, name: "36 Chambers", artist: "Wu-Tang Clan", year: 1993 },
  { number: 90, name: "The Blueprint", artist: "Jay-Z", year: 2001 },
  { number: 91, name: "Aquemini", artist: "OutKast", year: 1998 },
  { number: 92, name: "Stankonia", artist: "OutKast", year: 2000 },
  { number: 93, name: "The Marshall Mathers LP", artist: "Eminem", year: 2000 },
  { number: 94, name: "Speakerboxxx/The Love Below", artist: "OutKast", year: 2003 },
  { number: 95, name: "The College Dropout", artist: "Kanye West", year: 2004 },
  { number: 96, name: "Late Registration", artist: "Kanye West", year: 2005 },
  { number: 97, name: "My Beautiful Dark Twisted Fantasy", artist: "Kanye West", year: 2010 },
  { number: 98, name: "To Pimp a Butterfly", artist: "Kendrick Lamar", year: 2015 },
  { number: 99, name: "good kid, m.A.A.d city", artist: "Kendrick Lamar", year: 2012 },
  { number: 100, name: "DAMN.", artist: "Kendrick Lamar", year: 2017 },
]

async function main() {
  console.log('🌱 Starting seed: Top 100 Vinyls of All Time...')

  try {
    // Get or create an admin user for the collection
    let adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
    })

    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating one...')
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@gathering.app',
          name: 'Gathering Admin',
          isAdmin: true,
        },
      })
      console.log('✅ Created admin user:', adminUser.email)
    } else {
      console.log('✅ Using existing admin user:', adminUser.email)
    }

    // Check if collection already exists
    const existingCollection = await prisma.communityCollection.findFirst({
      where: {
        name: 'Top 100 Vinyls of All Time',
      },
    })

    if (existingCollection) {
      console.log('⚠️  Collection already exists. Deleting it first...')
      await prisma.communityItem.deleteMany({
        where: { communityCollectionId: existingCollection.id },
      })
      await prisma.communityCollectionVote.deleteMany({
        where: { communityCollectionId: existingCollection.id },
      })
      await prisma.communityCollection.delete({
        where: { id: existingCollection.id },
      })
      console.log('✅ Deleted existing collection')
    }

    // Create the community collection
    console.log('📀 Creating "Top 100 Vinyls of All Time" collection...')
    const collection = await prisma.communityCollection.create({
      data: {
        name: 'Top 100 Vinyls of All Time',
        description: 'A curated list of the 100 greatest vinyl records of all time, featuring iconic albums from various genres and eras.',
        category: 'Music',
        coverImage: null, // Can be added later
        tags: JSON.stringify(['Music', 'Vinyl', 'Classic', 'Essential']),
        userId: adminUser.id,
        items: {
          create: top100Vinyls.map((vinyl) => ({
            name: `${vinyl.name} - ${vinyl.artist}`,
            number: vinyl.number,
            notes: `Released in ${vinyl.year}. Ranked #${vinyl.number} in the Top 100 Vinyls of All Time.`,
            image: null, // Can be added later with album artwork
          })),
        },
      },
      include: {
        items: true,
      },
    })

    console.log(`✅ Successfully created collection with ${collection.items.length} items!`)
    console.log(`📊 Collection ID: ${collection.id}`)
    console.log('🎉 Seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

