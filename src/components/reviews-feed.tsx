'use client'

import React, { useState } from 'react'
import { Review } from '@/types/review'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RespondModal } from '@/components/respond-modal'

interface ReviewsFeedProps {
  reviews: Review[]
}

export function ReviewsFeed({ reviews }: ReviewsFeedProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

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
              <Badge variant="slate">
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

          {/* Show existing response if present */}
          {rev.response_text && (
            <div className="mt-2 p-2.5 rounded bg-slate-900/80 border border-[#1e2d3d] text-xs space-y-1">
              <p className="font-semibold text-teal-400 text-[11px]">Your Response:</p>
              <p className="text-slate-300">{rev.response_text}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#1e2d3d]/50">
            <span>{new Date(rev.review_date).toLocaleDateString()}</span>
            
            <div className="flex items-center space-x-2">
              <Badge variant={rev.status === 'unanswered' ? 'amber' : 'teal'}>
                {rev.status}
              </Badge>
              {rev.status === 'unanswered' && (
                <Button
                  variant="secondary"
                  className="py-0.5 px-2 text-[10px]"
                  onClick={() => setSelectedReview(rev)}
                >
                  Respond
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      <RespondModal
        review={selectedReview}
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </div>
  )
}