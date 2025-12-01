import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1114] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-semibold text-[#fafafa] mb-4 tracking-tight">404</h1>
        <p className="text-[#969696] mb-8 text-lg">
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

