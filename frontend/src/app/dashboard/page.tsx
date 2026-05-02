'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { StatCard, RecentActivity } from '@/components/dashboard/StatCard'
import { FileText, Briefcase, TrendingUp, Zap } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here's your career progress at a glance.
        </p>
      </div>

      {/* Score rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-6 glow-brand-hover">
          <ScoreRing score={stats?.latest_ats_score ?? 0} label="ATS Score" color="#14b88f" />
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">Latest ATS</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.latest_ats_score ?? '—'}</p>
            <p className="text-xs text-slate-500 mt-1">Resume scan score</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-6 glow-brand-hover">
          <ScoreRing score={stats?.latest_match_score ?? 0} label="Match" color="#6366f1" />
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">Job Match</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.latest_match_score ?? '—'}</p>
            <p className="text-xs text-slate-500 mt-1">Last job compared</p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">Quick Actions</p>
          <div className="space-y-2 mt-3">
            <a href="/resume" className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors">
              <Zap className="w-3.5 h-3.5" /> Analyze new resume
            </a>
            <a href="/jobs" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              <Zap className="w-3.5 h-3.5" /> Match a job
            </a>
            <a href="/interview" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              <Zap className="w-3.5 h-3.5" /> Prep interview
            </a>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Resumes" value={stats?.total_resumes ?? 0} icon={FileText} color="brand" />
        <StatCard label="Analyses Run" value={stats?.total_analyses ?? 0} icon={TrendingUp} color="indigo" />
        <StatCard label="Job Matches" value={stats?.total_job_matches ?? 0} icon={Briefcase} color="purple" />
        <StatCard label="AI Sessions" value={0} icon={Zap} color="amber" />
      </div>

      {/* Recent activity */}
      <RecentActivity items={stats?.recent_analyses ?? []} isLoading={isLoading} />
    </div>
  )
}
