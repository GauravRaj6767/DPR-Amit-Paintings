'use client'

import type { MediaFile } from "@/types"
import { proxyUrl } from "@/lib/mediaUrl"

export function PhotoGrid({ images }: { images: MediaFile[] }) {
  if (images.length === 0) return null

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border-dim)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Photos
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, color: "var(--accent)",
          background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)",
          borderRadius: 99, padding: "1px 7px",
        }}>
          {images.length}
        </span>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 6 }}>
        {images.map((img) => (
          <a
            key={img.media_id}
            href={proxyUrl(img.file_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="photo-thumb"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proxyUrl(img.file_url)}
              alt="Site photo"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement
                el.style.display = "none"
                const parent = el.parentElement
                if (parent && !parent.querySelector(".img-fallback")) {
                  const fb = document.createElement("div")
                  fb.className = "img-fallback"
                  fb.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--text-dim);"
                  fb.textContent = "🖼"
                  parent.appendChild(fb)
                }
              }}
            />
            <div className="photo-overlay" />
          </a>
        ))}
      </div>
    </div>
  )
}
