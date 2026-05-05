import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Group Dining Near You — TableMesh',
  description:
    'Browse open dining tables and group meals near you. Find food lovers, join a hosted dinner, or start your own. Discover Korean BBQ, dim sum, and more.',
  alternates: {
    canonical: '/explore',
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
