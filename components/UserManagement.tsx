'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, Search, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  isAdmin: boolean
  isVerified: boolean
  badge: string | null
  createdAt: string
  _count: {
    collections: number
    communityCollections: number
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchUsers()
  }, [searchQuery])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    setUpdatingUsers(prev => new Set(prev).add(userId))
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentStatus }),
      })
      if (res.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isVerified: !currentStatus } : user
        ))
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to update verification status'}`)
      }
    } catch (error) {
      console.error('Error toggling verification:', error)
      alert('Failed to update verification status')
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  return (
    <Card className="bg-[#1a1d24] border-[#2a2d35]">
      <CardHeader>
        <CardTitle className="text-[#fafafa]">User Management</CardTitle>
        <CardDescription className="text-[#969696]">
          Manage user verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696]" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0f1114] border-[#2a2d35] text-[#fafafa] placeholder:text-[#969696] focus:border-[var(--accent-color)]"
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-[#969696]">
            No users found
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-[#0f1114] rounded-lg border border-[#2a2d35] hover:border-[#353842] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2a2d35] flex items-center justify-center text-[#969696] font-semibold">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#fafafa] font-medium truncate">
                        {user.name || user.email}
                      </span>
                      {user.isAdmin && (
                        <span className="px-2 py-0.5 text-xs bg-[var(--accent-color)] text-black rounded font-semibold">
                          Admin
                        </span>
                      )}
                      {user.isVerified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-sm text-[#969696] truncate">
                      {user.email}
                    </div>
                    <div className="text-xs text-[#969696] mt-1">
                      {user._count.collections} collections • {user._count.communityCollections} community collections
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleToggleVerification(user.id, user.isVerified)}
                  disabled={updatingUsers.has(user.id)}
                  variant={user.isVerified ? "outline" : "default"}
                  size="sm"
                  className={user.isVerified 
                    ? "border-[#2a2d35] text-[#969696] hover:bg-[#2a2d35]" 
                    : "bg-[var(--accent-color)] text-black hover:opacity-90"
                  }
                >
                  {updatingUsers.has(user.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : user.isVerified ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Unverify
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

