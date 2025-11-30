import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminDashboard from '@/components/AdminDashboard'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default async function AdminPage() {
  const session = await getSession()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  // Check if user is admin - first check session, then database
  const isAdmin = session.user.isAdmin ?? false
  
  if (!isAdmin) {
    // Double-check database in case session is stale
    const userId = session.user.id
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      })
      
      if (!user?.isAdmin) {
        redirect('/')
      }
    } else {
      redirect('/auth/signin')
    }
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-5xl font-semibold text-[#fafafa] mb-3 tracking-tight">Admin Dashboard</h1>
          <p className="text-[#969696] text-lg mb-10">Manage recommended collections</p>
          <AdminDashboard />
        </div>
      </div>
    </>
  )
}

