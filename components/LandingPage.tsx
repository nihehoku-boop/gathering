'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, ChevronDown, ChevronDown as ArrowDown } from 'lucide-react'
import LogoIcon from './LogoIcon'
import Link from 'next/link'
import Image from 'next/image'
import { useMemo } from 'react'

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

  // Generate particle positions once and memoize them
  const particlePositions = useMemo(() => {
    const positions: Array<{ top: number; left: number }> = []
    for (let i = 0; i < 65; i++) {
      positions.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
      })
    }
    return positions
  }, [])

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
        {[...Array(40)].map((_, i) => {
          const pos = particlePositions[i]
          return (
            <div
              key={`bg-glitter-accent-${i}`}
              className="absolute w-2 h-2 bg-[var(--accent-color)] rounded-full animate-glitter"
              style={{
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${2 + (i % 4) * 0.25}s`,
              }}
            ></div>
          )
        })}
        {[...Array(25)].map((_, i) => {
          const pos = particlePositions[40 + i]
          return (
            <div
              key={`bg-glitter-blue-${i}`}
              className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full animate-glitter"
              style={{
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                animationDelay: `${i * 0.2 + 0.05}s`,
                animationDuration: `${2.5 + (i % 3) * 0.33}s`,
              }}
            ></div>
          )
        })}
        </div>

      {/* Hero Section - Discord Style */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full bg-[#0f1114]/95 backdrop-blur-sm border-b border-[#2a2d35]/50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 lg:px-20 lg:py-6 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 hover:opacity-80 smooth-transition">
              <LogoIcon width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
              <span className="text-base sm:text-lg lg:text-2xl font-bold text-[#fafafa] tracking-tighter">Colletro</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {!session && (
                <>
                  <Link 
                    href="/auth/signin"
                    className="text-[#969696] hover:text-[#fafafa] smooth-transition text-xs sm:text-sm font-medium hidden sm:block"
                  >
                    Sign In
                  </Link>
                  <Button
                    onClick={handleGetStarted}
                    className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition rounded-full px-3 sm:px-5 lg:px-6 text-xs sm:text-sm py-1.5 sm:py-2 lg:py-2.5 whitespace-nowrap"
                  >
                    Get Started
                  </Button>
                </>
              )}
              {session && (
                <Button
                  onClick={handleGetStarted}
                  className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition rounded-full px-3 sm:px-5 lg:px-6 text-xs sm:text-sm py-1.5 sm:py-2 lg:py-2.5 whitespace-nowrap"
                >
                  My Trove
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Content - Split Layout */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-20 pt-24 sm:pt-32 lg:pt-0 pb-4 sm:py-8 lg:py-32 overflow-hidden min-h-[calc(100vh-80px)] sm:min-h-auto flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Text Side */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 lg:mb-6 leading-tight px-2 sm:px-0">
                <span className="text-[#fafafa]">Your Collection</span>
                <br />
                <span className="bg-gradient-to-r from-[var(--accent-color)] to-blue-500 bg-clip-text text-transparent">
                  Trove
                </span>
            </h1>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-[#969696] mb-6 sm:mb-7 lg:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
                Build your trove. Catalog books, comics, movies, and cards — with tags, editions, and wishlists.
            </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-4 justify-center lg:justify-start px-2 sm:px-0">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-sm sm:text-base lg:text-lg px-5 sm:px-7 lg:px-8 py-3 sm:py-5 lg:py-6 rounded-full smooth-transition group w-full sm:w-auto"
              >
                  {session ? 'Go to My Trove' : 'Get Started'}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 group-hover:translate-x-1 smooth-transition" />
              </Button>
              {!session && (
                <Link href="/auth/signin" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] text-sm sm:text-base lg:text-lg px-5 sm:px-7 lg:px-8 py-3 sm:py-5 lg:py-6 rounded-full smooth-transition w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
              </div>
            </div>

            {/* Logo Side - Hero (Standing Alone, Bigger with Glitter) */}
            <div className="relative flex items-center justify-center order-1 lg:order-2 mb-4 sm:mb-5 lg:mb-0 overflow-visible">
              <div className="relative w-full max-w-[130px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-none">
                <div className="relative animate-sparkle w-full aspect-square flex items-center justify-center">
                  <LogoIcon width={500} height={500} className="w-[130px] h-[130px] sm:w-[200px] sm:h-[200px] md:w-[280px] md:h-[280px] lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] relative z-10 max-w-full max-h-full object-contain" />
                </div>
                
                {/* Glitter/Particle Effect - Hidden on mobile to prevent overflow */}
                <div className="absolute inset-0 z-0 overflow-visible hidden sm:block">
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
              
              {/* Decorative elements - Hidden on mobile to prevent overflow */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--accent-color)]/20 rounded-full blur-2xl -z-10 hidden sm:block"></div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -z-10 hidden sm:block"></div>
            </div>
          </div>
          
          {/* Scroll Indicator - Only visible on mobile */}
          <div className="flex justify-center mt-8 sm:mt-0 lg:hidden">
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <span className="text-xs text-[#969696] mb-1">Scroll to explore</span>
              <ChevronDown className="h-6 w-6 text-[var(--accent-color)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections - Continuous Flow */}
      <div className="relative">
        {features.map((feature, index) => (
          <section
            key={index}
            className="py-12 sm:py-16 lg:py-32 relative"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                {/* Image Side */}
                <div
                  className={
                    feature.imageSide === 'left'
                      ? 'order-2 lg:order-1 lg:col-start-1'
                      : 'order-2 lg:order-2 lg:col-start-2'
                  }
                >
                  <div style={{ perspective: '1000px' }} className="hidden lg:block">
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
                          priority={index < 2}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Mobile: Simpler version without 3D effect */}
                  <div className="lg:hidden">
                    <div className="relative rounded-xl overflow-hidden border border-[#2a2d35] bg-[#1a1d24] shadow-xl">
                      <div className="aspect-video">
                        <Image
                          src={feature.screenshot}
                          alt={feature.title}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover"
                          priority={index < 2}
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
                  <div className="max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
                    {/* Title with Icon Next to It */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <img
                        src={feature.icon}
                        alt={feature.iconAlt}
                        className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain flex-shrink-0"
                      />
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#fafafa] leading-tight">
                        {feature.title}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-base sm:text-lg lg:text-xl text-[#969696] mb-6 sm:mb-8 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Details List */}
                    <ul className="space-y-2 sm:space-y-3">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 sm:gap-3">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] flex-shrink-0"></div>
                          <span className="text-[#d1d1d1] text-sm sm:text-base lg:text-lg">{detail}</span>
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

      {/* FAQ Section */}
      <div className="relative py-12 sm:py-16 lg:py-32 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[#fafafa]">
                Questions?
              </h2>
              <p className="text-lg sm:text-xl text-[#969696]">
                We've got answers
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "Is Colletro really free?",
                  answer: "Yes! Colletro is completely free to use. You can create unlimited collections, add as many items as you want, and enjoy all the core features without paying a cent. We believe everyone should be able to organize their collections without breaking the bank."
                },
                {
                  question: "What kinds of collections can I track?",
                  answer: "Pretty much anything! Books, comics, trading cards, vinyl records, movies, video games, collectibles, artwork — if you collect it, you can track it. We've got templates for the most popular collection types, plus you can create custom fields for anything unique to your collection."
                },
                {
                  question: "Can I share my collections with others?",
                  answer: "Absolutely! You can share individual collections via private links, or share them with the community. You control what's public and what stays private. It's a great way to show off your collection or get recommendations from fellow collectors."
                },
                {
                  question: "What if I want to export my data?",
                  answer: "No worries! You can export your collections as CSV files anytime. Your data belongs to you, and we want to make sure you can take it with you whenever you need it. We're also working on additional export formats."
                },
                {
                  question: "Do you have a mobile app?",
                  answer: "Not yet, but Colletro works great on mobile browsers! The site is fully responsive, so you can manage your collections from your phone or tablet. A native mobile app might come in the future if there's enough interest."
                },
                {
                  question: "How do you keep my data safe?",
                  answer: "Security is super important to us. We use industry-standard encryption, secure authentication, and regular backups. Your collections are private by default, and you have full control over what you share. We take your privacy seriously."
                }
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group bg-[#1a1d24] border border-[#2a2d35] rounded-xl overflow-hidden smooth-transition hover:border-[var(--accent-color)]/30 animate-fade-up"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                >
                  <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer list-none text-[#fafafa] font-medium text-base sm:text-lg smooth-transition hover:text-[var(--accent-color)]">
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-[#969696] group-open:rotate-180 smooth-transition flex-shrink-0" />
                  </summary>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-[#d1d1d1] leading-relaxed faq-answer text-sm sm:text-base">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-12 sm:py-16 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-6 sm:p-8 lg:p-16 bg-gradient-to-br from-[#1a1d24] to-[#0f1114] border border-[#2a2d35] rounded-2xl sm:rounded-3xl overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 via-blue-500/5 to-[var(--accent-color)]/5"></div>
              
              <div className="relative z-10">
                <div className="inline-block mb-4 sm:mb-6">
                  <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-[var(--accent-color)]" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 text-[#fafafa]">
              Ready to get started?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[#969696] mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
                  Join Colletro today and start organizing your collections
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full smooth-transition group w-full sm:w-auto"
            >
                  {session ? 'Go to My Trove' : 'Get Started for Free'}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 smooth-transition" />
            </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-[#2a2d35] bg-[#0f1114]/50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <LogoIcon width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-lg sm:text-xl font-bold text-[#fafafa] tracking-tighter">Colletro</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-[#969696] text-xs sm:text-sm flex-wrap justify-center">
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
