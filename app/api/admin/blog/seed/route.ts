import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

const initialPosts = [
  {
    title: 'Why I Finally Started Tracking My Collection (And You Should Too)',
    slug: 'why-i-finally-started-tracking-my-collection',
    excerpt: 'After years of losing track of what I owned and buying duplicates, I finally caved and started organizing my collection. Here\'s what changed.',
    content: `<p>So I'll be honest with you – I've been collecting comics for over a decade, and for the longest time, I thought I could keep track of everything in my head. "I know what I have," I'd tell myself. Famous last words, right?</p>

<p>It all came crashing down last year when I bought the same issue of Amazing Spider-Man #300 <em>three times</em>. Not because I'm rich (I'm definitely not), but because I genuinely couldn't remember if I already owned it. That's when I realized my "mental catalog" was completely useless.</p>

<h2>The Breaking Point</h2>

<p>My collection isn't huge by some standards – maybe 500-600 comics, a couple hundred books, and a growing stack of trading cards. But here's the thing: when you're browsing at a convention or scrolling through eBay at 2 AM, you need to know <em>right now</em> if you already have that issue.</p>

<p>I tried spreadsheets. I really did. But updating a spreadsheet every time I bought something? That lasted about two weeks. Then I'd forget for months, and by the time I remembered, I had no idea what I'd added.</p>

<h2>What Actually Works</h2>

<p>I finally bit the bullet and started using a proper collection tracker. And honestly? It's been a game changer. Now when I'm at my local comic shop, I can pull out my phone, check if I have that issue, and make an informed decision. No more guessing. No more duplicates.</p>

<p>But here's what surprised me – it's not just about avoiding duplicate purchases. I've rediscovered stuff I forgot I even owned. That first edition of Watchmen I picked up years ago? Yeah, I had completely forgotten about it. Now it's front and center in my collection.</p>

<h2>The Real Benefits</h2>

<p>Beyond the obvious (knowing what you own), tracking your collection helps you see patterns. I realized I was buying way too many variant covers and not enough actual story content. Now I'm more intentional about what I add.</p>

<p>Plus, there's something satisfying about seeing your progress. That progress bar showing "247 of 500 issues owned" hits different than just having a vague sense that you're "almost done" with a series.</p>

<p>If you're on the fence about starting to track your collection, just do it. Start small – maybe just your favorite series. You'll thank yourself later when you're standing in a shop wondering if you need that issue.</p>

<p>Trust me, I've been there.</p>`,
    category: 'Getting Started',
    tags: ['collection management', 'organization', 'tips', 'getting started'],
  },
  {
    title: 'The Comic Book Collector\'s Dilemma: Variants, First Prints, and That One Issue You\'ll Never Find',
    slug: 'comic-book-collectors-dilemma-variants-first-prints',
    excerpt: 'Navigating the wild world of variant covers, first printings, and the eternal hunt for that one issue that always seems to slip away.',
    content: `<p>Let's talk about something every comic collector deals with: the variant cover rabbit hole. You know the one. You're browsing your pull list, minding your own business, when suddenly you see it – a variant cover that's absolutely stunning. But it's $50. For a book that came out last week.</p>

<p>Do you buy it? Do you stick with the regular cover? What if there's a second printing? These are the questions that keep me up at night.</p>

<h2>The Variant Problem</h2>

<p>I'm not gonna lie – I have a problem with variant covers. Not a financial problem (though my wallet might disagree), but a decision-making problem. When there are five different covers for the same issue, how do you choose?</p>

<p>My rule used to be: buy the one that looks coolest. Simple, right? Wrong. Because then I'd see someone else's collection with a different variant, and I'd start second-guessing myself. "Maybe I should have gotten the sketch variant instead..."</p>

<p>Now I track everything. If I buy a variant, it goes in the system. If I see a cooler one later, I can make an informed decision about whether to upgrade or just appreciate what I have.</p>

<h2>First Prints vs. Everything Else</h2>

<p>Here's where it gets tricky. Some collectors care deeply about first printings. Others don't. I'm somewhere in the middle – I want first prints for key issues (first appearances, major events), but I'm not going to lose sleep over a random filler issue.</p>

<p>The problem? You can't always tell at a glance. That's where tracking comes in handy. I mark which issues are first prints, which are reprints, and which ones I honestly don't care about. It's my collection, my rules.</p>

<h2>The One That Got Away</h2>

<p>We all have that one issue. The one we've been hunting for years. Mine is Amazing Spider-Man #129 (first appearance of the Punisher). I've seen it at conventions, I've seen it online, but the price is always just a bit too high, or the condition isn't quite right.</p>

<p>But here's the thing – I'm tracking it. It's on my wishlist. I know exactly what I'm looking for, what condition I want, and what price I'm willing to pay. When the right copy comes along, I'll know it.</p>

<p>That's the real power of tracking your collection. It's not just about what you have – it's about what you're looking for, what you're willing to spend, and what actually matters to you.</p>

<h2>My Advice</h2>

<p>Don't let the variant cover madness consume you. Set your own rules. Track what matters to you. And remember – at the end of the day, it's your collection. Whether you have every variant or just the covers you like, that's what makes it yours.</p>

<p>Now if you'll excuse me, I need to go check if that new variant cover is still available...</p>`,
    category: 'Tips',
    tags: ['comics', 'variants', 'collecting', 'tips'],
  },
  {
    title: 'The Joy of Rediscovering Your Own Collection',
    slug: 'joy-of-rediscovering-your-own-collection',
    excerpt: 'Sometimes the best part of organizing your collection isn\'t adding new items – it\'s finding gems you forgot you even owned.',
    content: `<p>Last weekend, I finally sat down to organize my book collection. I'd been putting it off for months, mostly because the thought of going through hundreds of books sounded exhausting. But I had a free afternoon, so I figured why not?</p>

<p>What I didn't expect was to find books I completely forgot I owned. That copy of Dune I bought in college but never read? Still there. That signed first edition I picked up at a convention years ago? Yep, still sitting on the shelf.</p>

<h2>The Hidden Treasures</h2>

<p>I think we all do this – we buy something, put it away, and then forget about it. Life gets busy. New things come in. Old things get buried. But when you actually go through your collection and catalog everything, you start to see what you really have.</p>

<p>I found a first edition of The Name of the Wind that I'd completely forgotten about. I remember buying it, but then it got mixed in with my regular books, and I just... forgot. Now it's properly cataloged, and I'm actually excited to read it again.</p>

<h2>Why We Forget</h2>

<p>I think part of it is that we buy things faster than we can appreciate them. At least, that's my problem. I'll see something cool, buy it, and then immediately move on to the next thing. Before I know it, I have a stack of stuff I haven't even looked at yet.</p>

<p>But when you're forced to go through everything – when you're entering each item into your tracker – you have to actually look at what you own. You have to remember why you bought it. You have to appreciate it again.</p>

<h2>The Realization</h2>

<p>Going through my collection made me realize something: I have way more cool stuff than I thought. I'm not just some guy with a bunch of books and comics. I'm a collector with a curated collection of things I actually care about.</p>

<p>And that's pretty cool.</p>

<h2>Making It a Habit</h2>

<p>Now I try to add new items to my tracker as soon as I get them. Not because I'm super organized (I'm definitely not), but because I want to actually appreciate what I'm buying. Taking that extra minute to catalog it forces me to slow down and actually look at what I just acquired.</p>

<p>Plus, it's way easier to add one item at a time than to try to remember everything you've bought in the last six months. Trust me, I've tried both ways.</p>

<h2>Your Turn</h2>

<p>If you haven't gone through your collection in a while, do it. Seriously. Set aside an afternoon, put on some music, and just go through what you own. You'll probably find stuff you forgot about. You'll probably remember why you started collecting in the first place.</p>

<p>And who knows? Maybe you'll find that one thing you've been looking for, sitting right there on your shelf the whole time.</p>

<p>I know I did.</p>`,
    category: 'Stories',
    tags: ['collecting', 'organization', 'rediscovery', 'personal'],
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

    const created = []
    const skipped = []

    for (const post of initialPosts) {
      // Check if post already exists
      const existing = await prisma.blogPost.findUnique({
        where: { slug: post.slug },
      })

      if (existing) {
        skipped.push(post.slug)
        continue
      }

      const newPost = await prisma.blogPost.create({
        data: {
          ...post,
          authorId: session.user.id,
          published: true,
          publishedAt: new Date(),
        },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      created.push(newPost.slug)
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      message: `Created ${created.length} posts, skipped ${skipped.length} existing posts`,
    })
  } catch (error) {
    console.error('Error seeding blog posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

