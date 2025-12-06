'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  const router = useRouter()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const faqItems = [
    {
      question: "How do I create a collection?",
      answer: "Click the \"Create Collection\" button on the main page. Give your collection a name, choose a category, and optionally add a description, cover image, and tags. You can also select a template (like Comic Book, Trading Card, Film, etc.) to get pre-configured fields."
    },
    {
      question: "How do I add items to my collection?",
      answer: "You can add items individually by clicking the \"Add Item\" button, or use the \"Bulk Import\" feature to add multiple items at once. Bulk Import supports numbered series (e.g., \"LTB #1\" to \"LTB #550\"), CSV files, or manual list pasting."
    },
    {
      question: "What are recommended collections?",
      answer: "Recommended collections are curated collections created by admins, such as \"Academy Award Best Picture Winners\" or \"Studio Ghibli Collection\". You can browse them and add them to your account with one click. If the collection is updated by admins, you can sync those updates to your copy."
    },
    {
      question: "What are community collections?",
      answer: "Community collections are collections created by other users that they've made public. You can browse, search, and filter through thousands of community collections. If you find one you like, you can add it to your account."
    },
    {
      question: "How do I mark items as owned?",
      answer: "Click the checkbox next to an item to mark it as owned. You can also select multiple items and use the bulk actions menu to mark them all at once. The progress bar at the top of each collection shows how many items you own."
    },
    {
      question: "Can I customize the appearance?",
      answer: "Yes! You can change your accent color in the settings, which affects buttons, links, and other UI elements. You can also customize your profile with a bio, banner image, and theme settings."
    },
    {
      question: "What templates are available?",
      answer: "We offer templates for Comic Books, Trading Cards, Books, Video Games, Films/Blu-rays, and more. Each template comes with relevant fields pre-configured. You can also use the \"Custom\" template to define your own fields."
    },
    {
      question: "How do I share my collections?",
      answer: "You can make your collections public and share them with others. Use the share button on a collection to get a shareable link. You can also publish collections to the community for others to discover."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, your data is stored securely in our database. By default, your collections are private and only visible to you. You control what you share publicly. We use industry-standard security practices to protect your information."
    },
    {
      question: "Can I export my collections?",
      answer: "Yes! You can export your collections as CSV files. Use the export button on the collections page to download your data. This is useful for backups or importing into other systems."
    },
    {
      question: "How do I organize my collections?",
      answer: "You can organize collections using folders. Create folders to group related collections together. You can also use tags to categorize and filter your collections. Drag and drop collections in the sidebar to reorder them."
    },
    {
      question: "How do I reset my password?",
      answer: "Click \"Forgot Password\" on the sign-in page. Enter your email address and you'll receive a password reset link. Click the link in the email to set a new password."
    }
  ]

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Info className="h-8 w-8 text-[#fafafa]" />
              <h1 className="text-5xl font-semibold text-[#fafafa] tracking-tight">About Sammlerei</h1>
            </div>
            <p className="text-[#969696] text-lg mb-10">
              Learn more about this collection management platform
            </p>
          </div>

          <div className="max-w-4xl space-y-6">
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">What is Sammlerei?</CardTitle>
                <CardDescription className="text-[#969696]">
                  A modern platform for managing your collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#969696]">
                <p>
                  Sammlerei is a comprehensive collection management platform designed to help you track, organize, and manage your various collections. Whether you collect comics, books, movies, games, or any other items, Sammlerei provides the tools you need to stay organized.
                </p>
                <p>
                  With features like progress tracking, tagging, recommended collections, and more, Sammlerei makes it easy to keep track of what you have and what you're still looking for.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Features</CardTitle>
                <CardDescription className="text-[#969696]">
                  What you can do with Sammlerei
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-[#969696]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Create Collections:</strong> Organize your items into custom collections with tags, descriptions, and cover images</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Track Progress:</strong> Mark items as owned and see your collection progress with visual progress bars</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Recommended Collections:</strong> Discover curated collections recommended by admins and add them to your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Auto-Updates:</strong> Get notified when recommended collections are updated and sync changes to your collections</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Customizable:</strong> Personalize your experience with accent colors and display preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent-color)] mt-1">•</span>
                    <span><strong className="text-[#fafafa]">Bulk Import:</strong> Quickly add multiple items using numbered series, CSV, or manual lists</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[var(--accent-color)]" />
                  <CardTitle className="text-[#fafafa]">Frequently Asked Questions</CardTitle>
                </div>
                <CardDescription className="text-[#969696]">
                  Common questions about Sammlerei
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  {faqItems.map((faq, index) => {
                    const isOpen = openFaqIndex === index
                    return (
                      <div
                        key={index}
                        className="border border-[#2a2d35] rounded-lg overflow-hidden bg-[#0f1114] hover:border-[#353842] transition-colors"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1a1d24] transition-colors"
                        >
                          <h3 className="text-[#fafafa] font-semibold pr-6 text-base">{faq.question}</h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-[var(--accent-color)] flex-shrink-0 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#969696] flex-shrink-0 transition-transform duration-200" />
                          )}
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-5 pb-5 pt-2">
                            <p className="text-[#969696] text-sm leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">About the Developer</CardTitle>
                <CardDescription className="text-[#969696]">
                  The story behind Sammlerei
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#969696]">
                <p>
                  Hi! I'm <strong className="text-[#fafafa]">Nico "Henske"</strong>, the creator of Sammlerei. As a comic book collector myself, I found it challenging to track my collection progress effectively. Existing solutions either lacked the features I needed or had clunky interfaces that made managing large collections a chore.
                </p>
                <p>
                  That's why I built Sammlerei - a modern, intuitive platform designed by a collector, for collectors. Whether you're tracking comics, trading cards, books, films, or any other collectibles, Sammlerei provides the tools you need to stay organized and see your progress at a glance.
                </p>
                <p className="text-sm italic border-t border-[#2a2d35] pt-4">
                  <strong className="text-[#fafafa]">Development Note:</strong> This platform was developed with the assistance of AI tools for certain coding tasks, including code generation, debugging, and optimization. All design decisions, feature planning, and final implementation were made by the developer.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Technology</CardTitle>
                <CardDescription className="text-[#969696]">
                  Built with modern web technologies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-[#969696]">
                <p>
                  Sammlerei is built using Next.js 14, React, TypeScript, Prisma, and SQLite. The platform features a modern, responsive design with a dark theme optimized for extended use.
                </p>
                <p>
                  Your data is stored securely and locally, giving you full control over your collections and privacy.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Data Sources & Attribution</CardTitle>
                <CardDescription className="text-[#969696]">
                  APIs and services we use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-[#0f1114] rounded-lg border border-[#2a2d35]">
                  <div className="flex-shrink-0">
                    <img 
                      src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692cc94f794c356c81506d9bfc7d01065f5a8c1370c85545e2.svg" 
                      alt="TMDb Logo" 
                      className="h-8 w-auto"
                    />
                  </div>
                  <div className="flex-1 text-[#969696] text-sm">
                    <p className="mb-2">
                      <strong className="text-[#fafafa]">The Movie Database (TMDb)</strong> - Movie data and poster images for film collections are provided by TMDb.
                    </p>
                    <p className="text-xs italic">
                      This product uses the TMDb API but is not endorsed or certified by TMDb.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}



