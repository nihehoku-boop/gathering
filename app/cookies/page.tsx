import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Cookie Policy - Sammlerei',
  description: 'Cookie Policy for Sammlerei collection management platform',
}

export default function CookiesPage() {
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
            <h1 className="text-4xl font-semibold text-[#fafafa] mb-2">Cookie Policy</h1>
            <p className="text-[#969696]">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-[#fafafa]">
            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">1. What Are Cookies?</h2>
              <p className="text-[#969696] leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">2. How We Use Cookies</h2>
              <p className="text-[#969696] leading-relaxed mb-3">
                Sammlerei uses cookies for the following purposes:
              </p>
              
              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">2.1. Essential Cookies</h3>
              <p className="text-[#969696] leading-relaxed">
                These cookies are necessary for the Service to function properly. They include:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-[#969696] mt-2">
                <li><strong>Authentication:</strong> NextAuth.js session cookies to keep you logged in</li>
                <li><strong>Security:</strong> CSRF protection tokens</li>
                <li><strong>Preferences:</strong> Your accent color and theme preferences stored in localStorage</li>
              </ul>
              <p className="text-[#969696] leading-relaxed mt-3">
                These cookies cannot be disabled as they are essential for the Service to work.
              </p>

              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">2.2. Analytics Cookies</h3>
              <p className="text-[#969696] leading-relaxed">
                We use Vercel Analytics to understand how users interact with our Service. This helps us improve the user experience. These cookies collect anonymous usage data.
              </p>

              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">2.3. Performance Cookies</h3>
              <p className="text-[#969696] leading-relaxed">
                We use Vercel Speed Insights to monitor performance and identify areas for optimization. These cookies help us ensure the Service loads quickly and efficiently.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">3. Third-Party Cookies</h2>
              <p className="text-[#969696] leading-relaxed mb-3">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#969696]">
                <li><strong>Vercel Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Cloudinary:</strong> For image hosting and optimization (may set cookies for image delivery)</li>
              </ul>
              <p className="text-[#969696] leading-relaxed mt-3">
                These third parties have their own privacy policies and cookie practices. We encourage you to review their policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">4. Managing Cookies</h2>
              <p className="text-[#969696] leading-relaxed mb-3">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#969696]">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies, and delete cookies. However, blocking essential cookies may affect the functionality of the Service.</li>
                <li><strong>Browser Extensions:</strong> You can use browser extensions to manage cookies.</li>
                <li><strong>Do Not Track:</strong> Some browsers have a "Do Not Track" feature. We respect this setting where technically feasible.</li>
              </ul>
              <p className="text-[#969696] leading-relaxed mt-3">
                <strong>Note:</strong> Disabling essential cookies will prevent you from using certain features of the Service, including staying logged in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">5. Local Storage</h2>
              <p className="text-[#969696] leading-relaxed">
                In addition to cookies, we use browser local storage to store your preferences (such as accent color) on your device. This data is stored locally and is not transmitted to our servers except as part of your user profile when you save your settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">6. Changes to This Cookie Policy</h2>
              <p className="text-[#969696] leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">7. Contact Us</h2>
              <p className="text-[#969696] leading-relaxed">
                If you have any questions about our use of cookies, please contact us through the contact information provided in your account settings or on our website.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-[#353842]">
            <p className="text-sm text-[#969696] text-center">
              For more information about how we handle your personal data, please see our <Link href="/privacy" className="text-[var(--accent-color)] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

