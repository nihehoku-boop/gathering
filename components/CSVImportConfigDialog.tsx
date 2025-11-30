'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { X, Check, AlertCircle } from 'lucide-react'

interface CSVRow {
  [key: string]: string
}

interface CSVImportConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  csvData: CSVRow[]
  onImport: (config: {
    collectionName: string
    description: string
    category: string
    tags: string[]
    coverImage: string
    columnMappings: {
      name: string
      number: string
      image: string
      notes: string
    }
    previewItems: Array<{
      name: string
      number: number | null
      image: string | null
      notes: string | null
    }>
  }) => void
}

export default function CSVImportConfigDialog({
  open,
  onOpenChange,
  csvData,
  onImport,
}: CSVImportConfigDialogProps) {
  const [collectionName, setCollectionName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  
  // Column mappings
  const [nameColumn, setNameColumn] = useState('')
  const [numberColumn, setNumberColumn] = useState('')
  const [imageColumn, setImageColumn] = useState('')
  const [notesColumn, setNotesColumn] = useState('')

  // Get available columns from CSV (memoize to prevent unnecessary recalculations)
  const availableColumns = csvData.length > 0 ? Object.keys(csvData[0]) : []

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      return
    }

    // Only auto-detect on initial open when dialog first opens with data
    if (csvData.length > 0 && availableColumns.length > 0) {
      // Auto-detect columns with more comprehensive matching
      const cols = availableColumns.map(c => c.toLowerCase().trim())
      
      // Try to find name column (more variations)
      const nameCol = availableColumns.find(c => {
        const lower = c.toLowerCase().trim()
        return [
          'name', 'title', 'item', 'item name', 'name/title', 'item name',
          'product', 'product name', 'book', 'comic', 'series', 'collection',
          'entry', 'item title', 'title/name', 'name_title', 'name-title'
        ].includes(lower)
      }) || availableColumns[0]
      
      // Try to find number column (more variations)
      const numCol = availableColumns.find(c => {
        const lower = c.toLowerCase().trim()
        return [
          'number', 'num', '#', 'no', 'nr', 'issue', 'volume', 'vol',
          'issue number', 'vol number', 'volume number', 'item number',
          'index', 'id', 'item id', 'sequence', 'order', 'position'
        ].includes(lower)
      }) || ''
      
      // Try to find image column (more variations)
      const imgCol = availableColumns.find(c => {
        const lower = c.toLowerCase().trim()
        return [
          'image', 'img', 'cover', 'cover image', 'url', 'picture', 'photo',
          'image url', 'img url', 'cover url', 'picture url', 'thumbnail',
          'thumb', 'cover image url', 'image link', 'img link', 'photo url'
        ].includes(lower)
      }) || ''
      
      // Try to find notes column (more variations)
      const notesCol = availableColumns.find(c => {
        const lower = c.toLowerCase().trim()
        return [
          'notes', 'note', 'description', 'desc', 'comment', 'comments',
          'remarks', 'details', 'info', 'information', 'summary', 'synopsis',
          'item description', 'item notes', 'item comment'
        ].includes(lower)
      }) || ''

      // Set all at once to avoid multiple renders
      setNameColumn(nameCol)
      setNumberColumn(numCol)
      setImageColumn(imgCol)
      setNotesColumn(notesCol)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]) // Only run when dialog opens/closes

  const generatePreview = () => {
    if (!nameColumn || csvData.length === 0) return []

    return csvData.slice(0, 10).map((row, index) => {
      const name = row[nameColumn] || ''
      const numberStr = numberColumn ? (row[numberColumn] || '') : ''
      
      // Try to parse number, handle various formats
      let number: number | null = null
      if (numberStr) {
        // Remove any non-numeric characters except minus sign and decimal point
        const cleaned = numberStr.toString().replace(/[^\d.-]/g, '')
        const parsed = parseFloat(cleaned)
        if (!isNaN(parsed) && isFinite(parsed)) {
          number = Math.floor(parsed) // Use integer part
        }
      }
      
      // If no number found, try to extract from name
      if (number === null && name) {
        const match = name.match(/#?\s*(\d+)/)
        if (match) {
          number = parseInt(match[1])
        }
      }
      
      const image = imageColumn ? (row[imageColumn] || '') : ''
      const notes = notesColumn ? (row[notesColumn] || '') : ''

      return {
        name: name.trim() || `Item ${index + 1}`,
        number: number,
        image: image.trim() || null,
        notes: notes.trim() || null,
      }
    }).filter(item => item.name && item.name.trim().length > 0)
  }

  const generateAllItems = () => {
    if (!nameColumn || csvData.length === 0) return []

    return csvData.map((row, index) => {
      const name = row[nameColumn] || ''
      const numberStr = numberColumn ? (row[numberColumn] || '') : ''
      
      // Try to parse number, handle various formats
      let number: number | null = null
      if (numberStr) {
        // Remove any non-numeric characters except minus sign and decimal point
        const cleaned = numberStr.toString().replace(/[^\d.-]/g, '')
        const parsed = parseFloat(cleaned)
        if (!isNaN(parsed) && isFinite(parsed)) {
          number = Math.floor(parsed) // Use integer part
        }
      }
      
      // If no number found, try to extract from name
      if (number === null && name) {
        const match = name.match(/#?\s*(\d+)/)
        if (match) {
          number = parseInt(match[1])
        }
      }
      
      const image = imageColumn ? (row[imageColumn] || '') : ''
      const notes = notesColumn ? (row[notesColumn] || '') : ''

      return {
        name: name.trim() || `Item ${index + 1}`,
        number: number,
        image: image.trim() || null,
        notes: notes.trim() || null,
      }
    }).filter(item => item.name && item.name.trim().length > 0)
  }

  const previewItems = generatePreview()
  const allItems = generateAllItems()
  
  // Validation warnings
  const emptyNameCount = allItems.filter(item => !item.name || item.name.trim().length === 0).length
  const duplicateNames = allItems.filter((item, index, self) => 
    item.name && self.findIndex(i => i.name === item.name) !== index
  ).length

  const handleImport = () => {
    if (!collectionName.trim()) {
      alert('Please enter a collection name')
      return
    }

    if (!nameColumn) {
      alert('Please select a column for item names')
      return
    }

    if (allItems.length === 0) {
      alert('No valid items found. Please check your column mappings.')
      return
    }

    if (emptyNameCount > 0) {
      const proceed = confirm(
        `Warning: ${emptyNameCount} item(s) have empty names and will be skipped. Continue?`
      )
      if (!proceed) return
    }

    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)

    // Filter out items with empty names
    const validItems = allItems.filter(item => item.name && item.name.trim().length > 0)

    onImport({
      collectionName: collectionName.trim(),
      description: description.trim() || '',
      category: category.trim() || '',
      tags: tagArray,
      coverImage: coverImage.trim() || '',
      columnMappings: {
        name: nameColumn,
        number: numberColumn,
        image: imageColumn,
        notes: notesColumn,
      },
      previewItems: validItems,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1d24] border-[#2a2d35]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#fafafa]">Configure CSV Import</CardTitle>
              <CardDescription className="text-[#969696]">
                Map CSV columns and set collection information
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-[#969696] hover:text-[#fafafa]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Collection Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#fafafa]">Collection Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="csv-collection-name" className="text-[#fafafa]">
                Collection Name <span className="text-[#FF3B30]">*</span>
              </Label>
              <Input
                id="csv-collection-name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Enter collection name"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-description" className="text-[#fafafa]">Description</Label>
              <Input
                id="csv-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter collection description"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="csv-category" className="text-[#fafafa]">Category</Label>
                <Input
                  id="csv-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Comics, Books"
                  className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-tags" className="text-[#fafafa]">Tags</Label>
                <Input
                  id="csv-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-cover-image" className="text-[#fafafa]">Cover Image URL</Label>
              <Input
                id="csv-cover-image"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
              />
            </div>
          </div>

          {/* Column Mappings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#fafafa]">Column Mappings</h3>
            <p className="text-sm text-[#969696]">
              Select which CSV columns correspond to each field. Found {csvData.length} rows with {availableColumns.length} columns.
            </p>
            {availableColumns.length > 0 && (
              <div className="text-xs text-[#666] bg-[#2a2d35] p-2 rounded border border-[#353842]">
                <strong>Available columns:</strong> {availableColumns.join(', ')}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-column" className="text-[#fafafa]">
                  Item Name Column <span className="text-[#FF3B30]">*</span>
                </Label>
                <select
                  id="name-column"
                  value={nameColumn}
                  onChange={(e) => setNameColumn(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-[#353842] text-[#fafafa] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none"
                >
                  <option value="">Select column...</option>
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="number-column" className="text-[#fafafa]">Number Column</Label>
                <select
                  id="number-column"
                  value={numberColumn}
                  onChange={(e) => setNumberColumn(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-[#353842] text-[#fafafa] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none"
                >
                  <option value="">None</option>
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-column" className="text-[#fafafa]">Image Column</Label>
                <select
                  id="image-column"
                  value={imageColumn}
                  onChange={(e) => setImageColumn(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-[#353842] text-[#fafafa] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none"
                >
                  <option value="">None</option>
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes-column" className="text-[#fafafa]">Notes Column</Label>
                <select
                  id="notes-column"
                  value={notesColumn}
                  onChange={(e) => setNotesColumn(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-[#353842] text-[#fafafa] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none"
                >
                  <option value="">None</option>
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          {previewItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#fafafa]">Preview</h3>
                <span className="text-sm text-[#969696]">
                  Showing first 10 of {allItems.length} items
                </span>
              </div>
              <div className="bg-[#2a2d35] rounded-lg border border-[#353842] p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {previewItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-[#1a1d24] rounded border border-[#353842]"
                    >
                      {item.number !== null && (
                        <span className="text-xs text-[#969696] min-w-[3rem]">#{item.number}</span>
                      )}
                      <span className="text-sm text-[#fafafa] flex-1">{item.name}</span>
                      {item.image && (
                        <span className="text-xs text-[#666] truncate max-w-[100px]" title={item.image}>
                          📷
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          <div className="space-y-2">
            {!nameColumn && (
              <div className="flex items-center gap-2 p-3 bg-[#FF3B30]/10 border border-[#FF3B30] rounded-lg">
                <AlertCircle className="h-4 w-4 text-[#FF3B30]" />
                <span className="text-sm text-[#FF3B30]">
                  Please select a column for item names
                </span>
              </div>
            )}
            {nameColumn && emptyNameCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-[#FF9500]/10 border border-[#FF9500] rounded-lg">
                <AlertCircle className="h-4 w-4 text-[#FF9500]" />
                <span className="text-sm text-[#FF9500]">
                  Warning: {emptyNameCount} item(s) have empty names and will be skipped
                </span>
              </div>
            )}
            {nameColumn && duplicateNames > 0 && (
              <div className="flex items-center gap-2 p-3 bg-[#FF9500]/10 border border-[#FF9500] rounded-lg">
                <AlertCircle className="h-4 w-4 text-[#FF9500]" />
                <span className="text-sm text-[#FF9500]">
                  Note: {duplicateNames} duplicate item name(s) found (this is allowed)
                </span>
              </div>
            )}
            {nameColumn && allItems.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-[#FF3B30]/10 border border-[#FF3B30] rounded-lg">
                <AlertCircle className="h-4 w-4 text-[#FF3B30]" />
                <span className="text-sm text-[#FF3B30]">
                  No valid items found. Please check your column mappings.
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#2a2d35]">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!collectionName.trim() || !nameColumn}
              className="accent-button text-white smooth-transition rounded-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Import {allItems.length} Items
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

