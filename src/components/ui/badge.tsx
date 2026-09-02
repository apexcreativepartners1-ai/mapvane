export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'teal' | 'slate' | 'amber'
  className?: string
}

export function Badge({ children, variant = 'teal', className = '' }: BadgeProps) {
  const variants = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    slate: 'bg-slate-800 text-slate-400 border-slate-700',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}