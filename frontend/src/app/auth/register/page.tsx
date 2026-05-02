'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setIsLoading(true)
    try {
      await register(form.email, form.full_name, form.password)
      toast.success('Account created! Welcome aboard.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface bg-grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center glow-brand">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>CareerAI</span>
        </div>

        <div className="card p-8 animate-slide-up">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm mb-6">Start your AI-powered career journey.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={set(key as keyof typeof form)}
                  required
                  placeholder={placeholder}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors glow-brand mt-2"
            >
              {isLoading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
