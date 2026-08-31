'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Google OAuth Sign-Up
  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  // Email/Password Sign-Up
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          org_name: orgName,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1118] p-4 text-slate-100">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
        <h1 className="mb-2 text-2xl font-bold text-white">Get Started</h1>
        <p className="mb-6 text-xs text-slate-400">Create an organization account to manage store locations.</p>
        
        {error && <p className="mb-4 rounded bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">{error}</p>}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignup}
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign up with Google
        </button>

        <div className="relative my-4 flex items-center justify-center border-b border-slate-800">
          <span className="absolute bg-[#0f1722] px-2 text-[10px] uppercase text-slate-500">Or email</span>
        </div>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-300">Organization Name</label>
            <input 
              type="text" 
              value={orgName} 
              onChange={(e) => setOrgName(e.target.value)} 
              placeholder="e.g. Urban Grocers"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" 
              required 
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-300">Work Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@company.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" 
              required 
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-slate-300">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-2.5 text-sm text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 disabled:opacity-50 transition"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account? <Link href="/login" className="text-teal-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}