import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import type { Site, Supervisor } from "@/types"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SupervisorManager } from "@/components/settings/SupervisorManager"
import { SiteManager } from "@/components/settings/SiteManager"

async function getSettingsData() {
  const supabase = createAdminClient()

  const [{ data: sites }, { data: supervisors }] = await Promise.all([
    // Fetch ALL sites (active + inactive) for the settings page
    supabase.from("sites").select("*").order("name", { ascending: true }),
    supabase.from("supervisors").select("*").order("name", { ascending: true }),
  ])

  const allSites = (sites ?? []) as Site[]
  const allSupervisors = (supervisors ?? []) as Supervisor[]

  // Build a count of supervisors per site
  const supervisorCounts: Record<string, number> = {}
  for (const sup of allSupervisors) {
    if (!sup.site_id) continue
    supervisorCounts[sup.site_id] = (supervisorCounts[sup.site_id] ?? 0) + 1
  }

  return { sites: allSites, supervisors: allSupervisors, supervisorCounts }
}

export default async function SettingsPage() {
  const { sites, supervisors, supervisorCounts } = await getSettingsData()

  const activeSites = sites.filter((s) => s.is_active)

  return (
    <div className="bg-mesh" style={{ minHeight: "100dvh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 48px" }}>

        <header className="animate-fade-in delay-0" style={{ paddingTop: 40, paddingBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Link
              href="/dashboard"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--text-dim)", fontSize: 13 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </Link>
            <ThemeToggle />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#f5a623,#d4830a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <span className="font-display" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Amit Paintings
            </span>
          </div>

          <h1 className="font-display" style={{ fontSize: 36, fontWeight: 800, color: "var(--text-base)", lineHeight: 1.1, marginBottom: 4 }}>
            Settings
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
            Manage sites, supervisors, and assignments
          </p>
        </header>

        {/* Stats */}
        <div className="animate-fade-up delay-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 32 }}>
          {[
            { label: "Total Sites", value: sites.length },
            { label: "Active Sites", value: activeSites.length },
            { label: "Supervisors", value: supervisors.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", lineHeight: 1, marginBottom: 3 }}>
                {value}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Sites section ── */}
        <div className="animate-fade-in delay-2" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            Sites
          </span>
          <div className="divider" style={{ flex: 1 }} />
        </div>

        <div className="animate-fade-up delay-3" style={{ marginBottom: 36 }}>
          <SiteManager sites={sites} supervisorCounts={supervisorCounts} />
        </div>

        {/* ── Supervisors section ── */}
        <div className="animate-fade-in delay-4" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            Supervisors
          </span>
          <div className="divider" style={{ flex: 1 }} />
        </div>

        <div className="animate-fade-up delay-5">
          {activeSites.length === 0 ? (
            <div className="card" style={{ padding: "32px 24px", textAlign: "center" }}>
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Add at least one active site before assigning supervisors.</p>
            </div>
          ) : (
            <SupervisorManager supervisors={supervisors} sites={activeSites} />
          )}
        </div>

      </div>
    </div>
  )
}
