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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const accentColor = localStorage.getItem('accentColor') || '#FFD60A';
                  const accentColorHover = accentColor === '#FFD60A' ? '#E6C009' : 
                    (function() {
                      const num = parseInt(accentColor.replace('#', ''), 16);
                      const amt = Math.round(2.55 * -20);
                      const R = Math.max(0, Math.min(255, (num >> 16) + amt));
                      const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
                      const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
                      return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
                    })();
                  document.documentElement.style.setProperty('--accent-color', accentColor);
                  document.documentElement.style.setProperty('--accent-color-hover', accentColorHover);
                } catch(e) {
                  // Fallback to default if localStorage fails
                  document.documentElement.style.setProperty('--accent-color', '#FFD60A');
                  document.documentElement.style.setProperty('--accent-color-hover', '#E6C009');
                }
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

