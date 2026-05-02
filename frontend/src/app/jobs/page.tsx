'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { resumesApi, jobsApi } from '@/lib/api'
import { toast } from 'sonner'
import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { clsx } from 'clsx'

const VERDICT_COLORS: Record<string, string> = {
  strong_match: 'text-green-400 bg-green-500/10 border-green-500/20',
  good_match:   'text-brand-400 bg-brand-500/10 border-brand-500/20',
  partial_match:'text-amber-400 bg-amber-500/10 border-amber-500/20',
  poor_match:   'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function JobsPage() {
  const [form, setForm] = useState({ resume_id: '', job_title: '', company_name: '', job_description: '' })
  const [result, setResult] = useState<any>(null)

  const { data: resumes = [] } = useQuery({ queryKey: ['resumes'], queryFn: () => resumesApi.list().then(r => r.data) })

  const matchMutation = useMutation({
    mutationFn: () => jobsApi.match(form).then(r => r.data),
    onSuccess: (data) => { toast.success('Match complete!'); setResult(data) },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Match failed'),
  })

  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Job Matcher</h1>
          <p className="text-slate-400 mt-1">Paste a job description and see how well your resume matches.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input form */}
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Job Details</h2>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Select Resume</label>
              <select
                value={form.resume_id}
                onChange={set('resume_id')}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">Choose a resume...</option>
                {resumes.map((r: any) => <option key={r.id} value={r.id}>{r.title} (v{r.version})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Job Title *</label>
                <input value={form.job_title} onChange={set('job_title')} placeholder="Software Engineer"
                  className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Company (optional)</label>
                <input value={form.company_name} onChange={set('company_name')} placeholder="Acme Corp"
                  className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Job Description *</label>
              <textarea
                value={form.job_description}
                onChange={set('job_description')}
                rows={10}
                placeholder="Paste the full job description here..."
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <button
              onClick={() => matchMutation.mutate()}
              disabled={!form.resume_id || !form.job_title || !form.job_description || matchMutation.isPending}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {matchMutation.isPending ? 'Analyzing match...' : '🎯 Analyze Match'}
            </button>
          </div>

          {/* Results */}
          <div>
            {matchMutation.isPending ? (
              <div className="card p-8 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-slate-300">Comparing resume with job requirements...</p>
              </div>
            ) : result ? (
              <div className="space-y-4 animate-fade-in">
                {/* Score */}
                <div className="card p-6">
                  <div className="flex items-center gap-6">
                    <ScoreRing score={result.match_score} label="Match" color="#6366f1" size={90} />
                    <div>
                      <p className="text-3xl font-bold text-white">{result.match_score}%</p>
                      <span className={clsx('text-xs px-3 py-1 rounded-full border font-medium mt-2 inline-block',
                        VERDICT_COLORS[result.verdict] ?? '')}>
                        {result.verdict?.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-sm text-slate-400 mt-2">{result.result_data?.verdict_reason}</p>
                    </div>
                  </div>
                </div>

                {/* Missing skills */}
                {result.result_data?.missing_skills?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">Missing Skills</h3>
                    <div className="space-y-2">
                      {result.result_data.missing_skills.map((s: any, i: number) => (
                        <div key={i} className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-white">{s.skill}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.how_to_address}</p>
                          </div>
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full shrink-0 font-medium',
                            s.importance === 'must_have' ? 'badge-critical' : 'badge-low')}>
                            {s.importance?.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tailoring suggestions */}
                {result.result_data?.tailoring_suggestions?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-indigo-400 mb-3 uppercase tracking-wider">Tailoring Suggestions</h3>
                    <div className="space-y-3">
                      {result.result_data.tailoring_suggestions.map((s: any, i: number) => (
                        <div key={i} className="border border-surface-border rounded-lg p-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.section}</p>
                          <p className="text-xs text-red-400 line-through mb-1">{s.current}</p>
                          <p className="text-xs text-green-400">{s.suggested}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-10 text-center border-dashed">
                <p className="text-4xl mb-3">💼</p>
                <p className="text-slate-300">Fill in the job details and click Analyze Match</p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
