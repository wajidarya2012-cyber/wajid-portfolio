export default function LocaleNotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: "800", marginBottom: "1rem" }}>404</h1>
        <p style={{ marginBottom: "1rem" }}>Page Not Found</p>
        <a href="/en" style={{ color: "#6366f1" }}>Back to Home</a>
      </div>
    </div>
  );
}
