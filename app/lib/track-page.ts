import { createSupabaseBrowserClient } from './supabase-browser'

export async function trackPageView(page: string, params?: Record<string, string>) {
  try {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('page_events').insert({
      user_id: user.id,
      page,
      page_params: params ?? null,
    })
  } catch {
    // Never break the app for tracking errors
  }
}
