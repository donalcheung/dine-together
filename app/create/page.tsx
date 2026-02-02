'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CreateRequestPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    restaurant_name: '',
    restaurant_address: '',
    dining_time: '',
    seats_available: 1,
    description: '',
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('dining_requests')
        .insert([
          {
            host_id: user.id,
            restaurant_name: formData.restaurant_name,
            restaurant_address: formData.restaurant_address,
            dining_time: formData.dining_time,
            seats_available: formData.seats_available,
            total_seats: formData.seats_available,
            description: formData.description,
            status: 'open',
          }
        ])
        .select()
        .single()

      if (error) throw error

      router.push(`/request/${data.id}`)
    } catch (error: any) {
      console.error('Full error:', error)
      console.error('Error message:', error?.message)
      console.error('Error details:', error?.details)
      console.error('Error hint:', error?.hint)
      alert(`Failed to create request: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'seats_available' ? parseInt(value) : value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Create Dining Request
          </h2>
          <p className="text-gray-600 text-lg">
            Let others know where you're dining and invite them to join!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <label htmlFor="restaurant_name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Utensils className="w-5 h-5 text-[var(--primary)]" />
                Restaurant Name
              </label>
              <input
                id="restaurant_name"
                name="restaurant_name"
                type="text"
                value={formData.restaurant_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                placeholder="e.g., Golden Dragon Dim Sum"
              />
            </div>

            {/* Restaurant Address */}
            <div>
              <label htmlFor="restaurant_address" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-5 h-5 text-[var(--primary)]" />
                Restaurant Address
              </label>
              <input
                id="restaurant_address"
                name="restaurant_address"
                type="text"
                value={formData.restaurant_address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                placeholder="e.g., 123 Main St, New York, NY 10001"
              />
            </div>

            {/* Dining Time */}
            <div>
              <label htmlFor="dining_time" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                Dining Time
              </label>
              <input
                id="dining_time"
                name="dining_time"
                type="datetime-local"
                value={formData.dining_time}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                Typically post 1-3 hours before your dining time
              </p>
            </div>

            {/* Seats Available */}
            <div>
              <label htmlFor="seats_available" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                How many people do you want to join?
              </label>
              <select
                id="seats_available"
                name="seats_available"
                value={formData.seats_available}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              >
                <option value={1}>1 person</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4 people</option>
                <option value={5}>5 people</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
                placeholder="e.g., I'm craving dim sum and want to try multiple dishes! Looking for friendly people to share the experience."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-[var(--neutral)] mb-2">How it works:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Other users will see your request and can ask to join</li>
                <li>• You'll approve who joins based on their profile</li>
                <li>• Meet at the restaurant at the scheduled time</li>
                <li>• Share dishes and split the bill however you prefer</li>
                <li>• Rate each other after the meal!</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Dining Request'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
