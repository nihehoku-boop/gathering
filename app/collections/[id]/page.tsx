import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import CollectionDetail from '@/components/CollectionDetail'

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Handle both sync and async params (Next.js 14 vs 15+)
  const resolvedParams = await Promise.resolve(params)
  const collectionId = resolvedParams.id

  return <CollectionDetail collectionId={collectionId} />
}

