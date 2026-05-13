import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import Navbar from '../components/Navbar'

export const metadata: Metadata = {
  title: 'About — TableMesh',
  description: 'The story behind TableMesh — how a solo traveler\'s moment of disappointment in London sparked an app to bring people together over food.',
}

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-[var(--background)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-widest mb-4">Founder Story</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-6 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            It started with a Beef Wellington I couldn&apos;t order
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            A moment of disappointment in London set off a years-long idea that became TableMesh.
          </p>
        </div>
      </section>

      {/* Founder photo + intro */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            <div className="shrink-0">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-lg ring-4 ring-orange-100">
                <Image
                  src="/founder.jpg"
                  alt="Donal Cheung, founder of TableMesh"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--neutral)] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>Donal Cheung</h2>
              <p className="text-[var(--primary)] font-semibold mb-3">Founder, Sheep Labs LLC</p>
              <p className="text-gray-600 leading-relaxed">
                I&apos;m Donal — a traveler, food lover, and the founder of TableMesh. I&apos;ve spent years eating my way through cities solo, and somewhere between London and Asia I became convinced there had to be a better way to share a meal with someone. So I built it.
              </p>
            </div>
          </div>

          {/* Story */}
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-2 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>The Moment</h2>
            <p className="leading-relaxed">
              About four years ago I was in London, excited to try the Beef Wellington at one of Gordon Ramsay&apos;s restaurants. I&apos;d been looking forward to it. Then came the catch: it&apos;s only served for a party of two or more. I was travelling solo. No Wellington for me.
            </p>
            <p className="leading-relaxed">
              I remember standing there thinking — there must be someone else in this city right now who wants to try the exact same thing. If only there were an easy way to find them. Not a dating app, not a general social network. Just a simple way to say &ldquo;I want to eat this, who&apos;s in?&rdquo;
            </p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>The Problem Gets Bigger</h2>
            <p className="leading-relaxed">
              That moment stuck with me. As I travelled more — especially across Asia, where shared meals and family-style dining are the norm — the same friction kept showing up. Dishes that come in portions for four. Set menus designed for groups. Hot pot, dim sum, Korean BBQ — experiences that are technically available to a solo diner but were clearly meant to be shared.
            </p>
            <p className="leading-relaxed">
              The solo traveler&apos;s problem is real: you&apos;re in a city full of food designed for community, and you&apos;re eating it alone. I kept thinking someone should solve this.
            </p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>The Bigger Vision</h2>
            <p className="leading-relaxed">
              When I started building TableMesh in early 2026, the initial spark was that specific problem — finding a +1 for a meal you can&apos;t do alone. But as I built it out, the vision expanded.
            </p>
            <p className="leading-relaxed">
              Because the truth is, this isn&apos;t just a traveler&apos;s problem. How many times have you wanted to catch up with an old friend but the &ldquo;we should hang soon&rdquo; text never leads anywhere? Sometimes sending a dining request and having them spot it nearby is easier than a cold &ldquo;hey, how have you been?&rdquo; text. There&apos;s something lower-stakes about it. An invitation, not an interrogation.
            </p>
            <p className="leading-relaxed">
              I want TableMesh to be the app you reach for any time you want to eat with someone. That could mean posting a public table and seeing who&apos;s interested. It could mean inviting friends to a spot you&apos;ve been meaning to try. It could mean reconnecting with a colleague over lunch. Food is one of the best excuses people have to show up for each other — TableMesh just makes the logistics disappear.
            </p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-10 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>My Commitment to You</h2>
            <p className="leading-relaxed">
              The core features that make TableMesh work — hosting a table, joining one, chatting with your group — will <strong>never be gated behind a paywall</strong>. I only want to charge for things that are genuinely nice to have. The app should be valuable to anyone who wants to eat with someone, regardless of whether they pay.
            </p>
            <p className="leading-relaxed">
              As the community grows, I plan to partner with restaurants to post group-friendly offers and discounts directly in the app — so the more people use TableMesh, the more value everyone gets.
            </p>
            <p className="leading-relaxed">
              I&apos;m building this as a solo founder, which means every feature shipped, every bug fixed, and every meal connected is personal. I&apos;d love for you to be part of it.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-14 p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl text-center border border-orange-100">
            <p className="text-lg font-semibold text-[var(--neutral)] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Ready to find your table?</p>
            <p className="text-gray-500 mb-6 text-sm">Download TableMesh and make your next meal worth sharing.</p>
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all font-semibold shadow-sm"
            >
              Download TableMesh
            </a>
          </div>
        </div>
      </section>

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
