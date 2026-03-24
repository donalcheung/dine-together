import Link from 'next/link'
import { Metadata } from 'next'
import Navbar from '../../components/Navbar'

export const metadata: Metadata = {
  title: 'Why Eating Alone Is Costing You More Than You Think | TableMesh',
  description: 'Research shows that shared meals strengthen relationships, improve mental health, and even save money. Here\'s the science behind why humans are meant to eat together.',
  alternates: { canonical: '/blog/why-eating-alone-is-costing-you' },
  openGraph: { title: 'Why Eating Alone Is Costing You More Than You Think', description: 'The science behind why humans are meant to eat together.', url: 'https://tablemesh.com/blog/why-eating-alone-is-costing-you', type: 'article' },
}

const articleJsonLd = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'Why Eating Alone Is Costing You More Than You Think',
  author: { '@type': 'Organization', name: 'TableMesh', url: 'https://tablemesh.com' },
  publisher: { '@type': 'Organization', name: 'TableMesh', url: 'https://tablemesh.com', logo: { '@type': 'ImageObject', url: 'https://tablemesh.com/icon-512x512.png' } },
  datePublished: '2026-02-27', dateModified: '2026-02-27',
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} /></head>
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full font-medium text-xs">Insights</span>
            <span>February 27, 2026</span><span>·</span><span>6 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Why Eating Alone Is Costing You More Than You Think
          </h1>
          <p className="text-xl text-gray-600">
            Research shows that shared meals strengthen relationships, improve mental health, and even save money. Here&apos;s the science behind why humans are meant to eat together.
          </p>
        </div>

        <div className="prose prose-lg prose-gray max-w-none">
          <p>
            In 2024, the U.S. Surgeon General declared loneliness a public health epidemic, noting that social isolation carries health risks equivalent to smoking 15 cigarettes a day. At the same time, data from the USDA shows that Americans are eating alone more than ever — nearly half of all meals are now consumed solo. These two trends are not unrelated. Shared meals have been the foundation of human social bonding for hundreds of thousands of years, and we&apos;re abandoning them at our own cost.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Mental Health Connection</h2>
          <p>
            A 2023 study published in the journal PLOS ONE found that people who regularly eat meals with others report significantly lower rates of depression and anxiety compared to those who eat alone. The effect was consistent across age groups and cultures. The researchers attributed this to the combination of social interaction, routine, and the neurochemical effects of sharing food — eating together triggers oxytocin release, the same hormone associated with bonding and trust.
          </p>
          <p>
            Another study from the University of Oxford found that the more often people eat with others, the more likely they are to feel happy and satisfied with their lives. The relationship was dose-dependent: more shared meals meant more happiness, with diminishing returns only after eating with others more than 6 times per week.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Financial Cost of Solo Dining</h2>
          <p>
            Eating alone is also more expensive per person than eating in a group. Shared dishes — Korean BBQ, dim sum, family-style Italian — offer dramatically better value when split among 4-6 people. A $100 Korean BBQ spread feeds 4 people for $25 each, while a solo dinner at a comparable restaurant runs $30-40. Group dining also enables access to prix fixe menus and tasting menus that require minimum party sizes, often offering the best value-per-dish ratio on the menu.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Career Impact</h2>
          <p>
            In professional settings, shared meals are one of the most powerful networking tools available. A Harvard Business Review study found that firefighters who ate together performed significantly better as teams than those who didn&apos;t. In corporate settings, employees who regularly eat lunch with colleagues are promoted faster and report higher job satisfaction. The informal conversations that happen over food — about projects, ideas, frustrations — build the kind of trust and understanding that formal meetings rarely achieve.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Relationship Dividend</h2>
          <p>
            Anthropologist Robin Dunbar, known for &quot;Dunbar&apos;s Number&quot; (the theory that humans can maintain about 150 stable relationships), found that shared meals are one of the top predictors of relationship quality. People who eat together regularly report stronger friendships, more trust, and greater willingness to help each other. The act of breaking bread together — literally sharing sustenance — activates deep evolutionary bonding mechanisms that no amount of texting or social media can replicate.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why We Stopped Eating Together</h2>
          <p>
            The shift toward solo eating isn&apos;t because people prefer it. It&apos;s because coordination is hard. Work schedules are fragmented. Friend groups are scattered across cities. The mental overhead of organizing a group meal — picking a restaurant, finding a time that works, managing RSVPs — is enough to make most people default to eating alone. The problem isn&apos;t desire; it&apos;s friction.
          </p>

          <div className="bg-orange-50 rounded-xl p-8 mt-12 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Remove the Friction with TableMesh</h3>
            <p className="text-gray-700 mb-4">
              TableMesh eliminates the coordination overhead that keeps people eating alone. Host a table in 30 seconds, share a link, and let people RSVP. No more group chat chaos. No more plans that die in the thread. Just real meals with real people.
            </p>
            <Link href="/" className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm">
              Get TableMesh Free →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Bottom Line</h2>
          <p>
            Eating alone isn&apos;t just a lifestyle choice — it has measurable costs to your mental health, your wallet, your career, and your relationships. The science is clear: humans are meant to eat together. The question isn&apos;t whether shared meals matter — it&apos;s how to make them happen more often. And that starts with removing the friction that keeps us eating alone.
          </p>
        </div>
      </article>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-500">© 2026 Sheep Labs LLC. All rights reserved.</div>
      </footer>
    </div>
  )
}
