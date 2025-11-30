'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  onSuccess: () => void
}

export default function BulkImportDialog({
  open,
  onOpenChange,
  collectionId,
  onSuccess,
}: BulkImportDialogProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('numbered')

  // Numbered series options
  const [seriesName, setSeriesName] = useState('')
  const [startNumber, setStartNumber] = useState('1')
  const [endNumber, setEndNumber] = useState('100')
  const [prefix, setPrefix] = useState('#')

  // CSV import
  const [csvText, setCsvText] = useState('')

  // Manual list
  const [manualList, setManualList] = useState('')

  if (!open) return null

  const generateNumberedSeries = () => {
    const start = parseInt(startNumber)
    const end = parseInt(endNumber)
    if (isNaN(start) || isNaN(end) || start > end) return []

    const items = []
    for (let i = start; i <= end; i++) {
      items.push({
        name: `${seriesName} ${prefix}${i}`,
        number: i,
      })
    }
    return items
  }

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    return lines
      .map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        // Try to parse CSV format: number,name or just name
        const parts = trimmed.split(',').map(p => p.trim())
        if (parts.length === 2) {
          const num = parseInt(parts[0])
          return {
            name: parts[1],
            number: isNaN(num) ? null : num,
          }
        } else if (parts.length === 1) {
          // Try to extract number from name like "LTB #123" or "Book 42"
          const match = trimmed.match(/(\d+)/)
          return {
            name: trimmed,
            number: match ? parseInt(match[1]) : null,
          }
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

        // Try to extract number from name
        const match = trimmed.match(/(\d+)/)
        return {
          name: trimmed,
          number: match ? parseInt(match[1]) : null,
        }
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
      const res = await fetch('/api/items/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, items }),
      })

      if (res.ok) {
        // Reset form
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

  const previewItems = () => {
    let items: Array<{ name: string; number: number | null }> = []

    if (activeTab === 'numbered') {
      items = generateNumberedSeries().slice(0, 5)
    } else if (activeTab === 'csv') {
      items = parseCSV(csvText).slice(0, 5)
    } else if (activeTab === 'manual') {
      items = parseManualList(manualList).slice(0, 5)
    }

    return items
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
          <CardDescription>
            Add multiple items to your collection at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="numbered">Numbered Series</TabsTrigger>
              <TabsTrigger value="csv">CSV Import</TabsTrigger>
              <TabsTrigger value="manual">Manual List</TabsTrigger>
            </TabsList>

            <TabsContent value="numbered" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="seriesName">Series Name *</Label>
                <Input
                  id="seriesName"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  placeholder="e.g., Lustige Taschenbücher, Book"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="#"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startNumber">Start Number</Label>
                  <Input
                    id="startNumber"
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endNumber">End Number</Label>
                  <Input
                    id="endNumber"
                    type="number"
                    value={endNumber}
                    onChange={(e) => setEndNumber(e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Will create {getItemCount()} items: {seriesName && `${seriesName} ${prefix}${startNumber}`} to {seriesName && `${seriesName} ${prefix}${endNumber}`}
              </div>
            </TabsContent>

            <TabsContent value="csv" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="csvText">CSV Data *</Label>
                <Textarea
                  id="csvText"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Format: number,name&#10;1,LTB #1&#10;2,LTB #2&#10;Or just names (numbers will be auto-detected):&#10;LTB #1&#10;LTB #2"
                  rows={10}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Found {getItemCount()} items. Format: number,name or just name (one per line)
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="manualList">Item Names (one per line) *</Label>
                <Textarea
                  id="manualList"
                  value={manualList}
                  onChange={(e) => setManualList(e.target.value)}
                  placeholder="LTB #1&#10;LTB #2&#10;LTB #3&#10;..."
                  rows={10}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Found {getItemCount()} items. Numbers will be auto-detected from names.
              </div>
            </TabsContent>
          </Tabs>

          {getItemCount() > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="text-sm font-medium mb-2">Preview (first 5 items):</div>
              <ul className="text-sm space-y-1">
                {previewItems().map((item, idx) => (
                  <li key={idx}>
                    {item.number && `#${item.number} - `}
                    {item.name}
                  </li>
                ))}
                {getItemCount() > 5 && (
                  <li className="text-muted-foreground">... and {getItemCount() - 5} more</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || getItemCount() === 0}>
            {loading ? 'Importing...' : `Import ${getItemCount()} Items`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}



