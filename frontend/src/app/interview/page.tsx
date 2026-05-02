'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { resumesApi, interviewApi } from '@/lib/api'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { ChevronDown, ChevronUp } from 'lucide-react'

function QuestionCard({ q, type }: { q: any, type: string }) {
  const [open, setOpen] = useState(false)
  const diffColor: Record<string, string> = { easy: 'badge-low', medium: 'badge-medium', hard: 'badge-critical' }

  return (
    <div className="border border-surface-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-hover transition-colors">
        <div className="flex-1 pr-4">
          <p className="text-sm font-medium text-white">{q.question}</p>
          <p className="text-xs text-slate-500 mt-1">{q.topic || q.competency || q.scenario}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {q.difficulty && (
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', diffColor[q.difficulty] ?? 'badge-low')}>
              {q.difficulty}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 border-t border-surface-border bg-surface/50 space-y-3">
          {q.what_interviewer_is_testing && (
            <p className="text-xs text-slate-400"><span className="text-brand-400 font-medium">Tests: </span>{q.what_interviewer_is_testing}</p>
          )}
          {q.ideal_answer_hints && (
            <div>
              <p className="text-xs text-brand-400 font-medium mb-1">Key points to cover:</p>
              <ul className="space-y-1">
                {q.ideal_answer_hints.map((h: string, i: number) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-brand-500">•</span>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {q.ideal_structure && (
            <p className="text-xs text-slate-400"><span className="text-indigo-400 font-medium">Structure: </span>{q.ideal_structure}</p>
          )}
          {q.follow_up && (
            <p className="text-xs text-slate-400"><span className="text-amber-400 font-medium">Follow-up: </span>{q.follow_up}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function InterviewPage() {
  const [resumeId, setResumeId] = useState('')
  const [prep, setPrep] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('technical')

  const { data: resumes = [] } = useQuery({ queryKey: ['resumes'], queryFn: () => resumesApi.list().then(r => r.data) })

  const genMutation = useMutation({
    mutationFn: () => interviewApi.generate(resumeId).then(r => r.data),
    onSuccess: (data) => { toast.success('Questions generated!'); setPrep(data.result_data) },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Generation failed'),
  })

  const TABS = [
    { key: 'technical', label: '🔧 Technical', count: prep?.technical_questions?.length },
    { key: 'behavioral', label: '🧠 Behavioral', count: prep?.behavioral_questions?.length },
    { key: 'project', label: '🚀 Project Dives', count: prep?.project_deep_dive_questions?.length },
    { key: 'ask', label: '❓ Ask Them', count: prep?.questions_to_ask_interviewer?.length },
  ]

  return (

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Interview Prep</h1>
          <p className="text-slate-400 mt-1">Get personalized questions generated directly from your resume.</p>
        </div>

        <div className="card p-6 flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Select Resume</label>
            <select value={resumeId} onChange={e => setResumeId(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
              <option value="">Choose a resume...</option>
              {resumes.map((r: any) => <option key={r.id} value={r.id}>{r.title} (v{r.version})</option>)}
            </select>
          </div>
          <button
            onClick={() => genMutation.mutate()}
            disabled={!resumeId || genMutation.isPending}
            className="py-2.5 px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            {genMutation.isPending ? 'Generating...' : '🎙️ Generate Questions'}
          </button>
        </div>

        {genMutation.isPending && (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Crafting personalized interview questions...</p>
          </div>
        )}

        {prep && (
          <div className="space-y-4 animate-fade-in">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === t.key
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-surface-hover')}>
                  {t.label} {t.count ? <span className="ml-1 text-xs opacity-60">({t.count})</span> : ''}
                </button>
              ))}
            </div>

            {activeTab === 'technical' && (
              <div className="space-y-3">
                {prep.technical_questions?.map((q: any, i: number) => <QuestionCard key={i} q={q} type="technical" />)}
              </div>
            )}
            {activeTab === 'behavioral' && (
              <div className="space-y-3">
                {prep.behavioral_questions?.map((q: any, i: number) => <QuestionCard key={i} q={q} type="behavioral" />)}
              </div>
            )}
            {activeTab === 'project' && (
              <div className="space-y-4">
                {prep.project_deep_dive_questions?.map((p: any, i: number) => (
                  <div key={i} className="card p-5">
                    <h3 className="text-sm font-semibold text-white mb-3">🚀 {p.project}</h3>
                    <div className="space-y-2">
                      {p.questions?.map((q: string, j: number) => (
                        <p key={j} className="text-sm text-slate-300 flex gap-2"><span className="text-purple-400">Q{j+1}.</span>{q}</p>
                      ))}
                    </div>
                    {p.red_flags_to_avoid?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-surface-border">
                        <p className="text-xs text-red-400 font-medium mb-1">⚠ Avoid these weak answers:</p>
                        {p.red_flags_to_avoid.map((r: string, j: number) => (
                          <p key={j} className="text-xs text-slate-500">• {r}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'ask' && (
              <div className="space-y-3">
                {prep.questions_to_ask_interviewer?.map((q: any, i: number) => (
                  <div key={i} className="card p-5">
                    <p className="text-sm font-medium text-white mb-1">"{q.question}"</p>
                    <p className="text-xs text-brand-400">Why impressive: {q.why_impressive}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!prep && !genMutation.isPending && (
          <div className="card p-12 text-center border-dashed">
            <p className="text-4xl mb-3">🎙️</p>
            <p className="text-slate-300 font-medium">Select your resume and generate interview questions</p>
            <p className="text-slate-500 text-sm mt-1">You'll get technical, behavioral, project-based, and smart questions to ask them.</p>
          </div>
        )}
      </div>

  )
}
