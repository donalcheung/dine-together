'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, Users, MapPin, Star, Clock, Shield, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard')
    } else {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Utensils className="w-8 h-8 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-2xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/auth" 
              className="px-4 py-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/auth?signup=true" 
              className="px-6 py-2 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-200">
            <span className="text-[var(--primary)] font-medium">✨ Share Food. Split Bills. Make Friends.</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-[var(--neutral)] mb-6 leading-tight">
            Never Eat<br />
            <span className="text-[var(--primary)] italic">Alone</span> Again
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Going to dim sum solo? Want to try 5 tapas but dining alone? 
            Find nearby food lovers who want to share dishes and split the bill.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-[var(--primary)] text-white rounded-full text-lg font-semibold hover:bg-[var(--primary-dark)] transition-all hover:shadow-xl transform hover:scale-105"
            >
              Find Dining Partners
            </Link>
            <Link 
              href="/create" 
              className="px-8 py-4 bg-white text-[var(--neutral)] rounded-full text-lg font-semibold border-2 border-[var(--neutral)] hover:bg-[var(--neutral)] hover:text-white transition-all"
            >
              Create Dining Request
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center mt-16 flex-wrap">
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--primary)]">2,847</div>
              <div className="text-gray-600">Meals Shared</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--primary)]">1,203</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--primary)]">4.8★</div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-[var(--neutral)]">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 card-hover">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <MapPin className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">1. Choose Restaurant</h3>
              <p className="text-gray-600 leading-relaxed">
                Heading to dinner in the next hour? Pick your restaurant and how many people you want to join you.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 card-hover">
              <div className="w-16 h-16 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0.2s'}}>
                <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">2. Get Matched</h3>
              <p className="text-gray-600 leading-relaxed">
                Nearby diners see your request and can join. You approve who comes based on their profile and ratings.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 card-hover">
              <div className="w-16 h-16 bg-[var(--neutral)] rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0.4s'}}>
                <Utensils className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">3. Dine & Share</h3>
              <p className="text-gray-600 leading-relaxed">
                Order multiple dishes, share the experience, split the bill easily. Rate each other after!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-[var(--neutral)]">
            Why DineTogether?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Clock className="w-12 h-12 text-[var(--primary)] mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Spontaneous & Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                No need to plan days ahead. Post a request an hour before dinner and find companions instantly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Star className="w-12 h-12 text-[var(--accent)] mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Trusted Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Every diner has a profile with ratings and reviews. You choose who joins your table.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Users className="w-12 h-12 text-[var(--primary)] mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Your Group Size</h3>
              <p className="text-gray-600 leading-relaxed">
                Want just one person? Or three? You decide the perfect group size for your dining experience.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Shield className="w-12 h-12 text-[var(--neutral)] mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Safe & Verified</h3>
              <p className="text-gray-600 leading-relaxed">
                Public restaurant settings, verified profiles, and a reputation system keep everyone accountable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Try More Dishes?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of food lovers making every meal an adventure.
          </p>
          <Link 
            href="/auth?signup=true" 
            className="inline-block px-10 py-4 bg-white text-[var(--primary)] rounded-full text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Start Dining Together
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--neutral)] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="w-6 h-6" />
            <span className="text-xl font-bold">DineTogether</span>
          </div>
          <p className="text-white/70 mb-6">Share meals. Split bills. Make memories.</p>
          <div className="flex gap-6 justify-center text-sm text-white/70">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="mt-8 text-white/50 text-sm">© 2026 DineTogether. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
