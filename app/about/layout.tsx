import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Colletro — catalog books, comics, movies, and cards with tags, editions, and wishlists. Your collection trove.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
