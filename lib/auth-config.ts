import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id
          // Fetch admin status from database
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { isAdmin: true, badge: true, accentColor: true },
            })
            token.isAdmin = dbUser?.isAdmin || false
            token.badge = dbUser?.badge || null
            token.accentColor = dbUser?.accentColor || '#FFD60A'
          } catch (error) {
            console.error('Error fetching admin status in JWT callback:', error)
            token.isAdmin = false
          }
        } else if (token.id) {
          // Refresh admin status on each token check
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { isAdmin: true, badge: true, accentColor: true },
            })
            token.isAdmin = dbUser?.isAdmin || false
            token.badge = dbUser?.badge || null
            token.accentColor = dbUser?.accentColor || '#FFD60A'
          } catch (error) {
            console.error('Error refreshing admin status in JWT callback:', error)
            // Keep existing admin status if query fails
          }
        }
      } catch (error) {
        console.error('Error in JWT callback:', error)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.isAdmin = (token.isAdmin as boolean) || false
        session.user.badge = (token.badge as string | null) || null
        session.user.accentColor = (token.accentColor as string) || '#FFD60A'
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

