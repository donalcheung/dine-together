import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dining Request — TableMesh',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return children
}
