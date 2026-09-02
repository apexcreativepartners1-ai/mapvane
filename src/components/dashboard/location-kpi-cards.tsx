'use client'

import { Store, Star, MessageSquareWarning, CheckCircle2, AlertTriangle } from 'lucide-react'

export interface LocationWithStats {
  id: string
  name: string
  city: string
  address: string
  totalReviews: number
  avgRating: number
  unansweredCount: number
}

interface Props {
  locations: LocationWithStats[]
  selectedLocationId: string
  onSelectLocation: (id: string) => void
}

export default function LocationKpiCards({
  locations,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  if (locations.length === 0) {
    return (
      <div className="p-6 text-center border rounded-xl bg-slate-50 text-slate-500">
        No store locations registered yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {locations.map((loc) => {
        const isSelected = selectedLocationId === loc.id

        return (
          <div
            key={loc.id}
            onClick={() => onSelectLocation(loc.id)}
            className={`p-5 bg-white border rounded-xl shadow-sm transition-all cursor-pointer relative overflow-hidden select-none ${
              isSelected
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/10'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {/* Status Callout Badge */}
            <div className="absolute top-3 right-3">
              {loc.unansweredCount === 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ✓ All Clear 🎉
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {loc.unansweredCount} <AlertTriangle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2.5 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 leading-none">
                  {loc.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {loc.city}, {loc.address}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
              {/* Total Reviews */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-slate-500">Total</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5">
                  {loc.totalReviews}
                </span>
              </div>

              {/* Average Rating */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-slate-500">Avg Rating</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-lg font-bold text-slate-900">
                    {loc.avgRating}
                  </span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
              </div>

              {/* Unanswered Reviews */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-slate-500">Unanswered</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-lg font-bold ${
                      loc.unansweredCount > 0 ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    {loc.unansweredCount}
                  </span>
                  {loc.unansweredCount > 0 ? (
                    <MessageSquareWarning className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}