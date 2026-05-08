'use client'

import { useEffect } from 'react'
import { trackPageView } from '../lib/track-page'

export default function PageTracker({ page, params }: { page: string; params?: Record<string, string> }) {
  useEffect(() => {
    trackPageView(page, params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
