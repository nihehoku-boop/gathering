'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ArrowLeft, User } from 'lucide-react'
import { getBadgeEmoji } from '@/lib/badges'

interface WishlistItem {
  id: string
  itemName: string
  itemNumber: number | null
  itemImage: string | null
  collectionName: string | null
  notes: string | null
}

interface SharedWishlist {
  id: string
  name: string
  description: string | null
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    badge: string | null
  }
  items: WishlistItem[]
}

export default function SharedWishlistPage() {
  const params = useParams()
  const router = useRouter()
  const [wishlist, setWishlist] = useState<SharedWishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.token) {
      fetchSharedWishlist(params.token as string)
    }
  }, [params.token])

  const fetchSharedWishlist = async (token: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/wishlist/share/${token}`)
      if (res.ok) {
        const data = await res.json()
        setWishlist(data)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Wishlist not found')
      }
    } catch (error) {
      console.error('Error fetching shared wishlist:', error)
      setError('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[var(--text-secondary)]">Loading wishlist...</div>
        </div>
      </>
    )
  }

  if (error || !wishlist) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#FF3B30] mb-4">{error || 'Wishlist not found'}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-6 sm:mb-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="mb-6 sm:mb-8 animate-fade-up">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF3B30]" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
                {wishlist.name || 'Wishlist'}
              </h1>
            </div>
            {wishlist.description && (
              <p className="text-[var(--text-secondary)] text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">{wishlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm sm:text-base text-[var(--text-secondary)]">
              <User className="h-4 w-4" />
              <span>
                by{' '}
                <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                  {wishlist.user.badge && (
                    <span className="text-base">{getBadgeEmoji(wishlist.user.badge) || wishlist.user.badge}</span>
                  )}
                  {wishlist.user.name || wishlist.user.email}
                </span>
              </span>
            </div>
          </div>

          {wishlist.items.length === 0 ? (
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up">
              <CardContent className="py-16 text-center">
                <Heart className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-6" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  This wishlist trove is empty
                </h3>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {wishlist.items.map((item, index) => (
                <Card
                  key={item.id}
                  className="relative group rounded-lg border-2 overflow-hidden transition-all animate-fade-up bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)]"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {item.itemImage ? (
                    <div className="bg-[var(--bg-tertiary)] relative" style={{ aspectRatio: '2/3' }}>
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-[#2a2d35] relative" style={{ aspectRatio: '2/3' }}>
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2d35] to-[#1a1d24]">
                        <div className="text-center p-2">
                          <div className="text-xs font-semibold text-[var(--text-secondary)]">
                            {item.itemNumber && `#${item.itemNumber}`}
                          </div>
                          <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                            {item.itemName}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-2 bg-[var(--bg-secondary)]">
                    <div className="text-xs font-medium truncate text-[var(--text-primary)]">
                      {item.itemNumber && `#${item.itemNumber} `}
                      {item.itemName}
                    </div>
                    {item.collectionName && (
                      <div className="text-xs text-[var(--text-secondary)] truncate mt-1">
                        from {item.collectionName}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-[var(--text-muted)] truncate mt-1 line-clamp-1">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}



