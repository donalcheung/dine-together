import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import Navbar from '../components/Navbar'
import DownloadButtons from '../DownloadButtons'
import { productUpdates, platformLabels, type UpdatePlatform } from './updates-data'

export const metadata: Metadata = {
  title: 'Product Updates — TableMesh',
  description:
    'See what we have shipped recently in the TableMesh app and on tablemesh.com — new features, fixes, and improvements by release date.',
  alternates: {
    canonical: '/updates',
  },
  openGraph: {
    title: 'Product Updates — TableMesh',
    description: 'Changelog of recent TableMesh app and web releases.',
    url: 'https://tablemesh.com/updates',
  },
}

function PlatformBadge({ platform }: { platform: UpdatePlatform }) {
  const styles: Record<UpdatePlatform, string> = {
    app: 'bg-orange-50 text-orange-700 border-orange-100',
    web: 'bg-blue-50 text-blue-700 border-blue-100',
    both: 'bg-purple-50 text-purple-700 border-purple-100',
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[platform]}`}
    >
      {platformLabels[platform]}
    </span>
  )
}

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider mb-3">
            Changelog
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-[var(--neutral)] mb-5 leading-tight"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            What We&apos;ve <span className="text-[var(--primary)]">Shipped</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            New features and fixes land in the app and on the web all the time. Here is a running log by date — for the big-picture product story, see{' '}
            <Link href="/features" className="text-[var(--primary)] font-semibold hover:underline">
              core features
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-orange-200 via-amber-100 to-transparent" aria-hidden />

          <div className="space-y-14">
            {productUpdates.map((release) => (
              <article key={release.date} className="relative pl-8">
                <div
                  className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-white border-2 border-[var(--primary)] shadow-sm"
                  aria-hidden
                />

                <time
                  dateTime={release.date}
                  className="block text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4"
                >
                  {release.displayDate}
                </time>

                <ul className="space-y-5">
                  {release.items.map((item, i) => {
                    const platform = item.platform ?? 'app'
                    return (
                      <li
                        key={`${release.date}-${i}`}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <h2 className="text-lg font-bold text-[var(--neutral)] pr-2" style={{ fontFamily: 'Fraunces, serif' }}>
                            {item.title}
                          </h2>
                          <PlatformBadge platform={platform} />
                        </div>
                        <p className="text-gray-600 leading-relaxed text-[15px]">{item.description}</p>
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-16 text-center text-sm text-gray-500">
          Missing something?{' '}
          <Link href="/contact" className="text-[var(--primary)] font-medium hover:underline">
            Let us know
          </Link>
          .
        </p>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Try the Latest Build
          </h2>
          <p className="text-white/90 mb-8">Download TableMesh and see these updates in action.</p>
          <DownloadButtons variant="cta" />
        </div>
      </section>

      <footer className="bg-[var(--neutral)] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="TableMesh" width={32} height={32} className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold">TableMesh</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/updates" className="hover:text-white transition-colors">Updates</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/partner" className="hover:text-white transition-colors">For Restaurants</Link>
          </div>
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Sheep Labs LLC.</p>
        </div>
      </footer>
    </div>
  )
}
