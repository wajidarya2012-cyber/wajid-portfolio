import Link from "next/link";

export default function NotFound() {
  return (
    <html>
      <body style={{ background: "#0a0f1e", color: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "5rem", fontWeight: "800", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "1rem 0" }}>Page Not Found</h2>
            <p style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "0.875rem" }}>The page you are looking for does not exist.</p>
            <a
              href="/en"
              style={{ padding: "0.75rem 2rem", borderRadius: "9999px", background: "#4f46e5", color: "white", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
