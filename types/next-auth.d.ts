import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      isAdmin?: boolean
      isVerified?: boolean
      badge?: string | null
      accentColor?: string
      emailVerified?: Date | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    isAdmin?: boolean
    isVerified?: boolean
    badge?: string | null
    accentColor?: string
    emailVerified?: Date | null
  }
}

