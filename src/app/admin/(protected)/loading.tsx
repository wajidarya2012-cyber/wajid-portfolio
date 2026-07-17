export default function AdminLoading() {
  return (
    <div style={{ maxWidth: "1100px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="skeleton" style={{ height: "1.75rem", width: "220px", borderRadius: "8px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "16px" }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: "300px", borderRadius: "16px" }} />
    </div>
  );
}