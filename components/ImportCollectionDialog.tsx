'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, FileJson, Loader2, Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAlert } from '@/hooks/useAlert'
import AlertDialog from './ui/alert-dialog'
import CSVImportConfigDialog from './CSVImportConfigDialog'

interface ImportCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ImportCollectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportCollectionDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<'json' | 'csv' | 'auto'>('auto')
  const [uploading, setUploading] = useState(false)
  const [showCSVConfig, setShowCSVConfig] = useState(false)
  const [csvData, setCsvData] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { alertDialog, showAlert, closeAlert } = useAlert()

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []
    
    // Try to detect if it's a header row
    const firstLine = lines[0]
    const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    
    // Check if first line looks like headers (contains common field names)
    const headerKeywords = ['name', 'title', 'number', 'num', 'image', 'notes', 'description']
    const isHeaderRow = headers.some(h => headerKeywords.some(k => h.toLowerCase().includes(k)))
    
    const dataStartIndex = isHeaderRow ? 1 : 0
    const actualHeaders = isHeaderRow ? headers : headers.map((_, i) => `Column ${i + 1}`)
    
    const rows: any[] = []
    for (let i = dataStartIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const row: any = {}
      actualHeaders.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      rows.push(row)
    }
    
    return rows
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-detect format
      const detectedFormat = format === 'auto' 
        ? (selectedFile.name.endsWith('.json') ? 'json' : 'csv')
        : format
      
      if (detectedFormat === 'csv' || selectedFile.name.endsWith('.csv')) {
        // Parse CSV and show config dialog
        try {
          const text = await selectedFile.text()
          const parsed = parseCSV(text)
          if (parsed.length > 0) {
            setCsvData(parsed)
            setShowCSVConfig(true)
            setFormat('csv')
          } else {
            showAlert({
              title: 'Invalid CSV',
              message: 'The CSV file appears to be empty or invalid.',
              type: 'error',
            })
          }
        } catch (error) {
          showAlert({
            title: 'Error Reading CSV',
            message: 'Failed to read the CSV file. Please check the file format.',
            type: 'error',
          })
        }
      } else {
        setFormat('json')
      }
    }
  }

  const handleCSVImport = async (config: {
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
  }) => {
    setUploading(true)
    try {
      // Create collection with items from CSV config
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.collectionName,
          description: config.description || null,
          category: config.category || null,
          tags: config.tags,
          coverImage: config.coverImage || null,
          items: config.previewItems,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create collection')
      }

      const data = await res.json()
      
      showAlert({
        title: 'Import Successful!',
        message: `Successfully imported collection "${config.collectionName}" with ${config.previewItems.length} items.`,
        type: 'success',
      })

      // Reset form
      setFile(null)
      setFormat('auto')
      setCsvData([])
      setShowCSVConfig(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Import error:', error)
      showAlert({
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Failed to import collection.',
        type: 'error',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (!file) {
      showAlert({
        title: 'No File Selected',
        message: 'Please select a file to import.',
        type: 'error',
      })
      return
    }

    // CSV files should use the config dialog
    if (format === 'csv' || file.name.endsWith('.csv')) {
      // This should have been handled in handleFileSelect
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('format', 'json')

      const res = await fetch('/api/collections/import', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        let errorMessage = 'Import failed'
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorData.details || `Import failed with status ${res.status}`
          console.error('Import API error:', errorData)
        } catch (e) {
          errorMessage = `Import failed with status ${res.status}`
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      
      showAlert({
        title: 'Import Successful!',
        message: `Successfully imported ${data.count} collection(s) with ${data.totalItems} total items.`,
        type: 'success',
      })

      // Reset form
      setFile(null)
      setFormat('auto')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Import error:', error)
      showAlert({
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Failed to import collections. Please check the file format.',
        type: 'error',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-semibold text-[var(--text-primary)]">Import Collections</CardTitle>
                <CardDescription className="text-[var(--text-secondary)] mt-2">
                  Import collections from a previously exported JSON or CSV file
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">Select File</label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                {file && (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 flex-1 bg-[#2a2d35] px-3 py-2 rounded border border-[#353842]">
                      {file.name.endsWith('.json') ? (
                        <FileJson className="h-4 w-4 text-[var(--accent-color)]" />
                      ) : (
                        <FileText className="h-4 w-4 text-[var(--accent-color)]" />
                      )}
                      <span className="text-sm text-[var(--text-primary)] truncate">{file.name}</span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={uploading}
                      className="text-[#FF3B30] hover:text-[#C0392B] hover:bg-[#2a2d35]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">File Format</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={format === 'auto' ? 'default' : 'outline'}
                  onClick={() => setFormat('auto')}
                  disabled={uploading}
                  className={format === 'auto' ? 'accent-button' : 'border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35]'}
                >
                  Auto-detect
                </Button>
                <Button
                  type="button"
                  variant={format === 'json' ? 'default' : 'outline'}
                  onClick={() => setFormat('json')}
                  disabled={uploading}
                  className={format === 'json' ? 'accent-button' : 'border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35]'}
                >
                  JSON
                </Button>
                <Button
                  type="button"
                  variant={format === 'csv' ? 'default' : 'outline'}
                  onClick={() => setFormat('csv')}
                  disabled={uploading}
                  className={format === 'csv' ? 'accent-button' : 'border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35]'}
                >
                  CSV
                </Button>
              </div>
            </div>

            <div className="bg-[#2a2d35] border border-[#353842] rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">Supported Formats:</p>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                <li>JSON files exported from Gathering</li>
                <li>CSV files exported from Gathering</li>
                <li>Files must match the export format structure</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="border-[#353842] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || uploading || (format === 'csv')}
              className="accent-button text-white smooth-transition"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {format === 'csv' ? 'Configure CSV...' : 'Import Collections'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      {showCSVConfig && csvData.length > 0 && (
        <CSVImportConfigDialog
          open={showCSVConfig}
          onOpenChange={(open) => {
            setShowCSVConfig(open)
            if (!open) {
              setCsvData([])
            }
          }}
          csvData={csvData}
          onImport={handleCSVImport}
        />
      )}
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
