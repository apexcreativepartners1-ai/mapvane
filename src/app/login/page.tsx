'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [authMethod, setAuthMethod] = useState<'password' | 'phone'>('password')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  // Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else { router.push('/dashboard'); router.refresh(); }
  }

  // Phone OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) setError(error.message)
    else setShowOtpInput(true)
  }

  // Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) setError(error.message)
    else { router.push('/dashboard'); router.refresh(); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1118] p-4 text-slate-100">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
        <h1 className="mb-2 text-2xl font-bold text-white">MapVane Sign In</h1>
        <p className="mb-6 text-xs text-slate-400">Access your multi-location review dashboard.</p>

        {error && <p className="mb-4 rounded bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">{error}</p>}

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-4 flex items-center justify-center border-b border-slate-800">
          <span className="absolute bg-[#0f1722] px-2 text-[10px] uppercase text-slate-500">Or</span>
        </div>

        {/* Tab Switcher */}
        <div className="mb-4 flex rounded-lg bg-slate-800/50 p-1">
          <button
            onClick={() => setAuthMethod('password')}
            className={`w-1/2 rounded-md py-1 text-xs font-medium transition ${authMethod === 'password' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Email
          </button>
          <button
            onClick={() => setAuthMethod('phone')}
            className={`w-1/2 rounded-md py-1 text-xs font-medium transition ${authMethod === 'phone' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Phone SMS
          </button>
        </div>

        {authMethod === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-xs text-white outline-none focus:border-teal-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-xs text-white outline-none focus:border-teal-500"
                required
              />
            </div>
            <button type="submit" className="w-full rounded-lg bg-teal-500 py-2 text-xs font-bold text-slate-950 hover:brightness-110">
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp}>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-slate-300">Phone Number (with country code)</label>
              <input
                type="tel"
                placeholder="+11234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={showOtpInput}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-xs text-white outline-none focus:border-teal-500"
                required
              />
            </div>
            {showOtpInput && (
              <div className="mb-4">
                <label className="mb-1 block text-xs text-slate-300">6-Digit OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-xs text-white outline-none focus:border-teal-500"
                  required
                />
              </div>
            )}
            <button type="submit" className="w-full rounded-lg bg-teal-500 py-2 text-xs font-bold text-slate-950 hover:brightness-110">
              {showOtpInput ? 'Verify OTP' : 'Send Code'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          Need an account? <Link href="/signup" className="text-teal-400 hover:underline">Register Organization</Link>
        </p>
      </div>
    </div>
  )
}