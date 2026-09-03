'use client'

import { useState, useMemo, useTransition } from 'react'
import { ReviewRecord } from '@/app/dashboard/page'
import { generateSingleAIReply, generateBulkAIReplies, ReplyTone } from '@/app/actions/ai'
import { replyToReview } from '@/app/actions/reviews'
import { triggerReviewSync } from '@/app/actions/sync'
import { 
  Star, Search, CheckCircle, Clock, RefreshCw, 
  MessageSquare, Sparkles, XCircle, CheckSquare, Square,
  Loader2, Send, X
} from 'lucide-react'

interface Props {
  locations: Array<{ id: string; name: string }>
  reviews: ReviewRecord[]
  selectedLocationId: string
  onLocationChange: (locationId: string) => void
  draftReplies: Record<string, string>
  loadingAiIds: Record<string, boolean>
  submittingIds: Record<string, boolean>
  onDraftChange: (reviewId: string, text: string) => void
  onGenerateSingle: (review: ReviewRecord) => void
  onPublishReply: (reviewId: string) => Promise<void> | void
}

export default function ReviewTableSection({
  locations,
  reviews,
  selectedLocationId,
  onLocationChange,
  draftReplies,
  loadingAiIds,
  submittingIds,
  onDraftChange,
  onGenerateSingle,
  onPublishReply,
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
  const [singleReplyText, setSingleReplyText] = useState<string>('')
  const [selectedTone, setSelectedTone] = useState<ReplyTone>('professional')
  const [isGeneratingSingle, setIsGeneratingSingle] = useState<boolean>(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false)
  const [bulkDrafts, setBulkDrafts] = useState<Record<string, string>>({})
  const [isGeneratingBulk, setIsGeneratingBulk] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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

  const analytics = useMemo(() => {
    const total = filteredReviews.length
    if (total === 0) return { total: 0, responseRate: 0, avgRating: '0.0', pendingCount: 0 }

    const answered = filteredReviews.filter((r) => r.is_answered).length
    const pending = total - answered
    const sumRating = filteredReviews.reduce((acc, r) => acc + r.rating, 0)

    return {
      total,
      responseRate: Math.round((answered / total) * 100),
      avgRating: (sumRating / total).toFixed(1),
      pendingCount: pending,
    }
  }, [filteredReviews])

  const unansweredReviews = useMemo(() => {
    return filteredReviews.filter((r) => !r.is_answered)
  }, [filteredReviews])

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (unansweredReviews.length === 0) return

    if (selectedReviewIds.length === unansweredReviews.length) {
      setSelectedReviewIds([])
    } else {
      setSelectedReviewIds(unansweredReviews.map((r) => r.id))
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

  const res = await replyToReview(activeReplyReview.id, singleReplyText)

  setIsSubmitting(false)
  if (res.success) {
    // FIX: Trigger the parent callback to update parent state / revalidate path
    await onPublishReply(activeReplyReview.id)
    setActiveReplyReview(null)
    setSingleReplyText('')
  } else {
    alert(`Failed to send reply: ${res.error}`)
  }
}

  const handleGenerateSingleDraft = async () => {
    if (!activeReplyReview) return
    setIsGeneratingSingle(true)

    const result = await generateSingleAIReply({
      id: activeReplyReview.id,
      authorName: activeReplyReview.author_name,
      rating: activeReplyReview.rating,
      content: activeReplyReview.content,
      tone: selectedTone,
    })

    setSingleReplyText(result.draft)
    setIsGeneratingSingle(false)
  }

  const handleOpenBulkModal = async () => {
    setIsBulkModalOpen(true)
    setIsGeneratingBulk(true)

    const selectedReviews = reviews.filter((review) => selectedReviewIds.includes(review.id))
    const results = await generateBulkAIReplies(
      selectedReviews.map((review) => ({
        id: review.id,
        authorName: review.author_name,
        rating: review.rating,
        content: review.content,
      }))
    )

    const draftMap: Record<string, string> = {}
    results.forEach((result) => {
      draftMap[result.reviewId] = result.draft
    })

    setBulkDrafts(draftMap)
    setIsGeneratingBulk(false)
  }

 const handleDispatchBulkReplies = async () => {
  setIsSubmitting(true)

  await Promise.all(
    Object.entries(bulkDrafts).map(([id, text]) => replyToReview(id, text))
  )

  // FIX: Notify parent state/router of all updated review IDs
  await Promise.all(
    Object.keys(bulkDrafts).map((id) => onPublishReply(id))
  )

  setIsSubmitting(false)
  setSelectedReviewIds([])
  setIsBulkModalOpen(false)
  setBulkDrafts({})
}

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Total Reviews</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{analytics.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Average Rating</p>
          <p className="text-lg font-extrabold text-amber-500 flex items-center gap-1">
            {analytics.avgRating} ★
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Response Rate</p>
          <p className="text-lg font-extrabold text-emerald-600">{analytics.responseRate}%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Pending Action</p>
          <p className="text-lg font-extrabold text-amber-600">{analytics.pendingCount}</p>
        </div>
      </div>

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
            onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'UNANSWERED' | 'ANSWERED')}
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
            onClick={handleOpenBulkModal}
            disabled={selectedReviewIds.length === 0 || unansweredReviews.length === 0}
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
                <button
                  onClick={toggleSelectAll}
                  disabled={unansweredReviews.length === 0}
                  className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {selectedReviewIds.length > 0 && selectedReviewIds.length === unansweredReviews.length ? (
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
                      <button
                        onClick={() => toggleSelectRow(review.id)}
                        disabled={review.is_answered}
                        className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
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
                      &quot;{review.content}&quot;
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
                          setSingleReplyText(`Hi ${review.author_name}, thank you for your feedback!`)
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

      {/* Single AI Reply Modal */}
      {activeReplyReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Reply to {activeReplyReview.author_name} ({activeReplyReview.rating}★)
              </h3>
              <button onClick={() => setActiveReplyReview(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">
              &quot;{activeReplyReview.content}&quot;
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Response</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as ReplyTone)}
                    className="px-2 py-1 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="apologetic">Apologetic</option>
                    <option value="short">Short &amp; Direct</option>
                  </select>

                  <button
                    onClick={handleGenerateSingleDraft}
                    disabled={isGeneratingSingle}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {isGeneratingSingle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isGeneratingSingle ? 'Analyzing Sentiment...' : 'Auto-Draft with AI'}
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={singleReplyText}
                onChange={(e) => setSingleReplyText(e.target.value)}
                placeholder="Write a response or use AI to generate a sentiment-tailored reply..."
                className="w-full p-3 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveReplyReview(null)} className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleSendSingleReply}
                disabled={isSubmitting || !singleReplyText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Personalized Replies Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Bulk AI Response Inspector ({selectedReviewIds.length} Reviews)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Review or edit each personalized draft before batch dispatch.
                </p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {isGeneratingBulk ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Analyzing sentiment and drafting unique replies for {selectedReviewIds.length} reviews...
                  </p>
                </div>
              ) : (
                reviews
                  .filter((review) => selectedReviewIds.includes(review.id))
                  .map((review) => (
                    <div key={review.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {review.author_name} ({review.rating}★)
                        </span>
                        <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                          {review.platform}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">&quot;{review.content}&quot;</p>
                      <textarea
                        rows={2}
                        value={bulkDrafts[review.id] || ''}
                        onChange={(e) => setBulkDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                        className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setIsBulkModalOpen(false)} className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleDispatchBulkReplies}
                disabled={isGeneratingBulk || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isSubmitting ? 'Dispatching...' : 'Dispatch All Custom Replies'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}