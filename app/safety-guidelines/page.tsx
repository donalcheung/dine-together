import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety Guidelines \u2014 TableMesh',
  description: 'Stay safe while dining with TableMesh. Read our community safety guidelines for meeting new people and organizing group meals.',
}

export default function SafetyGuidelines() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-8" style={{ fontFamily: 'Fraunces, serif' }}>Safety Guidelines</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-xl leading-relaxed">Your safety is our top priority. Whether you are organizing a team lunch, meeting friends, or joining a public table, these guidelines will help ensure a great experience for everyone.</p>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
              <h2 className="text-xl font-bold text-[var(--neutral)] mb-4">Before You Go</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Always meet in public restaurants.</strong> TableMesh is designed for dining at public establishments. Never agree to meet at a private residence.</li>
                <li><strong>Share your plans.</strong> Let a friend or family member know where you are going, who you are meeting, and when you expect to be back.</li>
                <li><strong>Check profiles and ratings.</strong> Review the host&apos;s or guest&apos;s profile, community ratings, and past dining history before committing.</li>
                <li><strong>Use in-app chat.</strong> Keep your conversations within the app. Avoid sharing personal contact information until you feel comfortable.</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
              <h2 className="text-xl font-bold text-[var(--neutral)] mb-4">During the Meal</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Arrange your own transportation.</strong> Drive yourself or use a ride-sharing service so you can leave at any time.</li>
                <li><strong>Trust your instincts.</strong> If something feels off, it is okay to leave. Your comfort comes first.</li>
                <li><strong>Respect boundaries.</strong> Be mindful of others&apos; personal space, dietary choices, and comfort levels.</li>
                <li><strong>Stay sober and aware.</strong> Keep an eye on your belongings and your surroundings.</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
              <h2 className="text-xl font-bold text-[var(--neutral)] mb-4">After the Meal</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Rate your experience.</strong> Honest ratings help the community identify great dining companions and flag problematic behavior.</li>
                <li><strong>Report concerns.</strong> If you experienced any inappropriate behavior, use the in-app report feature or email us at <a href="mailto:contact@tablemesh.com" className="text-[var(--primary)] font-semibold hover:underline">contact@tablemesh.com</a>.</li>
                <li><strong>Block if needed.</strong> You can block any user at any time from their profile. Blocked users cannot see your activity or contact you.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl border border-red-100">
              <h2 className="text-xl font-bold text-red-600 mb-4">Emergency</h2>
              <p className="leading-relaxed">If you are ever in immediate danger, contact your local emergency services first. Then report the incident to our team at <a href="mailto:contact@tablemesh.com" className="text-[var(--primary)] font-semibold hover:underline">contact@tablemesh.com</a> with the subject line <strong>&ldquo;Safety Report&rdquo;</strong> so we can take immediate action on our platform.</p>
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
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
