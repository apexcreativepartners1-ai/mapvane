'use client'

import { useState, useMemo, useTransition } from 'react'
import { ReviewRecord } from '@/app/dashboard/page'
import { replyToReview, bulkReplyToReviews } from '@/app/actions/reviews'
import { triggerReviewSync } from '@/app/actions/sync'
import { 
  Star, Search, CheckCircle, Clock, RefreshCw, 
  MessageSquare, Sparkles, XCircle, CheckSquare, Square 
} from 'lucide-react'

interface Props {
  locations: Array<{ id: string; name: string }>
  reviews: ReviewRecord[]
  selectedLocationId: string
  onLocationChange: (id: string) => void
}

export default function ReviewTableSection({
  locations,
  reviews,
  selectedLocationId,
  onLocationChange,
}: Props) {
  // Filter States
  const [selectedRating, setSelectedRating] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'UNANSWERED' | 'ANSWERED'>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Sync State
  const [isPending, startTransition] = useTransition()

  // Selection & Modal States
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([])
  const [activeReplyReview, setActiveReplyReview] = useState<ReviewRecord | null>(null)
  const [replyText, setReplyText] = useState<string>('')
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bulkPromptText, setBulkPromptText] = useState<string>('')

  // Filter Engine
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedLocationId !== 'ALL' && r.location_id !== selectedLocationId) return false
      if (selectedRating !== 'ALL' && r.rating !== Number(selectedRating)) return false
      if (selectedStatus === 'UNANSWERED' && r.is_answered) return false
      if (selectedStatus === 'ANSWERED' && !r.is_answered) return false

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchAuthor = r.author_name.toLowerCase().includes(query)
        const matchContent = r.content.toLowerCase().includes(query)
        if (!matchAuthor && !matchContent) return false
      }
      return true
    })
  }, [reviews, selectedLocationId, selectedRating, selectedStatus, searchQuery])

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedReviewIds.length === filteredReviews.length) {
      setSelectedReviewIds([])
    } else {
      setSelectedReviewIds(filteredReviews.map((r) => r.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Trigger Manual Sync Action
  const handleSync = () => {
    startTransition(async () => {
      await triggerReviewSync()
    })
  }

  const handleSendSingleReply = async () => {
    if (!activeReplyReview) return
    setIsSubmitting(true)

    const res = await replyToReview(activeReplyReview.id, replyText)

    setIsSubmitting(false)
    if (res.success) {
      setActiveReplyReview(null)
      setReplyText('')
    } else {
      alert(`Failed to send reply: ${res.error}`)
    }
  }

  const handleSendBulkReply = async () => {
    if (selectedReviewIds.length === 0) return
    setIsSubmitting(true)

    const res = await bulkReplyToReviews(selectedReviewIds, bulkPromptText)

    setIsSubmitting(false)
    if (res.success) {
      setSelectedReviewIds([])
      setIsBulkModalOpen(false)
      setBulkPromptText('')
    } else {
      alert(`Failed to complete bulk reply: ${res.error}`)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Top Action & Filter Bar */}
      <div className="p-4 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* FIX: Explicit background and text colors on select dropdowns for maximum visibility */}
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              All Locations ({locations.length})
            </option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Ratings ★</option>
            <option value="5" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">5 Stars</option>
            <option value="4" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">4 Stars</option>
            <option value="3" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">3 Stars</option>
            <option value="2" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">2 Stars</option>
            <option value="1" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">1 Star</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Response Statuses</option>
            <option value="UNANSWERED" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">⚠️ Unanswered Only</option>
            <option value="ANSWERED" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">✓ Answered</option>
          </select>

          {selectedLocationId !== 'ALL' && (
            <button
              onClick={() => onLocationChange('ALL')}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <XCircle className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>

        {/* Global Control Buttons & Search */}
        <div className="flex items-center gap-2">
          {/* Requirement 2: Refresh/Sync Button */}
          <button
            onClick={handleSync}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin text-indigo-600' : ''}`} />
            {isPending ? 'Syncing...' : 'Sync Reviews'}
          </button>

          {/* Requirement 3: Bulk Answer Action */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            disabled={selectedReviewIds.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Bulk Answer ({selectedReviewIds.length})
          </button>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Review Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 uppercase text-[10px] font-bold tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4 w-10">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                  {selectedReviewIds.length > 0 && selectedReviewIds.length === filteredReviews.length ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Author & Rating</th>
              <th className="py-3 px-4">Content</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                  No reviews match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => {
                const isSelected = selectedReviewIds.includes(review.id)

                return (
                  <tr key={review.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-50/20' : ''}`}>
                    <td className="py-3.5 px-4">
                      <button onClick={() => toggleSelectRow(review.id)} className="text-slate-400 hover:text-indigo-600">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {review.location_name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        review.platform === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        review.platform === 'yelp' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {review.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{review.author_name}</div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      "{review.content}"
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(review.review_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {review.is_answered ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    {/* Requirement 2: Direct Reply Button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setActiveReplyReview(review)
                          setReplyText(`Hi ${review.author_name}, thank you for your feedback!`)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" /> Answer
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Single Reply */}
      {activeReplyReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Reply to {activeReplyReview.author_name} ({activeReplyReview.platform.toUpperCase()})
            </h3>
            <p className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-slate-600 dark:text-slate-300 italic">
              "{activeReplyReview.content}"
            </p>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-3 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveReplyReview(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSingleReply}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Bulk Reply */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Bulk Answer {selectedReviewIds.length} Reviews
            </h3>
            <p className="text-xs text-slate-500">
              Generate or dispatch responses for all selected reviews simultaneously across Google, Yelp, and Apple.
            </p>
            <textarea
              rows={4}
              placeholder="Enter template or AI prompt for selected reviews..."
              value={bulkPromptText}
              onChange={(e) => setBulkPromptText(e.target.value)}
              className="w-full p-3 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBulkReply}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Batch Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}