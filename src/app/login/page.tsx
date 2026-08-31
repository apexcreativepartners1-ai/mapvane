import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center">
      <main className="max-w-xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          MapVane
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Multi-location review management and automated AI responses for modern franchise operations.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}