'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatApi } from '@/lib/api'
import { toast } from 'sonner'
import { Send, Sparkles, Bot, User } from 'lucide-react'
import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'

interface Message { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'How do I negotiate a higher salary offer?',
  'What skills should I learn for backend engineering?',
  'Review my career progression and suggest next steps.',
  'How do I switch from QA to Software Engineering?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMutation = useMutation({
    mutationFn: (msg: string) => chatApi.sendMessage(msg, sessionId).then(r => r.data),
    onSuccess: (data) => {
      setSessionId(data.session_id)
      setMessages(m => [...m, { role: 'assistant', content: data.response }])
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to send message'),
  })

  const send = (text: string) => {
    if (!text.trim() || sendMutation.isPending) return
    setMessages(m => [...m, { role: 'user', content: text }])
    setInput('')
    sendMutation.mutate(text)
  }

  return (

      <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[800px]">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white">AI Career Advisor</h1>
          <p className="text-slate-400 mt-1">Ask anything about your career, resume, or job search strategy.</p>
        </div>

        <div className="card flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Your AI Career Advisor</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-6">Ask anything about career strategy, salary negotiation, skill gaps, or job search tactics.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {STARTERS.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-left px-4 py-3 rounded-lg bg-surface border border-surface-border text-xs text-slate-400 hover:text-white hover:border-brand-500/50 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={clsx('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-brand-400" />
                    </div>
                  )}
                  <div className={clsx(
                    'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-none'
                      : 'bg-surface-hover text-slate-200 rounded-tl-none border border-surface-border'
                  )}>
                    {m.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                        {m.content}
                      </ReactMarkdown>
                    ) : m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))
            )}

            {sendMutation.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-brand-400" />
                </div>
                <div className="bg-surface-hover rounded-2xl rounded-tl-none border border-surface-border px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-surface-border">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                placeholder="Ask about salary negotiation, career pivots, skill gaps..."
                className="flex-1 bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || sendMutation.isPending}
                className="w-12 h-12 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center transition-colors glow-brand shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

  )
}
