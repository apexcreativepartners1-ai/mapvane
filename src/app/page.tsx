import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <main className="w-full max-w-4xl mx-auto px-4 py-20 sm:py-32">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
            Welcome to Mapvane
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern web application built with Next.js and Supabase authentication.
            Get started by signing in or creating an account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">Secure</div>
          <p className="text-gray-600">Enterprise-grade security with Supabase authentication</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">Fast</div>
          <p className="text-gray-600">Built with Next.js for optimal performance</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">Modern</div>
          <p className="text-gray-600">Using the latest web technologies and best practices</p>
        </div>
      </div>
    </main>
    </div>
  );
}
