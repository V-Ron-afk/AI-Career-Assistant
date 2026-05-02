/**
 * Reusable UI primitives used across the entire platform.
 */

import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'
import { ReactNode, ButtonHTMLAttributes } from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-brand-500 hover:bg-brand-600 text-white border-transparent',
  secondary: 'bg-transparent hover:bg-surface-hover text-slate-300 border-surface-border',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-transparent',
  ghost:     'bg-transparent hover:bg-surface-hover text-slate-400 hover:text-white border-transparent',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium border transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success'

const badgeClasses: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  info:     'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  success:  'bg-brand-500/10 text-brand-400 border-brand-500/20',
}

export function Badge({ variant = 'info', children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium border', badgeClasses[variant])}>
      {children}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 'md', color = 'brand' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colors: Record<string, string> = {
    brand: 'border-brand-500',
    indigo: 'border-indigo-500',
    purple: 'border-purple-500',
  }
  return (
    <div className={clsx(
      'rounded-full border-2 border-t-transparent animate-spin',
      sizes[size],
      colors[color] ?? 'border-brand-500'
    )} />
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, max = 10, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const bg = color ?? (pct >= 70 ? '#14b88f' : pct >= 50 ? '#f59e0b' : '#ef4444')
  return (
    <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: bg }}
      />
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  emoji,
  title,
  subtitle,
}: {
  emoji: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="card p-12 text-center border-dashed">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="text-slate-300 font-medium">{title}</p>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

// ─── LoadingCard ──────────────────────────────────────────────────────────────

export function LoadingCard({ message, color = 'brand' }: { message: string; color?: string }) {
  return (
    <div className="card p-10 text-center">
      <div className="flex justify-center mb-4">
        <Spinner size="lg" color={color} />
      </div>
      <p className="text-slate-300 font-medium">{message}</p>
      <p className="text-slate-500 text-sm mt-1">This takes about 15-20 seconds</p>
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
    </div>
  )
}
