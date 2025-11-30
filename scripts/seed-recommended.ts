import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tintin albums with actual titles
const tintinAlbums = [
  { number: 1, name: 'Tintin au pays des Soviets' },
  { number: 2, name: 'Tintin au Congo' },
  { number: 3, name: 'Tintin en Amérique' },
  { number: 4, name: 'Les Cigares du pharaon' },
  { number: 5, name: 'Le Lotus bleu' },
  { number: 6, name: 'L\'Oreille cassée' },
  { number: 7, name: 'L\'Île noire' },
  { number: 8, name: 'Le Sceptre d\'Ottokar' },
  { number: 9, name: 'Le Crabe aux pinces d\'or' },
  { number: 10, name: 'L\'Étoile mystérieuse' },
  { number: 11, name: 'Le Secret de La Licorne' },
  { number: 12, name: 'Le Trésor de Rackham le Rouge' },
  { number: 13, name: 'Les Sept Boules de cristal' },
  { number: 14, name: 'Le Temple du Soleil' },
  { number: 15, name: 'Tintin au pays de l\'or noir' },
  { number: 16, name: 'Objectif Lune' },
  { number: 17, name: 'On a marché sur la Lune' },
  { number: 18, name: 'L\'Affaire Tournesol' },
  { number: 19, name: 'Coke en stock' },
  { number: 20, name: 'Tintin au Tibet' },
  { number: 21, name: 'Les Bijoux de la Castafiore' },
  { number: 22, name: 'Vol 714 pour Sydney' },
  { number: 23, name: 'Tintin et les Picaros' },
  { number: 24, name: 'Tintin et l\'Alph-Art' },
]

// Lucky Luke albums (first 80 with some key titles)
const luckyLukeAlbums = [
  { number: 1, name: 'Arizona 1880' },
  { number: 2, name: 'Sous le ciel de l\'Ouest' },
  { number: 3, name: 'Oklahoma Jim' },
  { number: 4, name: 'L\'Héritage de Rantanplan' },
  { number: 5, name: 'Ruée sur l\'Oklahoma' },
  { number: 6, name: 'L\'Évasion de Dalton' },
  { number: 7, name: 'Sur la piste des Dalton' },
  { number: 8, name: 'À l\'ombre des derricks' },
  { number: 9, name: 'Les Rivaux de Painful Gulch' },
  { number: 10, name: 'Billy the Kid' },
  { number: 11, name: 'Les Collines noires' },
  { number: 12, name: 'Les Dalton dans le blizzard' },
  { number: 13, name: 'Les Dalton courent toujours' },
  { number: 14, name: 'La Caravane' },
  { number: 15, name: 'La Ville fantôme' },
  { number: 16, name: 'Les Dalton se rachètent' },
  { number: 17, name: 'Le 20ème de cavalerie' },
  { number: 18, name: 'L\'Escorte' },
  { number: 19, name: 'Des barbelés sur la prairie' },
  { number: 20, name: 'Calamity Jane' },
  { number: 21, name: 'Tortillas pour les Dalton' },
  { number: 22, name: 'La Diligence' },
  { number: 23, name: 'Le Pied-tendre' },
  { number: 24, name: 'Dalton City' },
  { number: 25, name: 'Jesse James' },
  { number: 26, name: 'Western Circus' },
  { number: 27, name: 'Canyon Apache' },
  { number: 28, name: 'Ma Dalton' },
  { number: 29, name: 'Chasseur de primes' },
  { number: 30, name: 'Le Grand Duc' },
  { number: 31, name: 'L\'Héritage de Rantanplan' },
  { number: 32, name: '7 histoires de Lucky Luke' },
  { number: 33, name: 'Le Cavalier blanc' },
  { number: 34, name: 'La Guérison des Dalton' },
  { number: 35, name: 'L\'Empereur Smith' },
  { number: 36, name: 'Le Fil qui chante' },
  { number: 37, name: 'La Ballade des Dalton' },
  { number: 38, name: 'Le Daily Star' },
  { number: 39, name: 'La Fiancée de Lucky Luke' },
  { number: 40, name: 'Le Ranch maudit' },
  { number: 41, name: 'Nitro-glycerine' },
  { number: 42, name: 'L\'Alibi' },
  { number: 43, name: 'Le Pony Express' },
  { number: 44, name: 'L\'Amnésie des Dalton' },
  { number: 45, name: 'Chasse aux fantômes' },
  { number: 46, name: 'Les Dalton à la noce' },
  { number: 47, name: 'Le Pont sur le Mississippi' },
  { number: 48, name: 'Belle Starr' },
  { number: 49, name: 'Le Klondike' },
  { number: 50, name: 'O.K. Corral' },
  { number: 51, name: 'Marcassin' },
  { number: 52, name: 'Profession: chasseur de primes' },
  { number: 53, name: 'La Légende de l\'Ouest' },
  { number: 54, name: 'La Maîtresse de l\'enseigne' },
  { number: 55, name: 'Le Retour de Rantanplan' },
  { number: 56, name: 'La Romance de Lucky Luke' },
  { number: 57, name: 'Lucky Luke contre Pinkerton' },
  { number: 58, name: 'Cavalier seul' },
  { number: 59, name: 'L\'Ouest, le vrai' },
  { number: 60, name: 'Nez cassé' },
  { number: 61, name: 'Daisy Town' },
  { number: 62, name: 'Fingers' },
  { number: 63, name: 'Le Duel' },
  { number: 64, name: 'Le Prophète' },
  { number: 65, name: 'L\'Artiste-peintre' },
  { number: 66, name: 'La Corde au cou' },
  { number: 67, name: 'Sarah Bernhardt' },
  { number: 68, name: 'Chasse à l\'homme' },
  { number: 69, name: 'Les Tontons Dalton' },
  { number: 70, name: 'Le Magot des Dalton' },
  { number: 71, name: 'Le Bandit manchot' },
  { number: 72, name: 'La Corde au cou' },
  { number: 73, name: 'La Belle Province' },
  { number: 74, name: 'La Conquête de l\'Ouest' },
  { number: 75, name: 'L\'Homme de Washington' },
  { number: 76, name: 'Terra libre' },
  { number: 77, name: 'La Promesse de l\'homme de la lune' },
  { number: 78, name: 'L\'Amour et l\'Argent' },
  { number: 79, name: 'Le Cavalier de la nuit' },
  { number: 80, name: 'L\'Ouest, c\'est l\'Ouest' },
]

// Asterix albums with actual titles
const asterixAlbums = [
  { number: 1, name: 'Astérix le Gaulois' },
  { number: 2, name: 'La Serpe d\'or' },
  { number: 3, name: 'Astérix et les Goths' },
  { number: 4, name: 'Astérix gladiateur' },
  { number: 5, name: 'Le Tour de Gaule d\'Astérix' },
  { number: 6, name: 'Astérix et Cléopâtre' },
  { number: 7, name: 'Le Combat des chefs' },
  { number: 8, name: 'Astérix chez les Bretons' },
  { number: 9, name: 'Astérix et les Normands' },
  { number: 10, name: 'Astérix légionnaire' },
  { number: 11, name: 'Le Bouclier arverne' },
  { number: 12, name: 'Astérix aux Jeux olympiques' },
  { number: 13, name: 'Astérix et le Chaudron' },
  { number: 14, name: 'Astérix en Hispanie' },
  { number: 15, name: 'La Zizanie' },
  { number: 16, name: 'Astérix chez les Helvètes' },
  { number: 17, name: 'Le Domaine des dieux' },
  { number: 18, name: 'Les Lauriers de César' },
  { number: 19, name: 'Le Devin' },
  { number: 20, name: 'Astérix en Corse' },
  { number: 21, name: 'Le Cadeau de César' },
  { number: 22, name: 'La Grande Traversée' },
  { number: 23, name: 'Obélix et Compagnie' },
  { number: 24, name: 'Astérix chez les Belges' },
  { number: 25, name: 'Le Grand Fossé' },
  { number: 26, name: 'L\'Odyssée d\'Astérix' },
  { number: 27, name: 'Le Fils d\'Astérix' },
  { number: 28, name: 'Astérix chez Rahàzade' },
  { number: 29, name: 'La Rose et le Glaive' },
  { number: 30, name: 'La Galère d\'Obélix' },
  { number: 31, name: 'Astérix et Latraviata' },
  { number: 32, name: 'Astérix et la Rentrée gauloise' },
  { number: 33, name: 'Le ciel lui tombe sur la tête' },
  { number: 34, name: 'L\'Anniversaire d\'Astérix et Obélix' },
  { number: 35, name: 'Astérix chez les Pictes' },
  { number: 36, name: 'Le Papyrus de César' },
  { number: 37, name: 'Astérix et la Transitalique' },
  { number: 38, name: 'La Fille de Vercingétorix' },
  { number: 39, name: 'Astérix et le Griffon' },
  { number: 40, name: 'L\'Iris blanc' },
]

async function main() {
  console.log('Seeding recommended collections with real titles and images...')

  // Delete existing collections to re-seed
  await prisma.recommendedCollection.deleteMany({})

  // Tintin Collection
  const existingTintin = await prisma.recommendedCollection.findFirst({
    where: { name: 'Les Aventures de Tintin' },
  })

  if (!existingTintin) {
    const tintin = await prisma.recommendedCollection.create({
      data: {
        name: 'Les Aventures de Tintin',
        description: 'The complete collection of Tintin comic albums by Hergé. Follow the adventures of the intrepid reporter Tintin and his faithful dog Snowy.',
        category: 'Comics',
        coverImage: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=600&fit=crop',
        items: {
          create: tintinAlbums.map(album => ({
            name: album.name,
            number: album.number,
            image: `https://via.placeholder.com/200x300/4A90E2/FFFFFF?text=${encodeURIComponent(album.name)}`,
          })),
        },
      },
    })
    console.log(`Created Tintin collection with ${tintinAlbums.length} items`)
  } else {
    console.log('Tintin collection already exists, skipping...')
  }

  // Lucky Luke Collection
  const existingLuckyLuke = await prisma.recommendedCollection.findFirst({
    where: { name: 'Lucky Luke' },
  })

  if (!existingLuckyLuke) {
    const luckyLuke = await prisma.recommendedCollection.create({
      data: {
        name: 'Lucky Luke',
        description: 'The complete collection of Lucky Luke comic albums by Morris and various writers. Follow the adventures of the fastest gun in the West!',
        category: 'Comics',
        coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
        items: {
          create: luckyLukeAlbums.map(album => ({
            name: album.name,
            number: album.number,
            image: `https://via.placeholder.com/200x300/E74C3C/FFFFFF?text=${encodeURIComponent(album.name)}`,
          })),
        },
      },
    })
    console.log(`Created Lucky Luke collection with ${luckyLukeAlbums.length} items`)
  } else {
    console.log('Lucky Luke collection already exists, skipping...')
  }

  // Asterix Collection
  const existingAsterix = await prisma.recommendedCollection.findFirst({
    where: { name: 'Astérix & Obélix' },
  })

  if (!existingAsterix) {
    const asterix = await prisma.recommendedCollection.create({
      data: {
        name: 'Astérix & Obélix',
        description: 'The complete collection of Astérix comic albums by René Goscinny and Albert Uderzo. Join the indomitable Gauls in their fight against the Romans!',
        category: 'Comics',
        coverImage: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=600&fit=crop',
        items: {
          create: asterixAlbums.map(album => ({
            name: album.name,
            number: album.number,
            image: `https://via.placeholder.com/200x300/27AE60/FFFFFF?text=${encodeURIComponent(album.name)}`,
          })),
        },
      },
    })
    console.log(`Created Asterix collection with ${asterixAlbums.length} items`)
  } else {
    console.log('Asterix collection already exists, skipping...')
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
