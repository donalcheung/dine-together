import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TableMesh — Effortless Group Dining',
  description:
    'Plan meals with friends, colleagues, or new people. Host a table, coordinate dinners, and discover shared dining experiences near you. Download the free app today.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="TableMesh Logo"
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
              TableMesh
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/about-us" className="hidden md:block text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
              About
            </Link>
            <Link href="/safety-guidelines" className="hidden md:block text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
              Safety
            </Link>
            <Link href="/contact" className="hidden md:block text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
              Contact
            </Link>
            <a
              href="#download"
              className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg text-sm font-semibold"
            >
              Get the App
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-8">
            <Image
              src="/logo.png"
              alt="TableMesh"
              width={96}
              height={96}
              className="w-24 h-24 rounded-3xl shadow-xl mx-auto"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[var(--neutral)] mb-6 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Every Great Meal<br />
            Starts with a <span className="text-[var(--primary)] italic">Table</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            The easiest way to organize group meals with friends, colleagues, or new people.
            Host a table, coordinate plans, and bring everyone together.
          </p>

          {/* App Store Badges */}
          <div id="download" className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a href="#" className="hover:opacity-80 transition-opacity" aria-label="Download on the App Store">
              <Image
                src="/app-store-badge.png"
                alt="Download on the App Store"
                width={200}
                height={60}
                className="h-[60px] w-auto"
              />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity" aria-label="Get it on Google Play">
              <Image
                src="/google-play-badge.png"
                alt="Get it on Google Play"
                width={200}
                height={60}
                className="h-[60px] w-auto"
              />
            </a>
          </div>

          <p className="text-sm text-gray-400">Free to download. Free to use.</p>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            One App, Endless Tables
          </h2>
          <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            Whether you are planning a team lunch, a friends&apos; night out, or looking to meet new people over food &mdash; TableMesh brings everyone to the table.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Friend Groups */}
            <article className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 card-hover">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Friend Groups</h3>
              <p className="text-gray-600 leading-relaxed">
                Finally agree on a place and time without the chaos of group texts. Share a link, let everyone RSVP, and just show up.
              </p>
            </article>

            {/* Work Teams */}
            <article className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 card-hover">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '0.1s' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Work Teams</h3>
              <p className="text-gray-600 leading-relaxed">
                The perfect tool for team lunches, offsites, and after-work dinners. Signal where you are grabbing lunch and turn solo breaks into team bonding.
              </p>
            </article>

            {/* Community */}
            <article className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 card-hover">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '0.2s' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                A welcoming way to meet new people and discover your city&apos;s food culture. Join public tables or create your own community group.
              </p>
            </article>

            {/* Travelers */}
            <article className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 card-hover">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '0.3s' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Travelers</h3>
              <p className="text-gray-600 leading-relaxed">
                Exploring a new city? Find locals or fellow travelers to share authentic dishes and experiences with. Turn any trip into a food adventure.
              </p>
            </article>

            {/* Foodies */}
            <article className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 card-hover">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '0.4s' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Foodies</h3>
              <p className="text-gray-600 leading-relaxed">
                Want to try dim sum but can&apos;t order enough alone? Find others to split dishes and explore the full menu together.
              </p>
            </article>

            {/* Restaurants */}
            <article className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 card-hover">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '0.5s' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Restaurants</h3>
              <p className="text-gray-600 leading-relaxed">
                Fill tables during slow hours. Post special deals and attract groups looking for great dining experiences. Grow your community.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            Simple as 1&#8209;2&#8209;3
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Host a Table</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a dining request in seconds. Set the time, place, and number of guests. Share a link for your group to RSVP, or make it public for the community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Connect &amp; Confirm</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse nearby tables or review join requests for yours. Use in-app chat to coordinate details and confirm attendance. No phone numbers needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Dine Together</h3>
              <p className="text-gray-600 leading-relaxed">
                Show up, enjoy the meal, and strengthen your connections &mdash; or make new ones. Rate your experience to help build a trusted community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── App Preview ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            See It in Action
          </h2>
          <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            A glimpse of the TableMesh experience &mdash; from discovering meals to chatting with your group.
          </p>

          {/* Scrollable phone gallery */}
          <div className="relative">
            <div className="flex gap-8 overflow-x-auto pb-8 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { src: '/screenshots/discover.png', label: 'Discover Meals', desc: 'Browse dining experiences near you' },
                { src: '/screenshots/host-meal.png', label: 'Host a Table', desc: 'Create a meal in seconds' },
                { src: '/screenshots/my-meals.png', label: 'My Meals', desc: 'Track upcoming and past meals' },
                { src: '/screenshots/messages.png', label: 'Messages', desc: 'Chat with friends and groups' },
                { src: '/screenshots/profile.png', label: 'Your Profile', desc: 'Build your dining reputation' },
                { src: '/screenshots/groups.png', label: 'Groups', desc: 'Dine with your crew' },
              ].map((screen, i) => (
                <div key={i} className="flex-shrink-0 snap-center">
                  <div className="relative mx-auto" style={{ width: '280px' }}>
                    {/* Phone frame */}
                    <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />
                      {/* Screen */}
                      <div className="rounded-[2.5rem] overflow-hidden bg-white">
                        <Image
                          src={screen.src}
                          alt={screen.label}
                          width={280}
                          height={607}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-6">
                    <h3 className="text-lg font-bold text-[var(--neutral)]">{screen.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{screen.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll hint */}
            <div className="flex justify-center mt-4 gap-2">
              <span className="text-sm text-gray-400">Swipe to explore</span>
              <svg className="w-5 h-5 text-gray-400 animate-bounce-x" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            Built for Real Diners
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Flexible Timing</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Post hours in advance or minutes before. See what is happening now or plan ahead for the weekend.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-purple-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Community Ratings</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Build your reputation as a reliable dining companion. See others&apos; ratings before you commit.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Location-Based</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                See dining requests near you, sorted by distance. Never miss out on nearby opportunities.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Safe &amp; Verified</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Always meet in public restaurants. Verified profiles, community ratings, and transparent communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            What Diners Say
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <blockquote className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                &ldquo;We use it to organize monthly dinners for our book club. Way easier than group texts. Everyone sees who is coming and where we are meeting.&rdquo;
              </p>
              <footer className="font-semibold text-[var(--neutral)]">&mdash; Michael, Community Organizer</footer>
            </blockquote>

            <blockquote className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                &ldquo;Our team uses TableMesh for Friday lunches. No more Slack polls. Someone hosts a table, everyone joins, done. It has genuinely improved our team culture.&rdquo;
              </p>
              <footer className="font-semibold text-[var(--neutral)]">&mdash; Priya, Engineering Manager</footer>
            </blockquote>

            <blockquote className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                &ldquo;Finally tried that dim sum spot! Found 3 people to split dishes with. We ordered the whole menu and spent half what we would have alone.&rdquo;
              </p>
              <footer className="font-semibold text-[var(--neutral)]">&mdash; Jamie, Food Enthusiast</footer>
            </blockquote>

            <blockquote className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                &ldquo;As a restaurant owner, Tuesday nights were dead. Now we post deals on TableMesh and fill 10&ndash;15 extra tables. Game changer for revenue.&rdquo;
              </p>
              <footer className="font-semibold text-[var(--neutral)]">&mdash; David, Restaurant Owner</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── CTA / Download Section ── */}
      <section className="py-24 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
            Your Next Great Meal Is Waiting
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join the community discovering that food tastes better when shared. Whether it is your weekly team lunch or a spontaneous dinner with friends &mdash; TableMesh brings everyone to the table.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#" className="hover:opacity-90 transition-opacity" aria-label="Download on the App Store">
              <Image
                src="/app-store-badge.png"
                alt="Download on the App Store"
                width={200}
                height={60}
                className="h-[60px] w-auto"
              />
            </a>
            <a href="#" className="hover:opacity-90 transition-opacity" aria-label="Get it on Google Play">
              <Image
                src="/google-play-badge.png"
                alt="Get it on Google Play"
                width={200}
                height={60}
                className="h-[60px] w-auto"
              />
            </a>
          </div>

          <p className="text-white/70 text-sm mt-6">Free to download. Available on iOS and Android.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--neutral)] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="TableMesh"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold">TableMesh</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                The social dining platform for friends, teams, and food lovers. Bringing people together, one table at a time.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/50">For Diners</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#download" className="hover:text-white transition-colors">Download App</a></li>
                <li><Link href="/safety-guidelines" className="hover:text-white transition-colors">Safety Guidelines</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/50">Company</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/50">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} Sheep Labs LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
