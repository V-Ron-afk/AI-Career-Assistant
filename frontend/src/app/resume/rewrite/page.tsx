'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { resumesApi } from '@/lib/api'
import { toast } from 'sonner'
import { Button, EmptyState, LoadingCard } from '@/components/ui'

export default function RewritePage() {
  const [form, setForm] = useState({ resume_id: '', target_role: '', target_industry: '' })
  const [result, setResult] = useState<any>(null)

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumesApi.list().then(r => r.data),
  })

  const rewriteMutation = useMutation({
    mutationFn: () => resumesApi.rewrite(form.resume_id, form.target_role, form.target_industry).then(r => r.data),
    onSuccess: (data) => { toast.success('Resume rewritten!'); setResult(data.result_data) },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Rewrite failed'),
  })

  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const canSubmit = form.resume_id && form.target_role && form.target_industry

  return (

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Resume Rewriter</h1>
          <p className="text-slate-400 mt-1">AI rewrites your resume with strong bullets, metrics, and role-specific keywords.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Rewrite Settings</h2>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Select Resume</label>
              <select value={form.resume_id} onChange={set('resume_id')}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
                <option value="">Choose a resume...</option>
                {resumes.map((r: any) => <option key={r.id} value={r.id}>{r.title} (v{r.version})</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Target Role</label>
              <input value={form.target_role} onChange={set('target_role')} placeholder="e.g. Senior Software Engineer"
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Target Industry</label>
              <select value={form.target_industry} onChange={set('target_industry')}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
                <option value="">Select industry...</option>
                {['Technology', 'Finance', 'Healthcare', 'E-commerce', 'SaaS', 'Consulting', 'Startups', 'Government', 'Education'].map(i =>
                  <option key={i} value={i}>{i}</option>
                )}
              </select>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-surface-border">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">How it works</p>
              <ul className="space-y-1.5">
                {['Uses XYZ formula: Accomplished X, measured by Y, by doing Z', 'Starts every bullet with a strong action verb', 'Adds industry-specific keywords automatically', 'Rewrites your summary to target the exact role'].map(t => (
                  <li key={t} className="flex gap-2 text-xs text-slate-400">
                    <span className="text-brand-500 mt-0.5">✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={() => rewriteMutation.mutate()} isLoading={rewriteMutation.isPending}
              disabled={!canSubmit} className="w-full">
              ✨ Rewrite Resume
            </Button>
          </div>

          <div>
            {rewriteMutation.isPending ? (
              <LoadingCard message="AI is rewriting your resume..." color="brand" />
            ) : result ? (
              <div className="space-y-4 animate-fade-in">
                <div className="card p-5 border-brand-500/20 bg-brand-500/5">
                  <h3 className="text-sm font-semibold text-brand-400 mb-2 uppercase tracking-wider">✨ New Professional Summary</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.rewritten_sections?.professional_summary}</p>
                </div>

                {result.rewritten_sections?.experience?.map((exp: any, i: number) => (
                  <div key={i} className="card p-5">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-white">{exp.role}</p>
                      <p className="text-xs text-slate-500">{exp.company} · {exp.dates}</p>
                    </div>
                    <ul className="space-y-2">
                      {exp.bullets?.map((b: string, j: number) => (
                        <li key={j} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-brand-500 mt-0.5 shrink-0">▸</span>{b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {result.keywords_added?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">Keywords Added</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords_added.map((k: string) => (
                        <span key={k} className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.estimated_ats_improvement && (
                  <div className="text-center text-sm text-brand-400 font-medium">
                    📈 Estimated ATS improvement: {result.estimated_ats_improvement}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState emoji="✍️" title="Configure the rewrite settings and click Rewrite"
                subtitle="Your resume bullets will be transformed with metrics and action verbs." />
            )}
          </div>
        </div>
      </div>

  )
}
