'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          router.push('/auth?error=authentication_failed')
          return
        }

        if (session?.user) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()
          
          // Create profile if it doesn't exist
          if (!profile) {
            const userName = session.user.user_metadata?.full_name || 
                            session.user.user_metadata?.name || 
                            session.user.email?.split('@')[0] || 
                            'User'
            
            await supabase
              .from('profiles')
              .upsert([
                {
                  id: session.user.id,
                  email: session.user.email!,
                  name: userName,
                  avatar_url: session.user.user_metadata?.avatar_url || 
                              session.user.user_metadata?.picture || null,
                  rating: 5.0,
                  total_ratings: 0,
                }
              ], {
                onConflict: 'id'
              })
          }

          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          // No session, redirect back to auth
          router.push('/auth')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/auth?error=something_went_wrong')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
