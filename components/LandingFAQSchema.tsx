/**
 * FAQPage structured data for the landing page FAQ section.
 * Helps Google show FAQ rich results and improves SEO for the homepage.
 */
export default function LandingFAQSchema() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Colletro really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Colletro is completely free to use. You can create unlimited collections, add as many items as you want, and enjoy all the core features without paying a cent.',
        },
      },
      {
        '@type': 'Question',
        name: 'What kinds of collections can I track?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Books, comics, trading cards, vinyl records, movies, video games, collectibles, artwork — if you collect it, you can track it. We have templates for popular types plus custom fields.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I share my collections with others?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can share via private links or with the community. You control what is public and what stays private.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if I want to export my data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can export your collections as CSV anytime. Your data belongs to you.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you have a mobile app?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not yet. Colletro works great on mobile browsers and is fully responsive.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do you keep my data safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We use industry-standard encryption, secure authentication, and regular backups. Your collections are private by default.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}
