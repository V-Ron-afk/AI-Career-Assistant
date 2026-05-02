'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resumesApi } from '@/lib/api'
import { toast } from 'sonner'
import { ResumeUploader } from '@/components/resume/ResumeUploader'
import { AnalysisPanel } from '@/components/resume/AnalysisPanel'
import { FileText, ChevronRight } from 'lucide-react'

// Use the same layout as dashboard

export default function ResumePage() {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const qc = useQueryClient()

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumesApi.list().then(r => r.data),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => resumesApi.upload(file).then(r => r.data),
    onSuccess: (resume) => {
      toast.success('Resume uploaded successfully!')
      qc.invalidateQueries({ queryKey: ['resumes'] })
      setSelectedResumeId(resume.id)
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Upload failed'),
  })

  const analyzeMutation = useMutation({
    mutationFn: (id: string) => resumesApi.analyze(id).then(r => r.data),
    onSuccess: (data) => {
      toast.success('Analysis complete!')
      setAnalysisData(data.result_data)
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Analysis failed'),
  })

  return (

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Resume Analyzer</h1>
          <p className="text-slate-400 mt-1">Upload your resume for AI-powered, hiring-manager-level feedback.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload + Resume list */}
          <div className="space-y-4">
            <ResumeUploader onUpload={(f) => uploadMutation.mutate(f)} isLoading={uploadMutation.isPending} />

            {resumes.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Your Resumes</h3>
                <div className="space-y-2">
                  {resumes.map((r: any) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResumeId(r.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                        selectedResumeId === r.id
                          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          : 'text-slate-400 hover:bg-surface-hover hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{r.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-slate-600">v{r.version}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>

                {selectedResumeId && (
                  <button
                    onClick={() => analyzeMutation.mutate(selectedResumeId)}
                    disabled={analyzeMutation.isPending}
                    className="mt-4 w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors glow-brand"
                  >
                    {analyzeMutation.isPending ? 'Analyzing...' : '✨ Analyze Resume'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Analysis results */}
          <div className="lg:col-span-2">
            {analyzeMutation.isPending ? (
              <div className="card p-8 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-slate-300 font-medium">AI is analyzing your resume...</p>
                <p className="text-slate-500 text-sm mt-1">This takes about 15-20 seconds</p>
              </div>
            ) : analysisData ? (
              <AnalysisPanel data={analysisData} />
            ) : (
              <div className="card p-10 text-center border-dashed">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-slate-300 font-medium">Select a resume and click Analyze</p>
                <p className="text-slate-500 text-sm mt-1">You'll get ATS score, issue cards, and improvement suggestions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

  )
}
