import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Korean BBQ: Why It\'s Better with a Group (And How to Plan One) | TableMesh',
  description:
    'Korean BBQ is designed for sharing. Learn the etiquette, how many people you need, what to order, and how to split the bill fairly — plus tips for first-timers.',
  alternates: { canonical: '/blog/korean-bbq-group-dining-guide' },
  openGraph: {
    title: 'Korean BBQ: Why It\'s Better with a Group',
    description: 'Everything you need to know about planning a Korean BBQ group dinner.',
    url: 'https://tablemesh.com/blog/korean-bbq-group-dining-guide',
    type: 'article',
  },
}

const articleJsonLd = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'Korean BBQ: Why It\'s Better with a Group (And How to Plan One)',
  author: { '@type': 'Organization', name: 'TableMesh', url: 'https://tablemesh.com' },
  publisher: { '@type': 'Organization', name: 'TableMesh', url: 'https://tablemesh.com', logo: { '@type': 'ImageObject', url: 'https://tablemesh.com/icon-512x512.png' } },
  datePublished: '2026-03-01', dateModified: '2026-03-01',
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
            <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full font-medium text-xs">Food Guides</span>
            <span>March 1, 2026</span><span>·</span><span>8 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Korean BBQ: Why It&apos;s Better with a Group (And How to Plan One)
          </h1>
          <p className="text-xl text-gray-600">
            Korean BBQ is designed for sharing. Here&apos;s everything you need to know to plan the perfect group KBBQ night.
          </p>
        </div>

        <div className="prose prose-lg prose-gray max-w-none">
          <p>
            Korean BBQ is one of the few dining experiences that genuinely requires a group. The communal grill at the center of the table, the endless banchan (side dishes), the variety of meats — it&apos;s all designed for sharing. Going solo to KBBQ is like buying a whole pizza and eating one slice. Technically possible, but you&apos;re missing the point.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Magic Number: 4 to 6 People</h2>
          <p>
            Most Korean BBQ restaurants seat groups of 4-6 per grill. This is the sweet spot: enough people to order a wide variety of meats, share the grilling duties, and keep the conversation flowing — but not so many that you&apos;re fighting for grill space. With 4 people, you can comfortably order 5-6 different cuts and try everything. The per-person cost also drops significantly: a $120 all-you-can-eat spread split four ways is $30 each, compared to $60 for a couple.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What to Order: A Group Guide</h2>
          <p>
            If your group is new to KBBQ, here&apos;s a reliable ordering strategy. Start with the classics: galbi (marinated short ribs) and samgyeopsal (pork belly) are crowd-pleasers that even picky eaters enjoy. Add bulgogi (marinated beef) for something sweeter and chadolbaegi (thinly sliced beef brisket) for something more savory. If your group is adventurous, add dakgalbi (spicy chicken) or gopchang (intestines). Most places offer all-you-can-eat options that remove the ordering anxiety entirely.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">KBBQ Etiquette for First-Timers</h2>
          <p>
            Korean BBQ has a few unwritten rules that are good to know before your first visit. The youngest person at the table traditionally handles the grilling (though this is relaxed in most American KBBQ restaurants). Don&apos;t flip the meat too often — once is usually enough. Use the lettuce wraps: take a piece of lettuce, add meat, a dab of ssamjang (fermented bean paste), a slice of garlic, and wrap it up. This is the authentic way to eat KBBQ and it&apos;s delicious.
          </p>
          <p>
            Don&apos;t fill up on rice early — save room for the meat. The banchan (side dishes) are refillable at most places, so don&apos;t be shy about asking for more kimchi or pickled radish. And if someone is grilling for you, it&apos;s polite to pour their drink.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Splitting the Bill</h2>
          <p>
            KBBQ is one of the easiest cuisines to split evenly because everyone eats from the same grill. Most groups just divide the total by the number of people. If you&apos;re doing all-you-can-eat (which most KBBQ restaurants offer), the price is already per-person, making it even simpler. Drinks are usually the only variable — handle those separately if needed.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How to Rally Your Group</h2>
          <p>
            The hardest part of a KBBQ night isn&apos;t the food — it&apos;s getting 4-6 people to commit to the same night. Here&apos;s what works: pick the date and restaurant yourself, then send a simple invite with the details. Don&apos;t ask &quot;when works for everyone?&quot; — that&apos;s how plans die. On TableMesh, you can create a dining request for KBBQ, set the group size to 4-6, and share the link. People RSVP with a tap, and you can see exactly who&apos;s coming.
          </p>

          <div className="bg-orange-50 rounded-xl p-8 mt-12 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Rally Your KBBQ Crew on TableMesh</h3>
            <p className="text-gray-700 mb-4">
              Post a KBBQ night, set your group size, and share the link. Friends RSVP with a tap — no app download required. Chat in-app to coordinate and get everyone to the grill.
            </p>
            <Link href="/" className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm">
              Get TableMesh Free →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Bottom Line</h2>
          <p>
            Korean BBQ is more than a meal — it&apos;s an experience built around community. The shared grill, the communal banchan, the collaborative cooking — it all creates a sense of togetherness that few other dining formats can match. Grab 3-5 friends, pick a spot, and let the grill bring you together.
          </p>
        </div>
      </article>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-500">© 2026 Sheep Labs LLC. All rights reserved.</div>
      </footer>
    </div>
  )
}
