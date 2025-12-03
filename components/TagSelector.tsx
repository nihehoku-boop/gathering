'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { AVAILABLE_TAGS, getTagColor, stringifyTags, parseTags } from '@/lib/tags'

interface TagSelectorProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  label?: string
  allowCustom?: boolean
}

export default function TagSelector({ 
  selectedTags, 
  onChange, 
  label = 'Tags',
  allowCustom = true 
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customTagInput, setCustomTagInput] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setCustomTagInput('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter available tags based on search
  const filteredTags = AVAILABLE_TAGS.filter(tag => {
    const matchesSearch = tag.toLowerCase().includes(searchQuery.toLowerCase())
    const notSelected = !selectedTags.includes(tag)
    return matchesSearch && notSelected
  })

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  const addCustomTag = () => {
    const trimmed = customTagInput.trim()
    if (trimmed && !selectedTags.includes(trimmed) && trimmed.length > 0) {
      onChange([...selectedTags, trimmed])
      setCustomTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-2">
      <Label className="text-[#fafafa]">{label}</Label>
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => {
            const colors = getTagColor(tag)
            const isCustom = !AVAILABLE_TAGS.includes(tag as any)
            return (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-sm border flex items-center gap-2 smooth-transition"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderColor: colors.border,
                }}
              >
                {tag}
                {isCustom && <span className="text-xs opacity-70">(custom)</span>}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:opacity-70 smooth-transition"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-[#2a2d35] border border-[#353842] rounded-md text-[#fafafa] flex items-center justify-between hover:border-[var(--accent-color)] smooth-transition"
        >
          <span className="text-sm">
            {selectedTags.length > 0 
              ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`
              : 'Select tags...'}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[#1a1d24] border border-[#2a2d35] rounded-md shadow-lg max-h-80 overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-[#2a2d35]">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                <Input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-[#2a2d35] border-[#353842] text-[#fafafa] text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Tag List */}
            <div className="overflow-y-auto flex-1 p-2">
              {filteredTags.length > 0 ? (
                <div className="space-y-1">
                  {filteredTags.map((tag) => {
                    const colors = getTagColor(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          toggleTag(tag)
                          setSearchQuery('')
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-[#2a2d35] smooth-transition flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                          }}
                        />
                        <span className="text-[#fafafa]">{tag}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-[#666] text-sm">
                  {searchQuery ? 'No tags found' : 'All tags selected'}
                </div>
              )}
            </div>

            {/* Custom Tag Input */}
            {allowCustom && (
              <div className="p-2 border-t border-[#2a2d35]">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Create custom tag..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTag()
                      }
                    }}
                    className="flex-1 bg-[#2a2d35] border-[#353842] text-[#fafafa] text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    disabled={!customTagInput.trim() || selectedTags.includes(customTagInput.trim())}
                    className="px-3 py-2 bg-[var(--accent-color)] text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed smooth-transition flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-[#666] mt-1">
                  Press Enter or click Add to create a custom tag
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

