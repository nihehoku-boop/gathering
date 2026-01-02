import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Privacy Policy - Colletro',
  description: 'Privacy Policy for Colletro collection management platform - GDPR compliant',
}

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-semibold text-[#fafafa] mb-2">Privacy Policy</h1>
            <p className="text-[#969696]">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm text-[#969696] mt-2 italic">
              This Privacy Policy complies with the General Data Protection Regulation (GDPR) and German data protection laws.
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-[#fafafa]">
            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">1. Introduction</h2>
              <p className="text-[#969696] leading-relaxed">
                Colletro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our collection management platform.
              </p>
              <p className="text-[#969696] leading-relaxed mt-3">
                <strong>Data Controller:</strong> The data controller for the purposes of GDPR is Colletro. For questions about data protection, please contact us through the contact information provided in your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">2.1. Information You Provide</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#969696]">
                <li><strong>Account Information:</strong> Email address, name, password (hashed), profile picture, bio, banner image</li>
                <li><strong>Collection Data:</strong> Collections, items, images, notes, and other content you create</li>
                <li><strong>Profile Information:</strong> Display name, badge, accent color, theme preferences</li>
                <li><strong>Community Content:</strong> Collections and items you share with the community</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">2.2. Automatically Collected Information</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#969696]">
                <li><strong>Usage Data:</strong> How you interact with the Service (pages visited, features used)</li>
                <li><strong>Device Information:</strong> Browser type, device type, operating system</li>
                <li><strong>IP Address:</strong> Collected for security and analytics purposes</li>
                <li><strong>Cookies and Tracking:</strong> See our Cookie Policy for details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">3. Legal Basis for Processing (GDPR)</h2>
              <p className="text-[#969696] leading-relaxed mb-3">We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#969696]">
                <li><strong>Consent:</strong> When you create an account and agree to this Privacy Policy</li>
                <li><strong>Contract Performance:</strong> To provide the Service you requested</li>
                <li><strong>Legitimate Interests:</strong> For security, fraud prevention, and service improvement</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">4. How We Use Your Information</h2>
              <p className="text-[#969696] leading-relaxed mb-3">We use the collected information for:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#969696]">
                <li>Providing and maintaining the Service</li>
                <li>Authenticating your identity</li>
                <li>Processing your requests and transactions</li>
                <li>Sending you service-related communications</li>
                <li>Improving and personalizing the Service</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-[#969696] leading-relaxed mb-3">We do not sell your personal data. We may share your information only in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">5.1. Public Information</h3>
              <p className="text-[#969696] leading-relaxed">
                Collections and items you mark as public or share in community collections are visible to all users. Your profile information (name, bio, banner) is visible on your public profile if you have not set your profile to private.
              </p>

              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">5.2. Service Providers</h3>
              <p className="text-[#969696] leading-relaxed">
                We may share data with trusted third-party service providers who assist us in operating the Service, such as:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-[#969696] mt-2">
                <li>Cloud hosting providers (Vercel, Prisma)</li>
                <li>Image hosting services (Cloudinary)</li>
                <li>Analytics services (Vercel Analytics)</li>
              </ul>
              <p className="text-[#969696] leading-relaxed mt-3">
                These providers are contractually obligated to protect your data and use it only for the purposes we specify.
              </p>

              <h3 className="text-xl font-semibold text-[#fafafa] mb-3 mt-4">5.3. Legal Requirements</h3>
              <p className="text-[#969696] leading-relaxed">
                We may disclose your information if required by law, court order, or government regulation, or to protect our rights, property, or safety.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">6. Data Storage and Security</h2>
              <div className="text-[#969696] leading-relaxed space-y-3">
                <p>6.1. <strong>Location:</strong> Your data is stored on servers located within the European Union or in countries with adequate data protection laws.</p>
                <p>6.2. <strong>Security Measures:</strong> We implement appropriate technical and organizational measures to protect your data, including:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Encryption of data in transit (HTTPS)</li>
                  <li>Secure password hashing (bcrypt)</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                </ul>
                <p>6.3. <strong>Data Retention:</strong> We retain your data for as long as your account is active or as needed to provide the Service. You can delete your account at any time, which will result in the deletion of your personal data, subject to legal retention requirements.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">7. Your Rights Under GDPR</h2>
              <p className="text-[#969696] leading-relaxed mb-3">As a data subject, you have the following rights:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#969696]">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we process your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with a supervisory authority</li>
              </ul>
              <p className="text-[#969696] leading-relaxed mt-4">
                To exercise these rights, please contact us through your account settings or the contact information provided on our website. We will respond to your request within one month.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">8. Cookies and Tracking</h2>
              <p className="text-[#969696] leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience. For detailed information about our use of cookies, please see our <Link href="/cookies" className="text-[var(--accent-color)] hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">9. Children's Privacy</h2>
              <p className="text-[#969696] leading-relaxed">
                Our Service is not intended for children under 13 years of age (or the age of majority in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">10. International Data Transfers</h2>
              <p className="text-[#969696] leading-relaxed">
                If your data is transferred outside the European Economic Area (EEA), we ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission, to protect your data in accordance with GDPR requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-[#969696] leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#fafafa] mb-4">12. Contact Us</h2>
              <p className="text-[#969696] leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us through the contact information provided in your account settings or on our website.
              </p>
              <p className="text-[#969696] leading-relaxed mt-3">
                <strong>Supervisory Authority:</strong> If you are located in Germany, you have the right to lodge a complaint with the Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI) or your local data protection authority.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-[#353842]">
            <p className="text-sm text-[#969696] text-center">
              By using Colletro, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

