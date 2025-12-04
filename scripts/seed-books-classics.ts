/**
 * Seed script to create classic book collections
 * - Modern Library 100 Best Novels
 * - Time Magazine's All-Time 100 Novels
 * - BBC's The Big Read Top 100
 * 
 * Run with: npm run seed:books-classics
 * Test mode: npm run seed:books-classics -- --test
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

// Modern Library 100 Best Novels (Complete list)
// Source: https://www.modernlibrary.com/top-100/100-best-novels/
const MODERN_LIBRARY_100: BookData[] = [
  { title: 'Ulysses', author: 'James Joyce' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { title: 'A Portrait of the Artist as a Young Man', author: 'James Joyce' },
  { title: 'Lolita', author: 'Vladimir Nabokov' },
  { title: 'Brave New World', author: 'Aldous Huxley' },
  { title: 'The Sound and the Fury', author: 'William Faulkner' },
  { title: 'Catch-22', author: 'Joseph Heller' },
  { title: 'Darkness at Noon', author: 'Arthur Koestler' },
  { title: 'Sons and Lovers', author: 'D. H. Lawrence' },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { title: 'Under the Volcano', author: 'Malcolm Lowry' },
  { title: 'The Way of All Flesh', author: 'Samuel Butler' },
  { title: '1984', author: 'George Orwell' },
  { title: 'I, Claudius', author: 'Robert Graves' },
  { title: 'To the Lighthouse', author: 'Virginia Woolf' },
  { title: 'An American Tragedy', author: 'Theodore Dreiser' },
  { title: 'The Heart Is a Lonely Hunter', author: 'Carson McCullers' },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut' },
  { title: 'Invisible Man', author: 'Ralph Ellison' },
  { title: 'Native Son', author: 'Richard Wright' },
  { title: 'Henderson the Rain King', author: 'Saul Bellow' },
  { title: 'Appointment in Samarra', author: 'John O\'Hara' },
  { title: 'U.S.A.', author: 'John Dos Passos' },
  { title: 'Winesburg, Ohio', author: 'Sherwood Anderson' },
  { title: 'A Passage to India', author: 'E. M. Forster' },
  { title: 'The Wings of the Dove', author: 'Henry James' },
  { title: 'The Ambassadors', author: 'Henry James' },
  { title: 'Tender Is the Night', author: 'F. Scott Fitzgerald' },
  { title: 'The Studs Lonigan Trilogy', author: 'James T. Farrell' },
  { title: 'The Good Soldier', author: 'Ford Madox Ford' },
  { title: 'Animal Farm', author: 'George Orwell' },
  { title: 'The Golden Bowl', author: 'Henry James' },
  { title: 'Sister Carrie', author: 'Theodore Dreiser' },
  { title: 'A Handful of Dust', author: 'Evelyn Waugh' },
  { title: 'As I Lay Dying', author: 'William Faulkner' },
  { title: 'All the King\'s Men', author: 'Robert Penn Warren' },
  { title: 'The Bridge of San Luis Rey', author: 'Thornton Wilder' },
  { title: 'Howards End', author: 'E. M. Forster' },
  { title: 'Go Tell It on the Mountain', author: 'James Baldwin' },
  { title: 'The Heart of the Matter', author: 'Graham Greene' },
  { title: 'Lord of the Flies', author: 'William Golding' },
  { title: 'Deliverance', author: 'James Dickey' },
  { title: 'A Dance to the Music of Time', author: 'Anthony Powell' },
  { title: 'Point Counter Point', author: 'Aldous Huxley' },
  { title: 'The Sun Also Rises', author: 'Ernest Hemingway' },
  { title: 'The Secret Agent', author: 'Joseph Conrad' },
  { title: 'Nostromo', author: 'Joseph Conrad' },
  { title: 'The Rainbow', author: 'D. H. Lawrence' },
  { title: 'Women in Love', author: 'D. H. Lawrence' },
  { title: 'Tropic of Cancer', author: 'Henry Miller' },
  { title: 'The Naked and the Dead', author: 'Norman Mailer' },
  { title: 'Portnoy\'s Complaint', author: 'Philip Roth' },
  { title: 'Pale Fire', author: 'Vladimir Nabokov' },
  { title: 'Light in August', author: 'William Faulkner' },
  { title: 'On the Road', author: 'Jack Kerouac' },
  { title: 'The Maltese Falcon', author: 'Dashiell Hammett' },
  { title: 'Parade\'s End', author: 'Ford Madox Ford' },
  { title: 'The Age of Innocence', author: 'Edith Wharton' },
  { title: 'Zuleika Dobson', author: 'Max Beerbohm' },
  { title: 'The Moviegoer', author: 'Walker Percy' },
  { title: 'Death Comes for the Archbishop', author: 'Willa Cather' },
  { title: 'From Here to Eternity', author: 'James Jones' },
  { title: 'The Wapshot Chronicles', author: 'John Cheever' },
  { title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { title: 'A Clockwork Orange', author: 'Anthony Burgess' },
  { title: 'Of Human Bondage', author: 'W. Somerset Maugham' },
  { title: 'Heart of Darkness', author: 'Joseph Conrad' },
  { title: 'Main Street', author: 'Sinclair Lewis' },
  { title: 'The House of Mirth', author: 'Edith Wharton' },
  { title: 'The Alexandria Quartet', author: 'Lawrence Durrell' },
  { title: 'A High Wind in Jamaica', author: 'Richard Hughes' },
  { title: 'A House for Mr. Biswas', author: 'V. S. Naipaul' },
  { title: 'The Day of the Locust', author: 'Nathanael West' },
  { title: 'A Farewell to Arms', author: 'Ernest Hemingway' },
  { title: 'Scoop', author: 'Evelyn Waugh' },
  { title: 'The Prime of Miss Jean Brodie', author: 'Muriel Spark' },
  { title: 'Finnegans Wake', author: 'James Joyce' },
  { title: 'Kim', author: 'Rudyard Kipling' },
  { title: 'A Room with a View', author: 'E. M. Forster' },
  { title: 'Brideshead Revisited', author: 'Evelyn Waugh' },
  { title: 'The Adventures of Augie March', author: 'Saul Bellow' },
  { title: 'Angle of Repose', author: 'Wallace Stegner' },
  { title: 'A Bend in the River', author: 'V. S. Naipaul' },
  { title: 'The Death of the Heart', author: 'Elizabeth Bowen' },
  { title: 'Lord Jim', author: 'Joseph Conrad' },
  { title: 'Ragtime', author: 'E. L. Doctorow' },
  { title: 'The Old Wives\' Tale', author: 'Arnold Bennett' },
  { title: 'The Call of the Wild', author: 'Jack London' },
  { title: 'Loving', author: 'Henry Green' },
  { title: 'Midnight\'s Children', author: 'Salman Rushdie' },
  { title: 'Tobacco Road', author: 'Erskine Caldwell' },
  { title: 'Ironweed', author: 'William Kennedy' },
  { title: 'The Magus', author: 'John Fowles' },
  { title: 'Wide Sargasso Sea', author: 'Jean Rhys' },
  { title: 'Under the Net', author: 'Iris Murdoch' },
  { title: 'Sophie\'s Choice', author: 'William Styron' },
  { title: 'The Sheltering Sky', author: 'Paul Bowles' },
  { title: 'The Postman Always Rings Twice', author: 'James M. Cain' },
  { title: 'The Ginger Man', author: 'J. P. Donleavy' },
  { title: 'The Magnificent Ambersons', author: 'Booth Tarkington' },
]

// Time Magazine's All-Time 100 Novels (Complete list)
// Source: https://entertainment.time.com/2005/10/16/all-time-100-novels/
const TIME_100: BookData[] = [
  { title: 'The Adventures of Augie March', author: 'Saul Bellow' },
  { title: 'All the King\'s Men', author: 'Robert Penn Warren' },
  { title: 'American Pastoral', author: 'Philip Roth' },
  { title: 'An American Tragedy', author: 'Theodore Dreiser' },
  { title: 'Animal Farm', author: 'George Orwell' },
  { title: 'Appointment in Samarra', author: 'John O\'Hara' },
  { title: 'Are You There God? It\'s Me, Margaret', author: 'Judy Blume' },
  { title: 'The Assistant', author: 'Bernard Malamud' },
  { title: 'At Swim-Two-Birds', author: 'Flann O\'Brien' },
  { title: 'Atonement', author: 'Ian McEwan' },
  { title: 'Beloved', author: 'Toni Morrison' },
  { title: 'The Berlin Stories', author: 'Christopher Isherwood' },
  { title: 'The Big Sleep', author: 'Raymond Chandler' },
  { title: 'The Blind Assassin', author: 'Margaret Atwood' },
  { title: 'Blood Meridian', author: 'Cormac McCarthy' },
  { title: 'Brideshead Revisited', author: 'Evelyn Waugh' },
  { title: 'The Bridge of San Luis Rey', author: 'Thornton Wilder' },
  { title: 'Call It Sleep', author: 'Henry Roth' },
  { title: 'Catch-22', author: 'Joseph Heller' },
  { title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { title: 'A Clockwork Orange', author: 'Anthony Burgess' },
  { title: 'The Confessions of Nat Turner', author: 'William Styron' },
  { title: 'The Corrections', author: 'Jonathan Franzen' },
  { title: 'The Crying of Lot 49', author: 'Thomas Pynchon' },
  { title: 'A Dance to the Music of Time', author: 'Anthony Powell' },
  { title: 'The Day of the Locust', author: 'Nathanael West' },
  { title: 'Death Comes for the Archbishop', author: 'Willa Cather' },
  { title: 'A Death in the Family', author: 'James Agee' },
  { title: 'The Death of the Heart', author: 'Elizabeth Bowen' },
  { title: 'Deliverance', author: 'James Dickey' },
  { title: 'Dog Soldiers', author: 'Robert Stone' },
  { title: 'Falconer', author: 'John Cheever' },
  { title: 'The French Lieutenant\'s Woman', author: 'John Fowles' },
  { title: 'The Golden Notebook', author: 'Doris Lessing' },
  { title: 'Go Tell It on the Mountain', author: 'James Baldwin' },
  { title: 'Gone with the Wind', author: 'Margaret Mitchell' },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { title: 'Gravity\'s Rainbow', author: 'Thomas Pynchon' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { title: 'A Handful of Dust', author: 'Evelyn Waugh' },
  { title: 'The Heart Is a Lonely Hunter', author: 'Carson McCullers' },
  { title: 'The Heart of the Matter', author: 'Graham Greene' },
  { title: 'Herzog', author: 'Saul Bellow' },
  { title: 'Housekeeping', author: 'Marilynne Robinson' },
  { title: 'A House for Mr. Biswas', author: 'V. S. Naipaul' },
  { title: 'I, Claudius', author: 'Robert Graves' },
  { title: 'Infinite Jest', author: 'David Foster Wallace' },
  { title: 'Invisible Man', author: 'Ralph Ellison' },
  { title: 'Light in August', author: 'William Faulkner' },
  { title: 'The Lion, the Witch and the Wardrobe', author: 'C. S. Lewis' },
  { title: 'Lolita', author: 'Vladimir Nabokov' },
  { title: 'Lord of the Flies', author: 'William Golding' },
  { title: 'The Lord of the Rings', author: 'J. R. R. Tolkien' },
  { title: 'Loving', author: 'Henry Green' },
  { title: 'Lucky Jim', author: 'Kingsley Amis' },
  { title: 'The Man Who Loved Children', author: 'Christina Stead' },
  { title: 'Midnight\'s Children', author: 'Salman Rushdie' },
  { title: 'Money', author: 'Martin Amis' },
  { title: 'The Moviegoer', author: 'Walker Percy' },
  { title: 'Mrs. Dalloway', author: 'Virginia Woolf' },
  { title: 'Naked Lunch', author: 'William S. Burroughs' },
  { title: 'Native Son', author: 'Richard Wright' },
  { title: 'Neuromancer', author: 'William Gibson' },
  { title: 'Never Let Me Go', author: 'Kazuo Ishiguro' },
  { title: '1984', author: 'George Orwell' },
  { title: 'On the Road', author: 'Jack Kerouac' },
  { title: 'One Flew Over the Cuckoo\'s Nest', author: 'Ken Kesey' },
  { title: 'The Painted Bird', author: 'Jerzy Kosinski' },
  { title: 'Pale Fire', author: 'Vladimir Nabokov' },
  { title: 'A Passage to India', author: 'E. M. Forster' },
  { title: 'Play It as It Lays', author: 'Joan Didion' },
  { title: 'Portnoy\'s Complaint', author: 'Philip Roth' },
  { title: 'Possession', author: 'A. S. Byatt' },
  { title: 'The Power and the Glory', author: 'Graham Greene' },
  { title: 'The Prime of Miss Jean Brodie', author: 'Muriel Spark' },
  { title: 'Rabbit, Run', author: 'John Updike' },
  { title: 'Ragtime', author: 'E. L. Doctorow' },
  { title: 'The Recognitions', author: 'William Gaddis' },
  { title: 'Red Harvest', author: 'Dashiell Hammett' },
  { title: 'Revolutionary Road', author: 'Richard Yates' },
  { title: 'The Sheltering Sky', author: 'Paul Bowles' },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut' },
  { title: 'Snow Crash', author: 'Neal Stephenson' },
  { title: 'The Sot-Weed Factor', author: 'John Barth' },
  { title: 'The Sound and the Fury', author: 'William Faulkner' },
  { title: 'The Sportswriter', author: 'Richard Ford' },
  { title: 'The Spy Who Came in from the Cold', author: 'John le Carré' },
  { title: 'The Sun Also Rises', author: 'Ernest Hemingway' },
  { title: 'Their Eyes Were Watching God', author: 'Zora Neale Hurston' },
  { title: 'Things Fall Apart', author: 'Chinua Achebe' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { title: 'To the Lighthouse', author: 'Virginia Woolf' },
  { title: 'Tropic of Cancer', author: 'Henry Miller' },
  { title: 'Ubik', author: 'Philip K. Dick' },
  { title: 'Under the Net', author: 'Iris Murdoch' },
  { title: 'Under the Volcano', author: 'Malcolm Lowry' },
  { title: 'Watchmen', author: 'Alan Moore' },
  { title: 'White Noise', author: 'Don DeLillo' },
  { title: 'White Teeth', author: 'Zadie Smith' },
  { title: 'Wide Sargasso Sea', author: 'Jean Rhys' },
  { title: 'Zuleika Dobson', author: 'Max Beerbohm' },
]

// BBC's The Big Read Top 100 (Complete list)
// Source: https://www.bbc.co.uk/arts/bigread/
const BBC_BIG_READ: BookData[] = [
  { title: 'The Lord of the Rings', author: 'J. R. R. Tolkien' },
  { title: 'Pride and Prejudice', author: 'Jane Austen' },
  { title: 'His Dark Materials', author: 'Philip Pullman' },
  { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams' },
  { title: 'Harry Potter and the Goblet of Fire', author: 'J. K. Rowling' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { title: 'Winnie the Pooh', author: 'A. A. Milne' },
  { title: '1984', author: 'George Orwell' },
  { title: 'The Lion, the Witch and the Wardrobe', author: 'C. S. Lewis' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë' },
  { title: 'Catch-22', author: 'Joseph Heller' },
  { title: 'Wuthering Heights', author: 'Emily Brontë' },
  { title: 'Birdsong', author: 'Sebastian Faulks' },
  { title: 'Rebecca', author: 'Daphne du Maurier' },
  { title: 'The Catcher in the Rye', author: 'J. D. Salinger' },
  { title: 'The Wind in the Willows', author: 'Kenneth Grahame' },
  { title: 'Great Expectations', author: 'Charles Dickens' },
  { title: 'Little Women', author: 'Louisa May Alcott' },
  { title: 'Captain Corelli\'s Mandolin', author: 'Louis de Bernières' },
  { title: 'War and Peace', author: 'Leo Tolstoy' },
  { title: 'Gone with the Wind', author: 'Margaret Mitchell' },
  { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J. K. Rowling' },
  { title: 'Harry Potter and the Chamber of Secrets', author: 'J. K. Rowling' },
  { title: 'Harry Potter and the Prisoner of Azkaban', author: 'J. K. Rowling' },
  { title: 'The Hobbit', author: 'J. R. R. Tolkien' },
  { title: 'Tess of the d\'Urbervilles', author: 'Thomas Hardy' },
  { title: 'Middlemarch', author: 'George Eliot' },
  { title: 'A Prayer for Owen Meany', author: 'John Irving' },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck' },
  { title: 'Alice\'s Adventures in Wonderland', author: 'Lewis Carroll' },
  { title: 'The Story of Tracy Beaker', author: 'Jacqueline Wilson' },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez' },
  { title: 'The Pillars of the Earth', author: 'Ken Follett' },
  { title: 'David Copperfield', author: 'Charles Dickens' },
  { title: 'Charlie and the Chocolate Factory', author: 'Roald Dahl' },
  { title: 'Treasure Island', author: 'Robert Louis Stevenson' },
  { title: 'A Town Like Alice', author: 'Nevil Shute' },
  { title: 'Persuasion', author: 'Jane Austen' },
  { title: 'Dune', author: 'Frank Herbert' },
  { title: 'Emma', author: 'Jane Austen' },
  { title: 'Anne of Green Gables', author: 'L. M. Montgomery' },
  { title: 'Watership Down', author: 'Richard Adams' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas' },
  { title: 'Brideshead Revisited', author: 'Evelyn Waugh' },
  { title: 'Animal Farm', author: 'George Orwell' },
  { title: 'A Christmas Carol', author: 'Charles Dickens' },
  { title: 'Far from the Madding Crowd', author: 'Thomas Hardy' },
  { title: 'Goodnight Mister Tom', author: 'Michelle Magorian' },
  { title: 'The Shell Seekers', author: 'Rosamunde Pilcher' },
  { title: 'The Secret Garden', author: 'Frances Hodgson Burnett' },
  { title: 'Of Mice and Men', author: 'John Steinbeck' },
  { title: 'The Stand', author: 'Stephen King' },
  { title: 'Anna Karenina', author: 'Leo Tolstoy' },
  { title: 'A Suitable Boy', author: 'Vikram Seth' },
  { title: 'The BFG', author: 'Roald Dahl' },
  { title: 'Swallows and Amazons', author: 'Arthur Ransome' },
  { title: 'Black Beauty', author: 'Anna Sewell' },
  { title: 'Artemis Fowl', author: 'Eoin Colfer' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky' },
  { title: 'Noughts & Crosses', author: 'Malorie Blackman' },
  { title: 'Memoirs of a Geisha', author: 'Arthur Golden' },
  { title: 'A Tale of Two Cities', author: 'Charles Dickens' },
  { title: 'The Thorn Birds', author: 'Colleen McCullough' },
  { title: 'Mort', author: 'Terry Pratchett' },
  { title: 'The Magic Faraway Tree', author: 'Enid Blyton' },
  { title: 'The Magus', author: 'John Fowles' },
  { title: 'Good Omens', author: 'Terry Pratchett' },
  { title: 'Guards! Guards!', author: 'Terry Pratchett' },
  { title: 'Lord of the Flies', author: 'William Golding' },
  { title: 'Perfume', author: 'Patrick Süskind' },
  { title: 'The Ragged Trousered Philanthropists', author: 'Robert Tressell' },
  { title: 'Night Watch', author: 'Terry Pratchett' },
  { title: 'Matilda', author: 'Roald Dahl' },
  { title: 'Bridget Jones\'s Diary', author: 'Helen Fielding' },
  { title: 'The Secret History', author: 'Donna Tartt' },
  { title: 'The Woman in White', author: 'Wilkie Collins' },
  { title: 'Ulysses', author: 'James Joyce' },
  { title: 'Bleak House', author: 'Charles Dickens' },
  { title: 'Double Act', author: 'Jacqueline Wilson' },
  { title: 'The Twits', author: 'Roald Dahl' },
  { title: 'I Capture the Castle', author: 'Dodie Smith' },
  { title: 'Holes', author: 'Louis Sachar' },
  { title: 'Gormenghast', author: 'Mervyn Peake' },
  { title: 'The God of Small Things', author: 'Arundhati Roy' },
  { title: 'Vicky Angel', author: 'Jacqueline Wilson' },
  { title: 'Brave New World', author: 'Aldous Huxley' },
  { title: 'Cold Comfort Farm', author: 'Stella Gibbons' },
  { title: 'Magician', author: 'Raymond E. Feist' },
  { title: 'On the Road', author: 'Jack Kerouac' },
  { title: 'The Godfather', author: 'Mario Puzo' },
  { title: 'The Clan of the Cave Bear', author: 'Jean M. Auel' },
  { title: 'The Colour of Magic', author: 'Terry Pratchett' },
  { title: 'The Alchemist', author: 'Paulo Coelho' },
  { title: 'Katherine', author: 'Anya Seton' },
  { title: 'Kane and Abel', author: 'Jeffrey Archer' },
  { title: 'Love in the Time of Cholera', author: 'Gabriel García Márquez' },
  { title: 'Girls in Love', author: 'Jacqueline Wilson' },
  { title: 'The Princess Diaries', author: 'Meg Cabot' },
  { title: 'Midnight\'s Children', author: 'Salman Rushdie' },
  { title: 'Three Men in a Boat', author: 'Jerome K. Jerome' },
  { title: 'Small Gods', author: 'Terry Pratchett' },
  { title: 'The Beach', author: 'Alex Garland' },
  { title: 'The Dracula', author: 'Bram Stoker' },
  { title: 'Point Blanc', author: 'Anthony Horowitz' },
  { title: 'The Pickwick Papers', author: 'Charles Dickens' },
  { title: 'Stormbreaker', author: 'Anthony Horowitz' },
  { title: 'The Wasp Factory', author: 'Iain Banks' },
  { title: 'The Day of the Triffids', author: 'John Wyndham' },
  { title: 'Tales of the City', author: 'Armistead Maupin' },
  { title: 'The Moonstone', author: 'Wilkie Collins' },
  { title: 'The Thirty-Nine Steps', author: 'John Buchan' },
  { title: 'The Outsider', author: 'Albert Camus' },
  { title: 'The Weirdstone of Brisingamen', author: 'Alan Garner' },
  { title: 'The Witches', author: 'Roald Dahl' },
  { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
  { title: 'Shogun', author: 'James Clavell' },
  { title: 'The Day of the Jackal', author: 'Frederick Forsyth' },
  { title: 'The Voyage of the Dawn Treader', author: 'C. S. Lewis' },
  { title: 'Mansfield Park', author: 'Jane Austen' },
  { title: 'The Pillars of the Earth', author: 'Ken Follett' },
  { title: 'The Adventures of Tom Sawyer', author: 'Mark Twain' },
  { title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain' },
]

const COLLECTIONS = [
  {
    name: 'Modern Library 100 Best Novels',
    description: 'The Modern Library\'s list of the 100 best English-language novels of the 20th century, selected by the Modern Library editorial board. Complete list of all 100 novels.',
    sourceUrl: 'https://www.modernlibrary.com/top-100/100-best-novels/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'Modern Library', '20th Century', 'Literature'],
    books: MODERN_LIBRARY_100.map((book, i) => ({
      ...book,
      notes: `Modern Library 100 Best Novels #${i + 1}`,
    })),
  },
  {
    name: 'Time Magazine\'s All-Time 100 Novels',
    description: 'Time Magazine\'s list of the 100 best English-language novels published since 1923 (when Time was first published). Complete list of all 100 novels.',
    sourceUrl: 'https://entertainment.time.com/2005/10/16/all-time-100-novels/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'Time Magazine', 'Best Novels', 'Literature'],
    books: TIME_100.map((book, i) => ({
      ...book,
      notes: `Time Magazine All-Time 100 Novels #${i + 1}`,
    })),
  },
  {
    name: 'BBC\'s The Big Read Top 100',
    description: 'The Big Read was a survey conducted by the BBC in 2003 to determine the UK\'s best-loved novel. Over 750,000 votes were cast. Complete list of all 100 novels.',
    sourceUrl: 'https://www.bbc.co.uk/arts/bigread/',
    category: 'Books',
    tags: ['Books', 'Fiction', 'Classics', 'BBC Big Read', 'UK', 'Popular Vote'],
    books: BBC_BIG_READ.map((book, i) => ({
      ...book,
      notes: `BBC Big Read Top 100 #${i + 1}`,
    })),
  },
]

async function main() {
  console.log('🌱 Starting classic book collections seeding...')
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
    console.log('🎉 All classic collections completed!')
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)

