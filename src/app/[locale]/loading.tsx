export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>
      <div className="section-container" style={{ paddingTop: "4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="skeleton" style={{ height: "2.5rem", width: "60%", borderRadius: "8px" }} />
        <div className="skeleton" style={{ height: "1rem", width: "90%", borderRadius: "6px" }} />
        <div className="skeleton" style={{ height: "1rem", width: "80%", borderRadius: "6px" }} />
        <div className="skeleton" style={{ height: "1rem", width: "70%", borderRadius: "6px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "1rem", marginTop: "1.5rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "16px" }} />
          ))}
        </div>
      </div>
    </div>
  );
}