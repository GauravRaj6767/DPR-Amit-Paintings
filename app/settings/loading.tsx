export default function SettingsLoading() {
  return (
    <div className="bg-mesh" style={{ minHeight: "100dvh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 48px" }}>

        {/* Header */}
        <div style={{ paddingTop: 40, paddingBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="skeleton" style={{ width: 80, height: 13, borderRadius: 3 }} />
            <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 110, height: 13, borderRadius: 4 }} />
          </div>
          <div className="skeleton" style={{ width: 160, height: 38, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 200, height: 13, borderRadius: 3 }} />
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 32 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 4, margin: "0 auto 6px" }} />
              <div className="skeleton" style={{ width: 60, height: 11, borderRadius: 3, margin: "0 auto" }} />
            </div>
          ))}
        </div>

        {/* Sites section */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div className="skeleton" style={{ width: 40, height: 11, borderRadius: 3 }} />
          <div style={{ flex: 1, borderTop: "1px solid var(--border-dim)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 36 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: 130, height: 14, borderRadius: 3, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 90, height: 12, borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div className="skeleton" style={{ width: 70, height: 28, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 50, height: 28, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Supervisors section */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div className="skeleton" style={{ width: 80, height: 11, borderRadius: 3 }} />
          <div style={{ flex: 1, borderTop: "1px solid var(--border-dim)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 3, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 150, height: 12, borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div className="skeleton" style={{ width: 44, height: 28, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
