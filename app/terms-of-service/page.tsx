import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service \u2014 TableMesh',
  description: 'Read the TableMesh terms of service. Understand your rights and responsibilities when using our platform.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="TableMesh Logo" width={40} height={40} className="w-10 h-10 rounded-xl" />
            <span className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>TableMesh</span>
          </Link>
          <a href="/#download" className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all text-sm font-semibold">Get the App</a>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-10">Last Updated: February 14, 2026</p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="leading-relaxed">Welcome to TableMesh. By accessing or using our mobile application and related services (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). Please read them carefully.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>1. Acceptance of Terms</h2>
            <p className="leading-relaxed">By creating an account or using the Service, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Service.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>2. Eligibility</h2>
            <p className="leading-relaxed">You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you meet this age requirement.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>3. Your Account</h2>
            <p className="leading-relaxed">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to update it as necessary.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>4. Acceptable Use</h2>
            <p className="leading-relaxed">You agree to use the Service responsibly and in compliance with all applicable laws. You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful, harassing, or harmful purpose.</li>
              <li>Post content that is false, misleading, defamatory, or offensive.</li>
              <li>Impersonate any person or entity.</li>
              <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts.</li>
              <li>Use the Service to spam, solicit, or advertise without authorization.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>5. User Content</h2>
            <p className="leading-relaxed">You retain ownership of the content you create on the Service. By posting content, you grant Sheep Labs LLC a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with operating and improving the Service.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>6. Safety</h2>
            <p className="leading-relaxed">TableMesh facilitates connections between users but does not guarantee the behavior of any user. You are responsible for your own safety when meeting other users. We strongly recommend meeting in public places and following our <Link href="/safety-guidelines" className="text-[var(--primary)] font-semibold hover:underline">Safety Guidelines</Link>.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>7. Termination</h2>
            <p className="leading-relaxed">We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion. You may delete your account at any time through the app settings.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>8. Disclaimers</h2>
            <p className="leading-relaxed">The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>9. Limitation of Liability</h2>
            <p className="leading-relaxed">To the fullest extent permitted by law, Sheep Labs LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>10. Changes to These Terms</h2>
            <p className="leading-relaxed">We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on this page and updating the &ldquo;Last Updated&rdquo; date. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>11. Contact Us</h2>
            <p className="leading-relaxed">If you have any questions about these Terms, please contact us at: <a href="mailto:contact@tablemesh.com" className="text-[var(--primary)] font-semibold hover:underline">contact@tablemesh.com</a></p>
          </div>
        </div>
      </main>

      <footer className="bg-[var(--neutral)] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Sheep Labs LLC. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/70">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/about-us" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
