import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TableMesh for Restaurants — Fill Empty Seats with Group Diners',
  description:
    'Join TableMesh as a restaurant partner. Create deals for group diners, fill empty seats during off-peak hours, and grow your business with the dining social app.',
}

export default function PartnerLandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/partner" className="flex items-center gap-3">
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
            <span className="text-xs font-semibold bg-[var(--primary)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              Partners
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/partner/login"
              className="hidden md:block text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/partner/signup"
              className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg text-sm font-semibold"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[var(--primary)] text-sm font-medium">Now accepting restaurant partners</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--neutral)] mb-6 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
              Fill Empty Seats with
              <span className="text-[var(--primary)]"> Group Diners</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              TableMesh connects your restaurant with groups of 4+ diners looking for deals. Create promotions, attract new customers during slow hours, and turn empty tables into revenue.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/partner/signup"
                className="px-8 py-4 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg text-lg font-semibold text-center"
              >
                Start Free Today
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all text-lg font-semibold text-center"
              >
                View Pricing
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                No setup fees
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Free plan available
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-red-50 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--neutral)]">Tuesday Night Special</h3>
                    <p className="text-sm text-gray-500">Mario&apos;s Italian Kitchen</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">20% OFF</span>
                  <span className="text-sm text-gray-500">Groups of 4+</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">12 groups joined this week</span>
                  <span className="text-[var(--primary)] font-semibold">Active</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[var(--neutral)]">This Month</span>
                  <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">+34%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[var(--primary)]">48</p>
                    <p className="text-xs text-gray-500">Group Visits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--neutral)]">192</p>
                    <p className="text-xs text-gray-500">Total Diners</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">$8.4K</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            How It Works for Restaurants
          </h2>
          <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            Get started in minutes. No hardware, no tablets, no complicated setup.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--primary)]">1</span>
              </div>
              <h3 className="font-bold text-[var(--neutral)] mb-2">Create Your Profile</h3>
              <p className="text-sm text-gray-600">Sign up and add your restaurant details, photos, and cuisine type.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--primary)]">2</span>
              </div>
              <h3 className="font-bold text-[var(--neutral)] mb-2">Create Deals</h3>
              <p className="text-sm text-gray-600">Set up group dining deals with discounts, minimum party sizes, and schedules.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--primary)]">3</span>
              </div>
              <h3 className="font-bold text-[var(--neutral)] mb-2">Attract Groups</h3>
              <p className="text-sm text-gray-600">Your deals appear to thousands of group diners looking for their next meal.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--primary)]">4</span>
              </div>
              <h3 className="font-bold text-[var(--neutral)] mb-2">Grow Revenue</h3>
              <p className="text-sm text-gray-600">Track performance, optimize deals, and watch your empty seats fill up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--neutral)] mb-16" style={{ fontFamily: 'Fraunces, serif' }}>
            Why Restaurants Love TableMesh
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">Guaranteed Groups</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every diner who comes through TableMesh is part of a group of 4+. Higher average check sizes, guaranteed.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">No Commission Fees</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Unlike delivery apps that take 15-30%, TableMesh charges a flat monthly fee. Keep 100% of your revenue.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">Fill Off-Peak Hours</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Target slow days and times with specific deals. Turn Tuesday nights and Wednesday lunches into busy periods.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">Real Analytics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                See exactly how many groups visit, which deals perform best, and track your ROI in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">Auto-Generated Requests</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your deals automatically create dining requests visible to nearby users. Zero effort marketing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">Verified Diners</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                All TableMesh users have verified profiles. No fake reservations, no no-shows from anonymous users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-20 px-6 bg-white scroll-mt-24">
        <div className="max-w-5xl mx-auto">

          {/* Grand Opening Banner */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm">
              <span className="text-base">🎊</span>
              Grand Opening Pricing — Rates increase as we grow
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--neutral)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Lock In Your Rate Today
          </h2>
          <p className="text-center text-lg text-gray-600 mb-3 max-w-2xl mx-auto">
            Early partners keep this price for life — no commission fees, no hidden charges, just a flat rate.
          </p>
          <p className="text-center text-sm text-gray-400 mb-10 max-w-xl mx-auto">
            Comparable restaurant marketing tools charge $149–$499/month. We&apos;re building with our early partners, and this rate reflects that partnership.
          </p>

          {/* Billing toggle note */}
          <div className="flex flex-col items-center gap-2 mb-12">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <span className="px-4 py-2 rounded-lg bg-white shadow text-sm font-semibold text-[var(--neutral)]">Monthly — $49/mo</span>
              <span className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500">Yearly — $470/yr</span>
            </div>
            <p className="text-sm text-green-600 font-semibold">Save $118/year with annual billing — about $39/month</p>
            <p className="text-xs text-gray-400">Switch billing period in your dashboard after signing up</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[var(--neutral)]">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">Get listed and start reaching diners</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  1 active deal at a time
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Restaurant profile page
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Basic analytics (totals only)
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  No auto-generated dining requests
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  No per-deal analytics
                </li>
              </ul>
              <Link
                href="/partner/signup"
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all font-semibold text-center block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-[var(--primary)] rounded-2xl p-8 flex flex-col relative shadow-xl">
              {/* Stacked badges */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--primary)] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Grand Opening Rate
              </div>

              <h3 className="text-xl font-bold text-[var(--neutral)] mb-2">Pro</h3>

              {/* Price with future anchor */}
              <div className="mb-1 flex items-end gap-2">
                <span className="text-4xl font-bold text-[var(--primary)]">$49</span>
                <span className="text-gray-500 mb-1">/month</span>
                <span className="text-sm text-gray-400 line-through mb-1">$99+</span>
              </div>
              <p className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-2">
                🔒 Early partners lock in this rate — price increases as we grow
              </p>
              <p className="text-sm text-green-600 font-semibold mb-1">or $470/year — save $118 (~$39/mo)</p>
              <p className="text-xs text-blue-600 font-medium bg-blue-50 rounded-lg px-3 py-2 mb-4">🎉 Start with a free 1-month trial — no charge until it ends</p>

              <p className="text-sm text-gray-600 mb-6">For restaurants ready to fill seats and grow revenue</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Up to 3 active deals
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Auto-generated hostless dining requests
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Full analytics + per-deal breakdown
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Redemption history
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Cancel anytime
                </li>
              </ul>
              <Link
                href="/partner/signup?plan=pro"
                className="w-full py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-center block"
              >
                Start Free Trial — Lock In $49/mo
              </Link>
            </div>
          </div>

          {/* Competitor context */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              OpenTable starts at <span className="font-semibold text-gray-700">$149/month</span>. Toast marketing tools start at <span className="font-semibold text-gray-700">$110/month</span>. TableMesh Pro is <span className="font-semibold text-[var(--primary)]">$49/month</span> — and early partners keep that rate as prices rise.
            </p>
          </div>

        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
            Ready to Fill Your Empty Tables?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join restaurants already using TableMesh to attract group diners and boost revenue. Get started in under 5 minutes.
          </p>
          <Link
            href="/partner/signup"
            className="inline-block px-10 py-4 bg-white text-[var(--primary)] rounded-xl hover:shadow-xl transition-all text-lg font-bold"
          >
            Create Your Restaurant Profile
          </Link>
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
                The group dining platform connecting restaurants with groups of diners. Fill empty seats, grow revenue.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/50">For Restaurants</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/partner/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/partner/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/50">For Diners</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/" className="hover:text-white transition-colors">Download App</Link></li>
                <li><Link href="/safety-guidelines" className="hover:text-white transition-colors">Safety Guidelines</Link></li>
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
