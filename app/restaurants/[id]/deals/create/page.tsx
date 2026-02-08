'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Utensils, ArrowLeft, Percent, DollarSign, Gift, Users, Calendar, Clock, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { validateProfanity } from '@/lib/profanity-filter'

export default function CreateDealPage() {
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_item',
    discount_value: 0,
    min_party_size: 2,
    max_party_size: null as number | null,
    min_spend: null as number | null,
    valid_days: [1, 2, 3, 4, 5] as number[], // Weekdays by default
    valid_time_start: '14:00',
    valid_time_end: '17:00',
    expires_at: '',
    max_redemptions: null as number | null,
    max_per_user: 1,
  })

  const dayNames = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ]

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
    loadRestaurant(user.id)
  }

  const loadRestaurant = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .eq('owner_id', userId)
        .single()

      if (error) {
        // Not authorized or doesn't exist
        router.push('/restaurants/manage')
        return
      }

      setRestaurant(data)
    } catch (error) {
      console.error('Error loading restaurant:', error)
      router.push('/restaurants/manage')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'number') {
      const numValue = value === '' ? null : parseFloat(value)
      setFormData(prev => ({ ...prev, [name]: numValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const toggleDay = (day: number) => {
    setFormData(prev => {
      const newDays = prev.valid_days.includes(day)
        ? prev.valid_days.filter(d => d !== day)
        : [...prev.valid_days, day].sort((a, b) => a - b)
      
      return { ...prev, valid_days: newDays }
    })
  }

  const selectAllDays = () => {
    setFormData(prev => ({ ...prev, valid_days: [1, 2, 3, 4, 5, 6, 7] }))
  }

  const selectWeekdays = () => {
    setFormData(prev => ({ ...prev, valid_days: [1, 2, 3, 4, 5] }))
  }

  const selectWeekends = () => {
    setFormData(prev => ({ ...prev, valid_days: [6, 7] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.valid_days.length === 0) {
      alert('Please select at least one valid day')
      return
    }

    setLoading(true)

    try {
      // Validate profanity in deal title and description
      validateProfanity(formData.title, 'Deal title')
      validateProfanity(formData.description, 'Deal description')

      const dealData = {
        restaurant_id: restaurantId,
        title: formData.title,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_party_size: formData.min_party_size,
        max_party_size: formData.max_party_size,
        min_spend: formData.min_spend,
        valid_days: formData.valid_days,
        valid_time_start: formData.valid_time_start,
        valid_time_end: formData.valid_time_end,
        expires_at: formData.expires_at || null,
        max_redemptions: formData.max_redemptions,
        max_per_user: formData.max_per_user,
        is_active: true,
      }

      const { data, error } = await supabase
        .from('restaurant_deals')
        .insert([dealData])
        .select()
        .single()

      if (error) throw error

      router.push('/restaurants/manage')
    } catch (error: any) {
      console.error('Error creating deal:', error)
      alert(`Failed to create deal: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/restaurants/manage" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
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
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Create New Deal
          </h2>
          <p className="text-gray-600 text-lg">
            Attract customers during non-peak hours with special offers
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[var(--neutral)] pb-2 border-b">
                Deal Information
              </h3>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Happy Hour: 30% Off Table of 4+"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Describe your deal and what makes it special..."
                />
              </div>
            </div>

            {/* Discount Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[var(--neutral)] pb-2 border-b">
                Discount Details
              </h3>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Discount Type *
                </label>
                <div className="grid md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discount_type: 'percentage' }))}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.discount_type === 'percentage'
                        ? 'border-[var(--primary)] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Percent className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
                    <div className="font-semibold">Percentage</div>
                    <div className="text-xs text-gray-500">% off total bill</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discount_type: 'fixed_amount' }))}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.discount_type === 'fixed_amount'
                        ? 'border-[var(--primary)] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
                    <div className="font-semibold">Fixed Amount</div>
                    <div className="text-xs text-gray-500">$ off total bill</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discount_type: 'free_item' }))}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.discount_type === 'free_item'
                        ? 'border-[var(--primary)] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Gift className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
                    <div className="font-semibold">Free Item</div>
                    <div className="text-xs text-gray-500">Complimentary item</div>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              {formData.discount_type !== 'free_item' && (
                <div>
                  <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.discount_type === 'percentage' ? 'Percentage Off *' : 'Dollar Amount Off *'}
                  </label>
                  <div className="relative">
                    {formData.discount_type === 'fixed_amount' && (
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                    <input
                      id="discount_value"
                      name="discount_value"
                      type="number"
                      min="0"
                      step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                      max={formData.discount_type === 'percentage' ? '100' : undefined}
                      value={formData.discount_value || ''}
                      onChange={handleChange}
                      required
                      className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all ${
                        formData.discount_type === 'fixed_amount' ? 'pl-12 pr-4' : 'px-4'
                      }`}
                      placeholder={formData.discount_type === 'percentage' ? '30' : '20.00'}
                    />
                    {formData.discount_type === 'percentage' && (
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Requirements Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[var(--neutral)] pb-2 border-b">
                Requirements
              </h3>

              {/* Party Size */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min_party_size" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Minimum Party Size *
                  </label>
                  <input
                    id="min_party_size"
                    name="min_party_size"
                    type="number"
                    min="1"
                    value={formData.min_party_size}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="max_party_size" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Maximum Party Size (Optional)
                  </label>
                  <input
                    id="max_party_size"
                    name="max_party_size"
                    type="number"
                    min="1"
                    value={formData.max_party_size || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Minimum Spend */}
              <div>
                <label htmlFor="min_spend" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Spend (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="min_spend"
                    name="min_spend"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_spend || ''}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    placeholder="50.00"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[var(--neutral)] pb-2 border-b">
                When is this deal valid?
              </h3>

              {/* Valid Days */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4" />
                  Valid Days *
                </label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={selectAllDays}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    All Days
                  </button>
                  <button
                    type="button"
                    onClick={selectWeekdays}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={selectWeekends}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Weekends
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        formData.valid_days.includes(day.value)
                          ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{day.label.slice(0, 3)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="valid_time_start" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    Start Time *
                  </label>
                  <input
                    id="valid_time_start"
                    name="valid_time_start"
                    type="time"
                    value={formData.valid_time_start}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="valid_time_end" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    End Time *
                  </label>
                  <input
                    id="valid_time_end"
                    name="valid_time_end"
                    type="time"
                    value={formData.valid_time_end}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  id="expires_at"
                  name="expires_at"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.expires_at}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Limits Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[var(--neutral)] pb-2 border-b">
                Usage Limits (Optional)
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="max_redemptions" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Total Uses
                  </label>
                  <input
                    id="max_redemptions"
                    name="max_redemptions"
                    type="number"
                    min="1"
                    value={formData.max_redemptions || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label htmlFor="max_per_user" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Uses Per User
                  </label>
                  <input
                    id="max_per_user"
                    name="max_per_user"
                    type="number"
                    min="1"
                    value={formData.max_per_user}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 Pro Tips for Great Deals:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Target non-peak hours (2pm-5pm) to fill empty tables</li>
                    <li>Require larger parties to increase average check size</li>
                    <li>Limit to weekdays only to drive weekday traffic</li>
                    <li>Set expiration dates for seasonal or limited-time offers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Deal...
                </div>
              ) : (
                'Create Deal'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
