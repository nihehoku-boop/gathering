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
          // Only query database when user first logs in (user object is only present on initial login)
          // This prevents querying the database on every request
          token.id = user.id
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { isAdmin: true, isVerified: true, badge: true, accentColor: true, emailVerified: true },
            })
            token.isAdmin = dbUser?.isAdmin || false
            token.isVerified = dbUser?.isVerified || false
            token.badge = dbUser?.badge || null
            token.accentColor = dbUser?.accentColor || '#FFD60A'
            token.emailVerified = dbUser?.emailVerified || null
            
            // Log only in development to verify it's working
            if (process.env.NODE_ENV === 'development') {
              console.log('[JWT] Database query on login - this is expected')
            }
          } catch (error) {
            console.error('Error fetching admin status in JWT callback:', error)
            token.isAdmin = false
            token.isVerified = false
            token.badge = null
            token.accentColor = '#FFD60A'
            token.emailVerified = null
          }
        } else {
          // User object is NOT present - this means it's a subsequent request
          // We use cached values from the token, NO database query
          // This is the optimization that prevents unnecessary queries
          if (process.env.NODE_ENV === 'development') {
            console.log('[JWT] Using cached token values - NO database query (this is correct)')
          }
        }
        // Don't query database on every request - use cached values from token
        // Admin status changes are rare, so we cache it in the JWT token
        // If admin status needs to be updated, user should re-login or we can add a refresh endpoint
      } catch (error) {
        console.error('Error in JWT callback:', error)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.isAdmin = (token.isAdmin as boolean) || false
        session.user.isVerified = (token.isVerified as boolean) || false
        session.user.badge = (token.badge as string | null) || null
        session.user.accentColor = (token.accentColor as string) || '#FFD60A'
        session.user.emailVerified = token.emailVerified as Date | null | undefined
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - session is updated if accessed within this time
  },
  secret: process.env.NEXTAUTH_SECRET,
}

