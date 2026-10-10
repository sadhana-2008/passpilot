import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const API = '/api'

// ── Markdown-lite renderer (bold, italic, inline-code, bullets) ──────────────
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let listItems = []
  let key = 0

  const flushList = () => {
    if (listItems.length) {
      elements.push(<ul key={key++}>{listItems}</ul>)
      listItems = []
    }
  }

  const parseInline = (str) => {
    // bold **text**, italic *text*, inline `code`
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
      if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>
      if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>
      return p
    })
  }

  lines.forEach((line) => {
    if (/^\s*[-*]\s/.test(line)) {
      listItems.push(<li key={key++}>{parseInline(line.replace(/^\s*[-*]\s/, ''))}</li>)
    } else {
      flushList()
      if (line.trim() === '') {
        elements.push(<br key={key++} />)
      } else if (/^#{1,3}\s/.test(line)) {
        const content = line.replace(/^#{1,3}\s/, '')
        elements.push(<h3 key={key++}>{parseInline(content)}</h3>)
      } else {
        elements.push(<p key={key++}>{parseInline(line)}</p>)
      }
    }
  })
  flushList()
  return elements
}

// ── Single chat bubble ────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`bubble-row ${isUser ? 'user' : 'agent'}`}>
      {!isUser && (
        <div className="avatar agent-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
          </svg>
        </div>
      )}
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-agent'}`}>
        {isUser
          ? <p>{msg.content}</p>
          : renderMarkdown(msg.content)}
        {msg.streaming && <span className="cursor-blink">▋</span>}
      </div>
      {isUser && (
        <div className="avatar user-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="bubble-row agent">
      <div className="avatar agent-avatar" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
        </svg>
      </div>
      <div className="bubble bubble-agent typing">
        <span /><span /><span />
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)          // { user_id, session_id }
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)         // waiting for first token
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start session on mount
  useEffect(() => {
    fetch(`${API}/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(r => r.json())
      .then(data => {
        setSession(data)
        // Greeting
        setMessages([{
          id: crypto.randomUUID(),
          role: 'agent',
          content: "👋 Welcome to **PassPilot**!\n\nI'm your AI-powered passport readiness assistant. Tell me about your situation — whether you're applying for a fresh passport, renewing one, or need help with documents — and I'll guide you through the checklist.\n\nWhat brings you here today?"
        }])
      })
      .catch(() => setError('Could not connect to the backend. Is the server running?'))
  }, [])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading || !session) return

    setInput('')
    setError(null)
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: text }
    const agentId = crypto.randomUUID()

    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, message: text }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setLoading(false)
      // Add streaming placeholder
      setMessages(prev => [...prev, { id: agentId, role: 'agent', content: '', streaming: true }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const snap = buffer
        setMessages(prev =>
          prev.map(m => m.id === agentId ? { ...m, content: snap } : m)
        )
      }

      // Mark as done
      setMessages(prev =>
        prev.map(m => m.id === agentId ? { ...m, streaming: false } : m)
      )
    } catch (e) {
      setLoading(false)
      setError(`Failed to get response: ${e.message}`)
    } finally {
      inputRef.current?.focus()
    }
  }, [input, loading, session])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">🛂</div>
            <div>
              <h1>PassPilot</h1>
              <span className="tagline">AI Passport Readiness Assistant</span>
            </div>
          </div>
          <div className={`status-dot ${session ? 'online' : 'offline'}`}>
            {session ? 'Connected' : 'Connecting…'}
          </div>
        </div>
      </header>

      {/* ── Chat window ── */}
      <main className="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        {loading && <TypingDots />}
        {error && (
          <div className="error-banner" role="alert">
            ⚠️ {error}
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* ── Input bar ── */}
      <footer className="input-bar">
        <div className="input-inner">
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-input"
            rows={1}
            placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={!session || loading}
            aria-label="Your message"
          />
          <button
            id="send-btn"
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading || !session}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="disclaimer">
          Unofficial assistant · Uses synthetic/mock data · Final decisions are made by the Passport Office
        </p>
      </footer>
    </div>
  )
}
