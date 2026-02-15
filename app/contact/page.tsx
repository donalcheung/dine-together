import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact \u2014 TableMesh',
  description: 'Get in touch with the TableMesh team. We are here to help with questions, feedback, or support.',
}

export default function Contact() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-8" style={{ fontFamily: 'Fraunces, serif' }}>Contact Us</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-xl leading-relaxed">We would love to hear from you. Whether you have a question, feedback, or need support, our team is here to help.</p>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
              <h2 className="text-xl font-bold text-[var(--neutral)] mb-4">Email Us</h2>
              <p className="leading-relaxed mb-2">For all inquiries, please reach out to:</p>
              <a href="mailto:contact@tablemesh.com" className="text-[var(--primary)] font-semibold text-lg hover:underline">contact@tablemesh.com</a>
              <p className="text-sm text-gray-500 mt-3">We aim to respond within 24 hours.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
              <h2 className="text-xl font-bold text-[var(--neutral)] mb-4">Report an Issue</h2>
              <p className="leading-relaxed">If you are experiencing a problem with the app or need to report a safety concern, please email us with the subject line <strong>&ldquo;Safety Report&rdquo;</strong> or <strong>&ldquo;Bug Report&rdquo;</strong> and we will prioritize your request.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[var(--neutral)] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Sheep Labs LLC. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/70">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/about-us" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
