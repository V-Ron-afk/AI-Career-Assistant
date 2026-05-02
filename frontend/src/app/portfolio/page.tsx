'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { portfolioApi } from '@/lib/api'
import { toast } from 'sonner'
import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { clsx } from 'clsx'

export default function PortfolioPage() {
  const [mode, setMode] = useState<'github' | 'description'>('github')
  const [githubUrl, setGithubUrl] = useState('')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<any>(null)

  const reviewMutation = useMutation({
    mutationFn: () => portfolioApi.review({
      github_url: mode === 'github' ? githubUrl : undefined,
      project_description: mode === 'description' ? description : undefined,
    }).then(r => r.data),
    onSuccess: (data) => { toast.success('Review complete!'); setResult(data) },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Review failed'),
  })

  const canSubmit = mode === 'github' ? githubUrl.startsWith('http') : description.length > 50

  return (

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Review</h1>
          <p className="text-slate-400 mt-1">Get hiring-manager-level feedback on your GitHub and projects.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="card p-6 space-y-5">
            <div className="flex gap-2">
              {(['github', 'description'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={clsx('flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                    mode === m ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:bg-surface-hover')}>
                  {m === 'github' ? '🔗 GitHub URL' : '📝 Description'}
                </button>
              ))}
            </div>

            {mode === 'github' ? (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">GitHub Profile or Repo URL</label>
                <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500" />
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Project Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={8}
                  placeholder="Describe your projects: what you built, tech stack, scale, impact..."
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none" />
                <p className="text-xs text-slate-600 mt-1">{description.length} chars (min 50)</p>
              </div>
            )}

            <button
              onClick={() => reviewMutation.mutate()}
              disabled={!canSubmit || reviewMutation.isPending}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {reviewMutation.isPending ? 'Reviewing...' : '🔍 Review Portfolio'}
            </button>
          </div>

          {/* Results */}
          <div>
            {reviewMutation.isPending ? (
              <div className="card p-8 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-slate-300">Analyzing your portfolio...</p>
              </div>
            ) : result ? (
              <div className="space-y-4 animate-fade-in">
                {/* Scores */}
                <div className="card p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <ScoreRing score={result.overall_score} label="Overall" color="#f59e0b" size={80} />
                    <div className="flex-1 space-y-2">
                      {[
                        { label: 'Technical Depth', val: result.result_data?.technical_depth_score, max: 10 },
                        { label: 'Market Relevance', val: result.result_data?.market_relevance_score, max: 10 },
                        { label: 'Project Complexity', val: result.result_data?.project_complexity_score, max: 10 },
                      ].map(({ label, val, max }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{label}</span>
                            <span className="text-white font-medium">{val}/{max}</span>
                          </div>
                          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                              style={{ width: `${(val / max) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Impression */}
                {result.result_data?.hiring_manager_impression && (
                  <div className="card p-5 border-amber-500/20 bg-amber-500/5">
                    <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">Hiring Manager Impression</p>
                    <p className="text-sm text-slate-300">{result.result_data.hiring_manager_impression}</p>
                  </div>
                )}

                {/* Recommended projects */}
                {result.result_data?.recommended_new_projects?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">💡 Recommended Projects</h3>
                    <div className="space-y-3">
                      {result.result_data.recommended_new_projects.map((p: any, i: number) => (
                        <div key={i} className="border border-surface-border rounded-lg p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-white">{p.title}</p>
                            <span className="text-xs text-slate-500 shrink-0">~{p.estimated_weeks}w</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{p.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {p.tech_stack?.map((t: string) => (
                              <span key={t} className="text-xs px-2 py-0.5 bg-surface text-slate-400 border border-surface-border rounded">{t}</span>
                            ))}
                          </div>
                          <p className="text-xs text-green-400 mt-2">✓ {p.why_impactful}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-12 text-center border-dashed">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-300">Submit your GitHub URL or project description to get feedback.</p>
              </div>
            )}
          </div>
        </div>
      </div>

  )
}
