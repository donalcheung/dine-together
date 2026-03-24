import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import DownloadButtons from '../DownloadButtons'
import Navbar from '../components/Navbar'

export const metadata: Metadata = {
  title: 'Features — TableMesh',
  description:
    'Explore every feature of TableMesh: host meals, build dining groups for free, find food buddies by taste and vibe, discover nearby tables on a map, and unlock exclusive restaurant deals.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">

      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--neutral)] mb-6 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Every Feature, <span className="text-[var(--primary)]">Explained</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            TableMesh is built for every kind of diner — whether you&apos;re organizing your friend group, building a community, finding new food companions, or just trying to fill a table for Korean BBQ.
          </p>
        </div>
      </section>

      {/* ── Feature 1: Host a Table ── */}
      <section className="py-0 bg-white">
        <div className="grid md:grid-cols-2 items-center max-w-none">
          <div className="relative h-[400px] md:h-[560px]">
            <Image src="/photos/friends-cheers.jpg" alt="Friends toasting at a restaurant" fill className="object-cover" />
          </div>
          <div className="p-10 md:p-16 max-w-xl">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">For Everyone</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Host a Table in Seconds
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Pick a restaurant, set the time and group size, and you&apos;re done. Share a link with your crew — they can see all the details and RSVP without downloading the app. No back-and-forth, no group chat chaos.
            </p>
            <ul className="space-y-3 text-gray-600">
              {[
                'Public or private — you control who can join',
                'Share a link; guests RSVP without downloading the app',
                'In-app group chat keeps everyone on the same page',
                'See who\'s confirmed, pending, or hasn\'t responded',
                'Set a party size minimum for shared-plate restaurants',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Feature 2: Dining Groups ── */}
      <section className="py-0 bg-[var(--background)]">
        <div className="grid md:grid-cols-2 items-center max-w-none">
          <div className="p-10 md:p-16 max-w-xl order-2 md:order-1">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">For Community Organizers</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Build Your Dining Community — Free
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Meetup charges organizers over $100 a year just to host a group. TableMesh Groups are completely free. Create a public foodie club, a private coworker lunch crew, or a recurring meetup — no subscription required.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Members can browse and join public dining requests posted within the group, chat together, and build a shared dining history over time.
            </p>
            <ul className="space-y-3 text-gray-600">
              {[
                '100% free for organizers — no subscription fees ever',
                'Public or private groups',
                'Post recurring meals (weekly lunches, monthly dinners)',
                'Members see all group dining requests in one feed',
                'Built-in group chat — no separate WhatsApp group needed',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-blue-700 text-sm font-semibold">
                💡 Perfect for: local foodie clubs, coworker lunch groups, neighborhood dining meetups, travel dining communities, and friend circles with recurring dinners.
              </p>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[560px] order-1 md:order-2">
            <Image src="/Screenshots/iPhone/Group.png" alt="TableMesh Groups screen" fill className="object-contain bg-gray-50 p-8" />
          </div>
        </div>
      </section>

      {/* ── Feature 3: Food Buddies ── */}
      <section className="py-0 bg-white">
        <div className="grid md:grid-cols-2 items-center max-w-none">
          <div className="relative h-[400px] md:h-[560px]">
            <Image src="/Screenshots/iPhone/food buddies.png" alt="TableMesh Food Buddies screen" fill className="object-contain bg-gray-50 p-8" />
          </div>
          <div className="p-10 md:p-16 max-w-xl">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">For Foodies &amp; Explorers</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Find Your Dining Counterparts
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Looking for someone to split a tasting menu, try that new spicy Szechuan spot, or tackle an omakase? Browse locals by their cuisine preferences, dining style, and vibe — and wave to connect.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              This isn&apos;t a dating app. It&apos;s about finding people who eat the way you eat. Every connection happens in a public restaurant, on your schedule, with full control over who you meet.
            </p>
            <ul className="space-y-3 text-gray-600">
              {[
                'Match by cuisine preferences, dining style, and vibe',
                'See shared interests like hobbies and personality tags',
                'Wave to connect — no pressure, no algorithms',
                'Always in public restaurants — never private locations',
                'Verified profiles and diner levels build trust',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Feature 4: Discover on Map ── */}
      <section className="py-0 bg-[var(--background)]">
        <div className="grid md:grid-cols-2 items-center max-w-none">
          <div className="p-10 md:p-16 max-w-xl order-2 md:order-1">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">For Travelers &amp; Newcomers</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Discover Meals Near You
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              New in town or traveling solo? See live dining requests pinned on a map near you. Browse who&apos;s going, what they&apos;re eating, and when — then join a table that looks good. No cold introductions, no awkward DMs.
            </p>
            <ul className="space-y-3 text-gray-600">
              {[
                'Live map of public dining requests near you',
                'Filter by cuisine, time, and group size',
                'See host profiles and diner levels before joining',
                'Request to join or instant-join open tables',
                'Works anywhere — great for travel and new cities',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[400px] md:h-[560px] order-1 md:order-2">
            <Image src="/Screenshots/iPhone/Map.png" alt="TableMesh Map screen" fill className="object-contain bg-gray-50 p-8" />
          </div>
        </div>
      </section>

      {/* ── Feature 5: Restaurant Deals ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">For All Diners</div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Exclusive Group Deals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Partner restaurants post deals designed for groups. The bigger your party, the better the offer. Deals appear automatically when you pick a restaurant — no coupon codes, no searching.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '🍽️', title: 'Party-Size Deals', desc: '"Bring 4+, get 20% off" — deals tied to how many people you bring. The more the merrier, the better the price.' },
              { emoji: '📅', title: 'Slow-Night Specials', desc: 'Restaurants target their quiet nights. Find the best deals on Tuesdays and Wednesdays when restaurants want to fill tables.' },
              { emoji: '⚡', title: 'Zero Effort', desc: 'No coupon codes, no searching. Deals appear automatically when you pick a restaurant that has an active offer.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 text-center">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-[var(--neutral)] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature 6: Levels & Profile ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">For All Users</div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                Level Up as You Dine
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Every meal earns you XP. Fellow diners give you likes. Your profile builds a foodie reputation that travels with you — making it easier to connect with new dining companions and get approved to join tables.
              </p>
              <ul className="space-y-3 text-gray-600">
                {[
                  'Earn XP from every meal you host or join',
                  'Unlock titles from Newcomer to Legend',
                  'Receive likes from fellow diners after meals',
                  'Higher levels build trust with new dining companions',
                  'Your dining history is visible on your profile',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[480px]">
              <Image src="/Screenshots/iPhone/Profile.png" alt="TableMesh Profile screen" fill className="object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Built with Safety in Mind
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Every meal on TableMesh happens in a public restaurant. Profiles are verified, diner levels are earned, and every user agrees to our zero-tolerance policy for objectionable content and abusive behavior. You can block or report any user instantly.
          </p>
          <Link href="/safety-guidelines" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-400 text-gray-600 rounded-full font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
            Read Our Safety Guidelines
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="download" className="py-24 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
            Ready to Dine Together?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Download TableMesh and host your first meal in under 30 seconds.
          </p>
          <DownloadButtons variant="cta" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--neutral)] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="TableMesh" width={32} height={32} className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold">TableMesh</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/partner" className="hover:text-white transition-colors">For Restaurants</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Sheep Labs LLC.</p>
        </div>
      </footer>
    </div>
  )
}
