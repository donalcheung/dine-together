import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us \u2014 TableMesh',
  description: 'Learn about TableMesh, the social dining platform built by Sheep Labs LLC. Our mission is to bring people together around great food.',
}

export default function AboutUs() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-8" style={{ fontFamily: 'Fraunces, serif' }}>About TableMesh</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-xl leading-relaxed">TableMesh is a social dining platform built on a simple idea: <strong>food tastes better when shared</strong>.</p>

            <p className="leading-relaxed">We started TableMesh because we noticed something: planning a group meal is harder than it should be. Whether it is a team lunch that devolves into an endless Slack thread, a friends&apos; dinner that never gets past &ldquo;we should totally do that,&rdquo; or a traveler eating alone in a new city &mdash; the friction of coordinating a shared meal stops too many great experiences from happening.</p>

            <p className="leading-relaxed">TableMesh removes that friction. In a few taps, you can host a table, invite your group, or discover public meals happening near you. Our in-app chat keeps everything organized, and community ratings help build trust so you can dine with confidence.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-12 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Our Mission</h2>
            <p className="leading-relaxed">We believe that shared meals are one of the most powerful ways to build relationships &mdash; between friends, colleagues, neighbors, and strangers who become friends. Our mission is to make it effortless for anyone to bring people together around a table.</p>

            <h2 className="text-2xl font-bold text-[var(--neutral)] mt-12 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Who We Are</h2>
            <p className="leading-relaxed">TableMesh is built by <strong>Sheep Labs LLC</strong>, a small team passionate about food, community, and building tools that bring people together. Founded in 2026, we are based in the United States and committed to creating a safe, inclusive platform for diners everywhere.</p>

            <div className="mt-12 p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl text-center">
              <p className="text-lg font-semibold text-[var(--neutral)] mb-4">Ready to bring your table together?</p>
              <a href="/#download" className="inline-block px-8 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all font-semibold">Download TableMesh</a>
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
