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

interface CreateRecommendedItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  onSuccess: () => void
}

export default function CreateRecommendedItemDialog({
  open,
  onOpenChange,
  collectionId,
  onSuccess,
}: CreateRecommendedItemDialogProps) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Item name is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/recommended-collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            name: name.trim(),
            number: number ? parseInt(number) : null,
            notes: notes.trim() || null,
            image: image.trim() || null,
          }],
        }),
      })

      if (res.ok) {
        setName('')
        setNumber('')
        setNotes('')
        setImage('')
        onOpenChange(false)
        onSuccess()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to create item'}`)
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[#1a1d24] border-[#2a2d35]">
        <CardHeader>
          <CardTitle className="text-[#fafafa]">Add Item</CardTitle>
          <CardDescription className="text-[#969696]">
            Add a new item to this recommended collection
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#fafafa]">Item Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tintin in America"
                required
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number" className="text-[#fafafa]">Number</Label>
              <Input
                id="number"
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g., 1, 2, 3"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[#fafafa]">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this item"
                rows={3}
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-[#fafafa]">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
              />
              {image && (
                <div className="mt-2">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded border border-[#2a2d35]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="accent-button text-white smooth-transition"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}



