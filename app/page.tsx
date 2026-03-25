import Image from 'next/image'
import Link from 'next/link'
import Navbar from './components/Navbar'
import ScreenshotGallery from './ScreenshotGallery'
import DownloadButtons from './DownloadButtons'

export default function Home() {

  return (
    <div className="min-h-screen bg-[var(--background)]">

      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-16 sm:pt-24 pb-0 relative overflow-hidden">
        <div className="relative w-full h-[520px] sm:h-[600px] md:h-[700px]">
          <Image
            src="/photos/hero-friends-dining.jpg"
            alt="A group of friends laughing and sharing food at a restaurant table"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4 sm:mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium">For friends, coworkers, foodies &amp; adventurers</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
                  The Easiest Way to<br />
                  <span className="text-[var(--accent)]">Organize Group Meals</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-xl">
                  Coordinate dinners with your friend group. Signal your lunch break to coworkers. Rally people for Korean BBQ.
                </p>
                <DownloadButtons variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Everything in One App — Feature Grid ── */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-3 sm:mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Everything in One App
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              From organizing your regular crew to discovering new dining companions — TableMesh handles it all.
            </p>
          </div>

          {/* 2-col on mobile, 2-col on tablet, 3-col on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 sm:p-8 border border-orange-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-[var(--primary)] rounded-2xl flex items-center justify-center mb-3 sm:mb-5 text-xl sm:text-2xl">🍽️</div>
              <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-1 sm:mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Host a Table</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">
                Pick a restaurant, set the time and group size. Share a link with your crew or make it public for anyone nearby to join.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 px-2 sm:px-3 py-1 rounded-full">Friends &amp; Coworkers</span>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 sm:p-8 border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-5 text-xl sm:text-2xl">👥</div>
              <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-1 sm:mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Groups — Free</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">
                Build your dining community without paying organizer fees. Create public or private groups, post recurring meals.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full">Community</span>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 sm:p-8 border border-purple-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-5 text-xl sm:text-2xl">👋</div>
              <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-1 sm:mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Food Buddies</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">
                Browse locals who share your exact taste in food, dining style, and vibe. Wave to connect — always in a public restaurant.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-100 px-2 sm:px-3 py-1 rounded-full">Foodies</span>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-5 sm:p-8 border border-green-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-green-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-5 text-xl sm:text-2xl">📍</div>
              <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-1 sm:mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Discover Nearby</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">
                See live dining requests on a map. New in town? Browse public tables nearby and join one that looks good.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">Travelers</span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 sm:p-8 border border-amber-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-5 text-xl sm:text-2xl">🎁</div>
              <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-1 sm:mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Group Deals</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">
                Partner restaurants post deals designed for groups — the bigger your party, the better the offer. No coupon codes.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 sm:px-3 py-1 rounded-full">All Diners</span>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 sm:p-8 border border-red-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-red-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-5 text-xl sm:text-2xl">⭐</div>
              <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-1 sm:mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Level Up</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">
                Earn XP and likes from fellow diners. Unlock titles from Newcomer to Legend. Your foodie reputation travels with you.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 sm:px-3 py-1 rounded-full">All Users</span>
            </div>

          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link href="/features" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-full font-semibold hover:bg-[var(--primary)] hover:text-white transition-all text-sm sm:text-base">
              See All Features
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            Simple as 1&#8209;2&#8209;3
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-600 mb-10 sm:mb-16 max-w-2xl mx-auto">
            Hosting a meal takes less time than sending a group text.
          </p>
          <div className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-12">
            {[
              { num: '1', color: 'bg-[var(--primary)]', title: 'Host a Table', desc: 'Pick a restaurant, set the time and group size. Share it publicly or with your crew.' },
              { num: '2', color: 'bg-[var(--accent)]', title: 'Connect & Confirm', desc: 'People RSVP or request to join. Chat in-app to coordinate details.' },
              { num: '3', color: 'bg-[var(--primary)]', title: 'Dine Together', desc: 'Show up and enjoy. Earn likes from fellow diners and level up.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-white shadow-lg`}>{step.num}</div>
                <h3 className="text-sm sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-[var(--neutral)]">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-base hidden sm:block">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Screenshots ── */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            See It in Action
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-600 mb-8 sm:mb-16 max-w-2xl mx-auto">
            A glimpse of the TableMesh experience.
          </p>
          <ScreenshotGallery />
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            How We Compare
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
            There are other ways to organize meals. Here&apos;s why people choose TableMesh.
          </p>

          {/* Mobile: simplified 2-col table (TableMesh vs Others) */}
          <div className="block sm:hidden bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-4 bg-gray-50 text-gray-500 text-left font-bold w-1/2"></th>
                  <th className="p-4 bg-[var(--primary)] text-white font-bold text-center w-1/4">TableMesh</th>
                  <th className="p-4 bg-gray-50 text-gray-500 font-bold text-center w-1/4">Others</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Works with existing friends', tm: true, others: false },
                  { feature: 'Discover new people', tm: true, others: true },
                  { feature: 'Groups — free', tm: true, others: false },
                  { feature: 'Organizer fees', tm: false, others: true, label: { tm: 'Free', others: 'Up to $100+/yr' } },
                  { feature: 'Built-in RSVP', tm: true, others: false },
                  { feature: 'Free to use', tm: true, others: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 text-left text-gray-700 font-medium text-xs border-r border-gray-100">{row.feature}</td>
                    {row.label ? (
                      <>
                        <td className="p-3 text-center text-xs font-semibold text-green-600 border-l border-gray-100">{row.label.tm}</td>
                        <td className="p-3 text-center text-xs font-semibold text-red-500 border-l border-gray-100">{row.label.others}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 text-center border-l border-gray-100">
                          {row.tm ? <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            : <svg className="w-5 h-5 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>}
                        </td>
                        <td className="p-3 text-center border-l border-gray-100">
                          {row.others ? <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            : <svg className="w-5 h-5 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">&ldquo;Others&rdquo; = Timeleft, Meetup, Group Chats</p>
            </div>
          </div>

          {/* Desktop: full 5-col table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr>
                  <th className="p-4 md:p-6 bg-gray-50 text-gray-500 text-left font-bold min-w-[180px]"></th>
                  <th className="p-4 md:p-6 bg-[var(--primary)] text-white font-bold text-center min-w-[120px]">TableMesh</th>
                  <th className="p-4 md:p-6 bg-gray-50 text-gray-500 font-bold text-center min-w-[120px]">Timeleft</th>
                  <th className="p-4 md:p-6 bg-gray-50 text-gray-500 font-bold text-center min-w-[120px]">Meetup</th>
                  <th className="p-4 md:p-6 bg-gray-50 text-gray-500 font-bold text-center min-w-[120px]">Group Chats</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'You choose the restaurant', tm: true, tl: false, mu: true, gc: true },
                  { feature: 'Works with existing friends', tm: true, tl: false, mu: false, gc: true },
                  { feature: 'Discover new people', tm: true, tl: true, mu: true, gc: false },
                  { feature: 'Create groups for free', tm: true, tl: false, mu: false, gc: true },
                  { feature: 'Organizer fees', tm: false, tl: false, mu: true, gc: false, label: { tm: 'Free', tl: 'Free', mu: '$100+/yr', gc: 'N/A' } },
                  { feature: 'Built-in RSVP tracking', tm: true, tl: true, mu: true, gc: false },
                  { feature: 'Dining-specific features', tm: true, tl: true, mu: false, gc: false },
                  { feature: 'Works for coworker lunches', tm: true, tl: false, mu: false, gc: true },
                  { feature: 'Free to use', tm: true, tl: false, mu: false, gc: true },
                  { feature: 'Post a meal in under 30 seconds', tm: true, tl: false, mu: false, gc: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 md:p-5 text-left text-gray-700 font-medium border-r border-gray-100">{row.feature}</td>
                    {row.label ? (
                      [
                        { val: row.tm, text: row.label.tm },
                        { val: row.tl, text: row.label.tl },
                        { val: row.mu, text: row.label.mu },
                        { val: row.gc, text: row.label.gc },
                      ].map((cell, j) => (
                        <td key={j} className={`p-4 md:p-5 text-center text-sm font-semibold border-l border-gray-100 ${j === 0 ? 'text-green-600' : cell.val ? 'text-red-500' : 'text-green-600'}`}>
                          {cell.text}
                        </td>
                      ))
                    ) : (
                      [row.tm, row.tl, row.mu, row.gc].map((val, j) => (
                        <td key={j} className={`p-4 md:p-5 text-center ${j > 0 ? 'border-l border-gray-100' : ''}`}>
                          {val ? (
                            <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          )}
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            Real Stories from Real Tables
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-600 mb-8 sm:mb-16 max-w-2xl mx-auto">
            From office lunches to weekend adventures.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">

            <blockquote className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 self-start">Work Team</div>
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
              <p className="text-gray-700 leading-relaxed flex-1 mb-4 sm:mb-6 text-sm sm:text-base">
                &ldquo;We created a group on TableMesh and now 8–12 of us go out for lunch together most days. Even people from different departments who never talked before. HR loves it.&rdquo;
              </p>
              <footer>
                <p className="font-bold text-[var(--neutral)] text-sm sm:text-base">Priya S.</p>
                <p className="text-xs sm:text-sm text-gray-500">Engineering Manager, San Francisco</p>
              </footer>
            </blockquote>

            <blockquote className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 self-start">Foodie</div>
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
              <p className="text-gray-700 leading-relaxed flex-1 mb-4 sm:mb-6 text-sm sm:text-base">
                &ldquo;Korean BBQ needs at least 4 people to be worth it. Posted a table for Saturday night, had 5 people join within an hour. We ordered everything on the menu. $18 each. Unreal.&rdquo;
              </p>
              <footer>
                <p className="font-bold text-[var(--neutral)] text-sm sm:text-base">Jordan L.</p>
                <p className="text-xs sm:text-sm text-gray-500">Foodie, New York</p>
              </footer>
            </blockquote>

            <blockquote className="bg-gradient-to-br from-green-50 to-teal-50 p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 self-start">New in Town</div>
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
              <p className="text-gray-700 leading-relaxed flex-1 mb-4 sm:mb-6 text-sm sm:text-base">
                &ldquo;Moved to a new city and didn&apos;t know anyone. Three of us from that first dinner still grab lunch together every week.&rdquo;
              </p>
              <footer>
                <p className="font-bold text-[var(--neutral)] text-sm sm:text-base">Marcus T.</p>
                <p className="text-xs sm:text-sm text-gray-500">Software Engineer, Austin</p>
              </footer>
            </blockquote>

          </div>
        </div>
      </section>

      {/* ── Restaurant Partner CTA ── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-orange-100 text-center">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏪</div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--neutral)] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Own a Restaurant?</h3>
          <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
            Fill empty tables by reaching groups who are already planning to eat out. Post deals that reward bigger parties.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/partner/signup" className="px-6 sm:px-8 py-3 sm:py-3.5 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg font-semibold text-base sm:text-lg">
              Get Started Free
            </Link>
            <Link href="/partner" className="px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-[var(--primary)] text-[var(--primary)] rounded-full hover:bg-orange-50 transition-all font-semibold text-base sm:text-lg">
              Learn More
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">No setup fees &middot; Free plan available &middot; Cancel anytime</p>
        </div>
      </section>

      {/* ── Blog ── */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-3 sm:mb-4" style={{ fontFamily: 'Fraunces, serif' }}>From the Blog</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Tips, guides, and stories about bringing people together over food.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <Link href="/blog/how-to-organize-group-dinner" className="group">
              <article className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 sm:p-8 h-full hover:shadow-lg transition-all">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">Tips &amp; Guides</span>
                <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-2 sm:mb-3 group-hover:text-[var(--primary)] transition-colors">How to Organize a Group Dinner Without the Chaos</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">7 proven strategies to coordinate group dinners that actually happen.</p>
                <span className="text-[var(--primary)] font-medium text-sm">Read more &rarr;</span>
              </article>
            </Link>
            <Link href="/blog/best-team-lunch-ideas" className="group">
              <article className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 h-full hover:shadow-lg transition-all">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">For Teams</span>
                <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-2 sm:mb-3 group-hover:text-[var(--primary)] transition-colors">10 Team Lunch Ideas That Actually Build Culture</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">Turn midday meals into the best part of your workday.</p>
                <span className="text-[var(--primary)] font-medium text-sm">Read more &rarr;</span>
              </article>
            </Link>
            <Link href="/blog/social-dining-guide-for-introverts" className="group">
              <article className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 h-full hover:shadow-lg transition-all">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">Community</span>
                <h3 className="text-base sm:text-xl font-bold text-[var(--neutral)] mb-2 sm:mb-3 group-hover:text-[var(--primary)] transition-colors">The Introvert&apos;s Guide to Social Dining</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">Eating with new people doesn&apos;t have to be overwhelming.</p>
                <span className="text-[var(--primary)] font-medium text-sm">Read more &rarr;</span>
              </article>
            </Link>
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/blog" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-full font-semibold hover:bg-[var(--primary)] hover:text-white transition-all text-sm sm:text-base">
              View All Posts
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA / Download ── */}
      <section id="download" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
            Your Next Great Meal Is Waiting
          </h2>
          <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
            Whether it&apos;s your weekly team lunch, a spontaneous dinner with friends, or rallying people for that tasting menu you&apos;ve been eyeing — TableMesh brings everyone to the table.
          </p>
          <DownloadButtons variant="cta" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--neutral)] text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="TableMesh" width={32} height={32} className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold">TableMesh</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                The group dining coordination app for friends, teams, and food lovers.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/tablemesh.official" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/50 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.youtube.com/@tablemeshofficial/shorts" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/50 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@tablemesh" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/50 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-wider text-white/50">For Diners</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#download" className="hover:text-white transition-colors">Download</a></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/safety-guidelines" className="hover:text-white transition-colors">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-wider text-white/50">For Restaurants</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/partner" className="hover:text-white transition-colors">Partner Program</Link></li>
                <li><Link href="/partner/login" className="hover:text-white transition-colors">Restaurant Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-wider text-white/50">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
            <p className="text-white/50 text-xs sm:text-sm">&copy; {new Date().getFullYear()} Sheep Labs LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
