'use client'

import { useRef, useState, useEffect } from 'react'

export function AudioPlayer({ src, index }: { src: string; index: number }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => { setDuration(audio.duration); setLoaded(true) }
    const onTimeUpdate = () => setProgress(audio.currentTime / (audio.duration || 1))
    const onEnded = () => { setPlaying(false); setProgress(0) }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
    setProgress(ratio)
  }

  function fmt(s: number) {
    if (!isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-subtle)', border: '1px solid var(--border-dim)',
      borderRadius: 10, padding: '10px 12px',
    }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/pause button */}
      <button
        onClick={togglePlay}
        style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px rgba(245,166,35,0.4)',
        }}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
            <rect x="2" y="1" width="3" height="10" rx="1"/>
            <rect x="7" y="1" width="3" height="10" rx="1"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
            <path d="M3 1.5l7 4.5-7 4.5V1.5z"/>
          </svg>
        )}
      </button>

      {/* Progress bar + time */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 5 }}>
          Voice note {index + 1}
        </div>
        <div
          onClick={seek}
          style={{
            height: 4, borderRadius: 2, background: 'var(--border-dim)',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${progress * 100}%`, background: 'var(--accent)',
            borderRadius: 2, transition: 'width 0.1s linear',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
            {fmt(audioRef.current?.currentTime ?? 0)}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
            {loaded ? fmt(duration) : '…'}
          </span>
        </div>
      </div>
    </div>
  )
}
