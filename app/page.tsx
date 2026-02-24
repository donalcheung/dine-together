import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import ScreenshotGallery from './ScreenshotGallery'
import WaitlistForm from './WaitlistForm'
import RestaurantWaitlistForm from './RestaurantWaitlistForm'

export const metadata: Metadata = {
  title: 'TableMesh — Organize Group Meals Effortlessly',
  description:
    'TableMesh is the group dining coordination app for friends, coworkers, and food lovers. End the group chat chaos, signal your lunch break, tackle tasting menus, and bring everyone to the table.',
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
            <a href="#how-it-works" className="hidden md:block text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
              How It Works
            </a>
            <a href="#for-teams" className="hidden md:block text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
              For Teams
            </a>
            <a href="#for-foodies" className="hidden md:block text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
              For Foodies
            </a>
            <a
              href="#download"
              className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg text-sm font-semibold"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section — Photo-driven with clear coordination message ── */}
      <section className="pt-24 pb-0 relative overflow-hidden">
        <div className="relative w-full h-[600px] md:h-[700px]">
          <Image
            src="/photos/hero-friends-dining.jpg"
            alt="A group of friends laughing and sharing food at a restaurant table"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/90 text-sm font-medium">For friends, coworkers, foodies &amp; adventurers</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
                  The Easiest Way to<br />
                  <span className="text-[var(--accent)]">Organize Group Meals</span>
                </h1>

                <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                  Coordinate dinners with your friend group. Signal your lunch break to coworkers. Rally people for Korean BBQ. TableMesh is the tool that gets everyone to the table.
                </p>

                <WaitlistForm variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── "What is TableMesh?" — Clear positioning statement ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
            A Coordination Tool for People Who Eat Together
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            TableMesh is <strong>not</strong> another app for meeting strangers at curated dinners. It&apos;s a practical tool that helps you organize meals with the people already in your life &mdash; your friends, your coworkers, your family &mdash; and occasionally discover new dining companions along the way.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-orange-50 text-[var(--primary)] rounded-full text-sm font-semibold border border-orange-200">
              Friend Group Dinners
            </span>
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold border border-blue-200">
              Coworker Lunch Breaks
            </span>
            <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold border border-purple-200">
              Tasting Menus &amp; Shared Plates
            </span>
            <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-semibold border border-green-200">
              Community Meetups
            </span>
            <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-sm font-semibold border border-amber-200">
              Travel Dining
            </span>
          </div>
        </div>
      </section>

      {/* ── Scenario Sections — Photo + text, alternating layout ── */}
      <section className="py-0 bg-[var(--background)]">

        {/* Scenario 1: End the Group Chat Chaos */}
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/photos/friends-cheers.jpg"
              alt="Diverse group of friends toasting at a restaurant"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-10 md:p-16">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              For Friend Groups
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              End the Group Chat Chaos
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              No more &ldquo;where should we eat?&rdquo; threads that go nowhere. One person hosts a table, picks the spot and time, and everyone RSVPs with a tap. No back-and-forth. No one gets left out. Just show up.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Share a link &mdash; no app download required for friends to see details</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>In-app chat keeps plans organized in one place</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>See who&apos;s coming and who hasn&apos;t responded yet</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Scenario 2: Signal Your Lunch Break */}
        <div id="for-teams" className="grid md:grid-cols-2 items-center scroll-mt-24">
          <div className="p-10 md:p-16 order-2 md:order-1">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              For Coworkers
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Make Lunch the Best Part of Your Day
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Post where you&apos;re heading for lunch and let coworkers hop in. No more guessing who&apos;s free or sending awkward Slack messages. Just signal where you&apos;re going and watch the crew come together.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Create a work group &mdash; only your team sees your tables</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Post in seconds &mdash; &ldquo;Chipotle, 12:30, room for 3&rdquo;</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Turn solo breaks into team bonding across departments</span>
              </li>
            </ul>
          </div>
          <div className="relative h-[400px] md:h-[500px] order-1 md:order-2">
            <Image
              src="/photos/coworkers-lunch.jpeg"
              alt="Coworkers enjoying a casual lunch together"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Scenario 3: Tackle the Full Menu */}
        <div id="for-foodies" className="grid md:grid-cols-2 items-center scroll-mt-24">
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/photos/korean-bbq-group.jpg"
              alt="Friends sharing Korean BBQ at a restaurant"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-10 md:p-16">
            <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              For Foodies
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Taste the Full Menu Together
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Korean BBQ needs a group. Dim sum is better shared. Tasting menus often require a minimum party size. TableMesh helps you rally the right number of people so you can experience food the way it was meant to be enjoyed.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Set your group size &mdash; &ldquo;Need 4 for the tasting menu&rdquo;</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Perfect for shared plates, family-style, and prix fixe dining</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Split the bill and try everything on the menu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Scenario 4: Meet New People (secondary, not primary) */}
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-10 md:p-16 order-2 md:order-1">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              For Community &amp; Travelers
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Discover New Dining Companions
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              New in town? Traveling solo? Browse public tables nearby and join one that looks good. Meet people who share your taste in food &mdash; in a safe, public restaurant setting. No algorithms, no swiping, no pressure.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Browse public tables near you sorted by distance</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Verified profiles and diner levels build trust</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Always in public restaurants &mdash; never private locations</span>
              </li>
            </ul>
          </div>
          <div className="relative h-[400px] md:h-[500px] order-1 md:order-2">
            <Image
              src="/photos/shared-plates.jpg"
              alt="People sharing food and conversation at a restaurant"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Restaurant Deals Section ── */}
      <section id="for-restaurants" className="py-24 px-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              For Diners &amp; Restaurants
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
              Group Deals That Actually Make Sense
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Restaurants post deals designed for groups &mdash; the bigger your party, the better the offer. When you create a meal on TableMesh, matching deals appear automatically. Everyone wins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Diner side */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-orange-100">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--neutral)] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>For Diners</h3>
              <p className="text-gray-600 mb-6">Deals appear automatically when you pick a restaurant that has active offers. No coupon codes, no searching &mdash; just better prices for bringing friends.</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>&ldquo;Bring 4+, get 20% off&rdquo; &mdash; deals tied to party size</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Deals show up when you create a meal &mdash; zero effort</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>More people = better deal. Rally the crew.</span>
                </li>
              </ul>
            </div>

            {/* Restaurant side */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-orange-100">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--neutral)] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>For Restaurants</h3>
              <p className="text-gray-600 mb-6">Fill empty tables by reaching groups who are already planning to eat out. Post deals that reward bigger parties and watch your slow nights come alive.</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Groups spend 2&ndash;3x more per visit than solo diners</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Target slow nights &mdash; &ldquo;Tuesday: 6+ gets free appetizer&rdquo;</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Self-serve dashboard starting at $49/mo</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Restaurant partner signup */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-orange-100 text-center">
            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
              Own a Restaurant?
            </h3>
            <p className="text-gray-600 mb-6">
              Join our early restaurant partner program and start reaching groups of hungry diners in your area.
            </p>
            <RestaurantWaitlistForm />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            Simple as 1&#8209;2&#8209;3
          </h2>
          <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            Hosting a meal takes less time than sending a group text.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Host a Table</h3>
              <p className="text-gray-600 leading-relaxed">
                Pick a restaurant, set the time and group size. Share it with your friend group or make it public for anyone nearby.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Connect &amp; Confirm</h3>
              <p className="text-gray-600 leading-relaxed">
                People RSVP or request to join. Chat in-app to coordinate details. Approve guests if you want, or let anyone join.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Dine Together</h3>
              <p className="text-gray-600 leading-relaxed">
                Show up and enjoy. After the meal, rate your experience and earn likes from fellow diners. Level up as you go.
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

          <ScreenshotGallery />
        </div>
      </section>

      {/* ── "How We're Different" comparison ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            How We Compare
          </h2>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            There are other ways to organize meals. Here&apos;s why people choose TableMesh.
          </p>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden overflow-x-auto">
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
                  { feature: 'You choose when to go', tm: true, tl: false, mu: true, gc: true },
                  { feature: 'You choose who joins', tm: true, tl: false, mu: true, gc: true },
                  { feature: 'Works with existing friends', tm: true, tl: false, mu: false, gc: true },
                  { feature: 'Discover new people', tm: true, tl: true, mu: true, gc: false },
                  { feature: 'Built-in RSVP tracking', tm: true, tl: true, mu: true, gc: false },
                  { feature: 'Dining-specific features', tm: true, tl: true, mu: false, gc: false },
                  { feature: 'Works for coworker lunches', tm: true, tl: false, mu: false, gc: true },
                  { feature: 'Free to use', tm: true, tl: false, mu: false, gc: true },
                  { feature: 'Post a meal in under 30 seconds', tm: true, tl: false, mu: false, gc: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 md:p-5 text-left text-gray-700 font-medium border-r border-gray-100">{row.feature}</td>
                    {[row.tm, row.tl, row.mu, row.gc].map((val, j) => (
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
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Testimonials ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            Real Stories from Real Tables
          </h2>
          <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            From office lunches to weekend adventures &mdash; here&apos;s how people are using TableMesh.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 - Coordination story (lead) */}
            <blockquote className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 self-start">
                Work Team
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic flex-grow">
                &ldquo;We created a group on TableMesh and now 8&ndash;12 of us go out for lunch together most days. Even people from different departments who never talked before. HR loves it.&rdquo;
              </p>
              <footer>
                <span className="font-semibold text-[var(--neutral)]">Priya S.</span>
                <span className="text-sm text-gray-500 block">Engineering Manager, San Francisco</span>
              </footer>
            </blockquote>

            {/* Testimonial 2 - Friend group coordination */}
            <blockquote className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 self-start">
                Friend Group
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic flex-grow">
                &ldquo;My roommates and I could never agree on where to eat. Now one of us just hosts a table on TableMesh and everyone votes with their feet. Last Friday we ended up at a Thai place none of us had tried &mdash; it was incredible.&rdquo;
              </p>
              <footer>
                <span className="font-semibold text-[var(--neutral)]">Alyssa K.</span>
                <span className="text-sm text-gray-500 block">College Student, Boston</span>
              </footer>
            </blockquote>

            {/* Testimonial 3 - Foodie / shared plates */}
            <blockquote className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 self-start">
                Foodie
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic flex-grow">
                &ldquo;Korean BBQ needs at least 4 people to be worth it. Posted a table for Saturday night, had 5 people join within an hour. We ordered everything on the menu and split the bill. $18 each. Unreal.&rdquo;
              </p>
              <footer>
                <span className="font-semibold text-[var(--neutral)]">Jordan L.</span>
                <span className="text-sm text-gray-500 block">Foodie, New York</span>
              </footer>
            </blockquote>

            {/* Testimonial 4 - Restaurant owner */}
            <blockquote className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 self-start">
                Restaurant
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
                <svg className="w-5 h-5 text-gray-300 fill-gray-300" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic flex-grow">
                &ldquo;I run a small Italian place and Tuesday nights used to be empty. Started posting a weekly pasta special on TableMesh and now we get groups of 6&ndash;8 coming in regularly. The app basically does the marketing for me.&rdquo;
              </p>
              <footer>
                <span className="font-semibold text-[var(--neutral)]">David R.</span>
                <span className="text-sm text-gray-500 block">Restaurant Owner, Chicago</span>
              </footer>
            </blockquote>

            {/* Testimonial 5 - New in town */}
            <blockquote className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 self-start">
                New in Town
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
                <svg className="w-5 h-5 text-gray-300 fill-gray-300" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic flex-grow">
                &ldquo;Moved to a new city for work and didn&apos;t know anyone. Felt weird at first joining a stranger&apos;s table, but honestly? Three of us from that first dinner still grab lunch together every week.&rdquo;
              </p>
              <footer>
                <span className="font-semibold text-[var(--neutral)]">Marcus T.</span>
                <span className="text-sm text-gray-500 block">Software Engineer, Austin</span>
              </footer>
            </blockquote>

            {/* Testimonial 6 - Traveler */}
            <blockquote className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl shadow-lg flex flex-col">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 self-start">
                Traveler
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic flex-grow">
                &ldquo;Traveling solo in Tokyo and dreading another meal alone at a conveyor belt sushi place. Found a table of 4 other travelers on TableMesh. We ended up at this tiny ramen shop a local recommended. Best night of my trip.&rdquo;
              </p>
              <footer>
                <span className="font-semibold text-[var(--neutral)]">Sarah M.</span>
                <span className="text-sm text-gray-500 block">Travel Blogger, London</span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            Built for Real Diners
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Flexible Timing</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Post hours in advance or minutes before. See what is happening now or plan ahead for the weekend.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-purple-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Likes &amp; Levels</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Earn likes from fellow diners and level up with titles that show you&apos;re a seasoned companion.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Location-Based</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                See dining requests near you, sorted by distance. Never miss out on nearby opportunities.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <svg className="w-12 h-12 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <h3 className="text-xl font-bold mb-3 text-[var(--neutral)]">Safe &amp; Verified</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Always meet in public restaurants. Verified profiles, diner levels, and transparent communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Download Section ── */}
      <section id="download" className="py-24 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
            Your Next Great Meal Is Waiting
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Whether it&apos;s your weekly team lunch, a spontaneous dinner with friends, or rallying people for that tasting menu you&apos;ve been eyeing &mdash; TableMesh brings everyone to the table.
          </p>

          <WaitlistForm variant="cta" />
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
                The group dining coordination app for friends, teams, and food lovers. Bringing people together, one table at a time.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/50">For Diners</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#download" className="hover:text-white transition-colors">Join Waitlist</a></li>
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
