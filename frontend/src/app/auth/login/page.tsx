'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Sparkles, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface bg-grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center glow-brand">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>CareerAI</span>
        </div>

        <div className="card p-8 animate-slide-up">
          <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-slate-400 text-sm mb-6">Your AI career coach is waiting.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors glow-brand mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
