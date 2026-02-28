import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import type { Site } from "@/types"
import { ThemeToggle } from "@/components/ThemeToggle"

async function getSitesWithStatus() {
  const supabase = createAdminClient()
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const from = sevenDaysAgo.toISOString().split("T")[0]

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (!sites || sites.length === 0) return []

  const siteIds = sites.map((s: Site) => s.site_id)

  // Fetch last 7 days of logs for all sites — multiple rows per day are possible
  const { data: logs } = await supabase
    .from("daily_logs")
    .select("site_id, report_date, received_at, summary, work_done, workers_present, issues_flagged, materials_needed")
    .in("site_id", siteIds)
    .gte("report_date", from)
    .order("received_at", { ascending: false })

  return sites.map((site: Site) => {
    const siteLogs = (logs ?? []).filter((l) => l.site_id === site.site_id)
    const todayLogs = siteLogs.filter((l) => l.report_date === today)
    const latestLog = siteLogs[0] as (typeof siteLogs)[0] | undefined

    // Build a combined overall summary from all 7-day log summaries (newest first)
    const summaryLines = siteLogs
      .map((l) => l.summary ?? l.work_done)
      .filter(Boolean) as string[]
    const overallSummary = summaryLines.length > 0 ? summaryLines.join(" · ") : null

    // Status flags: check across all today's logs
    const hasIssueToday = todayLogs.some((l) => !!l.issues_flagged)
    const hasMaterialsToday = todayLogs.some((l) => !!l.materials_needed)
    const workersToday = todayLogs.find((l) => l.workers_present != null)?.workers_present ?? null

    return {
      site,
      latestLog,
      todayCount: todayLogs.length,
      overallSummary,
      hasIssueToday,
      hasMaterialsToday,
      workersToday,
    }
  })
}

type SiteEntry = Awaited<ReturnType<typeof getSitesWithStatus>>[number]

function StatusDot({ hasIssue, hasMaterials, hasReport }: { hasIssue: boolean; hasMaterials: boolean; hasReport: boolean }) {
  if (!hasReport) return <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-faint)", display: "inline-block" }} />
  if (hasIssue) return <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", boxShadow: "0 0 6px rgba(239,68,68,0.6)" }} />
  if (hasMaterials) return <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 6px rgba(245,158,11,0.5)" }} />
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
}

function SiteCard({ entry, index }: { entry: SiteEntry; index: number }) {
  const { site, latestLog, todayCount, overallSummary, hasIssueToday, hasMaterialsToday, workersToday } = entry
  const hasReport = !!latestLog
  const delayClass = `delay-${Math.min(index, 7)}`

  return (
    <Link href={`/dashboard/${site.site_id}`} className={`animate-fade-up ${delayClass}`} style={{ display: "block", textDecoration: "none" }}>
      <div className="card" style={{ padding: "20px", cursor: "pointer", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          borderRadius: "14px 0 0 14px",
          background: hasIssueToday
            ? "linear-gradient(180deg,#ef4444,#dc2626)"
            : hasMaterialsToday
            ? "linear-gradient(180deg,#f59e0b,#d97706)"
            : hasReport
            ? "linear-gradient(180deg,#22c55e,#16a34a)"
            : "linear-gradient(180deg,var(--text-faint),var(--bg-subtle))",
        }} />
        <div style={{ paddingLeft: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "var(--text-base)", lineHeight: 1.2, marginBottom: 3 }}>
                {site.name}
              </h3>
              {site.location && (
                <p style={{ fontSize: 12, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                    <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z" fill="currentColor"/>
                  </svg>
                  {site.location}
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {todayCount > 1 && (
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", background: "var(--bg-subtle)", border: "1px solid var(--border-dim)", borderRadius: 99, padding: "2px 7px" }}>
                  {todayCount} updates
                </span>
              )}
              <StatusDot hasIssue={hasIssueToday} hasMaterials={hasMaterialsToday} hasReport={hasReport} />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-faint)" }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {hasReport ? (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 12 }}>
                {overallSummary ?? "Reports received"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {workersToday != null && (
                  <span className="badge badge-neutral">
                    👷 {workersToday} workers
                  </span>
                )}
                {hasIssueToday && <span className="badge badge-issue">⚠ Issue flagged</span>}
                {hasMaterialsToday && <span className="badge badge-warn">◈ Materials needed</span>}
                {!hasIssueToday && !hasMaterialsToday && <span className="badge badge-ok">✓ All clear</span>}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>No report received today</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const entries = await getSitesWithStatus()
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  })
  const reportsToday = entries.filter((e) => !!e.latestLog).length
  const issuesCount = entries.filter((e) => e.hasIssueToday).length

  return (
    <div className="bg-mesh" style={{ minHeight: "100dvh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 48px" }}>

        <header className="animate-fade-in delay-0" style={{ paddingTop: 48, paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#f5a623,#d4830a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white"/>
                </svg>
              </div>
              <span className="font-display" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Amit Paintings
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: 36, fontWeight: 800, color: "var(--text-base)", lineHeight: 1.1, marginBottom: 4 }}>
              Daily Reports
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>{today}</p>
          </div>

          {/* Top-right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <ThemeToggle />
            <Link
              href="/settings"
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: "var(--bg-card)",
                border: "1px solid var(--border-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", textDecoration: "none", flexShrink: 0,
                transition: "border-color 0.2s",
              }}
              title="Settings"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 8, padding: "7px 14px", fontSize: 12, color: "var(--text-muted)", cursor: "pointer", fontFamily: "DM Sans,sans-serif", height: 34, whiteSpace: "nowrap" }}>
                Logout
              </button>
            </form>
          </div>
        </header>

        <div className="animate-fade-up delay-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Sites", value: entries.length },
            { label: "Reported", value: reportsToday },
            { label: "Issues", value: issuesCount },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: label === "Issues" && issuesCount > 0 ? "#f87171" : "var(--accent)", lineHeight: 1, marginBottom: 3 }}>
                {value}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="animate-fade-in delay-2" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            Active Sites
          </span>
          <div className="divider" style={{ flex: 1 }} />
        </div>

        {entries.length === 0 ? (
          <div className="card animate-fade-up delay-3" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏗️</div>
            <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No active sites found.</p>
            <p style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 4 }}>Add sites in the database to see them here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map((entry, i) => (
              <SiteCard key={entry.site.site_id} entry={entry} index={i + 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
