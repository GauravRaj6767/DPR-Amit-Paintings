'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteLogButton({ logId, label = 'Delete' }: { logId: string; label?: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/logs/${logId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch {
      alert('Failed to delete report. Please try again.')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Remove report?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 600,
            color: '#f87171',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '…' : 'Yes, remove'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-dim)',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={label}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-dim)',
        borderRadius: 6,
        padding: '4px 8px',
        fontSize: 11,
        color: 'var(--text-dim)',
        cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.35)'
        ;(e.currentTarget as HTMLButtonElement).style.color = '#f87171'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-dim)'
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
      {label}
    </button>
  )
}
