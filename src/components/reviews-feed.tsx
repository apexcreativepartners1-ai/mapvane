'use client'

import React from 'react'
import { Review } from '@/types/review'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ReviewsFeedProps {
  reviews: Review[]
}

export function ReviewsFeed({ reviews }: ReviewsFeedProps) {
  if (reviews.length === 0) {
    return (
      <Card className="p-8 text-center border-[#1e2d3d] bg-[#111c26]">
        <p className="text-sm text-slate-400">No customer reviews aggregated yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((rev) => (
        <Card key={rev.id} className="p-4 border-[#1e2d3d] bg-[#111c26] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-sm">{rev.author_name}</span>
              <Badge variant="slate" className="text-[10px] uppercase">
                {rev.platform}
              </Badge>
            </div>
            <div className="flex items-center space-x-1 text-amber-400 text-sm">
              {'★'.repeat(rev.rating)}
              {'☆'.repeat(5 - rev.rating)}
            </div>
          </div>

          {rev.content && (
            <p className="text-xs text-slate-300 leading-relaxed">{rev.content}</p>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#1e2d3d]/50">
            <span>{new Date(rev.review_date).toLocaleDateString()}</span>
            <Badge variant={rev.status === 'unanswered' ? 'amber' : 'teal'}>
              {rev.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}