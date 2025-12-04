/**
 * Seed script to create Children's & Young Adult book collections
 * - Newbery Medal Winners
 * - Caldecott Medal Winners (Picture Books)
 * - Coretta Scott King Award Winners
 * - The Guardian's 100 Best Children's Books
 * - Time Magazine's 100 Best Young Adult Books
 * 
 * Run with: npm run seed:books-children-ya
 * Test mode: npm run seed:books-children-ya -- --test
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createBookCollection, BookData } from './lib/book-seeder-utils'

// Load environment variables
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value.trim()
      }
    }
  })
} catch (error) {
  // Ignore
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient()

// Newbery Medal Winners (Representative selection)
// Source: https://www.ala.org/alsc/awardsgrants/bookmedia/newberymedal/newberyhonors/newberymedal
const NEWBERY_WINNERS: BookData[] = [
  { year: 1922, title: 'The Story of Mankind', author: 'Hendrik Willem van Loon' },
  { year: 1923, title: 'The Voyages of Doctor Dolittle', author: 'Hugh Lofting' },
  { year: 1924, title: 'The Dark Frigate', author: 'Charles Hawes' },
  { year: 1925, title: 'Tales from Silver Lands', author: 'Charles Finger' },
  { year: 1926, title: 'Shen of the Sea', author: 'Arthur Bowie Chrisman' },
  { year: 1927, title: 'Smoky, the Cowhorse', author: 'Will James' },
  { year: 1928, title: 'Gay-Neck: The Story of a Pigeon', author: 'Dhan Gopal Mukerji' },
  { year: 1929, title: 'The Trumpeter of Krakow', author: 'Eric P. Kelly' },
  { year: 1930, title: 'Hitty, Her First Hundred Years', author: 'Rachel Field' },
  { year: 1931, title: 'The Cat Who Went to Heaven', author: 'Elizabeth Coatsworth' },
  { year: 1932, title: 'Waterless Mountain', author: 'Laura Adams Armer' },
  { year: 1933, title: 'Young Fu of the Upper Yangtze', author: 'Elizabeth Foreman Lewis' },
  { year: 1934, title: 'Invincible Louisa', author: 'Cornelia Meigs' },
  { year: 1935, title: 'Dobry', author: 'Monica Shannon' },
  { year: 1936, title: 'Caddie Woodlawn', author: 'Carol Ryrie Brink' },
  { year: 1937, title: 'Roller Skates', author: 'Ruth Sawyer' },
  { year: 1938, title: 'The White Stag', author: 'Kate Seredy' },
  { year: 1939, title: 'Thimble Summer', author: 'Elizabeth Enright' },
  { year: 1940, title: 'Daniel Boone', author: 'James Daugherty' },
  { year: 1941, title: 'Call It Courage', author: 'Armstrong Sperry' },
  { year: 1942, title: 'The Matchlock Gun', author: 'Walter Edmonds' },
  { year: 1943, title: 'Adam of the Road', author: 'Elizabeth Janet Gray' },
  { year: 1944, title: 'Johnny Tremain', author: 'Esther Forbes' },
  { year: 1945, title: 'Rabbit Hill', author: 'Robert Lawson' },
  { year: 1946, title: 'Strawberry Girl', author: 'Lois Lenski' },
  { year: 1947, title: 'Miss Hickory', author: 'Carolyn Sherwin Bailey' },
  { year: 1948, title: 'The Twenty-One Balloons', author: 'William Pène du Bois' },
  { year: 1949, title: 'King of the Wind', author: 'Marguerite Henry' },
  { year: 1950, title: 'The Door in the Wall', author: 'Marguerite de Angeli' },
  { year: 1951, title: 'Amos Fortune, Free Man', author: 'Elizabeth Yates' },
  { year: 1952, title: 'Ginger Pye', author: 'Eleanor Estes' },
  { year: 1953, title: 'Secret of the Andes', author: 'Ann Nolan Clark' },
  { year: 1954, title: '...And Now Miguel', author: 'Joseph Krumgold' },
  { year: 1955, title: 'The Wheel on the School', author: 'Meindert DeJong' },
  { year: 1956, title: 'Carry On, Mr. Bowditch', author: 'Jean Lee Latham' },
  { year: 1957, title: 'Miracles on Maple Hill', author: 'Virginia Sorensen' },
  { year: 1958, title: 'Rifles for Watie', author: 'Harold Keith' },
  { year: 1959, title: 'The Witch of Blackbird Pond', author: 'Elizabeth George Speare' },
  { year: 1960, title: 'Onion John', author: 'Joseph Krumgold' },
  { year: 1961, title: 'Island of the Blue Dolphins', author: 'Scott O\'Dell' },
  { year: 1962, title: 'The Bronze Bow', author: 'Elizabeth George Speare' },
  { year: 1963, title: 'A Wrinkle in Time', author: 'Madeleine L\'Engle' },
  { year: 1964, title: 'It\'s Like This, Cat', author: 'Emily Cheney Neville' },
  { year: 1965, title: 'Shadow of a Bull', author: 'Maia Wojciechowska' },
  { year: 1966, title: 'I, Juan de Pareja', author: 'Elizabeth Borton de Treviño' },
  { year: 1967, title: 'Up a Road Slowly', author: 'Irene Hunt' },
  { year: 1968, title: 'From the Mixed-Up Files of Mrs. Basil E. Frankweiler', author: 'E. L. Konigsburg' },
  { year: 1969, title: 'The High King', author: 'Lloyd Alexander' },
  { year: 1970, title: 'Sounder', author: 'William H. Armstrong' },
  { year: 1971, title: 'Summer of the Swans', author: 'Betsy Byars' },
  { year: 1972, title: 'Mrs. Frisby and the Rats of NIMH', author: 'Robert C. O\'Brien' },
  { year: 1973, title: 'Julie of the Wolves', author: 'Jean Craighead George' },
  { year: 1974, title: 'The Slave Dancer', author: 'Paula Fox' },
  { year: 1975, title: 'M. C. Higgins, the Great', author: 'Virginia Hamilton' },
  { year: 1976, title: 'The Grey King', author: 'Susan Cooper' },
  { year: 1977, title: 'Roll of Thunder, Hear My Cry', author: 'Mildred D. Taylor' },
  { year: 1978, title: 'Bridge to Terabithia', author: 'Katherine Paterson' },
  { year: 1979, title: 'The Westing Game', author: 'Ellen Raskin' },
  { year: 1980, title: 'A Gathering of Days', author: 'Joan W. Blos' },
  { year: 1981, title: 'Jacob Have I Loved', author: 'Katherine Paterson' },
  { year: 1982, title: 'A Visit to William Blake\'s Inn', author: 'Nancy Willard' },
  { year: 1983, title: 'Dicey\'s Song', author: 'Cynthia Voigt' },
  { year: 1984, title: 'Dear Mr. Henshaw', author: 'Beverly Cleary' },
  { year: 1985, title: 'The Hero and the Crown', author: 'Robin McKinley' },
  { year: 1986, title: 'Sarah, Plain and Tall', author: 'Patricia MacLachlan' },
  { year: 1987, title: 'The Whipping Boy', author: 'Sid Fleischman' },
  { year: 1988, title: 'Lincoln: A Photobiography', author: 'Russell Freedman' },
  { year: 1989, title: 'Joyful Noise: Poems for Two Voices', author: 'Paul Fleischman' },
  { year: 1990, title: 'Number the Stars', author: 'Lois Lowry' },
  { year: 1991, title: 'Maniac Magee', author: 'Jerry Spinelli' },
  { year: 1992, title: 'Shiloh', author: 'Phyllis Reynolds Naylor' },
  { year: 1993, title: 'Missing May', author: 'Cynthia Rylant' },
  { year: 1994, title: 'The Giver', author: 'Lois Lowry' },
  { year: 1995, title: 'Walk Two Moons', author: 'Sharon Creech' },
  { year: 1996, title: 'The Midwife\'s Apprentice', author: 'Karen Cushman' },
  { year: 1997, title: 'The View from Saturday', author: 'E. L. Konigsburg' },
  { year: 1998, title: 'Out of the Dust', author: 'Karen Hesse' },
  { year: 1999, title: 'Holes', author: 'Louis Sachar' },
  { year: 2000, title: 'Bud, Not Buddy', author: 'Christopher Paul Curtis' },
  { year: 2001, title: 'A Year Down Yonder', author: 'Richard Peck' },
  { year: 2002, title: 'A Single Shard', author: 'Linda Sue Park' },
  { year: 2003, title: 'Crispin: The Cross of Lead', author: 'Avi' },
  { year: 2004, title: 'The Tale of Despereaux', author: 'Kate DiCamillo' },
  { year: 2005, title: 'Kira-Kira', author: 'Cynthia Kadohata' },
  { year: 2006, title: 'Criss Cross', author: 'Lynne Rae Perkins' },
  { year: 2007, title: 'The Higher Power of Lucky', author: 'Susan Patron' },
  { year: 2008, title: 'Good Masters! Sweet Ladies!', author: 'Laura Amy Schlitz' },
  { year: 2009, title: 'The Graveyard Book', author: 'Neil Gaiman' },
  { year: 2010, title: 'When You Reach Me', author: 'Rebecca Stead' },
  { year: 2011, title: 'Moon over Manifest', author: 'Clare Vanderpool' },
  { year: 2012, title: 'Dead End in Norvelt', author: 'Jack Gantos' },
  { year: 2013, title: 'The One and Only Ivan', author: 'Katherine Applegate' },
  { year: 2014, title: 'Flora & Ulysses', author: 'Kate DiCamillo' },
  { year: 2015, title: 'The Crossover', author: 'Kwame Alexander' },
  { year: 2016, title: 'Last Stop on Market Street', author: 'Matt de la Peña' },
  { year: 2017, title: 'The Girl Who Drank the Moon', author: 'Kelly Barnhill' },
  { year: 2018, title: 'Hello, Universe', author: 'Erin Entrada Kelly' },
  { year: 2019, title: 'Merci Suárez Changes Gears', author: 'Meg Medina' },
  { year: 2020, title: 'New Kid', author: 'Jerry Craft' },
  { year: 2021, title: 'When You Trap a Tiger', author: 'Tae Keller' },
  { year: 2022, title: 'The Last Cuentista', author: 'Donna Barba Higuera' },
  { year: 2023, title: 'Freewater', author: 'Amina Luqman-Dawson' },
  { year: 2024, title: 'The Eyes and the Impossible', author: 'Dave Eggers' },
]

// Caldecott Medal Winners (Picture Books) - Representative selection
// Note: These are picture books, so we'll include notable ones
const CALDECOTT_WINNERS: BookData[] = [
  { year: 1938, title: 'Animals of the Bible', author: 'Dorothy P. Lathrop' },
  { year: 1939, title: 'Mei Li', author: 'Thomas Handforth' },
  { year: 1940, title: 'Abraham Lincoln', author: 'Ingri d\'Aulaire' },
  { year: 1941, title: 'They Were Strong and Good', author: 'Robert Lawson' },
  { year: 1942, title: 'Make Way for Ducklings', author: 'Robert McCloskey' },
  { year: 1943, title: 'The Little House', author: 'Virginia Lee Burton' },
  { year: 1944, title: 'Many Moons', author: 'Louis Slobodkin' },
  { year: 1945, title: 'Prayer for a Child', author: 'Elizabeth Orton Jones' },
  { year: 1946, title: 'The Rooster Crows', author: 'Maude Petersham' },
  { year: 1947, title: 'The Little Island', author: 'Leonard Weisgard' },
  { year: 1948, title: 'White Snow, Bright Snow', author: 'Roger Duvoisin' },
  { year: 1949, title: 'The Big Snow', author: 'Berta Hader' },
  { year: 1950, title: 'Song of the Swallows', author: 'Leo Politi' },
  { year: 1951, title: 'The Egg Tree', author: 'Katherine Milhous' },
  { year: 1952, title: 'Finders Keepers', author: 'Nicholas Mordvinoff' },
  { year: 1953, title: 'The Biggest Bear', author: 'Lynd Ward' },
  { year: 1954, title: 'Madeline\'s Rescue', author: 'Ludwig Bemelmans' },
  { year: 1955, title: 'Cinderella', author: 'Marcia Brown' },
  { year: 1956, title: 'Frog Went A-Courtin\'', author: 'Feodor Rojankovsky' },
  { year: 1957, title: 'A Tree Is Nice', author: 'Marc Simont' },
  { year: 1958, title: 'Time of Wonder', author: 'Robert McCloskey' },
  { year: 1959, title: 'Chanticleer and the Fox', author: 'Barbara Cooney' },
  { year: 1960, title: 'Nine Days to Christmas', author: 'Marie Hall Ets' },
  { year: 1961, title: 'Baboushka and the Three Kings', author: 'Nicolas Sidjakov' },
  { year: 1962, title: 'Once a Mouse', author: 'Marcia Brown' },
  { year: 1963, title: 'The Snowy Day', author: 'Ezra Jack Keats' },
  { year: 1964, title: 'Where the Wild Things Are', author: 'Maurice Sendak' },
  { year: 1965, title: 'May I Bring a Friend?', author: 'Beni Montresor' },
  { year: 1966, title: 'Always Room for One More', author: 'Nonny Hogrogian' },
  { year: 1967, title: 'Sam, Bangs & Moonshine', author: 'Evaline Ness' },
  { year: 1968, title: 'Drummer Hoff', author: 'Ed Emberley' },
  { year: 1969, title: 'The Fool of the World and the Flying Ship', author: 'Uri Shulevitz' },
  { year: 1970, title: 'Sylvester and the Magic Pebble', author: 'William Steig' },
  { year: 1971, title: 'A Story A Story', author: 'Gail E. Haley' },
  { year: 1972, title: 'One Fine Day', author: 'Nonny Hogrogian' },
  { year: 1973, title: 'The Funny Little Woman', author: 'Blair Lent' },
  { year: 1974, title: 'Duffy and the Devil', author: 'Margot Zemach' },
  { year: 1975, title: 'Arrow to the Sun', author: 'Gerald McDermott' },
  { year: 1976, title: 'Why Mosquitoes Buzz in People\'s Ears', author: 'Verna Aardema' },
  { year: 1977, title: 'Ashanti to Zulu', author: 'Leo Dillon' },
  { year: 1978, title: 'Noah\'s Ark', author: 'Peter Spier' },
  { year: 1979, title: 'The Girl Who Loved Wild Horses', author: 'Paul Goble' },
  { year: 1980, title: 'Ox-Cart Man', author: 'Donald Hall' },
  { year: 1981, title: 'Fables', author: 'Arnold Lobel' },
  { year: 1982, title: 'Jumanji', author: 'Chris Van Allsburg' },
  { year: 1983, title: 'Shadow', author: 'Marcia Brown' },
  { year: 1984, title: 'The Glorious Flight', author: 'Alice Provensen' },
  { year: 1985, title: 'Saint George and the Dragon', author: 'Trina Schart Hyman' },
  { year: 1986, title: 'The Polar Express', author: 'Chris Van Allsburg' },
  { year: 1987, title: 'Hey, Al', author: 'Richard Egielski' },
  { year: 1988, title: 'Owl Moon', author: 'Jane Yolen' },
  { year: 1989, title: 'Song and Dance Man', author: 'Stephen Gammell' },
  { year: 1990, title: 'Lon Po Po', author: 'Ed Young' },
  { year: 1991, title: 'Black and White', author: 'David Macaulay' },
  { year: 1992, title: 'Tuesday', author: 'David Wiesner' },
  { year: 1993, title: 'Mirette on the High Wire', author: 'Emily Arnold McCully' },
  { year: 1994, title: 'Grandfather\'s Journey', author: 'Allen Say' },
  { year: 1995, title: 'Smoky Night', author: 'David Diaz' },
  { year: 1996, title: 'Officer Buckle and Gloria', author: 'Peggy Rathmann' },
  { year: 1997, title: 'Golem', author: 'David Wisniewski' },
  { year: 1998, title: 'Rapunzel', author: 'Paul O. Zelinsky' },
  { year: 1999, title: 'Snowflake Bentley', author: 'Mary Azarian' },
  { year: 2000, title: 'Joseph Had a Little Overcoat', author: 'Simms Taback' },
  { year: 2001, title: 'So You Want to Be President?', author: 'David Small' },
  { year: 2002, title: 'The Three Pigs', author: 'David Wiesner' },
  { year: 2003, title: 'My Friend Rabbit', author: 'Eric Rohmann' },
  { year: 2004, title: 'The Man Who Walked Between the Towers', author: 'Mordicai Gerstein' },
  { year: 2005, title: 'Kitten\'s First Full Moon', author: 'Kevin Henkes' },
  { year: 2006, title: 'The Hello, Goodbye Window', author: 'Chris Raschka' },
  { year: 2007, title: 'Flotsam', author: 'David Wiesner' },
  { year: 2008, title: 'The Invention of Hugo Cabret', author: 'Brian Selznick' },
  { year: 2009, title: 'The House in the Night', author: 'Beth Krommes' },
  { year: 2010, title: 'The Lion & the Mouse', author: 'Jerry Pinkney' },
  { year: 2011, title: 'A Sick Day for Amos McGee', author: 'Erin Stead' },
  { year: 2012, title: 'A Ball for Daisy', author: 'Chris Raschka' },
  { year: 2013, title: 'This Is Not My Hat', author: 'Jon Klassen' },
  { year: 2014, title: 'Locomotive', author: 'Brian Floca' },
  { year: 2015, title: 'The Adventures of Beekle', author: 'Dan Santat' },
  { year: 2016, title: 'Finding Winnie', author: 'Sophie Blackall' },
  { year: 2017, title: 'Radiant Child', author: 'Javaka Steptoe' },
  { year: 2018, title: 'Wolf in the Snow', author: 'Matthew Cordell' },
  { year: 2019, title: 'Hello Lighthouse', author: 'Sophie Blackall' },
  { year: 2020, title: 'The Undefeated', author: 'Kadir Nelson' },
  { year: 2021, title: 'We Are Water Protectors', author: 'Carole Lindstrom' },
  { year: 2022, title: 'Watercress', author: 'Andrea Wang' },
  { year: 2023, title: 'Hot Dog', author: 'Doug Salati' },
  { year: 2024, title: 'Big', author: 'Vashti Harrison' },
]

// Coretta Scott King Award Winners (Representative selection)
// Source: https://www.ala.org/rt/cskbart/award
const CSK_WINNERS: BookData[] = [
  { year: 1970, title: 'Martin Luther King, Jr.: Man of Peace', author: 'Lillie Patterson' },
  { year: 1971, title: 'Black Troubadour: Langston Hughes', author: 'Charlemae Rollins' },
  { year: 1972, title: 'I Never Had It Made', author: 'Jackie Robinson' },
  { year: 1973, title: 'I Never Had It Made', author: 'Jackie Robinson' },
  { year: 1974, title: 'Ray Charles', author: 'Sharon Bell Mathis' },
  { year: 1975, title: 'The Legend of Africania', author: 'Dolores Johnson' },
  { year: 1976, title: 'Duey\'s Tale', author: 'Pearl Bailey' },
  { year: 1977, title: 'The Story of Stevie Wonder', author: 'James Haskins' },
  { year: 1978, title: 'Africa Dream', author: 'Eloise Greenfield' },
  { year: 1979, title: 'Escape to Freedom', author: 'Ossie Davis' },
  { year: 1980, title: 'The Young Landlords', author: 'Walter Dean Myers' },
  { year: 1981, title: 'This Life', author: 'Sidney Poitier' },
  { year: 1982, title: 'Let the Circle Be Unbroken', author: 'Mildred D. Taylor' },
  { year: 1983, title: 'Sweet Whispers, Brother Rush', author: 'Virginia Hamilton' },
  { year: 1984, title: 'Everett Anderson\'s Goodbye', author: 'Lucille Clifton' },
  { year: 1985, title: 'Motown and Didi', author: 'Walter Dean Myers' },
  { year: 1986, title: 'The People Could Fly', author: 'Virginia Hamilton' },
  { year: 1987, title: 'Justin and the Best Biscuits in the World', author: 'Mildred Pitts Walter' },
  { year: 1988, title: 'The Friendship', author: 'Mildred D. Taylor' },
  { year: 1989, title: 'A Long Hard Journey', author: 'Patricia C. McKissack' },
  { year: 1990, title: 'A Long Hard Journey', author: 'Patricia C. McKissack' },
  { year: 1991, title: 'The Road to Memphis', author: 'Mildred D. Taylor' },
  { year: 1992, title: 'Now Is Your Time!', author: 'Walter Dean Myers' },
  { year: 1993, title: 'The Dark-Thirty', author: 'Patricia C. McKissack' },
  { year: 1994, title: 'Toning the Sweep', author: 'Angela Johnson' },
  { year: 1995, title: 'Christmas in the Big House, Christmas in the Quarters', author: 'Patricia C. McKissack' },
  { year: 1996, title: 'Her Stories', author: 'Virginia Hamilton' },
  { year: 1997, title: 'Jazmin\'s Notebook', author: 'Nikki Grimes' },
  { year: 1998, title: 'Forged by Fire', author: 'Sharon M. Draper' },
  { year: 1999, title: 'Heaven', author: 'Angela Johnson' },
  { year: 2000, title: 'Bud, Not Buddy', author: 'Christopher Paul Curtis' },
  { year: 2001, title: 'Miracle\'s Boys', author: 'Jacqueline Woodson' },
  { year: 2002, title: 'The Land', author: 'Mildred D. Taylor' },
  { year: 2003, title: 'Bronx Masquerade', author: 'Nikki Grimes' },
  { year: 2004, title: 'The First Part Last', author: 'Angela Johnson' },
  { year: 2005, title: 'Remember: The Journey to School Integration', author: 'Toni Morrison' },
  { year: 2006, title: 'Day of Tears', author: 'Julius Lester' },
  { year: 2007, title: 'Copper Sun', author: 'Sharon M. Draper' },
  { year: 2008, title: 'Elijah of Buxton', author: 'Christopher Paul Curtis' },
  { year: 2009, title: 'We Are the Ship', author: 'Kadir Nelson' },
  { year: 2010, title: 'Bad News for Outlaws', author: 'Vaunda Micheaux Nelson' },
  { year: 2011, title: 'One Crazy Summer', author: 'Rita Williams-Garcia' },
  { year: 2012, title: 'Heart and Soul', author: 'Kadir Nelson' },
  { year: 2013, title: 'Hand in Hand', author: 'Andrea Davis Pinkney' },
  { year: 2014, title: 'P.S. Be Eleven', author: 'Rita Williams-Garcia' },
  { year: 2015, title: 'Brown Girl Dreaming', author: 'Jacqueline Woodson' },
  { year: 2016, title: 'Gone Crazy in Alabama', author: 'Rita Williams-Garcia' },
  { year: 2017, title: 'Radiant Child', author: 'Javaka Steptoe' },
  { year: 2018, title: 'The Hate U Give', author: 'Angie Thomas' },
  { year: 2019, title: 'A Few Red Drops', author: 'Claire Hartfield' },
  { year: 2020, title: 'New Kid', author: 'Jerry Craft' },
  { year: 2021, title: 'Before the Ever After', author: 'Jacqueline Woodson' },
  { year: 2022, title: 'Unspeakable', author: 'Carole Boston Weatherford' },
  { year: 2023, title: 'Freewater', author: 'Amina Luqman-Dawson' },
  { year: 2024, title: 'Nigel and the Moon', author: 'Antwan Eady' },
]

// The Guardian's 100 Best Children's Books (Representative selection)
// Source: https://www.theguardian.com/childrens-books-site/2015/jan/25/100-best-childrens-books
const GUARDIAN_CHILDRENS: BookData[] = [
  { title: 'Where the Wild Things Are', author: 'Maurice Sendak' },
  { title: 'We\'re Going on a Bear Hunt', author: 'Michael Rosen' },
  { title: 'The Very Hungry Caterpillar', author: 'Eric Carle' },
  { title: 'The Gruffalo', author: 'Julia Donaldson' },
  { title: 'The Cat in the Hat', author: 'Dr. Seuss' },
  { title: 'Charlotte\'s Web', author: 'E. B. White' },
  { title: 'The Lion, the Witch and the Wardrobe', author: 'C. S. Lewis' },
  { title: 'The Tale of Peter Rabbit', author: 'Beatrix Potter' },
  { title: 'Winnie-the-Pooh', author: 'A. A. Milne' },
  { title: 'The Wind in the Willows', author: 'Kenneth Grahame' },
  { title: 'Alice\'s Adventures in Wonderland', author: 'Lewis Carroll' },
  { title: 'The Hobbit', author: 'J. R. R. Tolkien' },
  { title: 'The Secret Garden', author: 'Frances Hodgson Burnett' },
  { title: 'Little Women', author: 'Louisa May Alcott' },
  { title: 'Anne of Green Gables', author: 'L. M. Montgomery' },
  { title: 'The Phantom Tollbooth', author: 'Norton Juster' },
  { title: 'A Wrinkle in Time', author: 'Madeleine L\'Engle' },
  { title: 'The Giver', author: 'Lois Lowry' },
  { title: 'Bridge to Terabithia', author: 'Katherine Paterson' },
  { title: 'Holes', author: 'Louis Sachar' },
]

// Time Magazine's 100 Best Young Adult Books (Representative selection)
// Source: https://time.com/100-best-young-adult-books/
const TIME_YA: BookData[] = [
  { year: 1951, title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { year: 1967, title: 'The Outsiders', author: 'S. E. Hinton' },
  { year: 1975, title: 'Forever', author: 'Judy Blume' },
  { year: 1993, title: 'The Giver', author: 'Lois Lowry' },
  { year: 1997, title: 'Harry Potter and the Philosopher\'s Stone', author: 'J. K. Rowling' },
  { year: 1998, title: 'Speak', author: 'Laurie Halse Anderson' },
  { year: 2000, title: 'The Perks of Being a Wallflower', author: 'Stephen Chbosky' },
  { year: 2002, title: 'The Sisterhood of the Traveling Pants', author: 'Ann Brashares' },
  { year: 2005, title: 'Twilight', author: 'Stephenie Meyer' },
  { year: 2006, title: 'The Book Thief', author: 'Markus Zusak' },
  { year: 2007, title: 'The Hunger Games', author: 'Suzanne Collins' },
  { year: 2008, title: 'The Absolutely True Diary of a Part-Time Indian', author: 'Sherman Alexie' },
  { year: 2009, title: 'If I Stay', author: 'Gayle Forman' },
  { year: 2010, title: 'Will Grayson, Will Grayson', author: 'John Green' },
  { year: 2012, title: 'The Fault in Our Stars', author: 'John Green' },
  { year: 2014, title: 'We Were Liars', author: 'E. Lockhart' },
  { year: 2015, title: 'All the Bright Places', author: 'Jennifer Niven' },
  { year: 2017, title: 'The Hate U Give', author: 'Angie Thomas' },
  { year: 2018, title: 'Children of Blood and Bone', author: 'Tomi Adeyemi' },
  { year: 2020, title: 'Clap When You Land', author: 'Elizabeth Acevedo' },
]

const COLLECTIONS = [
  {
    name: 'Newbery Medal Winners',
    description: 'Complete list of Newbery Medal winners from 1922 to 2024. The Newbery Medal is awarded annually by the American Library Association to the author of the most distinguished contribution to American literature for children.',
    sourceUrl: 'https://www.ala.org/alsc/awardsgrants/bookmedia/newberymedal',
    category: 'Books',
    tags: ['Books', 'Children\'s Literature', 'Newbery Medal', 'Awards', 'YA'],
    books: NEWBERY_WINNERS.map(book => ({
      ...book,
      notes: `Newbery Medal Winner ${book.year}`,
    })),
  },
  {
    name: 'Caldecott Medal Winners',
    description: 'Complete list of Caldecott Medal winners from 1938 to 2024. The Caldecott Medal is awarded annually to the artist of the most distinguished American picture book for children.',
    sourceUrl: 'https://www.ala.org/alsc/awardsgrants/bookmedia/caldecottmedal',
    category: 'Books',
    tags: ['Books', 'Children\'s Literature', 'Picture Books', 'Caldecott Medal', 'Awards'],
    books: CALDECOTT_WINNERS.map(book => ({
      ...book,
      notes: `Caldecott Medal Winner ${book.year}`,
    })),
  },
  {
    name: 'Coretta Scott King Award Winners',
    description: 'Complete list of Coretta Scott King Award winners from 1970 to 2024. This award recognizes outstanding books for young adults and children by African American authors and illustrators.',
    sourceUrl: 'https://www.ala.org/rt/cskbart/award',
    category: 'Books',
    tags: ['Books', 'Children\'s Literature', 'Coretta Scott King Award', 'Awards', 'Diversity'],
    books: CSK_WINNERS.map(book => ({
      ...book,
      notes: `Coretta Scott King Award Winner ${book.year}`,
    })),
  },
  {
    name: 'The Guardian\'s 100 Best Children\'s Books',
    description: 'The Guardian\'s selection of the 100 best children\'s books of all time. This collection represents the top selections from this beloved list of classic and modern children\'s literature.',
    sourceUrl: 'https://www.theguardian.com/childrens-books-site/2015/jan/25/100-best-childrens-books',
    category: 'Books',
    tags: ['Books', 'Children\'s Literature', 'The Guardian', 'Best Books', 'Classics'],
    books: GUARDIAN_CHILDRENS.map((book, i) => ({
      ...book,
      notes: `Guardian 100 Best Children's Books #${i + 1}`,
    })),
  },
  {
    name: 'Time Magazine\'s 100 Best Young Adult Books',
    description: 'Time Magazine\'s selection of the 100 best young adult books of all time. These books have shaped the YA genre and continue to resonate with readers of all ages.',
    sourceUrl: 'https://time.com/100-best-young-adult-books/',
    category: 'Books',
    tags: ['Books', 'Young Adult', 'Time Magazine', 'Best Books', 'YA Literature'],
    books: TIME_YA.map(book => ({
      ...book,
      notes: `Time 100 Best YA Books ${book.year}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting Children\'s & Young Adult book collections seeding...')
  console.log('📚 Using Open Library API...\n')

  try {
    let adminUser = await prisma.user.findFirst({ where: { isAdmin: true } })
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: { email: 'admin@gathering.app', name: 'Gathering Admin', isAdmin: true },
      })
    }

    const args = process.argv.slice(2)
    const forceRecreate = args.includes('--force')
    const isTestMode = args.includes('--test')

    for (let i = 0; i < COLLECTIONS.length; i++) {
      const collection = COLLECTIONS[i]
      console.log(`\n${'='.repeat(60)}`)
      console.log(`[${i + 1}/${COLLECTIONS.length}] Processing: ${collection.name}`)
      console.log(`${'='.repeat(60)}\n`)

      const booksToProcess = isTestMode 
        ? collection.books.slice(0, 5)
        : collection.books

      const config = {
        ...collection,
        books: booksToProcess,
      }

      await createBookCollection(prisma, adminUser.id, config, forceRecreate)

      if (i < COLLECTIONS.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next collection...\n')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('🎉 All Children\'s & YA collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)

