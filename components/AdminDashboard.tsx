'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Edit, List, Download, Eye, EyeOff } from 'lucide-react'
import CreateRecommendedCollectionDialog from './CreateRecommendedCollectionDialog'
import EditRecommendedCollectionDialog from './EditRecommendedCollectionDialog'
import RecommendedCollectionItemsManager from './RecommendedCollectionItemsManager'
import BulkImportDialog from './BulkImportDialog'
import ImportCollectionDialog from './ImportCollectionDialog'
import { parseTags, getTagColor } from '@/lib/tags'

interface RecommendedItem {
  id: string
  name: string
  number: number | null
  notes: string | null
  image: string | null
}

interface RecommendedCollection {
  id: string
  name: string
  description: string | null
  category: string | null
  template?: string | null
  customFieldDefinitions?: string | null
  coverImage: string | null
  tags: string
  isPublic?: boolean
  items: RecommendedItem[]
  createdAt: string
}

export default function AdminDashboard() {
  const [collections, setCollections] = useState<RecommendedCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCollection, setEditingCollection] = useState<RecommendedCollection | null>(null)
  const [viewingCollectionId, setViewingCollectionId] = useState<string | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      // Add ?admin=true to show all collections (including hidden ones) in admin dashboard
      const res = await fetch('/api/recommended-collections?admin=true')
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched collections:', data)
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recommended collection?')) return

    try {
      const res = await fetch(`/api/recommended-collections/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchCollections()
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
    }
  }

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/recommended-collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentVisibility }),
      })
      if (res.ok) {
        fetchCollections()
        // Dispatch event to notify other components to refresh
        window.dispatchEvent(new CustomEvent('recommendedCollectionsUpdated'))
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to update visibility'}`)
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
      alert('Failed to update visibility')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (viewingCollectionId) {
    return (
      <RecommendedCollectionItemsManager
        collectionId={viewingCollectionId}
        onBack={() => setViewingCollectionId(null)}
        onUpdate={fetchCollections}
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Recommended Collections</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowImportDialog(true)}
            className="accent-button text-white smooth-transition rounded-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Import Collection
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Recommended Collection
          </Button>
        </div>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No recommended collections yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first recommended collection to showcase to users!
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden">
              {collection.coverImage && (
                <div className="w-full h-48 overflow-hidden bg-gray-200">
                  <img
                    src={collection.coverImage}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{collection.name}</CardTitle>
                    {collection.category && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded mt-1 inline-block">
                        {collection.category}
                      </span>
                    )}
                    {(() => {
                      const tags = parseTags(collection.tags || '[]')
                      return tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.map((tag) => {
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
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleVisibility(collection.id, collection.isPublic || false)}
                      className={collection.isPublic ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}
                      title={collection.isPublic ? "Hide from public" : "Make public"}
                    >
                      {collection.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCollection(collection)}
                      className="hover:text-[var(--accent-color)]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(collection.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {collection.description && (
                  <CardDescription className="mt-2">
                    {collection.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {collection.items.length} items
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingCollectionId(collection.id)}
                    >
                      <List className="mr-2 h-4 w-4" />
                      Manage Items
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCollectionId(collection.id)
                        setShowBulkImport(true)
                      }}
                    >
                      Add Items
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ImportCollectionDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={fetchCollections}
      />
      <CreateRecommendedCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchCollections}
      />
      <EditRecommendedCollectionDialog
        open={editingCollection !== null}
        onOpenChange={(open) => !open && setEditingCollection(null)}
        collection={editingCollection ? {
          ...editingCollection,
          tags: editingCollection.tags || '[]',
          template: editingCollection.template || null,
          customFieldDefinitions: editingCollection.customFieldDefinitions || null,
        } : null}
        onSuccess={fetchCollections}
      />

      {selectedCollectionId && (() => {
        const selectedCollection = collections.find(c => c.id === selectedCollectionId)
        return (
          <BulkImportDialog
            open={showBulkImport}
            onOpenChange={(open) => {
              setShowBulkImport(open)
              if (!open) setSelectedCollectionId(null)
            }}
            collectionId={selectedCollectionId}
            collectionTemplate={selectedCollection?.template || null}
            customFieldDefinitions={selectedCollection?.customFieldDefinitions || null}
            apiEndpoint={`/api/recommended-collections/${selectedCollectionId}/items`}
            isRecommendedCollection={true}
            onSuccess={fetchCollections}
          />
        )
      })()}
    </div>
  )
}


