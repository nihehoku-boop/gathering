import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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
  // Don't try to get accent color server-side - let client-side component handle it
  // This avoids hydration mismatches and ensures we always get the latest value
  const defaultAccentColor = '#FFD60A'
  const defaultAccentColorHover = adjustBrightness(defaultAccentColor, -20)

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Set default values - AccentColorLoader will update them after hydration
                const accentColor = '${defaultAccentColor}';
                const accentColorHover = '${defaultAccentColorHover}';
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

