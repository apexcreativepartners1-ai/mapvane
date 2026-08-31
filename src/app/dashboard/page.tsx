import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch organization profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organizations(name)')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#0a1118] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Organization: <span className="text-teal-400 font-semibold">{profile?.organizations?.[0]?.name || 'Default Org'}</span> ({profile?.role})
            </p>
          </div>
          <span className="text-xs text-slate-500">{user.email}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-slate-400 text-sm font-medium">Total Locations</h3>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-slate-400 text-sm font-medium">Average Rating</h3>
            <p className="text-3xl font-bold text-white mt-2">0.0 ★</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-slate-400 text-sm font-medium">Pending Reviews</h3>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}