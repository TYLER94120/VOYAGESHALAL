'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME =
  "Salam! 🌙 I'm HalalGPT. Ask me anything halal: food additives, products, restaurants, travel, Ramadan…"

const SUGGESTIONS = [
  '🔍 Is E120 halal?',
  '🍬 Are Haribo halal?',
  '🍗 Is KFC halal in the UK?',
  '✈️ Halal meal on a plane?',
]

export default function AskHalalGPT() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, loading])

  const send = async (rawText: string) => {
    const text = rawText.replace(/^[^\p{L}\p{N}]+\s*/u, '').trim() || rawText.trim()
    if (!text || loading) return

    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/halalgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = (await res.json()) as { reply?: string }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? "Sorry, I couldn't answer. Please try again 🙏" },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Oops, connection issue 📡 Please try again in a moment.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const showSuggestions = messages.length <= 1 && !loading

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(201,168,76,0.35)', backgroundColor: 'rgba(27,67,50,0.35)' }}>
      <div className="p-5 flex flex-col gap-3 min-h-[220px] max-h-[440px] overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-base whitespace-pre-wrap break-words ${
              m.role === 'user'
                ? 'self-end rounded-br-md font-semibold'
                : 'self-start rounded-bl-md text-white'
            }`}
            style={
              m.role === 'user'
                ? { backgroundColor: '#c9a84c', color: '#0b1a0f' }
                : { backgroundColor: '#1b4332' }
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div
            className="self-start rounded-2xl rounded-bl-md px-4 py-4 flex items-center gap-1.5"
            style={{ backgroundColor: '#1b4332' }}
            aria-label="HalalGPT is typing…"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#c9a84c', animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showSuggestions && (
        <div className="flex flex-wrap gap-2.5 px-5 pb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="min-h-[56px] px-4 py-3 rounded-full border text-base font-semibold text-white transition-colors hover:text-[#0b1a0f]"
              style={{ backgroundColor: '#1b4332', borderColor: '#c9a84c' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c9a84c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b4332')}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-2.5 items-end p-4 border-t"
        style={{ borderColor: 'rgba(201,168,76,0.35)' }}
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          className="flex-1 min-h-[56px] rounded-xl border px-4 text-base text-white outline-none focus:ring-2"
          style={{ backgroundColor: '#0b1a0f', borderColor: 'rgba(201,168,76,0.35)' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your halal question…"
          aria-label="Your question"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send"
          className="w-14 h-14 rounded-full text-xl flex items-center justify-center disabled:opacity-40"
          style={{ backgroundColor: '#c9a84c', color: '#0b1a0f' }}
        >
          ➤
        </button>
      </form>
    </div>
  )
}
