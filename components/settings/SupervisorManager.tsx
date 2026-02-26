'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Supervisor, Site } from '@/types'

// ── Inline styles helpers ──────────────────────────────────────────────────────

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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
}

// ── Add Supervisor Form ────────────────────────────────────────────────────────

function AddSupervisorForm({ sites }: { sites: Site[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [siteId, setSiteId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!phone.trim() || !siteId) { setError('Phone number and site are required.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null, phone_number: phone.trim(), site_id: siteId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to add supervisor')
      setName(''); setPhone(''); setSiteId(''); setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add supervisor')
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
        Add Supervisor
      </button>
    )
  }

  return (
    <div className="card" style={{ padding: '20px 20px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-base)', marginBottom: 16 }}>
        New Supervisor
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>
              Name <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Supervisor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>
              Phone Number *
            </label>
            <input
              type="text"
              placeholder="e.g. 917330817729"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
            />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>
            Assign to Site *
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              style={selectStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
            >
              <option value="">Select site…</option>
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_id}>{s.name}{s.location ? ` — ${s.location}` : ''}</option>
              ))}
            </select>
            <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {error && (
          <p style={{ fontSize: 12, color: '#f87171' }}>{error}</p>
        )}
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
            {loading ? 'Adding…' : 'Add Supervisor'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Supervisor Row ─────────────────────────────────────────────────────────────

function SupervisorRow({ supervisor, sites }: { supervisor: Supervisor; sites: Site[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [selectedSite, setSelectedSite] = useState(supervisor.site_id)
  const [editName, setEditName] = useState(supervisor.name ?? '')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const currentSite = sites.find((s) => s.site_id === supervisor.site_id)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch(`/api/supervisors/${supervisor.supervisor_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: selectedSite, name: editName.trim() || null }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setEditing(false)
      router.refresh()
    } catch {
      alert('Failed to update supervisor. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/supervisors/${supervisor.supervisor_id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch {
      alert('Failed to remove supervisor. Please try again.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 10,
      padding: '14px 16px', transition: 'border-color 0.2s',
    }}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Name</label>
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
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Assign to Site</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  style={{ ...selectStyle, fontSize: 12 }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
                >
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>{s.name}</option>
                  ))}
                </select>
                <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setEditing(false); setSelectedSite(supervisor.site_id); setEditName(supervisor.name ?? '') }}
              style={{ background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ background: 'linear-gradient(135deg,#f5a623,#d4830a)', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar */}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-subtle)', border: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            👷
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-base)' }}>
                {supervisor.name ?? 'Unnamed Supervisor'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{supervisor.phone_number}</span>
              {currentSite && (
                <>
                  <span style={{ color: 'var(--text-faint)' }}>·</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{currentSite.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {confirmDelete ? (
              <>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Remove?</span>
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
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center' }}
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

export function SupervisorManager({ supervisors, sites }: { supervisors: Supervisor[]; sites: Site[] }) {
  // Group supervisors by site
  const bySite = sites.map((site) => ({
    site,
    supervisors: supervisors.filter((s) => s.site_id === site.site_id),
  }))

  const unassigned = supervisors.filter((s) => !sites.find((site) => site.site_id === s.site_id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AddSupervisorForm sites={sites} />

      {bySite.map(({ site, supervisors: siteSups }) => (
        <div key={site.site_id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {site.name}
            </span>
            {site.location && (
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{site.location}</span>
            )}
            <div style={{ flex: 1, borderTop: '1px solid var(--border-dim)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
              {siteSups.length} supervisor{siteSups.length !== 1 ? 's' : ''}
            </span>
          </div>

          {siteSups.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>No supervisors assigned to this site</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {siteSups.map((sup) => (
                <SupervisorRow key={sup.supervisor_id} supervisor={sup} sites={sites} />
              ))}
            </div>
          )}
        </div>
      ))}

      {unassigned.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unassigned</span>
            <div style={{ flex: 1, borderTop: '1px solid var(--border-dim)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unassigned.map((sup) => (
              <SupervisorRow key={sup.supervisor_id} supervisor={sup} sites={sites} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
