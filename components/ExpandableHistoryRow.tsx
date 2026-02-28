'use client'

import { useState } from 'react'
import type { DailyLog, MediaFile } from '@/types'
import { PhotoGrid } from '@/components/PhotoGrid'
import { AudioPlayer } from '@/components/AudioPlayer'
import { DeleteLogButton } from '@/components/DeleteLogButton'
import { proxyUrl } from '@/lib/mediaUrl'

export function ExpandableHistoryRow({ log, index }: { log: DailyLog; index: number }) {
  const hasIssue = !!log.issues_flagged
  const hasMaterials = !!log.materials_needed
  const delayClass = `delay-${Math.min(index + 3, 7)}`

  const [expanded, setExpanded] = useState(false)
  const [media, setMedia] = useState<MediaFile[] | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)

  const dateLabel = new Date(log.report_date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const timeLabel = new Date(log.received_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  })

  async function handleExpand() {
    const next = !expanded
    setExpanded(next)
    if (next && media === null && !loadingMedia) {
      setLoadingMedia(true)
      try {
        const res = await fetch(`/api/logs/${log.log_id}/media`)
        const json = await res.json()
        setMedia(json.media ?? [])
      } catch {
        setMedia([])
      } finally {
        setLoadingMedia(false)
      }
    }
  }

  const images = (media ?? []).filter((m) => m.file_type === 'image')
  const audioFiles = (media ?? []).filter((m) => m.file_type === 'audio')
  const videoFiles = (media ?? []).filter((m) => m.file_type === 'video')

  // Parse voice note transcripts from raw_combined_text
  const transcripts: string[] = []
  if (log.raw_combined_text) {
    const matches = log.raw_combined_text.matchAll(/\[Voice note\]:\s*([\s\S]+?)(?=\n\[|\n[A-Z]|$)/g)
    for (const match of matches) {
      const t = match[1].trim()
      if (t) transcripts.push(t)
    }
  }

  const dotColor = hasIssue ? '#ef4444' : hasMaterials ? '#f59e0b' : '#22c55e'
  const dotShadow = hasIssue ? 'rgba(239,68,68,0.5)' : hasMaterials ? 'rgba(245,158,11,0.5)' : 'rgba(34,197,94,0.5)'

  return (
    <div className={`animate-fade-up ${delayClass}`} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Collapsed row — always visible */}
      <button
        onClick={handleExpand}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14,
          textAlign: 'left',
        }}
      >
        {/* Date/time column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44, paddingTop: 2 }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor, marginBottom: 4, boxShadow: `0 0 5px ${dotShadow}` }} />
          <span className="font-display" style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3 }}>{dateLabel}</span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'center' }}>{timeLabel}</span>
        </div>

        {/* Summary + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
            {log.summary ?? log.work_done ?? 'Report received'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {log.workers_present != null && (
              <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 8px' }}>👷 {log.workers_present}</span>
            )}
            {hasIssue && <span className="badge badge-issue" style={{ fontSize: 10, padding: '2px 8px' }}>⚠ Issue</span>}
            {hasMaterials && <span className="badge badge-warn" style={{ fontSize: 10, padding: '2px 8px' }}>◈ Materials</span>}
            {log.source_types?.includes('audio') && <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 8px' }}>🎤 Voice</span>}
            {log.source_types?.includes('image') && <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 8px' }}>📷 Photos</span>}
            {log.source_types?.includes('video') && <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 8px' }}>🎥 Video</span>}
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{ flexShrink: 0, paddingTop: 4, color: 'var(--text-dim)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-dim)', padding: '16px 16px 18px' }}>

          {log.work_done && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Work Done</div>
              <p style={{ fontSize: 13, color: 'var(--text-base)', lineHeight: 1.6 }}>{log.work_done}</p>
            </div>
          )}

          {log.materials_needed && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Materials Needed</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{log.materials_needed}</p>
            </div>
          )}

          {log.issues_flagged && (
            <div style={{ marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>⚠ Issue Flagged</div>
              <p style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.6 }}>{log.issues_flagged}</p>
            </div>
          )}

          {/* Media loading state */}
          {loadingMedia && (
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8 }}>Loading media…</p>
          )}

          {/* Voice note transcripts */}
          {transcripts.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                🎤 Voice Notes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {transcripts.map((t, i) => (
                  <div key={i} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-dim)', borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{t}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio players */}
          {audioFiles.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Audio
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {audioFiles.map((a, i) => (
                  <AudioPlayer key={a.media_id} src={proxyUrl(a.file_url)} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {images.length > 0 && <PhotoGrid images={images} />}

          {/* Videos */}
          {videoFiles.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                🎥 Videos
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {videoFiles.map((v) => (
                  <video
                    key={v.media_id}
                    src={proxyUrl(v.file_url)}
                    controls
                    style={{ width: '100%', borderRadius: 8, background: '#000' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No media */}
          {media !== null && images.length === 0 && audioFiles.length === 0 && videoFiles.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>No media attachments</p>
          )}

          {/* Delete */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'flex-end' }}>
            <DeleteLogButton logId={log.log_id} label="Remove report" />
          </div>
        </div>
      )}
    </div>
  )
}
