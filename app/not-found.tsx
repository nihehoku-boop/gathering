import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-semibold text-[var(--text-primary)] mb-4 tracking-tight">404</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-lg">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white smooth-transition">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  )
}

