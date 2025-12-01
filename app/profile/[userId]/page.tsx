'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, User, Lock, Trophy } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { parseTags, getTagColor } from '@/lib/tags'
import { getBadgeEmoji } from '@/lib/badges'

interface Collection {
  id: string
  name: string
  description: string | null
  category: string | null
  coverImage: string | null
  tags: string
  ownedItems: number
  totalItems: number
  progress: number
}

interface PublicProfile {
  id: string
  name: string
  email: string
  image: string | null
  badge: string | null
  topCollections: Collection[]
  totalCollections: number
  totalItems: number
  totalOwnedItems: number
  isPrivate?: boolean
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const userId = params.userId as string
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else if (res.status === 404) {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[#0f1114] lg:ml-64">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-[#969696]">Loading profile...</div>
          </div>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[#0f1114] lg:ml-64">
          <div className="container mx-auto px-6 py-8">
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardContent className="py-16 text-center">
                <User className="mx-auto h-16 w-16 text-[#353842] mb-6" />
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
                  Profile not found
                </h3>
                <p className="text-[#969696]">
                  This profile doesn't exist or is private.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  if (profile.isPrivate) {
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
            </div>
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardContent className="py-16 text-center">
                <Lock className="mx-auto h-16 w-16 text-[#353842] mb-6" />
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
                  Private Profile
                </h3>
                <p className="text-[#969696]">
                  This profile is set to private.
                </p>
              </CardContent>
            </Card>
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
          </div>

          <div className="max-w-4xl">
            {/* Profile Header */}
            <Card className="bg-[#1a1d24] border-[#2a2d35] mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-24 h-24 rounded-full border-2 border-[#353842]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#2a2d35] border-2 border-[#353842] flex items-center justify-center">
                      <span className="text-3xl font-semibold text-[#fafafa]">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-semibold text-[#fafafa] flex items-center gap-2">
                        {profile.badge && (
                          <span className="text-2xl">{getBadgeEmoji(profile.badge) || profile.badge}</span>
                        )}
                        {profile.name}
                      </h1>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-[#969696]">Collections</div>
                        <div className="text-2xl font-semibold text-[#fafafa]">
                          {profile.totalCollections}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#969696]">Total Items</div>
                        <div className="text-2xl font-semibold text-[#fafafa]">
                          {profile.totalItems}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#969696]">Owned</div>
                        <div className="text-2xl font-semibold text-[#fafafa]">
                          {profile.totalOwnedItems}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Collections */}
            {profile.topCollections.length > 0 ? (
              <Card className="bg-[#1a1d24] border-[#2a2d35]">
                <CardHeader>
                  <CardTitle className="text-[#fafafa] flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[var(--accent-color)]" />
                    Top Collections
                  </CardTitle>
                  <CardDescription className="text-[#969696]">
                    Showcasing the top 3 collections by owned items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.topCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="bg-[#2a2d35] rounded-lg overflow-hidden hover:border-[var(--accent-color)]/50 border border-[#353842] smooth-transition cursor-pointer"
                        onClick={() => router.push(`/collections/${collection.id}`)}
                      >
                        {collection.coverImage && (
                          <div className="w-full h-48 overflow-hidden bg-[#1a1d24]">
                            <img
                              src={collection.coverImage}
                              alt={collection.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-[#fafafa] mb-2">
                            {collection.name}
                          </h3>
                          {collection.category && (
                            <span className="text-xs text-[#969696] bg-[#1a1d24] px-2 py-1 rounded-md mb-2 inline-block">
                              {collection.category}
                            </span>
                          )}
                          {(() => {
                            const tags = parseTags(collection.tags || '[]')
                            return tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {tags.slice(0, 2).map((tag) => {
                                  const colors = getTagColor(tag)
                                  return (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center px-2 py-0.5 text-xs rounded-full border"
                                      style={{
                                        backgroundColor: colors.bg,
                                        color: colors.text,
                                        borderColor: colors.border,
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  )
                                })}
                              </div>
                            )
                          })()}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#969696]">Progress</span>
                              <span className="font-semibold text-[#fafafa]">
                                {collection.progress}%
                              </span>
                            </div>
                            <Progress value={collection.progress} className="h-2 bg-[#1a1d24]" />
                            <div className="text-xs text-[#969696] text-center">
                              {collection.ownedItems} / {collection.totalItems} items
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#1a1d24] border-[#2a2d35]">
                <CardContent className="py-16 text-center">
                  <Trophy className="mx-auto h-16 w-16 text-[#353842] mb-6" />
                  <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
                    No collections yet
                  </h3>
                  <p className="text-[#969696]">
                    This user hasn't created any collections.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

