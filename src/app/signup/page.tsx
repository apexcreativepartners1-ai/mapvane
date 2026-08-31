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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: orgName }])
        .select()
        .single()

      if (orgError) {
        setError(orgError.message)
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            organization_id: orgData.id,
            role: 'admin',
          },
        ])

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1118] p-4 text-slate-100">
      <form onSubmit={handleSignup} className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
        <h1 className="mb-2 text-2xl font-bold text-white">Get Started</h1>
        <p className="mb-6 text-xs text-slate-400">Create an organization account to manage store locations.</p>
        
        {error && <p className="mb-4 rounded bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">{error}</p>}

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

        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account? <Link href="/login" className="text-teal-400 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  )
}