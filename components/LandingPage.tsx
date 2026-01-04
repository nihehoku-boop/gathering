'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Users, Star, BarChart3, Sparkles, Check } from 'lucide-react'
import LogoIcon from './LogoIcon'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleGetStarted = () => {
    if (session) {
      router.push('/')
    } else {
      router.push('/auth/signin')
    }
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Build Your Trove',
      description: 'Create and manage multiple collections with ease. Track what you have and what you\'re looking for.',
    },
    {
      icon: Users,
      title: 'Community Collections',
      description: 'Discover collections shared by the community. Find inspiration and add them to your trove.',
    },
    {
      icon: Star,
      title: 'Recommended Collections',
      description: 'Get curated collections recommended by experts. Perfect starting points to grow your trove.',
    },
    {
      icon: BarChart3,
      title: 'Watch Your Trove Grow',
      description: 'Visual progress bars show your collection completion. See how close you are to completing each collection.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f1114] text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--accent-color)]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon width={32} height={32} className="h-8 w-8" />
            <span className="text-2xl font-bold text-[#fafafa] tracking-tighter">Colletro</span>
          </div>
          <div className="flex items-center gap-4">
            {!session && (
              <>
                <Link 
                  href="/auth/signin"
                  className="text-[#969696] hover:text-[#fafafa] smooth-transition"
                >
                  Sign In
                </Link>
                <Button
                  onClick={handleGetStarted}
                  className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition"
                >
                  Get Started
                </Button>
              </>
            )}
            {session && (
              <Button
                onClick={handleGetStarted}
                className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition"
              >
                My Collections
              </Button>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#fafafa] via-[var(--accent-color)] to-[#fafafa] bg-clip-text text-transparent animate-gradient">
              Your Collection Trove
            </h1>
            <p className="text-xl md:text-2xl text-[#969696] mb-8 max-w-2xl mx-auto leading-relaxed">
              Build your trove. Catalog books, comics, movies, and cards — with tags, editions, and wishlists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-lg px-8 py-6 rounded-full smooth-transition group"
              >
                {session ? 'Go to My Trove' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 smooth-transition" />
              </Button>
              {!session && (
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] text-lg px-8 py-6 rounded-full smooth-transition"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#fafafa]">
              Everything you need to manage your collections
            </h2>
            <p className="text-xl text-[#969696] max-w-2xl mx-auto">
              Powerful features designed to make collection management simple and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-8 bg-[#1a1d24] border border-[#2a2d35] rounded-2xl hover:border-[var(--accent-color)]/50 smooth-transition group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[var(--accent-color)]/10 rounded-lg group-hover:bg-[var(--accent-color)]/20 smooth-transition">
                      <Icon className="h-6 w-6 text-[var(--accent-color)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-[#fafafa]">
                        {feature.title}
                      </h3>
                      <p className="text-[#969696] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-[#1a1d24] to-[#0f1114] border border-[#2a2d35] rounded-3xl">
            <Sparkles className="h-12 w-12 text-[var(--accent-color)] mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#fafafa]">
              Ready to get started?
            </h2>
            <p className="text-xl text-[#969696] mb-8 max-w-2xl mx-auto">
              Join Sammlerei today and start organizing your collections
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-lg px-8 py-6 rounded-full smooth-transition group"
            >
              {session ? 'Go to My Trove' : 'Get Started for Free'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 smooth-transition" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#2a2d35] py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[var(--accent-color)]" />
              <span className="text-xl font-bold text-[#fafafa] tracking-tighter">Colletro</span>
            </div>
            <div className="flex items-center gap-6 text-[#969696] text-sm flex-wrap">
              <Link href="/about" className="hover:text-[#fafafa] smooth-transition">
                About
              </Link>
              <Link href="/terms" className="hover:text-[#fafafa] smooth-transition">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[#fafafa] smooth-transition">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-[#fafafa] smooth-transition">
                Cookies
              </Link>
              {session && (
                <>
                  <Link href="/community" className="hover:text-[#fafafa] smooth-transition">
                    Community
                  </Link>
                  <Link href="/recommended" className="hover:text-[#fafafa] smooth-transition">
                    Recommended
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

