'use client'

import { useState, useMemo } from 'react'
import { ReviewRecord } from '@/app/dashboard/page'
import { Star, Search, CheckCircle, Clock, XCircle } from 'lucide-react'

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
  // Remaining Filter States
  const [selectedRating, setSelectedRating] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'UNANSWERED' | 'ANSWERED'>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Multi-Facet Filter Engine
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // 1. Location Filter (Controlled from Card or Dropdown)
      if (selectedLocationId !== 'ALL' && r.location_id !== selectedLocationId) return false

      // 2. Star Rating Filter
      if (selectedRating !== 'ALL' && r.rating !== Number(selectedRating)) return false

      // 3. Answered/Unanswered Status Filter
      if (selectedStatus === 'UNANSWERED' && r.is_answered) return false
      if (selectedStatus === 'ANSWERED' && !r.is_answered) return false

      // 4. Search Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchAuthor = r.author_name.toLowerCase().includes(query)
        const matchContent = r.content.toLowerCase().includes(query)
        if (!matchAuthor && !matchContent) return false
      }

      return true
    })
  }, [reviews, selectedLocationId, selectedRating, selectedStatus, searchQuery])

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Filter Control Bar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Controlled Location Filter Dropdown */}
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Locations ({locations.length})</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Ratings ★</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Response Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Response Statuses</option>
            <option value="UNANSWERED">⚠️ Unanswered Only</option>
            <option value="ANSWERED">✓ Answered</option>
          </select>

          {/* Clear Filters Indicator */}
          {selectedLocationId !== 'ALL' && (
            <button
              onClick={() => onLocationChange('ALL')}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <XCircle className="w-3.5 h-3.5" /> Reset Location
            </button>
          )}
        </div>

        {/* Text Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search author or review..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/70 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Author & Rating</th>
              <th className="py-3 px-4">Review Content</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                  No reviews found for this store location.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {review.location_name}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        review.platform === 'google'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : review.platform === 'yelp'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {review.platform}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{review.author_name}</div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
        <span>
          Showing <strong>{filteredReviews.length}</strong> of <strong>{reviews.length}</strong> total reviews
        </span>
      </div>
    </div>
  )
}