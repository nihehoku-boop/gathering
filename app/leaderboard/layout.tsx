import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See top collectors on Colletro. Track progress and compare your trove with the community.',
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
