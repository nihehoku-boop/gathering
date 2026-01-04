'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import LogoIcon from './LogoIcon'
import Link from 'next/link'
import Image from 'next/image'

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
      icon: '/iconshomepage/barrel.png',
      iconAlt: 'Build Your Trove',
      title: 'Build Your Trove',
      description: 'Create and manage multiple collections with ease. Organize books, comics, movies, and cards all in one place.',
      details: [
        'Create unlimited collections',
        'Custom fields and templates',
        'Tags and categories',
        'Progress tracking',
      ],
      screenshot: '/screenshots/my trove.png',
      imageSide: 'right' as const,
    },
    {
      icon: '/iconshomepage/search.png',
      iconAlt: 'Discover Collections',
      title: 'Discover & Explore',
      description: 'Find collections shared by the community and get curated recommendations from experts.',
      details: [
        'Browse community collections',
        'Get expert recommendations',
        'Search and filter easily',
        'Add to your trove instantly',
      ],
      screenshot: '/screenshots/community collections.png',
      imageSide: 'left' as const,
    },
    {
      icon: '/iconshomepage/message in a bottle.png',
      iconAlt: 'Share Collections',
      title: 'Share Your Trove',
      description: 'Share your collections with friends or the community. Show off your prized items and get inspired.',
      details: [
        'Public sharing links',
        'Community submissions',
        'Privacy controls',
        'Social features',
      ],
      screenshot: '/screenshots/community collections.png',
      imageSide: 'right' as const,
    },
    {
      icon: '/iconshomepage/medal.png',
      iconAlt: 'Track Progress',
      title: 'Track Your Progress',
      description: 'Visual progress bars and statistics help you see how your collection is growing over time.',
      details: [
        'Completion percentages',
        'Progress visualization',
        'Collection statistics',
        'Achievement tracking',
      ],
      screenshot: '/screenshots/statistics.png',
      imageSide: 'left' as const,
    },
    {
      icon: '/iconshomepage/telescope.png',
      iconAlt: 'Wishlist',
      title: 'Never Miss a Find',
      description: 'Keep track of items you\'re looking for with wishlists and smart notifications.',
      details: [
        'Wishlist management',
        'Item tracking',
        'Smart reminders',
        'Collection goals',
      ],
      screenshot: '/screenshots/my wishlist.png',
      imageSide: 'right' as const,
    },
  ]

  return (
    <div className="min-h-screen text-white overflow-hidden relative bg-gradient-animated">
      {/* Background Particle Effect - Same as chest particles */}
      <div className="fixed inset-0 z-0 overflow-visible pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={`bg-glitter-accent-${i}`}
            className="absolute w-2 h-2 bg-[var(--accent-color)] rounded-full animate-glitter"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${2 + Math.random() * 1}s`,
            }}
          ></div>
        ))}
        {[...Array(25)].map((_, i) => (
          <div
            key={`bg-glitter-blue-${i}`}
            className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full animate-glitter"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2 + 0.05}s`,
              animationDuration: `${2.5 + Math.random() * 1}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hero Section - Discord Style */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6 lg:px-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon width={32} height={32} className="h-8 w-8" />
            <span className="text-2xl font-bold text-[#fafafa] tracking-tighter">Colletro</span>
          </div>
          <div className="flex items-center gap-4">
            {!session && (
              <>
                <Link 
                  href="/auth/signin"
                  className="text-[#969696] hover:text-[#fafafa] smooth-transition text-sm font-medium"
                >
                  Sign In
                </Link>
                <Button
                  onClick={handleGetStarted}
                  className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition rounded-full px-6"
                >
                  Get Started
                </Button>
              </>
            )}
            {session && (
              <Button
                onClick={handleGetStarted}
                className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition rounded-full px-6"
              >
                My Collections
              </Button>
            )}
          </div>
        </nav>

        {/* Hero Content - Split Layout */}
        <div className="relative z-10 container mx-auto px-6 lg:px-20 py-16 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Text Side */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="text-[#fafafa]">Your Collection</span>
                <br />
                <span className="bg-gradient-to-r from-[var(--accent-color)] to-blue-500 bg-clip-text text-transparent">
                  Trove
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-[#969696] mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Build your trove. Catalog books, comics, movies, and cards — with tags, editions, and wishlists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

            {/* Logo Side - Hero (Standing Alone, Bigger with Glitter) */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <div className="relative animate-sparkle">
                  <LogoIcon width={500} height={500} className="w-96 h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] relative z-10" />
                </div>
                
                {/* Glitter/Particle Effect */}
                <div className="absolute inset-0 z-0 overflow-visible">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-[var(--accent-color)] rounded-full animate-glitter"
                      style={{
                        left: `${20 + (i * 7)}%`,
                        top: `${15 + (i % 4) * 25}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: `${2 + (i % 3)}s`,
                      }}
                    ></div>
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`secondary-${i}`}
                      className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full animate-glitter"
                      style={{
                        left: `${25 + (i * 8)}%`,
                        top: `${20 + (i % 3) * 30}%`,
                        animationDelay: `${i * 0.4 + 0.5}s`,
                        animationDuration: `${2.5 + (i % 2)}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--accent-color)]/20 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections - Continuous Flow */}
      <div className="relative">
        {features.map((feature, index) => (
          <section
            key={index}
            className="py-20 lg:py-32 relative"
          >
            <div className="container mx-auto px-6 lg:px-20">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                {/* Image Side */}
                <div
                  className={
                    feature.imageSide === 'left'
                      ? 'order-2 lg:order-1 lg:col-start-1'
                      : 'order-2 lg:order-2 lg:col-start-2'
                  }
                >
                  <div style={{ perspective: '1000px' }}>
                    <div className="relative rounded-2xl overflow-hidden border border-[#2a2d35] bg-[#1a1d24] shadow-2xl transform-gpu transition-transform duration-300 hover:scale-105" style={{
                      transform: feature.imageSide === 'left' 
                        ? 'perspective(1000px) rotateY(5deg) rotateX(2deg) translateZ(20px)'
                        : 'perspective(1000px) rotateY(-5deg) rotateX(2deg) translateZ(20px)',
                    }}>
                      <div className="aspect-video">
                        <Image
                          src={feature.screenshot}
                          alt={feature.title}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Side */}
                <div
                  className={
                    feature.imageSide === 'left'
                      ? 'order-1 lg:order-2 lg:col-start-2'
                      : 'order-1 lg:order-1 lg:col-start-1'
                  }
                >
                  <div className="max-w-xl mx-auto lg:mx-0">
                    {/* Title with Icon Next to It */}
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={feature.icon}
                        alt={feature.iconAlt}
                        className="w-16 h-16 lg:w-20 lg:h-20 object-contain flex-shrink-0"
                      />
                      <h2 className="text-4xl lg:text-5xl font-bold text-[#fafafa] leading-tight">
                        {feature.title}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-xl text-[#969696] mb-8 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Details List */}
                    <ul className="space-y-3">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] flex-shrink-0"></div>
                          <span className="text-[#d1d1d1] text-lg">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CTA Section */}
      <div className="relative py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-12 lg:p-16 bg-gradient-to-br from-[#1a1d24] to-[#0f1114] border border-[#2a2d35] rounded-3xl overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 via-blue-500/5 to-[var(--accent-color)]/5"></div>
              
              <div className="relative z-10">
                <div className="inline-block mb-6">
                  <Sparkles className="h-12 w-12 text-[var(--accent-color)]" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#fafafa]">
                  Ready to get started?
                </h2>
                <p className="text-xl text-[#969696] mb-8 max-w-2xl mx-auto">
                  Join Colletro today and start organizing your collections
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
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-[#2a2d35] bg-[#0f1114]/50 py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <LogoIcon width={24} height={24} className="h-6 w-6" />
              <span className="text-xl font-bold text-[#fafafa] tracking-tighter">Colletro</span>
            </div>
            <div className="flex items-center gap-6 text-[#969696] text-sm flex-wrap justify-center">
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
