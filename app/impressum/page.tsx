import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Impressum - Colletro',
  description: 'Legal notice and provider information for Colletro',
}

export default function ImpressumPage() {
  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="mb-8">
            <Link href="/">
              <Button
                variant="ghost"
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-4xl font-semibold text-[#fafafa] mb-2">Impressum</h1>
            <p className="text-[#969696]">Legal notice / Angaben gemäß § 5 TMG</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-[#fafafa]">
            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">Provider / Responsible for content</h2>
              <p className="text-[#969696] leading-relaxed">
                <strong className="text-[#fafafa]">Nico Hennecke</strong>
                <br />
                Email: <a href="mailto:nico@hennecke.email" className="text-[var(--accent-color)] hover:underline">nico@hennecke.email</a>
              </p>
              <p className="text-[#969696] leading-relaxed mt-3">
                Full postal address can be provided on request. Please contact us at the email address above if you need it for legal or data protection purposes.
              </p>
              <p className="text-[#969696] text-sm mt-2 italic">
                Die vollständige Postanschrift kann bei Bedarf angefragt werden. Bitte kontaktieren Sie uns unter der oben genannten E-Mail-Adresse, wenn Sie diese für rechtliche oder datenschutzrechtliche Zwecke benötigen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">Contact for data protection</h2>
              <p className="text-[#969696] leading-relaxed">
                For questions about data protection, to exercise your rights (access, rectification, erasure, etc.), or to contact our data protection contact, please use:{' '}
                <a href="mailto:nico@hennecke.email" className="text-[var(--accent-color)] hover:underline">nico@hennecke.email</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">Disclaimer / Haftungsausschluss</h2>
              <p className="text-[#969696] leading-relaxed">
                The contents of this website were created with care. We do not guarantee that the content is complete, correct, or up to date. As a service provider we are responsible for our own content on these pages; we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">Links</h2>
              <p className="text-[#969696] leading-relaxed">
                Our site may contain links to external websites. We have no influence over their content and do not adopt it. The respective provider is responsible for the content of linked pages.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-[#353842]">
            <p className="text-sm text-[#969696]">
              <Link href="/privacy" className="text-[var(--accent-color)] hover:underline">Privacy Policy</Link>
              {' · '}
              <Link href="/cookies" className="text-[var(--accent-color)] hover:underline">Cookie Policy</Link>
              {' · '}
              <Link href="/terms" className="text-[var(--accent-color)] hover:underline">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
