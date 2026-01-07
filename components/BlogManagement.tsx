'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, User } from 'lucide-react'
import { useAlert } from '@/hooks/useAlert'
import AlertDialog from './ui/alert-dialog'
import CreateBlogPostDialog from './CreateBlogPostDialog'
import EditBlogPostDialog from './EditBlogPostDialog'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  authorId: string
  author: {
    name: string | null
    email: string
  }
  featuredImage: string | null
  published: boolean
  publishedAt: Date | null
  metaTitle: string | null
  metaDescription: string | null
  tags: string[]
  category: string | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const { alertDialog, showAlert, closeAlert } = useAlert()

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string) => {
    showAlert({
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      type: 'warning',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/blog/${id}`, {
            method: 'DELETE',
          })
          if (res.ok) {
            setPosts(posts.filter(p => p.id !== id))
            showAlert({
              title: 'Success',
              message: 'Blog post deleted successfully.',
              type: 'success',
            })
          } else {
            const error = await res.json()
            showAlert({
              title: 'Error',
              message: error.error || 'Failed to delete blog post',
              type: 'error',
            })
          }
        } catch (error) {
          console.error('Error deleting blog post:', error)
          showAlert({
            title: 'Error',
            message: 'Failed to delete blog post. Please try again.',
            type: 'error',
          })
        }
      },
    })
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          published: !post.published,
          publishedAt: !post.published ? new Date().toISOString() : null,
        }),
      })
      if (res.ok) {
        fetchPosts()
      } else {
        const error = await res.json()
        showAlert({
          title: 'Error',
          message: error.error || 'Failed to update blog post',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to update blog post. Please try again.',
        type: 'error',
      })
    }
  }

  if (loading) {
    return <div className="text-[var(--text-secondary)]">Loading blog posts...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Blog Management</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Create and manage blog posts for SEO and content marketing
          </p>
        </div>
        <div className="flex gap-2">
          {posts.length === 0 && (
            <Button
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/blog/seed', {
                    method: 'POST',
                  })
                  if (res.ok) {
                    const data = await res.json()
                    showAlert({
                      title: 'Success',
                      message: data.message || 'Initial blog posts created successfully!',
                      type: 'success',
                    })
                    fetchPosts()
                  } else {
                    const error = await res.json()
                    showAlert({
                      title: 'Error',
                      message: error.error || 'Failed to seed blog posts',
                      type: 'error',
                    })
                  }
                } catch (error) {
                  console.error('Error seeding blog posts:', error)
                  showAlert({
                    title: 'Error',
                    message: 'Failed to seed blog posts. Please try again.',
                    type: 'error',
                  })
                }
              }}
              variant="outline"
              className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            >
              Seed Initial Posts
            </Button>
          )}
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="accent-button text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardContent className="pt-6">
            <p className="text-[var(--text-secondary)] text-center">
              No blog posts yet. Create your first post to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="bg-[var(--bg-secondary)] border-[var(--border-color)]"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-[var(--text-primary)] line-clamp-2 mb-2">
                      {post.title}
                    </CardTitle>
                    {post.excerpt && (
                      <CardDescription className="text-[var(--text-secondary)] line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    {post.category && (
                      <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded">
                        {post.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.viewCount} views
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    {post.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                    )}
                    {post.author.name && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author.name}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPost(post)}
                      className="flex-1 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(post)}
                      className={`flex-1 ${
                        post.published
                          ? 'text-yellow-500 hover:bg-yellow-500/10'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      {post.published ? (
                        <>
                          <EyeOff className="mr-2 h-3 w-3" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-3 w-3" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <CreateBlogPostDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false)
            fetchPosts()
          }}
        />
      )}

      {editingPost && (
        <EditBlogPostDialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          post={editingPost}
          onSuccess={() => {
            setEditingPost(null)
            fetchPosts()
          }}
        />
      )}

      <AlertDialog {...alertDialog} onOpenChange={closeAlert} />
    </>
  )
}

