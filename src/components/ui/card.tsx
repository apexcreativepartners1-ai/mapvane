import React from 'react'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#111c26] border border-[#1e2d3d] rounded-xl p-5 text-slate-100 ${className}`}>
      {children}
    </div>
  )
}