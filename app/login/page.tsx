'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (!res.ok) {
      setError('Invalid password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-mesh" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Theme toggle — top right*/}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-fade-up delay-0">

          {/* Logo + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg,#f5a623,#d4830a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white"/>
                <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
                <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
                <rect x="9" y="9" width="5" height="5" rx="1" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>
                Amit Paintings
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Daily Progress Reports</div>
            </div>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: '28px 24px' }}>
            <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-base)', marginBottom: 6, lineHeight: 1.1 }}>
              Sign In
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>
              Access your site dashboard
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="password" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: 8,
                      padding: '10px 40px 10px 12px',
                      fontSize: 14,
                      color: 'var(--text-base)',
                      outline: 'none',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'border-color 0.2s',
                      width: '100%',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                      color: 'var(--text-dim)', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  background: loading ? 'var(--bg-subtle)' : 'linear-gradient(135deg,#f5a623,#d4830a)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: loading ? 'var(--text-dim)' : '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'opacity 0.2s',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
