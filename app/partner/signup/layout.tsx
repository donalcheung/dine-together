import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner Sign Up — TableMesh',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PartnerSignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
