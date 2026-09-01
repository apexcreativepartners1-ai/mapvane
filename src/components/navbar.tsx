import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function Navbar() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="w-full bg-[#0a1118] border-b border-[#1e2d3d] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white">MapVane</span>
            <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-medium">
              Own Your Ground
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/dashboard/locations" className="hover:text-white transition-colors">Locations</Link>
            <Link href="/dashboard/reviews" className="hover:text-white transition-colors">Reviews</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            {user?.email}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}