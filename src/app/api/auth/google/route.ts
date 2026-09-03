import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')

  if (!storeId) {
    return NextResponse.json({ error: 'Missing storeId parameter' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const appUrl = process.env.APP_URL

  if (!clientId || !appUrl) {
    console.error('Missing GOOGLE_CLIENT_ID or APP_URL in environment variables')
    return NextResponse.json({ error: 'OAuth configuration error' }, { status: 500 })
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`

  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
  ].join(' ')

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', scopes)
  googleAuthUrl.searchParams.set('access_type', 'offline') // Generates refresh token
  googleAuthUrl.searchParams.set('prompt', 'consent') // Force consent to guarantee refresh token
  googleAuthUrl.searchParams.set('state', storeId)

  return NextResponse.redirect(googleAuthUrl.toString())
}