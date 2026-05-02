'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, FileText, Briefcase, Github,
  MessageSquare, Mic, LogOut, Sparkles, User, Menu, X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resume', label: 'Resume Analyzer', icon: FileText },
  { href: '/jobs', label: 'Job Matcher', icon: Briefcase },
  { href: '/portfolio', label: 'Portfolio Review', icon: Github },
  { href: '/interview', label: 'Interview Prep', icon: Mic },
  { href: '/chat', label: 'AI Advisor', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="p-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center glow-brand shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            CareerAI
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border',
                active
                  ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                  : 'text-slate-400 hover:bg-surface-hover hover:text-white border-transparent'
              )}
            >
              <Icon className={clsx('w-4 h-4 shrink-0', active ? 'text-brand-400' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-brand-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar — fixed, always visible on lg+ */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-card border-r border-surface-border flex-col z-40">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>CareerAI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface-card border-r border-surface-border flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}