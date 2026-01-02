import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, HelpCircle, BookOpen, Users, Star, BarChart3, Upload, Search, Settings, Shield } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Help & FAQ - Colletro',
  description: 'Frequently asked questions and help for Colletro collection management platform',
}

const faqs = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    questions: [
      {
        q: 'How do I create my first collection?',
        a: 'Click the "Create Collection" button on the main page. Give it a name, choose a category, and optionally add a description and cover image. You can also select a template that matches your collection type (comic book, trading card, book, or custom).',
      },
      {
        q: 'What are templates?',
        a: 'Templates help you organize your collection with relevant fields. For example, the trading card template includes fields for set, card number, rarity, and player. You can also create custom templates with your own fields.',
      },
      {
        q: 'How do I add items to a collection?',
        a: 'Open your collection and click "Add Item". Enter the item name and any additional information. You can also upload an image for the item.',
      },
    ],
  },
  {
    category: 'Collections',
    icon: Users,
    questions: [
      {
        q: 'What is the difference between my collections and community collections?',
        a: 'Your collections are private to you (unless you share them). Community collections are public collections created by other users that you can browse, add to your own collections, or vote on.',
      },
      {
        q: 'How do I share my collection?',
        a: 'In your collection, click the share button to generate a shareable link. You can also make your collection public or share it to the community.',
      },
      {
        q: 'What are recommended collections?',
        a: 'Recommended collections are curated collections created by administrators. These are great starting points for new collectors and often include complete sets or popular collections.',
      },
    ],
  },
  {
    category: 'Features',
    icon: Star,
    questions: [
      {
        q: 'How does the progress tracking work?',
        a: 'The progress bar shows how many items in your collection you\'ve marked as "owned". It calculates the percentage based on owned items vs total items.',
      },
      {
        q: 'Can I import items from a CSV file?',
        a: 'Yes! Use the "Import Items" button in your collection. You can upload a CSV file and map the columns to your collection fields. The system supports various delimiters and formats.',
      },
      {
        q: 'How do I organize collections with folders?',
        a: 'Create folders from the sidebar or main page. You can then move collections into folders to keep them organized. Folders help you group related collections together.',
      },
      {
        q: 'What are tags?',
        a: 'Tags help you categorize and filter your collections. You can add multiple tags to a collection and use them to quickly find collections by type, theme, or any other category.',
      },
    ],
  },
  {
    category: 'Account & Settings',
    icon: Settings,
    questions: [
      {
        q: 'How do I change my password?',
        a: 'If you forgot your password, use the "Forgot Password" link on the sign-in page. If you know your password, you can change it in your profile settings.',
      },
      {
        q: 'Can I customize my profile?',
        a: 'Yes! Go to your profile page to add a bio, upload a banner image, customize your theme (background, card style, font size), and choose a badge.',
      },
      {
        q: 'How do I make my profile private?',
        a: 'In your profile settings, toggle the "Privacy Settings" option. This will hide your profile from leaderboards and public profile views.',
      },
      {
        q: 'What are achievements and badges?',
        a: 'Achievements are milestones you unlock as you use Colletro (e.g., creating your first collection, adding 100 items). Badges are visual indicators you can display next to your name.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: Shield,
    questions: [
      {
        q: 'My images are not uploading. What should I do?',
        a: 'Check that your image file is under 10MB and in a supported format (JPG, PNG, WebP). Make sure you have a stable internet connection. If problems persist, try a different image.',
      },
      {
        q: 'I can\'t see my collections. Where are they?',
        a: 'Check if you\'re on the correct page (My Collections). Also check if you have any filters applied. Try refreshing the page or clearing your browser cache.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact us through the support channels. We\'ll help you delete your account and all associated data in accordance with GDPR requirements.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="mb-8">
            <Link href="/">
              <Button
                variant="ghost"
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="h-8 w-8 text-[var(--accent-color)]" />
              <h1 className="text-4xl font-semibold text-[#fafafa]">Help & FAQ</h1>
            </div>
            <p className="text-[#969696] text-lg">
              Find answers to common questions and learn how to use Colletro
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <div key={categoryIndex} className="bg-[#1a1d24] border border-[#2a2d35] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="h-6 w-6 text-[var(--accent-color)]" />
                    <h2 className="text-2xl font-semibold text-[#fafafa]">{category.category}</h2>
                  </div>
                  <div className="space-y-6">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-l-2 border-[var(--accent-color)] pl-4">
                        <h3 className="text-lg font-semibold text-[#fafafa] mb-2">{faq.q}</h3>
                        <p className="text-[#969696] leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 p-6 bg-[#1a1d24] border border-[#2a2d35] rounded-lg">
            <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Still need help?</h2>
            <p className="text-[#969696] mb-4">
              If you can't find the answer you're looking for, please contact us through the contact information provided in your account settings or on our website.
            </p>
            <div className="flex gap-4">
              <Link href="/terms">
                <Button variant="outline" className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="outline" className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition">
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

