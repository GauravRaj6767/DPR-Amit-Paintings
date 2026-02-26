import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Site, DailyLog, MediaFile } from "@/types"
import { ThemeToggle } from "@/components/ThemeToggle"
import { DeleteLogButton } from "@/components/DeleteLogButton"
import { PhotoGrid } from "@/components/PhotoGrid"

// ── Data ──────────────────────────────────────────────────────────────────────

async function getSiteData(siteId: string) {
  const supabase = await createClient()

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("site_id", siteId)
    .single()

  if (!site) return null

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const from = sevenDaysAgo.toISOString().split("T")[0]

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("site_id", siteId)
    .gte("report_date", from)
    .order("report_date", { ascending: false })

  // Fetch media files for today's log (if any)
  // Use IST date — server runs in UTC, IST is UTC+5:30
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  const todayLog = (logs ?? []).find((l) => l.report_date === today)
  let todayImages: MediaFile[] = []
  if (todayLog) {
    const { data: mediaFiles } = await supabase
      .from("media_files")
      .select("*")
      .eq("log_id", todayLog.log_id)
      .eq("file_type", "image")
      .order("created_at", { ascending: true })
    todayImages = (mediaFiles ?? []) as MediaFile[]
  }

  return { site: site as Site, logs: (logs ?? []) as DailyLog[], todayImages }
}

// ── Components ────────────────────────────────────────────────────────────────

function InfoRow({ label, value, accent }: { label: string; value: string | null; accent?: boolean }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
        {label}
      </div>
      <p style={{ fontSize: 14, color: accent ? "var(--text-base)" : "var(--text-muted)", lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}

function TodayCard({ log, images }: { log: DailyLog; images: MediaFile[] }) {
  const hasIssue = !!log.issues_flagged
  const hasMaterials = !!log.materials_needed

  return (
    <div className="card animate-fade-up delay-2" style={{ padding: 24, marginBottom: 10, position: "relative", overflow: "hidden" }}>
      {/* Glow bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: hasIssue
          ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 70%)"
          : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,166,35,0.06) 0%, transparent 70%)"
      }} />

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px rgba(245,166,35,0.6)" }} />
            <span className="font-display" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Today&apos;s Report
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
              {new Date(log.received_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
            </span>
            <DeleteLogButton logId={log.log_id} label="Remove" />
          </div>
        </div>

        {log.workers_present != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid var(--border-dim)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-subtle)", border: "1px solid var(--border-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              👷
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-base)", lineHeight: 1 }}>
                {log.workers_present}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Workers present</div>
            </div>
          </div>
        )}

        <InfoRow label="Work Done" value={log.work_done} accent />
        <InfoRow label="Materials Needed" value={log.materials_needed} />

        {log.issues_flagged && (
          <div style={{ marginBottom: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
              ⚠ Issue Flagged
            </div>
            <p style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.6 }}>{log.issues_flagged}</p>
          </div>
        )}

        {log.summary && (
          <div style={{ paddingTop: 14, borderTop: "1px solid var(--border-dim)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Summary</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>{log.summary}</p>
          </div>
        )}

        {log.source_types?.length > 0 && (
          <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {log.source_types.map((t: string) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}

        <PhotoGrid images={images} />
      </div>
    </div>
  )
}

function HistoryRow({ log, index }: { log: DailyLog; index: number }) {
  const hasIssue = !!log.issues_flagged
  const hasMaterials = !!log.materials_needed
  const delayClass = `delay-${Math.min(index + 3, 7)}`

  const dateLabel = new Date(log.report_date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  })

  return (
    <div className={`animate-fade-up ${delayClass}`} style={{
      background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10,
      padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44, paddingTop: 2 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: hasIssue ? "#ef4444" : hasMaterials ? "#f59e0b" : "#22c55e", marginBottom: 4, boxShadow: `0 0 5px ${hasIssue ? "rgba(239,68,68,0.5)" : hasMaterials ? "rgba(245,158,11,0.5)" : "rgba(34,197,94,0.5)"}` }} />
        <span className="font-display" style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center", lineHeight: 1.3 }}>{dateLabel}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: log.workers_present != null ? 8 : 0 }}>
          {log.summary ?? log.work_done ?? "Report received"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {log.workers_present != null && (
            <span className="badge badge-neutral" style={{ fontSize: 10, padding: "2px 8px" }}>👷 {log.workers_present}</span>
          )}
          {hasIssue && <span className="badge badge-issue" style={{ fontSize: 10, padding: "2px 8px" }}>⚠ Issue</span>}
          {hasMaterials && <span className="badge badge-warn" style={{ fontSize: 10, padding: "2px 8px" }}>◈ Materials</span>}
        </div>
      </div>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        <DeleteLogButton logId={log.log_id} />
      </div>
    </div>
  )
}

function NoReportToday() {
  return (
    <div className="card animate-fade-up delay-2" style={{ padding: "32px 24px", textAlign: "center", marginBottom: 10 }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
      <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No report received today</p>
      <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
        Waiting for supervisor message via WhatsApp
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const data = await getSiteData(siteId)
  if (!data) notFound()

  const { site, logs, todayImages } = data
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  const todayLog = logs.find((l) => l.report_date === today)
  const historyLogs = logs.filter((l) => l.report_date !== today)

  return (
    <div className="bg-mesh" style={{ minHeight: "100dvh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 48px" }}>

        {/* Back + header */}
        <div className="animate-fade-in delay-0" style={{ paddingTop: 40, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--text-dim)", fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              All Sites
            </Link>
            <ThemeToggle />
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 34, fontWeight: 800, color: "var(--text-base)", lineHeight: 1.1, marginBottom: 6 }}>
                {site.name}
              </h1>
              {site.location && (
                <p style={{ fontSize: 13, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                    <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z" fill="currentColor"/>
                  </svg>
                  {site.location}
                </p>
              )}
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
              Active
            </div>
          </div>
        </div>

        {/* Today section */}
        <div className="animate-fade-in delay-1" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            Today
          </span>
          <div className="divider" style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
          </span>
        </div>

        {todayLog ? <TodayCard log={todayLog} images={todayImages} /> : <NoReportToday />}

        {/* History section */}
        {historyLogs.length > 0 && (
          <>
            <div className="animate-fade-in delay-3" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                Past 7 Days
              </span>
              <div className="divider" style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {historyLogs.map((log, i) => (
                <HistoryRow key={log.log_id} log={log} index={i} />
              ))}
            </div>
          </>
        )}

        {historyLogs.length === 0 && !todayLog && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 13, color: "var(--text-faint)" }}>No reports in the last 7 days</p>
          </div>
        )}
      </div>
    </div>
  )
}
