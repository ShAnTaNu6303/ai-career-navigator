import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import { Loader2, Send, Trash2, Bot } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const QUICK_PROMPTS = [
  'How do I negotiate a higher salary?',
  'What skills do FAANG companies look for?',
  'How to prepare for system design interviews?',
  'Best way to transition into a new field?',
  'How to write a standout resume?',
  'What certifications are worth pursuing?',
]

export default function ChatPage() {
  const { user } = useAuthStore()
  const [input, setInput] = useState('')
  const [localMessages, setLocalMessages] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const qc = useQueryClient()

  const { data: historyData } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => chatAPI.getHistory().then(r => r.data.messages),
    onSuccess: (msgs) => { if (msgs.length > 0 && localMessages.length === 0) setLocalMessages(msgs) }
  })

  useEffect(() => {
    if (historyData?.length && localMessages.length === 0) setLocalMessages(historyData)
  }, [historyData])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [localMessages])

  const sendMutation = useMutation({
    mutationFn: (msg) => chatAPI.sendMessage(msg),
    onMutate: (msg) => {
      setLocalMessages(p => [...p, { role: 'user', content: msg, createdAt: new Date() }])
    },
    onSuccess: (res) => {
      setLocalMessages(p => [...p, { role: 'assistant', content: res.data.reply, createdAt: new Date() }])
    },
    onError: () => {
      setLocalMessages(p => [...p, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.', createdAt: new Date() }])
    }
  })

  const clearMutation = useMutation({
    mutationFn: () => chatAPI.clearHistory(),
    onSuccess: () => { setLocalMessages([]); qc.invalidateQueries(['chat-history']) }
  })

  const send = () => {
    if (!input.trim() || sendMutation.isPending) return
    const msg = input.trim()
    setInput('')
    sendMutation.mutate(msg)
    inputRef.current?.focus()
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <div className="page-header mb-0">
          <h1>AI Career Assistant</h1>
          <p>24/7 guidance powered by Claude AI</p>
        </div>
        <button onClick={() => clearMutation.mutate()} className="btn-ghost flex items-center gap-2 text-sm text-slate-500 hover:text-red-400">
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      <div className="card flex flex-col flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {localMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <Bot size={24} className="text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-1">Hi! I'm your AI Career Coach</h3>
              <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">Ask me anything about career paths, skills, interviews, salary negotiation, or job search strategies. I'm here to help!</p>
              <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                {QUICK_PROMPTS.map(q => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                    className="text-left text-xs px-3 py-2.5 border border-border rounded-xl text-slate-400 hover:border-accent/50 hover:text-slate-200 hover:bg-accent/5 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {localMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-accent" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-bg rounded-tr-sm'
                  : 'bg-card border border-border rounded-tl-sm text-slate-200'
              }`}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-bg/60' : 'text-slate-600'}`}>
                  {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-accent2/15 text-accent2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                  {initials}
                </div>
              )}
            </div>
          ))}

          {sendMutation.isPending && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-accent" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border pt-4">
          <div className="flex gap-3">
            <input ref={inputRef} className="input flex-1 text-sm" placeholder="Ask anything about your career…"
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
            <button onClick={send} disabled={!input.trim() || sendMutation.isPending} className="btn-primary px-4 flex items-center gap-2">
              {sendMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {QUICK_PROMPTS.slice(0, 4).map(q => (
              <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                className="flex-shrink-0 text-xs px-3 py-1.5 border border-border rounded-full text-slate-500 hover:border-accent/50 hover:text-accent transition-all">
                {q.slice(0, 30)}…
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
