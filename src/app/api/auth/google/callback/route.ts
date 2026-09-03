import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const storeId = searchParams.get('state') // Pass store_id in state parameter

  if (!code || !storeId) {
    return NextResponse.redirect(new URL('/dashboard?error=invalid_oauth', request.url))
  }

  try {
    // Exchange auth code for access & refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || 'Failed to exchange token')
    }

    // Save tokens in Supabase
    const supabase = await createClient()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await supabase.from('platform_credentials').upsert({
      store_id: storeId,
      platform: 'google',
      external_location_id: 'pending_location_select', // Updated during location selection
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
    })

    return NextResponse.redirect(new URL('/dashboard?connected=google', request.url))
  } catch (error) {
    console.error('Google OAuth Exchange Error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', request.url))
  }
}