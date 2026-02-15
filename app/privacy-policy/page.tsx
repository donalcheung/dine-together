import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy \u2014 TableMesh',
  description: 'Read the TableMesh privacy policy. Learn how we collect, use, and protect your information.',
}

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Last Updated: February 14, 2026</p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="leading-relaxed">Welcome to TableMesh! This Privacy Policy explains how Sheep Labs LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and discloses information about you when you use our mobile application, TableMesh (the &ldquo;App&rdquo;), and our related services.</p>

            <p className="leading-relaxed">We are committed to protecting your privacy. By using our App, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>1. Information We Collect</h2>
            <p className="leading-relaxed">We collect information you provide directly to us, information we collect automatically when you use our App, and information we collect from other sources.</p>

            <h3 className="text-lg font-bold text-[var(--neutral)] mt-6 mb-2">A. Information You Provide to Us</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password. You may also choose to provide additional profile information, such as a profile photo, bio, job title, and company.</li>
              <li><strong>User Content:</strong> We collect the content you create within the App, including dining requests you host, messages you send in our chat, and any photos you upload.</li>
              <li><strong>Communications:</strong> If you contact us for support or other inquiries, we will collect the information contained in your communications.</li>
            </ul>

            <h3 className="text-lg font-bold text-[var(--neutral)] mt-6 mb-2">B. Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Information:</strong> We collect information about your activity on our App, such as the dining requests you view, join, or pass on; the screens you visit; and the features you use.</li>
              <li><strong>Device and Technical Information:</strong> We collect information from and about the device you use to access our App, including hardware model, operating system and version, unique device identifiers, and mobile network information.</li>
              <li><strong>Location Information:</strong> With your permission, we collect your device&apos;s precise location to show you nearby dining requests and to help you set the location for meals you host.</li>
            </ul>

            <h3 className="text-lg font-bold text-[var(--neutral)] mt-6 mb-2">C. Information from Other Sources</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Third-Party Services:</strong> If you choose to sign in using a third-party service like Google or Apple, we will receive information from that service, such as your name and email address, as permitted by your privacy settings on that service.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our App and services.</li>
              <li>Create and manage your account and profile.</li>
              <li>Connect you with other users for social dining experiences.</li>
              <li>Facilitate communication between users.</li>
              <li>Send you transactional and administrative communications.</li>
              <li>Personalize your experience in the App.</li>
              <li>Analyze usage and trends to improve our service.</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>3. How We Share Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>With Other Users:</strong> Your profile information and the details of the dining requests you host are visible to other users of the App.</li>
              <li><strong>With Our Service Providers:</strong> We share information with third-party vendors who carry out work on our behalf, such as database hosting, email delivery, crash reporting, and analytics.</li>
              <li><strong>In Response to Legal Process:</strong> We may disclose information if required by applicable law, regulation, or governmental request.</li>
              <li><strong>To Protect TableMesh:</strong> We may disclose information to protect the rights, property, and safety of Sheep Labs LLC or others.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>4. Your Choices</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> You may update or correct your account information at any time through your profile settings.</li>
              <li><strong>Location Information:</strong> You can disable location services at any time through your device&apos;s settings.</li>
              <li><strong>Push Notifications:</strong> You can opt out of receiving push notifications through your device&apos;s settings.</li>
              <li><strong>Account Deletion:</strong> You can delete your account at any time from the profile settings screen in the App.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>5. Contact Us</h2>
            <p className="leading-relaxed">If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:contact@tablemesh.com" className="text-[var(--primary)] font-semibold hover:underline">contact@tablemesh.com</a></p>
          </div>
        </div>
      </main>

      <footer className="bg-[var(--neutral)] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Sheep Labs LLC. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/70">
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/about-us" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
