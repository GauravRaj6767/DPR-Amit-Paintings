'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Site } from '@/types'

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-subtle)',
  border: '1px solid var(--border-dim)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  color: 'var(--text-base)',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  width: '100%',
  transition: 'border-color 0.2s',
}

// ── Add Site Form ──────────────────────────────────────────────────────────────

function AddSiteForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Site name is required.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), location: location.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to add site')
      setName(''); setLocation(''); setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add site')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'linear-gradient(135deg,#f5a623,#d4830a)',
          border: 'none', borderRadius: 8,
          padding: '9px 16px', fontSize: 13, fontWeight: 600,
          color: '#fff', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Site
      </button>
    )
  }

  return (
    <div className="card" style={{ padding: '20px 20px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-base)', marginBottom: 16 }}>New Site</div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>
              Site Name *
            </label>
            <input
              type="text"
              placeholder="e.g. MG Road Building"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>
              Location <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Koramangala, Bengaluru"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
            />
          </div>
        </div>
        {error && <p style={{ fontSize: 12, color: '#f87171' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null) }}
            style={{ background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ background: 'linear-gradient(135deg,#f5a623,#d4830a)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Adding…' : 'Add Site'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Site Row ───────────────────────────────────────────────────────────────────

function SiteRow({ site, supervisorCount }: { site: Site; supervisorCount: number }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(site.name)
  const [editLocation, setEditLocation] = useState(site.location ?? '')
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    if (!editName.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sites/${site.site_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), location: editLocation.trim() || null }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setEditing(false)
      router.refresh()
    } catch {
      alert('Failed to update site. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive() {
    setToggling(true)
    try {
      const res = await fetch(`/api/sites/${site.site_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !site.is_active }),
      })
      if (!res.ok) throw new Error('Failed to update')
      router.refresh()
    } catch {
      alert('Failed to update site status. Please try again.')
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/sites/${site.site_id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch {
      alert('Failed to delete site. Please try again.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${site.is_active ? 'var(--border-dim)' : 'var(--border-dim)'}`,
      borderRadius: 10,
      padding: '14px 16px',
      opacity: site.is_active ? 1 : 0.6,
      transition: 'opacity 0.2s, border-color 0.2s',
    }}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Site Name *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ ...inputStyle, fontSize: 12 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Optional"
                style={{ ...inputStyle, fontSize: 12 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setEditing(false); setEditName(site.name); setEditLocation(site.location ?? '') }}
              style={{ background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !editName.trim()}
              style={{ background: 'linear-gradient(135deg,#f5a623,#d4830a)', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: site.is_active ? 'linear-gradient(135deg,rgba(245,166,35,0.15),rgba(245,166,35,0.05))' : 'var(--bg-subtle)',
            border: '1px solid var(--border-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
          }}>
            🏗️
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-base)', marginBottom: 2 }}>
              {site.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {site.location && <span>{site.location}</span>}
              {site.location && <span style={{ color: 'var(--text-faint)' }}>·</span>}
              <span style={{ color: 'var(--text-faint)' }}>
                {supervisorCount} supervisor{supervisorCount !== 1 ? 's' : ''}
              </span>
              {!site.is_active && (
                <span style={{ background: 'rgba(139,145,158,0.12)', border: '1px solid rgba(139,145,158,0.2)', borderRadius: 99, padding: '1px 8px', fontSize: 10, fontWeight: 600, color: '#8b919e', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {confirmDelete ? (
              <>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Delete site?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#f87171', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                >
                  {deleting ? '…' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                >
                  No
                </button>
              </>
            ) : (
              <>
                {/* Active toggle */}
                <button
                  onClick={handleToggleActive}
                  disabled={toggling}
                  title={site.is_active ? 'Mark inactive' : 'Mark active'}
                  style={{
                    background: site.is_active ? 'rgba(34,197,94,0.1)' : 'var(--bg-subtle)',
                    border: `1px solid ${site.is_active ? 'rgba(34,197,94,0.25)' : 'var(--border-dim)'}`,
                    borderRadius: 6, padding: '5px 10px', fontSize: 11,
                    color: site.is_active ? '#4ade80' : 'var(--text-muted)',
                    cursor: toggling ? 'not-allowed' : 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600,
                    opacity: toggling ? 0.5 : 1,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {toggling ? '…' : site.is_active ? '● Active' : '○ Inactive'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => setEditing(true)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '5px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => setConfirmDelete(true)}
                  title="Delete site"
                  style={{ background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center' }}
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
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

export function SiteManager({ sites, supervisorCounts }: { sites: Site[]; supervisorCounts: Record<string, number> }) {
  const active = sites.filter((s) => s.is_active)
  const inactive = sites.filter((s) => !s.is_active)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AddSiteForm />

      {active.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Active</span>
            <div style={{ flex: 1, borderTop: '1px solid var(--border-dim)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{active.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map((site) => (
              <SiteRow key={site.site_id} site={site} supervisorCount={supervisorCounts[site.site_id] ?? 0} />
            ))}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Inactive</span>
            <div style={{ flex: 1, borderTop: '1px solid var(--border-dim)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{inactive.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inactive.map((site) => (
              <SiteRow key={site.site_id} site={site} supervisorCount={supervisorCounts[site.site_id] ?? 0} />
            ))}
          </div>
        </div>
      )}

      {sites.length === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏗️</div>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>No sites yet.</p>
          <p style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 4 }}>Add your first site above.</p>
        </div>
      )}
    </div>
  )
}
