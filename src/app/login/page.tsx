'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">MapVane Login</h1>
        {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full rounded border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full rounded border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>

        <button type="submit" className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  )
}