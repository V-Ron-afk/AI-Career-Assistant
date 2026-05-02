'use client'

import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number   // 0–100
  label: string
  color?: string
  size?: number
}

export function ScoreRing({ score, label, color = '#14b88f', size = 72 }: ScoreRingProps) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1e2535" strokeWidth={6}
        />
        {/* Score ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{Math.round(animated)}</span>
      </div>
    </div>
  )
}
