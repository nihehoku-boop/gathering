import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getFirstPageCommunityCollections } from '@/lib/community-collections-server'
import CommunityPageClient from './CommunityPageClient'

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  let initialData = null
  try {
    initialData = await getFirstPageCommunityCollections()
  } catch (e) {
    console.error('[Community] Failed to fetch initial collections:', e)
  }

  return <CommunityPageClient initialData={initialData} />
}
