"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#0a0f1e", color: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Something went wrong</h2>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>{error.message}</p>
            <button
              onClick={reset}
              style={{ padding: "0.5rem 1.5rem", borderRadius: "9999px", background: "#4f46e5", color: "white", fontSize: "0.875rem", cursor: "pointer", border: "none" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
