'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Utensils, Users, MapPin, Star, Clock, Shield, Heart, Briefcase, Plane, Users2, TrendingUp } from 'lucide-react'
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
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="TableMesh Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold text-[var(--neutral)]">TableMesh</h1>
          </Link>
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
            <span className="text-[var(--primary)] font-medium">🍽️ The Social Dining Network</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-[var(--neutral)] mb-6 leading-tight">
            Turn Every Meal<br />
            Into an <span className="text-[var(--primary)] italic">Experience</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Whether you're traveling solo, grabbing lunch with coworkers, organizing group dinners, or just want to try more dishes—TableMesh connects you with the right dining companions.
          </p>
          <Link 
            href="/create" 
            className="px-8 py-4 bg-white text-[var(--neutral)] rounded-full text-lg font-semibold border-2 border-[var(--neutral)] hover:bg-[var(--neutral)] hover:text-white transition-all"
          >
            Post Your Plans
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex gap-8 justify-center mt-16 flex-wrap">
          <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-700">Verified Profiles</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-gray-700">Community Ratings</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">Location-Based</span>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4 text-[var(--neutral)]">
            One Platform, Endless Possibilities
          </h2>
          <p className="text-center text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            From solo travelers to restaurant owners, TableMesh brings people together around great food
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Solo Travelers */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 card-hover">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <Plane className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Solo Travelers</h3>
              <p className="text-gray-600 leading-relaxed">
                Exploring a new city alone? Find locals or fellow travelers to share authentic dishes and experiences with.
              </p>
            </div>

            {/* Coworkers */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 card-hover">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0.1s'}}>
                <Briefcase className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Lunch Breaks</h3>
              <p className="text-gray-600 leading-relaxed">
                Signal to your coworkers where you're grabbing lunch. Turn solo breaks into casual team bonding.
              </p>
            </div>

            {/* Friends in Town */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 card-hover">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0.2s'}}>
                <Heart className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Visiting Friends</h3>
              <p className="text-gray-600 leading-relaxed">
                In town for the weekend? Let friends know you're around and available for spontaneous dinners.
              </p>
            </div>

            {/* Group Events */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 card-hover">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0.3s'}}>
                <Users2 className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Community Groups</h3>
              <p className="text-gray-600 leading-relaxed">
                Running a book club or meetup? Post your group's dinner plans and let others discover your community.
              </p>
            </div>

            {/* Try New Dishes */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 card-hover">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0.4s'}}>
                <Utensils className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Food Explorers</h3>
              <p className="text-gray-600 leading-relaxed">
                Want to try dim sum but can't order enough? Find others to split dishes and explore the full menu.
              </p>
            </div>

            {/* Restaurant Promotions */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 card-hover">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0.5s'}}>
                <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Restaurants</h3>
              <p className="text-gray-600 leading-relaxed">
                Fill tables during slow hours. Post special deals and attract groups looking for great dining experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-[var(--neutral)]">
            Simple as 1-2-3
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Post Your Plans</h3>
              <p className="text-gray-600 leading-relaxed">
                Share where you're dining and how many seats are available. Add details about cuisine preferences or group vibe.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Connect & Confirm</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse requests near you or review join requests for yours. Message to coordinate details and confirm attendance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--neutral)]">Dine & Review</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy your meal together. Afterward, rate your dining companions to help build a trusted community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-[var(--neutral)]">
            Built for Real Diners
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <Clock className="w-12 h-12 text-blue-500 mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Flexible Timing</h3>
              <p className="text-gray-600 leading-relaxed">
                Post hours in advance or minutes before. See what's happening now or plan ahead for the weekend.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <Star className="w-12 h-12 text-purple-500 mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Rating System</h3>
              <p className="text-gray-600 leading-relaxed">
                Build your reputation as a reliable dining companion. See others' ratings before you commit.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <MapPin className="w-12 h-12 text-green-500 mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Location-Based</h3>
              <p className="text-gray-600 leading-relaxed">
                See dining requests near you, sorted by distance. Never miss out on nearby opportunities.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <Shield className="w-12 h-12 text-amber-500 mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-bold mb-3 text-[var(--neutral)]">Safe & Public</h3>
              <p className="text-gray-600 leading-relaxed">
                Always meet in public restaurants. Verified profiles, ratings, and transparent communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-[var(--neutral)]">
            What Diners Say
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                "I travel for work constantly. TableMesh turned lonely hotel dinners into amazing conversations with locals. Best app for solo travelers!"
              </p>
              <div className="font-semibold text-[var(--neutral)]">— Sarah, Digital Nomad</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                "We use it to organize monthly dinners for our book club. Way easier than group texts. Everyone sees who's coming and where we're meeting."
              </p>
              <div className="font-semibold text-[var(--neutral)]">— Michael, Community Organizer</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                "Finally tried that dim sum spot! Found 3 people to split dishes with. We ordered the whole menu and spent half what we would've alone."
              </p>
              <div className="font-semibold text-[var(--neutral)]">— Jamie, Food Enthusiast</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">
                "As a restaurant owner, Tuesday nights were dead. Now we post deals on TableMesh and fill 10-15 tables. Game changer for revenue."
              </p>
              <div className="font-semibold text-[var(--neutral)]">— David, Restaurant Owner</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Your Next Great Meal Is Waiting
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands discovering that food tastes better when shared. Free to join, free to post.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth?signup=true" 
              className="inline-block px-10 py-4 bg-white text-[var(--primary)] rounded-full text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-block px-10 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-bold hover:bg-white hover:text-[var(--primary)] transition-all"
            >
              Browse Requests
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--neutral)] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-6 h-6" />
                <span className="text-xl font-bold">TableMesh</span>
              </div>
              <p className="text-white/70 text-sm">
                The social dining network for travelers, groups, and food lovers.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">For Diners</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Find Dining Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Create Request</a></li>
                <li><Link href="/safety-guidelines" className="hover:text-white transition-colors">Safety Guidelines</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">For Restaurants</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Restaurant Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Post Deals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/50 text-sm">© 2026 TableMesh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
