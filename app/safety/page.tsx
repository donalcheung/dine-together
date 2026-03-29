import Navbar from '../components/Navbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety Guidelines — TableMesh',
  description: 'How TableMesh keeps group dining safe. Learn about our verified profiles, public-restaurant-only policy, and zero-tolerance community standards.',
}

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 text-center bg-gradient-to-b from-green-50 to-[#faf7f2]">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <span className="text-base">🛡️</span>
          Your safety matters
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
          Safety <span className="text-green-600">Guidelines</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          TableMesh is built so every meal happens in a public restaurant, with verified users, and clear community standards. Here is how we keep it that way.
        </p>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pb-20">

        {/* Public Restaurants Only */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🍽</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Public Restaurants Only
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Every meal on TableMesh takes place at a real, public restaurant. We do not allow private locations, home addresses, or undisclosed venues. This ensures every interaction happens in a safe, well-lit, staffed environment where help is always nearby.
              </p>
            </div>
          </div>
        </section>

        {/* Verified Profiles */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">✅</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Verified Profiles
              </h2>
              <p className="text-gray-600 leading-relaxed">
                All TableMesh users create profiles with their real name and photo. Our diner level system means that the more meals someone attends, the more trust they build within the community. You can always view a person&apos;s dining history, level, and likes before deciding to join their table.
              </p>
            </div>
          </div>
        </section>

        {/* Host Controls */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">👤</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Host Controls
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Hosts have full control over their dining requests. You can set your table to public or private, approve or decline join requests, and remove any participant at any time. If you are joining someone else&apos;s table, you can leave at any point before the meal.
              </p>
            </div>
          </div>
        </section>

        {/* Matching & Communication */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">💬</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Safe Communication
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Direct messaging between users requires a mutual match (similar to a &ldquo;wave&rdquo; system). You will never receive unsolicited messages from strangers. Group chats are limited to confirmed participants of a specific dining request, keeping conversations relevant and respectful.
              </p>
            </div>
          </div>
        </section>

        {/* Zero Tolerance */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🚫</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Zero-Tolerance Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                TableMesh has a zero-tolerance policy for harassment, hate speech, discrimination, and abusive behavior of any kind. Users who violate our community standards are permanently banned. We review every report within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🚨</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Easy Reporting & Blocking
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You can block or report any user instantly from their profile or from within a group chat. Reports are reviewed by our team and handled confidentially. We take every report seriously and will follow up with you on the outcome.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Tips for a Great Experience
          </h2>
          <div className="space-y-3">
            {[
              'Check a host\'s profile and diner level before joining a table.',
              'Start with larger group meals if you\'re new — there\'s safety in numbers.',
              'Let a friend know where you\'re going and who you\'re meeting.',
              'Trust your instincts. If something feels off, leave and report.',
              'Be respectful, be on time, and be yourself.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <p className="text-gray-600 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
            Questions or Concerns?
          </h2>
          <p className="text-gray-500 mb-6">
            If you ever feel unsafe or need to report an issue, reach out to us at{' '}
            <a href="mailto:safety@tablemesh.com" className="text-orange-500 font-semibold hover:underline">
              safety@tablemesh.com
            </a>
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors"
          >
            Back to Home
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} TableMesh. All rights reserved.</p>
      </footer>
    </div>
  )
}
