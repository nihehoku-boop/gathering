import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Collections',
  description: 'Browse and discover collections shared by the Colletro community. Find books, comics, films, and more.',
}

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
