import Link from 'next/link'

export function AuthHeader() {
  return (
    <header className="w-full bg-[#0a1118] border-b border-[#1e2d3d] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight text-white">MapVane</span>
          <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-medium">
            Own Your Ground
          </span>
        </Link>
      </div>
    </header>
  )
}