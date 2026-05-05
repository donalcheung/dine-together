import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dining Table — TableMesh',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DineLayout({ children }: { children: React.ReactNode }) {
  return children
}
