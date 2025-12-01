import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage-grotesque',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Gathering - Your Collection Manager',
  description: 'Track and manage your collections with ease',
}

const adjustBrightness = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const accentColor = (session?.user as any)?.accentColor || '#FFD60A'
  const accentColorHover = adjustBrightness(accentColor, -20)

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const accentColor = '${accentColor}';
                const accentColorHover = '${accentColorHover}';
                document.documentElement.style.setProperty('--accent-color', accentColor);
                document.documentElement.style.setProperty('--accent-color-hover', accentColorHover);
              })();
            `,
          }}
        />
      </head>
      <body className={`${bricolageGrotesque.variable} ${bricolageGrotesque.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

