import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Terms of Service - Sammlerei',
  description: 'Terms of Service for Sammlerei collection management platform',
}

export default function TermsPage() {
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
            <h1 className="text-4xl font-semibold text-[#fafafa] mb-2">Terms of Service</h1>
            <p className="text-[#969696]">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-[#fafafa]">
            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#969696] leading-relaxed">
                By accessing and using Sammlerei ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">2. Description of Service</h2>
              <p className="text-[#969696] leading-relaxed">
                Sammlerei is a collection management platform that allows users to organize, track, and manage their personal collections. The Service includes features such as collection creation, item tracking, community sharing, and profile customization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">3. User Accounts</h2>
              <div className="text-[#969696] leading-relaxed space-y-3">
                <p>3.1. You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p>3.2. You are responsible for all activities that occur under your account.</p>
                <p>3.3. You must immediately notify us of any unauthorized use of your account.</p>
                <p>3.4. You must be at least 13 years old to use this Service (or the age of majority in your jurisdiction, whichever is higher).</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">4. User Content</h2>
              <div className="text-[#969696] leading-relaxed space-y-3">
                <p>4.1. You retain ownership of all content you upload to the Service.</p>
                <p>4.2. By uploading content, you grant us a license to store, display, and process your content as necessary to provide the Service.</p>
                <p>4.3. You are responsible for ensuring you have the right to upload any content you submit.</p>
                <p>4.4. You agree not to upload content that is:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Illegal, harmful, or violates any laws</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains malware, viruses, or harmful code</li>
                  <li>Is spam, abusive, or harassing</li>
                  <li>Violates privacy rights of others</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">5. Community Collections</h2>
              <div className="text-[#969696] leading-relaxed space-y-3">
                <p>5.1. Community collections are publicly visible and can be viewed by all users.</p>
                <p>5.2. You are responsible for the content you share in community collections.</p>
                <p>5.3. We reserve the right to remove or moderate community content that violates these terms.</p>
                <p>5.4. Users can report inappropriate content, which we will review and take appropriate action.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">6. Prohibited Uses</h2>
              <p className="text-[#969696] leading-relaxed mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-[#969696]">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any malicious code or malware</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">7. Intellectual Property</h2>
              <div className="text-[#969696] leading-relaxed space-y-3">
                <p>7.1. The Service and its original content, features, and functionality are owned by Sammlerei and are protected by international copyright, trademark, and other intellectual property laws.</p>
                <p>7.2. Our trademarks and trade dress may not be used without our prior written consent.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">8. Termination</h2>
              <div className="text-[#969696] leading-relaxed space-y-3">
                <p>8.1. We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service.</p>
                <p>8.2. You may delete your account at any time through your profile settings.</p>
                <p>8.3. Upon termination, your right to use the Service will immediately cease.</p>
                <p>8.4. We may delete your content after a reasonable period following account termination.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-[#969696] leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">10. Limitation of Liability</h2>
              <p className="text-[#969696] leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GATHERING SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">11. Governing Law</h2>
              <p className="text-[#969696] leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Germany, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of Germany.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">12. Changes to Terms</h2>
              <p className="text-[#969696] leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">13. Contact Information</h2>
              <p className="text-[#969696] leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through the contact information provided in your account settings or on our website.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-[#353842]">
            <p className="text-sm text-[#969696] text-center">
              By using Sammlerei, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

