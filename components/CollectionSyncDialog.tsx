'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface CollectionSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isCustomized: boolean
  onConfirm: (preserveCustomizations: boolean) => void
  loading: boolean
}

export default function CollectionSyncDialog({
  open,
  onOpenChange,
  isCustomized,
  onConfirm,
  loading,
}: CollectionSyncDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[#007AFF]" />
            Update Collection
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            {isCustomized
              ? 'This collection has been customized. Choose how to update it.'
              : 'An update is available for this collection.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCustomized && (
            <div className="bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#FF9500] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#FF9500]">
                    Customizations Detected
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    You've made changes to this collection (name, description, items, etc.). 
                    Updating will overwrite your customizations unless you choose to preserve them.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-primary)]">
              {isCustomized
                ? 'How would you like to update?'
                : 'Update this collection with the latest changes from the recommended collection?'}
            </p>
            {isCustomized && (
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p>• <strong className="text-[var(--text-primary)]">Full Update:</strong> Replace everything with the latest version</p>
                <p>• <strong className="text-[var(--text-primary)]">Preserve Customizations:</strong> Keep your changes and only add new items</p>
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
            className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
          >
            Cancel
          </Button>
          {isCustomized ? (
            <>
              <Button
                type="button"
                onClick={() => onConfirm(false)}
                disabled={loading}
                className="bg-[#FF3B30] hover:bg-[#D32F2F] text-white smooth-transition"
              >
                {loading ? 'Updating...' : 'Full Update'}
              </Button>
              <Button
                type="button"
                onClick={() => onConfirm(true)}
                disabled={loading}
                className="accent-button text-white smooth-transition"
              >
                {loading ? 'Updating...' : 'Preserve Customizations'}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => onConfirm(false)}
              disabled={loading}
              className="accent-button text-white smooth-transition"
            >
              {loading ? 'Updating...' : 'Update Collection'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}



