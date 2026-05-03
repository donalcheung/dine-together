const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ADMIN_EMAIL = 'donal.cheung@gmail.com'

Deno.serve(async (req) => {
  // Supabase Database Webhooks send the service role key as a Bearer token
  const auth = req.headers.get('authorization') ?? ''
  if (SUPABASE_SERVICE_ROLE_KEY && auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    const record = body?.record as Record<string, string | null> | undefined

    const name = record?.name ?? null
    const email = record?.email ?? null
    const createdAt = record?.created_at
      ? new Date(record.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Unknown'

    if (!RESEND_API_KEY) {
      console.warn('[notify-new-user] RESEND_API_KEY not set — skipping email')
      return new Response(JSON.stringify({ success: true, emailSent: false }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TableMesh <notifications@tablemesh.app>',
        to: [ADMIN_EMAIL],
        subject: `New User Signed Up${name ? `: ${name}` : ''}`,
        html: buildEmailHtml({ name, email, createdAt }),
      }),
    })

    if (!res.ok) {
      console.error('[notify-new-user] Resend error:', await res.text())
      return new Response(JSON.stringify({ success: true, emailSent: false }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, emailSent: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[notify-new-user] Error:', err)
    return new Response(JSON.stringify({ success: true, emailSent: false }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

function buildEmailHtml(opts: {
  name: string | null
  email: string | null
  createdAt: string
}): string {
  const rows = [
    { label: 'Name', value: opts.name ?? 'Not provided' },
    { label: 'Email', value: opts.email ?? 'Not provided' },
    { label: 'Signed Up', value: opts.createdAt },
  ].map(d => `
    <tr>
      <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;color:#374151;width:120px;">${d.label}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${d.value}</td>
    </tr>`).join('')

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px;border-radius:16px 16px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">New User Signed Up</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 16px 16px;">
        <p style="color:#374151;font-size:15px;line-height:1.6;margin-top:0;">A new user has created an account on TableMesh.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
        <a href="https://tablemesh.app/admin/dashboard/users"
           style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">
          View Users in Admin Dashboard &rarr;
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:20px;margin-bottom:0;">This is an automated notification from TableMesh.</p>
      </div>
    </div>`
}
