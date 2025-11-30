'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getBadgeEmoji } from '@/lib/badges'
import { parseTags, getTagColor } from '@/lib/tags'

interface Item {
  id: string
  name: string
  number: number | null
  isOwned: boolean
  image: string | null
  notes: string | null
}

interface Collection {
  id: string
  name: string
  description: string | null
  category: string | null
  coverImage: string | null
  tags: string
  items: Item[]
  user: {
    id: string
    name: string | null
    image: string | null
    badge: string | null
  }
}

export default function SharedCollectionPage() {
  const params = useParams()
  const token = params.token as string
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      fetchSharedCollection()
    }
  }, [token])

  const fetchSharedCollection = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/collections/share/${token}`)
      if (res.ok) {
        const data = await res.json()
        setCollection(data)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch shared collection.')
      }
    } catch (err) {
      console.error('Error fetching shared collection:', err)
      setError('An unexpected error occurred.')
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
          <div className="text-center text-[#969696]">Loading shared collection...</div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[#FF3B30]">Error: {error}</div>
        </div>
      </>
    )
  }

  if (!collection) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[#969696]">Collection not found or not public.</div>
        </div>
      </>
    )
  }

  const totalItems = collection.items.length
  const ownedItems = collection.items.filter(item => item.isOwned).length
  const progress = totalItems > 0 ? Math.round((ownedItems / totalItems) * 100) : 0
  const tags = parseTags(collection.tags)

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <Card className="mb-8 bg-[#1a1d24] border-[#2a2d35] animate-fade-up">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-4xl font-semibold text-[#fafafa] tracking-tight">
                    {collection.name}
                  </CardTitle>
                  {collection.description && (
                    <CardDescription className="mt-2 text-[#969696]">
                      {collection.description}
                    </CardDescription>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#969696]">
                    <span>Shared by:</span>
                    <span className="inline-flex items-center gap-1.5 text-[#fafafa]">
                      {collection.user.badge && (
                        <span className="text-xl">{getBadgeEmoji(collection.user.badge) || collection.user.badge}</span>
                      )}
                      {collection.user.name || 'Anonymous'}
                    </span>
                  </div>
                  {collection.category && (
                    <div className="mt-2">
                      <span className="text-xs bg-[#2a2d35] text-[#969696] px-2 py-1 rounded">
                        {collection.category}
                      </span>
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${getTagColor(tag).bg}20`,
                            color: getTagColor(tag).text,
                            border: `1px solid ${getTagColor(tag).border}40`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {collection.coverImage && (
                  <img
                    src={collection.coverImage}
                    alt={collection.name}
                    className="w-32 h-48 object-cover rounded-lg border border-[#2a2d35]"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#969696]">Collection Progress</span>
                  <span className="font-semibold text-lg text-[#fafafa]">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-[#969696]">
                  {ownedItems} of {totalItems} items collected
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {collection.items.map((item, index) => (
              <Card
                key={item.id}
                className={`relative group rounded-lg border-2 overflow-hidden transition-all animate-fade-up ${
                  item.isOwned
                    ? 'border-[#34C759] shadow-md'
                    : 'border-[#2a2d35] hover:border-[#353842]'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {item.image ? (
                  <div className="bg-[#2a2d35] relative" style={{ aspectRatio: '2/3' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full bg-[#2a2d35] relative" style={{ aspectRatio: '2/3' }}>
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2d35] to-[#1a1d24]">
                      <div className="text-center p-2">
                        <div className="text-xs font-semibold text-[#969696]">
                          {item.number && `#${item.number}`}
                        </div>
                        <div className="text-xs text-[#666] mt-1 line-clamp-2">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-2 bg-[#1a1d24]">
                  <div className="text-xs font-medium truncate text-[#fafafa]">
                    {item.number && `#${item.number} `}
                    {item.name}
                  </div>
                  {item.isOwned && (
                    <div className="mt-1 text-xs text-[#34C759]">✓ Owned</div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {collection.items.length === 0 && (
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardContent className="py-16 text-center">
                <p className="text-[#969696]">This collection has no items yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}



