export default function DashboardLoading() {
  return (
    <div className="bg-mesh" style={{ minHeight: "100dvh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 48px" }}>

        {/* Header skeleton */}
        <div style={{ paddingTop: 48, paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
              <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 4 }} />
            </div>
            <div className="skeleton" style={{ width: 200, height: 38, borderRadius: 6, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 160, height: 13, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 70, height: 34, borderRadius: 8 }} />
          </div>
        </div>

        {/* Stats strip skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 4, margin: "0 auto 6px" }} />
              <div className="skeleton" style={{ width: 52, height: 11, borderRadius: 3, margin: "0 auto" }} />
            </div>
          ))}
        </div>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div className="skeleton" style={{ width: 80, height: 11, borderRadius: 3 }} />
          <div style={{ flex: 1, borderTop: "1px solid var(--border-dim)" }} />
        </div>

        {/* Site card skeletons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--bg-subtle)", borderRadius: "14px 0 0 14px" }} />
              <div style={{ paddingLeft: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div className="skeleton" style={{ width: 140, height: 20, borderRadius: 4, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: 90, height: 12, borderRadius: 3 }} />
                  </div>
                  <div className="skeleton" style={{ width: 24, height: 24, borderRadius: "50%" }} />
                </div>
                <div className="skeleton" style={{ width: "85%", height: 13, borderRadius: 3, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 99 }} />
                  <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
