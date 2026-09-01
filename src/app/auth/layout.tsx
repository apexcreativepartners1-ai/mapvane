import { AuthHeader } from '@/components/auth-header'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a1118] text-slate-100 flex flex-col">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  )
}