import Link from 'next/link'
import { Metadata } from 'next'
import Navbar from '../components/Navbar'

export const metadata: Metadata = {
  title: 'TableMesh Blog — Group Dining Tips, Ideas & Stories',
  description:
    'Discover tips for organizing group dinners, team lunch ideas, social dining guides, and stories from the TableMesh community. Learn how to bring everyone to the table.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'TableMesh Blog — Group Dining Tips, Ideas & Stories',
    description:
      'Tips for organizing group dinners, team lunch ideas, and social dining guides from TableMesh.',
    url: 'https://tablemesh.com/blog',
  },
}

const posts = [
  {
    slug: 'loneliness-epidemic-social-dining',
    title: 'The Loneliness Epidemic Has a Surprisingly Simple Cure: Dinner With Strangers',
    excerpt:
      'Solo dining is up 52% and 1 in 4 Americans now eat every meal alone. New research from the World Happiness Report reveals why shared meals may be one of the most powerful tools we have against the loneliness crisis — and how TableMesh is now on iOS to help.',
    date: 'March 18, 2026',
    readTime: '7 min read',
    category: 'Insights',
  },
  {
    slug: 'how-to-organize-group-dinner',
    title: 'How to Organize a Group Dinner Without the Chaos',
    excerpt:
      'Tired of endless group chat debates about where to eat? Here are 7 proven strategies to coordinate group dinners that actually happen — from picking the restaurant to splitting the bill.',
    date: 'March 7, 2026',
    readTime: '6 min read',
    category: 'Tips & Guides',
  },
  {
    slug: 'best-team-lunch-ideas',
    title: '10 Team Lunch Ideas That Actually Build Culture',
    excerpt:
      'Skip the sad desk lunch. These team lunch formats — from rotating restaurant picks to themed food crawls — turn midday meals into the best part of your workday.',
    date: 'March 5, 2026',
    readTime: '5 min read',
    category: 'For Teams',
  },
  {
    slug: 'social-dining-guide-for-introverts',
    title: 'The Introvert\'s Guide to Social Dining',
    excerpt:
      'Eating with new people doesn\'t have to be overwhelming. Here\'s how to enjoy group meals on your own terms — from choosing the right group size to conversation starters that actually work.',
    date: 'March 3, 2026',
    readTime: '7 min read',
    category: 'Community',
  },
  {
    slug: 'korean-bbq-group-dining-guide',
    title: 'Korean BBQ: Why It\'s Better with a Group (And How to Plan One)',
    excerpt:
      'Korean BBQ is designed for sharing. Learn the etiquette, how many people you need, what to order, and how to split the bill fairly — plus tips for first-timers.',
    date: 'March 1, 2026',
    readTime: '8 min read',
    category: 'Food Guides',
  },
  {
    slug: 'why-eating-alone-is-costing-you',
    title: 'Why Eating Alone Is Costing You More Than You Think',
    excerpt:
      'Research shows that shared meals strengthen relationships, improve mental health, and even save money. Here\'s the science behind why humans are meant to eat together.',
    date: 'February 27, 2026',
    readTime: '6 min read',
    category: 'Insights',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          The TableMesh Blog
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Tips for organizing group meals, team lunch ideas, social dining guides, and stories from people who believe food is better shared.
        </p>
      </section>

      {/* Posts */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-gray-100 pb-10">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full font-medium text-xs">
                  {post.category}
                </span>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-orange-600 transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-orange-600 font-medium text-sm hover:text-orange-700"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Bring Everyone to the Table?
          </h2>
          <p className="text-gray-600 mb-8">
            TableMesh makes organizing group meals as easy as sending a text. Download the app and host your first table today.
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Get TableMesh Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500">
          © 2026 Sheep Labs LLC. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
