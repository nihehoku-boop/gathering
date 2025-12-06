'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, Share2, Trash2, Copy, Check, Edit, X } from 'lucide-react'
import AlertDialog from '@/components/ui/alert-dialog'
import { useAlert } from '@/hooks/useAlert'

interface WishlistItem {
  id: string
  itemId: string | null
  collectionId: string | null
  itemName: string
  itemNumber: number | null
  itemImage: string | null
  collectionName: string | null
  notes: string | null
  createdAt: string
}

interface Wishlist {
  id: string
  name: string
  description: string | null
  shareToken: string
  isPublic: boolean
  items: WishlistItem[]
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [wishlistName, setWishlistName] = useState('')
  const [copied, setCopied] = useState(false)
  const { alertDialog, showAlert, showConfirm, closeAlert } = useAlert()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchWishlist()
    }
  }, [status, router])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      console.log('[WishlistPage] Fetching wishlist...')
      const startTime = performance.now()
      const res = await fetch('/api/wishlist', {
        cache: 'force-cache',
        headers: { 'Cache-Control': 'public, max-age=60' }
      })
      const endTime = performance.now()
      console.log(`[WishlistPage] Fetch completed in ${(endTime - startTime).toFixed(2)}ms`)
      if (res.ok) {
        const data = await res.json()
        setWishlist(data)
        setWishlistName(data.name || 'My Wishlist')
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wishlistName,
          description: wishlist?.description,
          isPublic: wishlist?.isPublic || false,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setWishlist(data)
        setEditingName(false)
        showAlert({
          title: 'Success',
          message: 'Wishlist updated successfully.',
          type: 'success',
        })
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to update wishlist.',
        type: 'error',
      })
    }
  }

  const copyShareLink = () => {
    if (wishlist && wishlist.shareToken) {
      const url = `${window.location.origin}/wishlist/share/${wishlist.shareToken}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      showAlert({
        title: 'Error',
        message: 'Share token not available. Please make your wishlist public first.',
        type: 'error',
      })
    }
  }

  const togglePublic = async () => {
    if (!wishlist) return

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wishlist.name,
          description: wishlist.description,
          isPublic: !wishlist.isPublic,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setWishlist(data)
        showAlert({
          title: 'Success',
          message: `Wishlist is now ${data.isPublic ? 'public' : 'private'}.`,
          type: 'success',
        })
      }
    } catch (error) {
      console.error('Error toggling public status:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to update wishlist visibility.',
        type: 'error',
      })
    }
  }

  const deleteItem = async (itemId: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from your wishlist?',
      type: 'warning',
      confirmText: 'Remove',
      cancelText: 'Cancel',
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/wishlist/items?ids=${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchWishlist()
        showAlert({
          title: 'Success',
          message: 'Item removed from wishlist.',
          type: 'success',
        })
      } else {
        const errorData = await res.json()
        showAlert({
          title: 'Error',
          message: errorData.error || 'Failed to remove item',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error deleting wishlist item:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to remove item. Please try again.',
        type: 'error',
      })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 border-4 border-[#2a2d35] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-[var(--accent-color)] rounded-full animate-spin"></div>
              
              {/* Inner pulsing circle */}
              <div className="absolute inset-4 border-4 border-[var(--border-color)] rounded-full"></div>
              <div className="absolute inset-4 border-4 border-transparent border-r-[var(--accent-color)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              
              {/* Center dot */}
              <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--accent-color)] rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[var(--text-primary)] text-lg font-medium">Loading wishlist...</p>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!wishlist) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[var(--text-secondary)]">No wishlist found</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              {editingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={wishlistName}
                    onChange={(e) => setWishlistName(e.target.value)}
                    className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] focus:border-[var(--accent-color)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateWishlist()
                      } else if (e.key === 'Escape') {
                        setEditingName(false)
                        setWishlistName(wishlist.name || 'My Wishlist')
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={updateWishlist}
                    className="accent-button text-white smooth-transition rounded-full"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingName(false)
                      setWishlistName(wishlist.name || 'My Wishlist')
                    }}
                    className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-5xl font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                    <Heart className="h-8 w-8 text-[#FF3B30]" />
                    {wishlist.name || 'My Wishlist'}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingName(true)}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  </h1>
                </>
              )}
            </div>
            {wishlist.description && (
              <p className="text-[var(--text-secondary)] text-lg mb-4">{wishlist.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={copyShareLink}
                disabled={!wishlist.isPublic || !wishlist.shareToken}
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Share Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={togglePublic}
                className={`border-[var(--border-hover)] smooth-transition rounded-full ${
                  wishlist.isPublic
                    ? 'bg-[#34C759]/10 border-[#34C759] text-[#34C759]'
                    : 'text-[var(--text-primary)] hover:bg-[#2a2d35]'
                }`}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {wishlist.isPublic ? 'Public' : 'Private'}
              </Button>
              {wishlist.isPublic && wishlist.shareToken && (
                <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <span>Share link:</span>
                  <code className="bg-[var(--bg-tertiary)] px-2 py-1 rounded text-xs text-[var(--text-primary)]">
                    {window.location.origin}/wishlist/share/{wishlist.shareToken.substring(0, 8)}...
                  </code>
                </div>
              )}
            </div>
          </div>

          {wishlist.items.length === 0 ? (
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up">
              <CardContent className="py-16 text-center">
                <Heart className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-6" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  Your wishlist is empty
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  Add items from your collections to your wishlist!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {wishlist.items.map((item, index) => (
                <Card
                  key={item.id}
                  className="relative group rounded-lg border-2 overflow-hidden transition-all animate-fade-up cursor-pointer bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)]"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {item.itemImage ? (
                    <div className="bg-[var(--bg-tertiary)] relative" style={{ aspectRatio: '2/3' }}>
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteItem(item.id)
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-md hover:bg-[#C0392B] smooth-transition opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteItem(item.id)
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-md hover:bg-[#C0392B] smooth-transition opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
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
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => !open && closeAlert()}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        confirmText={alertDialog.confirmText}
        cancelText={alertDialog.cancelText}
        showCancel={alertDialog.showCancel}
        onConfirm={alertDialog.onConfirm}
        onCancel={alertDialog.onCancel}
      />
    </>
  )
}

