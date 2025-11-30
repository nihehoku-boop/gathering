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
        <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[#969696]">Loading wishlist...</div>
        </div>
      </>
    )
  }

  if (error || !wishlist) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#FF3B30] mb-4">{error || 'Wishlist not found'}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
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
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-8 text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="mb-8 animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-[#FF3B30]" />
              <h1 className="text-5xl font-semibold text-[#fafafa] tracking-tight">
                {wishlist.name || 'Wishlist'}
              </h1>
            </div>
            {wishlist.description && (
              <p className="text-[#969696] text-lg mb-4">{wishlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-[#969696]">
              <User className="h-4 w-4" />
              <span>
                by{' '}
                <span className="text-[#fafafa] flex items-center gap-1.5">
                  {wishlist.user.badge && (
                    <span className="text-base">{getBadgeEmoji(wishlist.user.badge) || wishlist.user.badge}</span>
                  )}
                  {wishlist.user.name || wishlist.user.email}
                </span>
              </span>
            </div>
          </div>

          {wishlist.items.length === 0 ? (
            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up">
              <CardContent className="py-16 text-center">
                <Heart className="mx-auto h-16 w-16 text-[#353842] mb-6" />
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
                  This wishlist is empty
                </h3>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.items.map((item, index) => (
                <Card
                  key={item.id}
                  className="bg-[#1a1d24] border-[#2a2d35] hover:border-[#353842] hover-lift animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.itemImage && (
                    <div className="w-full h-48 overflow-hidden bg-[#2a2d35]">
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg text-[#fafafa]">
                      {item.itemNumber && `#${item.itemNumber} `}
                      {item.itemName}
                    </CardTitle>
                    {item.collectionName && (
                      <CardDescription className="mt-1 text-[#969696]">
                        from {item.collectionName}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {item.notes && (
                    <CardContent>
                      <p className="text-sm text-[#969696]">{item.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}



