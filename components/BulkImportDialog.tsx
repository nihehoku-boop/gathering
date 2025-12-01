'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { getTemplateFields } from '@/lib/item-templates'

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionTemplate?: string | null
  customFieldDefinitions?: string | null
  onSuccess: () => void
}

export default function BulkImportDialog({
  open,
  onOpenChange,
  collectionId,
  collectionTemplate,
  customFieldDefinitions,
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
  const [csvDelimiter, setCsvDelimiter] = useState(',')
  const [csvSkipHeader, setCsvSkipHeader] = useState(false)
  const [csvNumberPattern, setCsvNumberPattern] = useState('auto') // 'auto', 'first', 'last', 'extract'
  const [csvTrimWhitespace, setCsvTrimWhitespace] = useState(true)
  const [csvColumnMapping, setCsvColumnMapping] = useState<Record<number, string>>({}) // Maps column index to field ID
  const [csvDetectedColumns, setCsvDetectedColumns] = useState<string[]>([]) // Detected column headers/indices

  // Manual list
  const [manualList, setManualList] = useState('')

  // Get available template fields
  const templateFields = useMemo(() => {
    const fields: Array<{ id: string; label: string; type: string }> = []
    
    // Add template fields
    if (collectionTemplate) {
      const templateFieldsList = getTemplateFields(collectionTemplate)
      fields.push(...templateFieldsList.map(f => ({ id: f.id, label: f.label, type: f.type })))
    }
    
    // Add custom fields
    if (customFieldDefinitions) {
      try {
        const parsed = typeof customFieldDefinitions === 'string'
          ? JSON.parse(customFieldDefinitions)
          : customFieldDefinitions
        if (Array.isArray(parsed)) {
          fields.push(...parsed.map((f: any) => ({ id: f.id || f.name, label: f.label || f.name, type: f.type || 'text' })))
        }
      } catch (e) {
        console.error('Error parsing custom field definitions:', e)
      }
    }
    
    return fields
  }, [collectionTemplate, customFieldDefinitions])

  // Detect CSV columns when text changes
  useEffect(() => {
    if (activeTab === 'csv' && csvText.trim()) {
      const lines = csvText.trim().split('\n')
      const firstLine = lines.length > 0 ? lines[0] : ''
      if (firstLine) {
        const delimiterMap: Record<string, string> = {
          ',': ',',
          ';': ';',
          '\t': '\t',
          '|': '|',
          'tab': '\t',
          'semicolon': ';',
          'pipe': '|',
        }
        const delimiter = delimiterMap[csvDelimiter] || ','
        const parts = firstLine.split(delimiter).map(p => csvTrimWhitespace ? p.trim() : p)
        setCsvDetectedColumns(parts)
        
        // Auto-map columns if header row exists
        if (csvSkipHeader && parts.length > 0) {
          const autoMapping: Record<number, string> = {}
          parts.forEach((col, index) => {
            const colLower = col.toLowerCase().trim()
            // Try to match column name to field
            const matchedField = templateFields.find(f => 
              f.label.toLowerCase() === colLower ||
              f.id.toLowerCase() === colLower ||
              f.label.toLowerCase().replace(/\s+/g, '') === colLower.replace(/\s+/g, '')
            )
            if (matchedField) {
              autoMapping[index] = matchedField.id
            }
          })
          setCsvColumnMapping(autoMapping)
        }
      }
    }
  }, [csvText, csvDelimiter, csvSkipHeader, csvTrimWhitespace, activeTab, templateFields])

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
    let lines = text.split('\n')
    
    // Skip header row if enabled
    if (csvSkipHeader && lines.length > 0) {
      lines = lines.slice(1)
    }

    // Map delimiter string to actual character
    const delimiterMap: Record<string, string> = {
      ',': ',',
      ';': ';',
      '\t': '\t',
      '|': '|',
      'tab': '\t',
      'semicolon': ';',
      'pipe': '|',
    }
    const delimiter = delimiterMap[csvDelimiter] || ','

    return lines
      .map((line, index) => {
        let trimmed = csvTrimWhitespace ? line.trim() : line
        if (!trimmed) return null

        // Split by delimiter
        const parts = trimmed.split(delimiter).map(p => csvTrimWhitespace ? p.trim() : p)
        
        if (parts.length >= 2) {
          // Multiple columns - determine which is number and which is name
          let number: number | null = null
          let name: string = ''
          let numberColumnIndex: number | null = null

          // First, determine number column
          if (csvNumberPattern === 'first') {
            // First column is number
            const num = parseInt(parts[0])
            number = isNaN(num) ? null : num
            numberColumnIndex = 0
          } else if (csvNumberPattern === 'last') {
            // Last column is number
            const num = parseInt(parts[parts.length - 1])
            number = isNaN(num) ? null : num
            numberColumnIndex = parts.length - 1
          } else {
            // Auto-detect: try first column as number
            const firstNum = parseInt(parts[0])
            if (!isNaN(firstNum)) {
              number = firstNum
              numberColumnIndex = 0
            } else {
              // Try to extract number from any column
              const fullText = parts.join(' ')
              const match = fullText.match(/(\d+)/)
              number = match ? parseInt(match[1]) : null
            }
          }

          // Extract custom fields based on column mapping
          const customFields: Record<string, any> = {}
          const nameParts: string[] = []

          parts.forEach((part, colIndex) => {
            const fieldId = csvColumnMapping[colIndex]
            if (fieldId && part) {
              // This column is mapped to a custom field
              customFields[fieldId] = part
            } else if (colIndex !== numberColumnIndex && part) {
              // This column is not mapped and not the number column - it's part of the name
              nameParts.push(part)
            }
          })

          // If no name parts were collected, use all non-number, non-mapped columns
          if (nameParts.length === 0) {
            parts.forEach((part, colIndex) => {
              if (colIndex !== numberColumnIndex && !csvColumnMapping[colIndex] && part) {
                nameParts.push(part)
              }
            })
          }

          name = nameParts.join(delimiter) || trimmed

          return {
            name: name || trimmed,
            number,
            customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
          }
        } else if (parts.length === 1) {
          // Single column - try to extract number from name
          let number: number | null = null
          
          if (csvNumberPattern === 'extract' || csvNumberPattern === 'auto') {
            // Try multiple patterns to extract number
            const patterns = [
              /#(\d+)/,           // #123
              /No\.?\s*(\d+)/i,   // No. 123 or No 123
              /Nr\.?\s*(\d+)/i,   // Nr. 123 or Nr 123
              /(\d+)/,            // Any number
            ]
            
            for (const pattern of patterns) {
              const match = trimmed.match(pattern)
              if (match) {
                number = parseInt(match[1])
                break
              }
            }
          }

          return {
            name: trimmed,
            number,
          }
        }
        return null
      })
      .filter(Boolean) as Array<{ name: string; number: number | null; customFields?: Record<string, any> }>
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

  const handleImport = async (items: Array<{ name: string; number: number | null; customFields?: Record<string, any> }>) => {
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
        setCsvDelimiter(',')
        setCsvSkipHeader(false)
        setCsvNumberPattern('auto')
        setCsvTrimWhitespace(true)
        setCsvColumnMapping({})
        setCsvDetectedColumns([])
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
    let items: Array<{ name: string; number: number | null; customFields?: Record<string, any> }> = []

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
    let items: Array<{ name: string; number: number | null; customFields?: Record<string, any> }> = []

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
                  placeholder="Format examples:&#10;number,name&#10;1,LTB #1&#10;2,LTB #2&#10;&#10;Or just names:&#10;LTB #1&#10;LTB #2&#10;&#10;Supports comma, semicolon, tab, or pipe delimiters"
                  rows={10}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="csvDelimiter">Field Delimiter</Label>
                  <select
                    id="csvDelimiter"
                    value={csvDelimiter}
                    onChange={(e) => setCsvDelimiter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="csvNumberPattern">Number Detection</Label>
                  <select
                    id="csvNumberPattern"
                    value={csvNumberPattern}
                    onChange={(e) => setCsvNumberPattern(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="first">First column is number</option>
                    <option value="last">Last column is number</option>
                    <option value="extract">Extract from name</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={csvSkipHeader}
                    onChange={(e) => setCsvSkipHeader(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Skip first row (header)</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={csvTrimWhitespace}
                    onChange={(e) => setCsvTrimWhitespace(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Trim whitespace</span>
                </label>
              </div>

              {csvDetectedColumns.length > 0 && templateFields.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <Label>Map CSV Columns to Fields</Label>
                  <div className="text-xs text-muted-foreground mb-2">
                    Map each CSV column to a template field. Leave unmapped to ignore.
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {csvDetectedColumns.map((col, index) => {
                      // Determine if this column is used for name/number
                      let isNameOrNumber = false
                      if (csvNumberPattern === 'first' && index === 0) {
                        isNameOrNumber = true
                      } else if (csvNumberPattern === 'last' && index === csvDetectedColumns.length - 1) {
                        isNameOrNumber = true
                      } else if (csvNumberPattern === 'auto') {
                        const firstNum = parseInt(csvDetectedColumns[0])
                        if (!isNaN(firstNum) && index === 0) {
                          isNameOrNumber = true
                        }
                      }
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 text-sm">
                            <span className="font-medium">Column {index + 1}:</span>
                            <span className="text-muted-foreground ml-1">
                              {csvSkipHeader ? `"${col}"` : `(data)`}
                            </span>
                            {isNameOrNumber && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (used for {index === 0 && csvNumberPattern !== 'last' ? 'number' : 'name'})
                              </span>
                            )}
                          </div>
                          {!isNameOrNumber && (
                            <select
                              value={csvColumnMapping[index] || ''}
                              onChange={(e) => {
                                const newMapping = { ...csvColumnMapping }
                                if (e.target.value) {
                                  newMapping[index] = e.target.value
                                } else {
                                  delete newMapping[index]
                                }
                                setCsvColumnMapping(newMapping)
                              }}
                              className="flex-1 px-2 py-1 text-sm bg-background border border-input rounded-md"
                            >
                              <option value="">-- Ignore --</option>
                              {templateFields.map(field => (
                                <option key={field.id} value={field.id}>
                                  {field.label} ({field.type})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Found {getItemCount()} items. Supports multiple delimiters and flexible number detection.
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
                    {item.customFields && Object.keys(item.customFields).length > 0 && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({Object.entries(item.customFields).map(([key, val]) => {
                          const field = templateFields.find(f => f.id === key)
                          return `${field?.label || key}: ${val}`
                        }).join(', ')})
                      </span>
                    )}
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



