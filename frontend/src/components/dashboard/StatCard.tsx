'use client'

import { LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

// ─── StatCard ─────────────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  brand:  'text-brand-400 bg-brand-500/10',
  indigo: 'text-indigo-400 bg-indigo-500/10',
  purple: 'text-purple-400 bg-purple-500/10',
  amber:  'text-amber-400 bg-amber-500/10',
}

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  color?: string
}

export function StatCard({ label, value, icon: Icon, color = 'brand' }: StatCardProps) {
  return (
    <div className="card p-5 hover:border-slate-600 transition-colors">
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', colorMap[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">{label}</p>
    </div>
  )
}

// ─── RecentActivity ───────────────────────────────────────────────────────────

const typeLabels: Record<string, { label: string; color: string }> = {
  resume_analysis: { label: 'Resume Analysis', color: 'text-brand-400' },
  job_match:       { label: 'Job Match',       color: 'text-indigo-400' },
  resume_rewrite:  { label: 'Resume Rewrite',  color: 'text-purple-400' },
  portfolio_review:{ label: 'Portfolio Review',color: 'text-amber-400' },
  interview_prep:  { label: 'Interview Prep',  color: 'text-pink-400' },
}

interface ActivityItem {
  id: string
  type: string
  score?: number
  created_at: string
}

export function RecentActivity({ items, isLoading }: { items: ActivityItem[], isLoading: boolean }) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg shimmer" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <p className="text-4xl mb-2">📋</p>
          <p>No analyses yet. Upload your resume to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const meta = typeLabels[item.type] ?? { label: item.type, color: 'text-slate-400' }
            return (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div>
                  <p className={clsx('text-sm font-medium', meta.color)}>{meta.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {item.score != null && (
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{Math.round(item.score)}</span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
