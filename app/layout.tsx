import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage-grotesque',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
  adjustFontFallback: true,
})

// Helper to safely create URL
const getMetadataBase = (): URL => {
  const url = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
  try {
    // If URL doesn't have protocol, add https
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
    return new URL(urlWithProtocol)
  } catch {
    return new URL('https://gathering-jade.vercel.app')
  }
}

export const metadata: Metadata = {
  title: 'Gathering - Your Collection Manager',
  description: 'Track and manage your collections with ease. Organize comics, cards, books, and more. Discover community collections and track your progress.',
  metadataBase: getMetadataBase(),
  keywords: ['collection', 'collector', 'collections', 'tracking', 'organize', 'comics', 'cards', 'books', 'collectibles'],
  authors: [{ name: 'Gathering' }],
  creator: 'Gathering',
  publisher: 'Gathering',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Gathering',
    title: 'Gathering - Your Collection Manager',
    description: 'Track and manage your collections with ease. Organize comics, cards, books, and more.',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'Gathering - Collection Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gathering - Your Collection Manager',
    description: 'Track and manage your collections with ease',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resource hints for faster external resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://assets.tcgdex.net" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Inline critical script for accent color and theme - optimized */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Apply theme immediately to prevent flash
                let t='dark';
                try{t=localStorage.getItem('themeMode')||'dark'}catch(e){}
                if(t==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}
                
                // Apply accent color
                let c='${defaultAccentColor}';
                try{c=localStorage.getItem('accentColor')||c}catch(e){}
                const a=(c,p)=>{const n=parseInt(c.replace('#',''),16),m=Math.round(2.55*p),R=Math.max(0,Math.min(255,(n>>16)+m)),G=Math.max(0,Math.min(255,((n>>8)&0xFF)+m)),B=Math.max(0,Math.min(255,(n&0xFF)+m));return'#'+(0x1000000+R*0x10000+G*0x100+B).toString(16).slice(1)};
                const h=(h)=>{const n=h.replace('#',''),r=parseInt(n.substring(0,2),16)/255,g=parseInt(n.substring(2,4),16)/255,b=parseInt(n.substring(4,6),16)/255,m=Math.max(r,g,b),i=Math.min(r,g,b),l=(m+i)/2;let s=0,d=0;if(m!==i){d=m-i;s=l>0.5?d/(2-m-i):d/(m+i);switch(m){case r:d=((g-b)/d+(g<b?6:0))/6;break;case g:d=((b-r)/d+2)/6;break;case b:d=((r-g)/d+4)/6;break}}return Math.round(d*360)+' '+Math.round(s*100)+'% '+Math.round(l*100)+'%'};
                document.documentElement.style.setProperty('--accent-color',c);
                document.documentElement.style.setProperty('--accent-color-hover',a(c,-20));
                document.documentElement.style.setProperty('--ring',h(c));
              })();
            `,
          }}
        />
      </head>
      <body className={`${bricolageGrotesque.variable} ${bricolageGrotesque.className} antialiased`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}

