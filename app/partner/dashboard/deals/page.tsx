'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser'

interface Deal {
  id: string
  title: string
  description: string
  discount_type: string
  discount_value: number
  min_party_size: number
  max_party_size: number | null
  min_spend: number | null
  valid_days: string[] | null
  valid_time_start: string | null
  valid_time_end: string | null
  starts_at: string
  expires_at: string | null
  max_redemptions: number | null
  redemptions_count: number
  max_per_user: number
  is_active: boolean
  auto_generate_hostless: boolean
  terms: string | null
  free_item_name: string | null
  created_at: string
}

// Tier limits
const DEAL_LIMITS: Record<string, number> = { free: 1, pro: 3 }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [subscription, setSubscription] = useState<string>('free')

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minPartySize, setMinPartySize] = useState('4')
  const [maxPartySize, setMaxPartySize] = useState('')
  const [minSpend, setMinSpend] = useState('')
  const [validDays, setValidDays] = useState<string[]>([])
  const [validTimeStart, setValidTimeStart] = useState('')
  const [validTimeEnd, setValidTimeEnd] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [terms, setTerms] = useState('')
  const [freeItemName, setFreeItemName] = useState('')
  const [autoGenerateHostless, setAutoGenerateHostless] = useState(false)

  const supabase = createSupabaseBrowserClient()

  const loadDeals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!restaurant) return
    setRestaurantId(restaurant.id)

    const { data: sub } = await supabase
      .from('restaurant_subscriptions')
      .select('plan')
      .eq('restaurant_id', restaurant.id)
      .single()

    setSubscription(sub?.plan || 'free')

    const { data } = await supabase
      .from('restaurant_deals')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })

    setDeals(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadDeals()
  }, [supabase])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDiscountType('percentage')
    setDiscountValue('')
    setMinPartySize('4')
    setMaxPartySize('')
    setMinSpend('')
    setValidDays([])
    setValidTimeStart('')
    setValidTimeEnd('')
    setExpiresAt('')
    setMaxRedemptions('')
    setTerms('')
    setFreeItemName('')
    setAutoGenerateHostless(false)
    setEditingDeal(null)
    setError('')
  }

  const dealLimit = DEAL_LIMITS[subscription] ?? 1
  const isPro = subscription === 'pro'

  const openCreateForm = () => {
    const activeDeals = deals.filter(d => d.is_active).length
    if (activeDeals >= dealLimit && !editingDeal) {
      setError(`Your ${subscription} plan allows up to ${dealLimit} active deal${dealLimit > 1 ? 's' : ''}. ${!isPro ? 'Upgrade to Pro for up to 3 deals.' : ''}`)
      return
    }
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (deal: Deal) => {
    setEditingDeal(deal)
    setTitle(deal.title)
    setDescription(deal.description)
    setDiscountType(deal.discount_type)
    setDiscountValue(String(deal.discount_value))
    setMinPartySize(String(deal.min_party_size || 4))
    setMaxPartySize(deal.max_party_size ? String(deal.max_party_size) : '')
    setMinSpend(deal.min_spend ? String(deal.min_spend) : '')
    setValidDays(deal.valid_days || [])
    setValidTimeStart(deal.valid_time_start || '')
    setValidTimeEnd(deal.valid_time_end || '')
    setExpiresAt(deal.expires_at ? deal.expires_at.split('T')[0] : '')
    setMaxRedemptions(deal.max_redemptions ? String(deal.max_redemptions) : '')
    setTerms(deal.terms || '')
    setFreeItemName(deal.free_item_name || '')
    setAutoGenerateHostless(deal.auto_generate_hostless || false)
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantId) return
    if (!title || !discountValue) {
      setError('Please fill in all required fields')
      return
    }

    setSaving(true)
    setError('')

    const dealData = {
      restaurant_id: restaurantId,
      title,
      description,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_party_size: parseInt(minPartySize) || 4,
      max_party_size: maxPartySize ? parseInt(maxPartySize) : null,
      min_spend: minSpend ? parseFloat(minSpend) : null,
      valid_days: validDays.length > 0 ? validDays : null,
      valid_time_start: validTimeStart || null,
      valid_time_end: validTimeEnd || null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      terms: terms || null,
      free_item_name: discountType === 'free_item' ? freeItemName : null,
      // auto_generate_hostless only available on Pro plan
      auto_generate_hostless: isPro ? autoGenerateHostless : false,
      is_active: true,
    }

    try {
      if (editingDeal) {
        const { error: updateError } = await supabase
          .from('restaurant_deals')
          .update(dealData)
          .eq('id', editingDeal.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('restaurant_deals')
          .insert(dealData)
        if (insertError) throw insertError
      }

      setShowForm(false)
      resetForm()
      await loadDeals()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save deal'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const toggleDeal = async (deal: Deal) => {
    // Check limit when activating
    if (!deal.is_active) {
      const activeDeals = deals.filter(d => d.is_active).length
      if (activeDeals >= dealLimit) {
        setError(`Your ${subscription} plan allows up to ${dealLimit} active deal${dealLimit > 1 ? 's' : ''}. ${!isPro ? 'Upgrade to Pro for up to 3 deals.' : ''}`)
        return
      }
    }

    await supabase
      .from('restaurant_deals')
      .update({ is_active: !deal.is_active })
      .eq('id', deal.id)

    await loadDeals()
  }

  const deleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return

    await supabase
      .from('restaurant_deals')
      .delete()
      .eq('id', dealId)

    await loadDeals()
  }

  const toggleDay = (day: string) => {
    setValidDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>Deals</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage deals for group diners.
            <span className="text-[var(--primary)]"> {isPro ? 'Pro plan: up to 3 active deals.' : 'Free plan: 1 active deal. Upgrade for up to 3 deals + auto-generation.'}</span>
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all text-sm font-semibold"
        >
          + New Deal
        </button>
      </div>

      {error && !showForm && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* Deal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); resetForm() }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
                {editingDeal ? 'Edit Deal' : 'Create New Deal'}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm() }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Tuesday Night Group Special"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the deal for diners..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="free_item">Free Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {discountType === 'percentage' ? 'Discount (%)' : discountType === 'fixed' ? 'Amount ($)' : 'Value ($)'} *
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '20' : '10'}
                    required
                    min="0"
                    step={discountType === 'percentage' ? '1' : '0.01'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
              </div>

              {discountType === 'free_item' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Item Name</label>
                  <input
                    type="text"
                    value={freeItemName}
                    onChange={(e) => setFreeItemName(e.target.value)}
                    placeholder="e.g., Appetizer, Dessert, Drink"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Party Size *</label>
                  <input
                    type="number"
                    value={minPartySize}
                    onChange={(e) => setMinPartySize(e.target.value)}
                    min="2"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Party Size</label>
                  <input
                    type="number"
                    value={maxPartySize}
                    onChange={(e) => setMaxPartySize(e.target.value)}
                    placeholder="No limit"
                    min="2"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Spend ($)</label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  placeholder="No minimum"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        validDays.includes(day)
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty for all days</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From (Time)</label>
                  <input
                    type="time"
                    value={validTimeStart}
                    onChange={(e) => setValidTimeStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until (Time)</label>
                  <input
                    type="time"
                    value={validTimeEnd}
                    onChange={(e) => setValidTimeEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="e.g., Cannot be combined with other offers. Dine-in only."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none"
                />
              </div>

              {/* Auto-generate hostless dining requests — Pro only */}
              <div className={`rounded-xl border p-4 ${
                isPro ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      Auto-generate hostless dining requests
                      {!isPro && (
                        <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">Pro only</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">When enabled, TableMesh automatically creates a hostless dining request for this deal&apos;s valid time slots, making it easier for solo diners to find your restaurant.</p>
                  </div>
                  <button
                    type="button"
                    disabled={!isPro}
                    onClick={() => isPro && setAutoGenerateHostless(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${
                      autoGenerateHostless && isPro ? 'bg-[var(--primary)]' : 'bg-gray-300'
                    } ${!isPro ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoGenerateHostless && isPro ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm() }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingDeal ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deals List */}
      {deals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--neutral)] mb-2">No deals yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first deal to start attracting group diners. Deals appear to nearby users in the TableMesh app.
          </p>
          <button
            onClick={openCreateForm}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-sm"
          >
            Create Your First Deal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-[var(--neutral)]">{deal.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      deal.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {deal.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-orange-50 text-[var(--primary)] rounded-lg text-xs font-medium">
                      {deal.discount_type === 'percentage' ? `${deal.discount_value}% off` :
                       deal.discount_type === 'fixed' ? `$${deal.discount_value} off` :
                       `Free: ${deal.free_item_name || 'item'}`}
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                      Min {deal.min_party_size} people
                    </span>
                    {deal.valid_days && deal.valid_days.length > 0 && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">
                        {deal.valid_days.map(d => d.slice(0, 3)).join(', ')}
                      </span>
                    )}
                    {deal.valid_time_start && deal.valid_time_end && (
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium">
                        {deal.valid_time_start} - {deal.valid_time_end}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium">
                      {deal.redemptions_count} redemptions
                    </span>
                    {deal.auto_generate_hostless && (
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                        Auto-generating
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleDeal(deal)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      deal.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      deal.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <button
                    onClick={() => openEditForm(deal)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteDeal(deal.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
