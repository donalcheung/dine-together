import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, restaurant_name, city } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Check if email already exists
    const { data: existing } = await supabase
      .from('restaurant_waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({
        message: "You're already on our restaurant partner list! We'll be in touch soon.",
      })
    }

    // Insert new restaurant waitlist entry
    const { error } = await supabase
      .from('restaurant_waitlist')
      .insert({
        email: email.toLowerCase(),
        restaurant_name: restaurant_name || null,
        city: city || null,
        source: request.headers.get('referer') || 'direct',
      })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      message: "You're in! We'll reach out with partnership details soon.",
    })
  } catch (err) {
    console.error('Restaurant waitlist API error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
