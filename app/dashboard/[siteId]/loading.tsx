export default function SiteDetailLoading() {
  return (
    <div className="bg-mesh" style={{ minHeight: "100dvh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 48px" }}>

        {/* Back nav + header */}
        <div style={{ paddingTop: 40, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="skeleton" style={{ width: 70, height: 13, borderRadius: 3 }} />
            <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="skeleton" style={{ width: 220, height: 36, borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 120, height: 13, borderRadius: 3 }} />
            </div>
            <div className="skeleton" style={{ width: 56, height: 26, borderRadius: 8 }} />
          </div>
        </div>

        {/* Today label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div className="skeleton" style={{ width: 40, height: 11, borderRadius: 3 }} />
          <div style={{ flex: 1, borderTop: "1px solid var(--border-dim)" }} />
          <div className="skeleton" style={{ width: 50, height: 11, borderRadius: 3 }} />
        </div>

        {/* Today card skeleton */}
        <div className="card" style={{ padding: 24, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div className="skeleton" style={{ width: 110, height: 13, borderRadius: 3 }} />
            <div className="skeleton" style={{ width: 50, height: 11, borderRadius: 3 }} />
          </div>
          {/* Workers row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid var(--border-dim)" }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div>
              <div className="skeleton" style={{ width: 40, height: 28, borderRadius: 4, marginBottom: 4 }} />
              <div className="skeleton" style={{ width: 90, height: 11, borderRadius: 3 }} />
            </div>
          </div>
          {/* Fields */}
          <div style={{ marginBottom: 16 }}>
            <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 3, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "90%", height: 13, borderRadius: 3, marginBottom: 4 }} />
            <div className="skeleton" style={{ width: "70%", height: 13, borderRadius: 3 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 3, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "60%", height: 13, borderRadius: 3 }} />
          </div>
          <div style={{ paddingTop: 14, borderTop: "1px solid var(--border-dim)" }}>
            <div className="skeleton" style={{ width: 55, height: 10, borderRadius: 3, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "80%", height: 13, borderRadius: 3 }} />
          </div>
        </div>

        {/* History label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 28 }}>
          <div className="skeleton" style={{ width: 70, height: 11, borderRadius: 3 }} />
          <div style={{ flex: 1, borderTop: "1px solid var(--border-dim)" }} />
        </div>

        {/* History rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
                <div className="skeleton" style={{ width: 4, height: 4, borderRadius: "50%", marginBottom: 4 }} />
                <div className="skeleton" style={{ width: 36, height: 11, borderRadius: 3 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "80%", height: 13, borderRadius: 3, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 5 }}>
                  <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
