import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'teal' | 'slate' | 'amber' | 'rose'
}

export function Badge({ children, variant = 'teal' }: BadgeProps) {
  const variantStyles = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}>
      {children}
    </span>
  )
}