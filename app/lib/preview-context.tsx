'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PreviewContextType {
  isPreviewMode: boolean
  previewRestaurantId: string | null
  exitPreview: () => void
}

const PreviewContext = createContext<PreviewContextType>({
  isPreviewMode: false,
  previewRestaurantId: null,
  exitPreview: () => {},
})

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewRestaurantId, setPreviewRestaurantId] = useState<string | null>(null)

  useEffect(() => {
    // Check URL params for preview mode
    const params = new URLSearchParams(window.location.search)
    const preview = params.get('preview')
    const restaurantId = params.get('restaurant_id')

    if (preview === 'true' && restaurantId) {
      setIsPreviewMode(true)
      setPreviewRestaurantId(restaurantId)
    }
  }, [])

  const exitPreview = () => {
    setIsPreviewMode(false)
    setPreviewRestaurantId(null)
    // Navigate back to admin
    window.location.href = '/admin/dashboard/restaurants'
  }

  return (
    <PreviewContext.Provider value={{ isPreviewMode, previewRestaurantId, exitPreview }}>
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreview() {
  return useContext(PreviewContext)
}
