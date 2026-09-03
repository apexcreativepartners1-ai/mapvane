'use client'

import { useState } from 'react'
import { LocationWithStats, ReviewRecord } from '@/app/dashboard/page'
import LocationKpiCards from './location-kpi-cards'
import ReviewTableSection from './review-table-section'
import { generateSingleAIReply, generateBulkAIReplies, ReviewContext } from '@/app/actions/ai'
import { replyToReview } from '@/app/actions/reviews'

interface Props {
  locationsWithStats: LocationWithStats[]
  locations: Array<{ id: string; name: string }>
  reviews: ReviewRecord[]
}

export default function InteractiveDashboard({
  locationsWithStats,
  locations,
  reviews: initialReviews,
}: Props) {
  // 1. Local state for reviews (enables optimistic updates)
  const [reviewsList, setReviewsList] = useState<ReviewRecord[]>(initialReviews)

  // 2. Location filter state connecting Card Clicks to Table Filtering
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL')

  // 3. Keyed State Maps for AI Drafts and Action Loading
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({})
  const [loadingAiIds, setLoadingAiIds] = useState<Record<string, boolean>>({})
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({})
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId((prev) => (prev === locationId ? 'ALL' : locationId))
  }

  // --- AI Draft Actions ---

  // Single Review AI Reply Generation
  const handleGenerateSingle = async (review: ReviewRecord) => {
    setLoadingAiIds((prev) => ({ ...prev, [review.id]: true }))

    const context: ReviewContext = {
      id: review.id,
      authorName: review.author_name || 'Valued Customer',
      rating: review.rating,
      content: review.content || '',
    }

    try {
      const result = await generateSingleAIReply(context)
      setDraftReplies((prev) => ({ ...prev, [review.id]: result.draft }))
    } catch (error) {
      console.error('Error generating AI draft:', error)
    } finally {
      setLoadingAiIds((prev) => ({ ...prev, [review.id]: false }))
    }
  }

  // Bulk AI Reply Generation for Unanswered Reviews
  const handleGenerateBulk = async () => {
    const unanswered = reviewsList.filter((r) => !r.is_answered)
    if (unanswered.length === 0) return

    setIsBulkLoading(true)

    const contexts: ReviewContext[] = unanswered.map((r) => ({
      id: r.id,
      authorName: r.author_name || 'Valued Customer',
      rating: r.rating,
      content: r.content || '',
    }))

    try {
      const results = await generateBulkAIReplies(contexts)
      const newDrafts: Record<string, string> = {}

      results.forEach((res) => {
        newDrafts[res.reviewId] = res.draft
      })

      setDraftReplies((prev) => ({ ...prev, ...newDrafts }))
    } catch (error) {
      console.error('Error generating bulk drafts:', error)
    } finally {
      setIsBulkLoading(false)
    }
  }

  // Handle draft text updates per card
  const handleDraftChange = (reviewId: string, text: string) => {
    setDraftReplies((prev) => ({ ...prev, [reviewId]: text }))
  }

  // --- Publish Action ---

  const handlePublishReply = async (reviewId: string) => {
    const textToPublish = draftReplies[reviewId]
    if (!textToPublish) return

    setSubmittingIds((prev) => ({ ...prev, [reviewId]: true }))

    try {
      await replyToReview(reviewId, textToPublish)

      // Optimistically update local reviews state
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, is_answered: true, reply_content: textToPublish } : r
        )
      )
    } catch (error) {
      console.error('Error publishing reply:', error)
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [reviewId]: false }))
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Top Bar Action for Bulk Draft Generation */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <button
          onClick={handleGenerateBulk}
          disabled={isBulkLoading || reviewsList.filter((r) => !r.is_answered).length === 0}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isBulkLoading ? 'Generating Bulk Drafts...' : '✨ AI Draft All Unanswered'}
        </button>
      </div>

      {/* 2. Interactive Location KPI Cards */}
      <LocationKpiCards
        locations={locationsWithStats}
        selectedLocationId={selectedLocationId}
        onSelectLocation={handleSelectLocation}
      />

      {/* 3. Review Table Section with Linked State & AI Handlers */}
      <ReviewTableSection
        locations={locations}
        reviews={reviewsList}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        draftReplies={draftReplies}
        loadingAiIds={loadingAiIds}
        submittingIds={submittingIds}
        onDraftChange={handleDraftChange}
        onGenerateSingle={handleGenerateSingle}
        onPublishReply={handlePublishReply}
      />
    </div>
  )
}