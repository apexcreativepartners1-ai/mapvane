'use client'

import { CheckCircle2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  storeId?: string
  isGoogleConnected?: boolean
}

export function DashboardHeader({
  storeId = 'default-store-id',
  isGoogleConnected = false,
}: DashboardHeaderProps) {
  const router = useRouter()

  const handleGoogleConnect = () => {
    router.push(`/api/auth/google?storeId=${encodeURIComponent(storeId)}`)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 border border-slate-800 shadow-xl mb-8">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MapVane Intelligence Hub</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Store Analytics &{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Reviews
            </span>
          </h1>

          <p className="text-sm text-slate-400 max-w-xl">
            Real-time performance metrics and sentiment-aware management across your entire store network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isGoogleConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Google Connected</span>
            </div>
          ) : (
            <button
              onClick={handleGoogleConnect}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md hover:shadow-indigo-500/20"
            >
              Connect Google Business
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
