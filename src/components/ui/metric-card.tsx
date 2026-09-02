import React from 'react'
import { Card } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
}

export function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <Card className="p-5 border-[#1e2d3d] bg-[#111c26] flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-teal-400">{subtitle}</p>}
      </div>
      {icon && <div className="p-3 bg-slate-800/50 rounded-lg text-teal-400">{icon}</div>}
    </Card>
  )
}