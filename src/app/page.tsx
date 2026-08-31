import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a1118] text-slate-100 flex flex-col justify-between font-sans">
      {/* Header Navigation */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MapVane</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#product" className="hover:text-white transition">Product</a>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#docs" className="hover:text-white transition">Docs</a>
        </nav>

        <a
          href="#demo"
          className="rounded-lg bg-teal-500/10 border border-teal-500/30 px-4 py-2 text-sm font-semibold text-teal-300 hover:bg-teal-500/20 transition"
        >
          Request Demo
        </a>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 text-center my-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          Master Multi-Location Reviews.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          MapVane centralizes, analyzes, and automates review management for franchise networks and multi-unit businesses. Boost reputation across all locations from one dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:brightness-110 transition"
          >
            Sign In to Dashboard
          </Link>
          <a
            href="#learn"
            className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            Learn More
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3">
              📊
            </div>
            <h3 className="font-semibold text-white">Unified Dashboard</h3>
            <p className="mt-1 text-xs text-slate-400">Aggregate ratings across all store locations instantly.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3">
              🧠
            </div>
            <h3 className="font-semibold text-white">AI Insights</h3>
            <p className="mt-1 text-xs text-slate-400">Sentiment analysis trends for customer feedback.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3">
              🤖
            </div>
            <h3 className="font-semibold text-white">Automated Responses</h3>
            <p className="mt-1 text-xs text-slate-400">Smart AI response drafts tailored to review sentiment.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3">
              📍
            </div>
            <h3 className="font-semibold text-white">Location Insights</h3>
            <p className="mt-1 text-xs text-slate-400">Compare individual branch performance metrics.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 MapVane. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#privacy" className="hover:text-slate-400">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-400">Terms of Service</a>
        </div>
      </footer>
    </div>
  )
}