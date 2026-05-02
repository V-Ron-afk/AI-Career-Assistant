'use client'

import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { clsx } from 'clsx'

interface AnalysisPanelProps {
  data: any
}

const SCORE_LABELS: Record<string, string> = {
  contact_info: 'Contact Info',
  work_experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  formatting: 'Formatting',
  keywords: 'Keywords',
  quantified_achievements: 'Metrics',
  readability: 'Readability',
}

const severityClass: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

export function AnalysisPanel({ data }: AnalysisPanelProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Score overview */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={data.ats_score} label="ATS" color="#14b88f" size={80} />
              <p className="text-xs text-slate-500 font-medium">ATS Score</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={data.overall_score} label="Overall" color="#6366f1" size={80} />
              <p className="text-xs text-slate-500 font-medium">Overall</p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-300 mb-1">Executive Summary</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{data.executive_summary}</p>
          </div>
        </div>
      </div>

      {/* Section scores */}
      {data.scores && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Section Scores</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.scores).map(([key, score]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{SCORE_LABELS[key] ?? key}</span>
                  <span className="text-white font-medium">{score}/10</span>
                </div>
                <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(score / 10) * 100}%`,
                      background: score >= 7 ? '#14b88f' : score >= 5 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 priority fixes */}
      {data.top_3_priority_fixes?.length > 0 && (
        <div className="card p-6 border-brand-500/20 bg-brand-500/5">
          <h3 className="text-sm font-semibold text-brand-400 mb-3 uppercase tracking-wider">🎯 Top 3 Priority Fixes</h3>
          <ol className="space-y-2">
            {data.top_3_priority_fixes.map((fix: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                <span className="text-slate-300">{fix}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Critical issues */}
      {data.critical_issues?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Issues Found</h3>
          <div className="space-y-3">
            {data.critical_issues.map((issue: any, i: number) => (
              <div key={i} className="p-4 bg-surface rounded-lg border border-surface-border">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-white">{issue.issue}</p>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', severityClass[issue.severity] ?? 'badge-low')}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">📍 {issue.location}</p>
                <p className="text-xs text-brand-400">💡 {issue.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyword analysis */}
      {data.keyword_analysis && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Keyword Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-green-400 mb-2 font-medium uppercase tracking-wider">✓ Present</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keyword_analysis.present?.map((kw: string) => (
                  <span key={kw} className="text-xs px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-red-400 mb-2 font-medium uppercase tracking-wider">✗ Missing</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keyword_analysis.missing_common?.map((kw: string) => (
                  <span key={kw} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-amber-400 mb-2 font-medium uppercase tracking-wider">⚠ Overused</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keyword_analysis.overused?.map((kw: string) => (
                  <span key={kw} className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rewritten summary */}
      {data.rewritten_summary && (
        <div className="card p-6 border-indigo-500/20 bg-indigo-500/5">
          <h3 className="text-sm font-semibold text-indigo-400 mb-2 uppercase tracking-wider">✨ AI-Rewritten Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{data.rewritten_summary}</p>
        </div>
      )}
    </div>
  )
}
