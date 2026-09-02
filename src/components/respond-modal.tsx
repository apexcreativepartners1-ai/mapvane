'use client'

import React, { useState } from 'react'
import { Review } from '@/types/review'
import { Button } from '@/components/ui/button'
import { respondToReview } from '@/app/actions/reviews'

interface RespondModalProps {
  review: Review | null
  isOpen: boolean
  onClose: () => void
}

export function RespondModal({ review, isOpen, onClose }: RespondModalProps) {
  const [responseText, setResponseText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !review) return null

  const handleTemplate = (type: 'positive' | 'apology' | 'neutral') => {
    if (type === 'positive') {
      setResponseText(
        `Hi ${review.author_name}, thank you so much for the fantastic ${review.rating}-star review! We're thrilled to hear about your great experience.`
      )
    } else if (type === 'apology') {
      setResponseText(
        `Hi ${review.author_name}, thank you for your feedback. We sincerely apologize that your experience didn't meet expectations. Please reach out to us directly so we can make things right.`
      )
    } else {
      setResponseText(
        `Hi ${review.author_name}, thank you for taking the time to share your feedback with us. We appreciate your input and hope to see you again soon!`
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!responseText.trim()) return

    setLoading(true)
    setError(null)

    try {
      await respondToReview(review.id, responseText)
      setResponseText('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to submit response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1e2d3d] bg-[#111c26] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e2d3d] pb-4 mb-4">
          <h2 className="text-lg font-bold text-white">Respond to Review</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4 p-3 rounded-lg bg-slate-900/50 border border-[#1e2d3d] text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-white">{review.author_name}</span>
            <span className="text-amber-400">{'★'.repeat(review.rating)}</span>
          </div>
          <p className="text-slate-300">{review.content || 'No text content provided.'}</p>
        </div>

        {/* AI Quick Reply Helpers */}
        <div className="mb-3 space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Quick Templates</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTemplate('positive')}
              className="px-2.5 py-1 text-xs rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20"
            >
              + Thank You
            </button>
            <button
              type="button"
              onClick={() => handleTemplate('apology')}
              className="px-2.5 py-1 text-xs rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
            >
              + Apology
            </button>
            <button
              type="button"
              onClick={() => handleTemplate('neutral')}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
            >
              + Neutral
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={4}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Write your response here..."
            className="w-full rounded-lg border border-[#1e2d3d] bg-slate-900/60 p-3 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
            required
          />

          <div className="flex justify-end space-x-3 border-t border-[#1e2d3d] pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Send Response'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}