import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Simply redirect to a client component that will handle the auth
  return NextResponse.redirect(new URL('/auth/confirm', request.url))
}
