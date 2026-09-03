import { NextResponse } from 'next/server'
import { triggerReviewSync } from '@/app/actions/sync'

export async function GET(request: Request) {
  // Verify authorization header from Vercel Cron to prevent unauthorized execution
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    await triggerReviewSync()
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}