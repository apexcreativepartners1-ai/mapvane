import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome back, {user.email}</p>
    </div>
  )
}