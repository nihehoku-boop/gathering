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
      const res = await fetch('/api/recommended-collections')
      if (res.ok) {
        const data = await res.json()
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
                      className="hover:text-primary"
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
          tags: editingCollection.tags || '[]'
        } : null}
        onSuccess={fetchCollections}
      />

      {selectedCollectionId && (
        <BulkImportRecommendedDialog
          open={showBulkImport}
          onOpenChange={(open) => {
            setShowBulkImport(open)
            if (!open) setSelectedCollectionId(null)
          }}
          collectionId={selectedCollectionId}
          onSuccess={fetchCollections}
        />
      )}
    </div>
  )
}

// Bulk import dialog for recommended collections
function BulkImportRecommendedDialog({
  open,
  onOpenChange,
  collectionId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('numbered')
  const [seriesName, setSeriesName] = useState('')
  const [startNumber, setStartNumber] = useState('1')
  const [endNumber, setEndNumber] = useState('100')
  const [prefix, setPrefix] = useState('#')
  const [csvText, setCsvText] = useState('')
  const [manualList, setManualList] = useState('')

  if (!open) return null

  const generateNumberedSeries = () => {
    const start = parseInt(startNumber)
    const end = parseInt(endNumber)
    if (isNaN(start) || isNaN(end) || start > end) return []
    const items = []
    for (let i = start; i <= end; i++) {
      items.push({ name: `${seriesName} ${prefix}${i}`, number: i })
    }
    return items
  }

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    return lines
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        const parts = trimmed.split(',').map(p => p.trim())
        if (parts.length === 2) {
          const num = parseInt(parts[0])
          return { name: parts[1], number: isNaN(num) ? null : num }
        } else if (parts.length === 1) {
          const match = trimmed.match(/(\d+)/)
          return { name: trimmed, number: match ? parseInt(match[1]) : null }
        }
        return null
      })
      .filter(Boolean) as Array<{ name: string; number: number | null }>
  }

  const parseManualList = (text: string) => {
    const lines = text.trim().split('\n')
    return lines
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        const match = trimmed.match(/(\d+)/)
        return { name: trimmed, number: match ? parseInt(match[1]) : null }
      })
      .filter(Boolean) as Array<{ name: string; number: number | null }>
  }

  const handleImport = async (items: Array<{ name: string; number: number | null }>) => {
    if (items.length === 0) {
      alert('No items to import')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/recommended-collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (res.ok) {
        setSeriesName('')
        setStartNumber('1')
        setEndNumber('100')
        setCsvText('')
        setManualList('')
        onOpenChange(false)
        onSuccess()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to import items'}`)
      }
    } catch (error) {
      console.error('Error importing items:', error)
      alert('Failed to import items')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    let items: Array<{ name: string; number: number | null }> = []
    if (activeTab === 'numbered') {
      if (!seriesName.trim()) {
        alert('Please enter a series name')
        return
      }
      items = generateNumberedSeries()
    } else if (activeTab === 'csv') {
      items = parseCSV(csvText)
      if (items.length === 0) {
        alert('No valid items found in CSV')
        return
      }
    } else if (activeTab === 'manual') {
      items = parseManualList(manualList)
      if (items.length === 0) {
        alert('No items found in list')
        return
      }
    }
    handleImport(items)
  }

  const getItemCount = () => {
    if (activeTab === 'numbered') {
      const start = parseInt(startNumber)
      const end = parseInt(endNumber)
      if (isNaN(start) || isNaN(end) || start > end) return 0
      return end - start + 1
    } else if (activeTab === 'csv') {
      return parseCSV(csvText).length
    } else if (activeTab === 'manual') {
      return parseManualList(manualList).length
    }
    return 0
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Bulk Import Items</CardTitle>
          <CardDescription>Add multiple items to recommended collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('numbered')}
                className={`px-4 py-2 rounded ${activeTab === 'numbered' ? 'bg-primary text-white' : 'bg-secondary'}`}
              >
                Numbered Series
              </button>
              <button
                onClick={() => setActiveTab('csv')}
                className={`px-4 py-2 rounded ${activeTab === 'csv' ? 'bg-primary text-white' : 'bg-secondary'}`}
              >
                CSV
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 rounded ${activeTab === 'manual' ? 'bg-primary text-white' : 'bg-secondary'}`}
              >
                Manual List
              </button>
            </div>

            {activeTab === 'numbered' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Series Name *</label>
                  <input
                    className="w-full px-3 py-2 border rounded"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    placeholder="e.g., Tintin, Lucky Luke"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prefix</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="#"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded"
                      value={endNumber}
                      onChange={(e) => setEndNumber(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Will create {getItemCount()} items
                </p>
              </div>
            )}

            {activeTab === 'csv' && (
              <div>
                <label className="block text-sm font-medium mb-1">CSV Data *</label>
                <textarea
                  className="w-full px-3 py-2 border rounded h-32"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="number,name or just name (one per line)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Found {getItemCount()} items
                </p>
              </div>
            )}

            {activeTab === 'manual' && (
              <div>
                <label className="block text-sm font-medium mb-1">Item Names (one per line) *</label>
                <textarea
                  className="w-full px-3 py-2 border rounded h-32"
                  value={manualList}
                  onChange={(e) => setManualList(e.target.value)}
                  placeholder="Item #1&#10;Item #2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Found {getItemCount()} items
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-6 pt-0 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || getItemCount() === 0}>
            {loading ? 'Importing...' : `Import ${getItemCount()} Items`}
          </Button>
        </div>
      </Card>
    </div>
  )
}

