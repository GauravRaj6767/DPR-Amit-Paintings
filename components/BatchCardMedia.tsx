'use client'

import type { MediaFile } from '@/types'
import { AudioPlayer } from '@/components/AudioPlayer'
import { PhotoGrid } from '@/components/PhotoGrid'

export function BatchCardMedia({ media }: { media: MediaFile[] }) {
  const images = media.filter((m) => m.file_type === 'image')
  const audioFiles = media.filter((m) => m.file_type === 'audio')
  const videoFiles = media.filter((m) => m.file_type === 'video')

  if (images.length === 0 && audioFiles.length === 0 && videoFiles.length === 0) return null

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid var(--border-dim)', paddingTop: 14 }}>
      {audioFiles.length > 0 && (
        <div style={{ marginBottom: images.length > 0 || videoFiles.length > 0 ? 12 : 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            🎤 Voice Notes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {audioFiles.map((a, i) => (
              <AudioPlayer key={a.media_id} src={a.file_url} index={i} />
            ))}
          </div>
        </div>
      )}

      {images.length > 0 && <PhotoGrid images={images} />}

      {videoFiles.length > 0 && (
        <div style={{ marginTop: images.length > 0 ? 12 : 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            🎥 Videos
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {videoFiles.map((v) => (
              <video
                key={v.media_id}
                src={v.file_url}
                controls
                style={{ width: '100%', borderRadius: 8, background: '#000' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
