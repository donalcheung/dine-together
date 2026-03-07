import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Introvert\'s Guide to Social Dining | TableMesh',
  description: 'Eating with new people doesn\'t have to be overwhelming. Here\'s how to enjoy group meals on your own terms — from choosing the right group size to conversation starters.',
  alternates: { canonical: '/blog/social-dining-guide-for-introverts' },
  openGraph: { title: 'The Introvert\'s Guide to Social Dining', description: 'How to enjoy group meals on your own terms.', url: 'https://tablemesh.com/blog/social-dining-guide-for-introverts', type: 'article' },
}

const articleJsonLd = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'The Introvert\'s Guide to Social Dining',
  author: { '@type': 'Organization', name: 'TableMesh', url: 'https://tablemesh.com' },
  publisher: { '@type': 'Organization', name: 'TableMesh', url: 'https://tablemesh.com', logo: { '@type': 'ImageObject', url: 'https://tablemesh.com/icon-512x512.png' } },
  datePublished: '2026-03-03', dateModified: '2026-03-03',
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} /></head>

      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <img src="/icon-192x192.png" alt="TableMesh" className="w-8 h-8 rounded-lg" />TableMesh
          </Link>
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <Link href="/blog" className="text-orange-600 font-medium">Blog</Link>
          </nav>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full font-medium text-xs">Community</span>
            <span>March 3, 2026</span><span>·</span><span>7 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            The Introvert&apos;s Guide to Social Dining
          </h1>
          <p className="text-xl text-gray-600">
            Eating with new people doesn&apos;t have to be overwhelming. Here&apos;s how to enjoy group meals on your own terms.
          </p>
        </div>

        <div className="prose prose-lg prose-gray max-w-none">
          <p>
            Introverts often get a bad rap when it comes to social dining. The assumption is that if you&apos;re introverted, you don&apos;t want to eat with other people. That&apos;s not true. Introverts enjoy connection just as much as extroverts — they just prefer it in smaller doses, with less noise, and with more meaningful conversation. The good news is that dining is actually one of the best social formats for introverts, because it comes with a built-in activity (eating) that fills the silences naturally.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Keep the Group Small</h2>
          <p>
            Research from Oxford anthropologist Robin Dunbar shows that meaningful conversation happens in groups of 4 or fewer. Beyond that, the table splits into sub-conversations and the noise level rises. For introverts, a group of 3-4 is the sweet spot: enough people for varied conversation, but small enough that you won&apos;t get lost in the crowd. On TableMesh, you can set your group size to exactly what feels comfortable.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Choose the Right Restaurant</h2>
          <p>
            The venue matters more than you think. Avoid loud, crowded spots where you have to shout to be heard — that drains introverts faster than anything. Look for restaurants with good acoustics, comfortable seating, and a relaxed pace. Japanese restaurants, wine bars, and farm-to-table spots tend to have the right vibe. Avoid all-you-can-eat buffets and sports bars.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Use Food as a Conversation Starter</h2>
          <p>
            One of the best things about dining is that the food itself provides endless conversation material. &quot;Have you tried this before?&quot; &quot;What do you usually order here?&quot; &quot;This reminds me of a place I went in...&quot; Food is a universal topic that doesn&apos;t require vulnerability or personal disclosure — perfect for introverts who prefer to warm up gradually.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Give Yourself an Exit Strategy</h2>
          <p>
            One of the biggest sources of social anxiety is feeling trapped. Before you go, give yourself permission to leave after a reasonable time. Dinner typically lasts 60-90 minutes — that&apos;s a perfectly acceptable window. If you&apos;re having a great time, stay longer. If your social battery is draining, you can gracefully exit without guilt. Having an exit plan paradoxically makes you more likely to enjoy the experience.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Start with People You Know</h2>
          <p>
            If dining with strangers feels like too big a leap, start with your existing circle. Organize a small dinner with 2-3 friends you&apos;re already comfortable with. Once you&apos;ve built the habit of social dining, you can gradually expand — maybe a friend brings a friend, or you join a table with one or two new faces mixed in with familiar ones.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Power of Being the Host</h2>
          <p>
            This might sound counterintuitive, but hosting a meal can actually be easier for introverts than attending one. When you&apos;re the host, you have a defined role: you chose the restaurant, you set the time, you welcome people. This structure reduces the ambiguity that makes social situations stressful. You&apos;re not wondering &quot;what should I do?&quot; — you already know.
          </p>

          <div className="bg-orange-50 rounded-xl p-8 mt-12 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dine on Your Terms with TableMesh</h3>
            <p className="text-gray-700 mb-4">
              Set your group size, pick a quiet restaurant, and invite just the right number of people. TableMesh lets you control the dining experience so you can enjoy the connection without the overwhelm.
            </p>
            <Link href="/" className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm">
              Get TableMesh Free →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Bottom Line</h2>
          <p>
            Social dining isn&apos;t about being the loudest person at the table. It&apos;s about sharing a meal with people whose company you enjoy, at a pace that works for you. Small groups, quiet restaurants, familiar faces, and a clear exit strategy — that&apos;s the introvert&apos;s recipe for a great dinner out.
          </p>
        </div>
      </article>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-500">© 2026 Sheep Labs LLC. All rights reserved.</div>
      </footer>
    </div>
  )
}
