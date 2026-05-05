import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join TableMesh',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RefLayout({ children }: { children: React.ReactNode }) {
  return children
}
