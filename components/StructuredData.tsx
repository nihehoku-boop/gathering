/**
 * Structured Data (JSON-LD) for SEO
 * Provides schema.org markup for better search engine understanding
 */

export default function StructuredData() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://gathering-jade.vercel.app'
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Colletro',
    url: baseUrl,
    description: 'Build your trove. Catalog books, comics, movies, and cards — with tags, editions, and wishlists.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/community?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Colletro',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    description: 'A modern platform for managing your collections',
    sameAs: [], // Add social media links here when available
  }

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Colletro',
    url: baseUrl,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    description: 'Collection management platform for tracking books, comics, movies, cards, and more',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
    </>
  )
}

