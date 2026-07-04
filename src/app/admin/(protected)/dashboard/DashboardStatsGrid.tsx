"use client";

import Link from "next/link";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

interface StatItem {
  label: string;
  value: number;
  icon: string;
  href: string;
  color: string;
  highlight?: boolean;
}

export default function DashboardStatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem" }}>
      {stats.map(({ label, value, icon, href, color, highlight }) => (
        <Link key={label} href={href} style={{ textDecoration: "none" }}>
          <div
            className="admin-card"
            style={{
              textAlign: "center",
              transition: "all 0.2s",
              cursor: "pointer",
              border: `1px solid ${highlight ? "rgba(245,158,11,0.35)" : "var(--border)"}`,
              background: highlight ? "rgba(245,158,11,0.05)" : "var(--bg-card)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-3px)";
              el.style.boxShadow = "0 8px 28px rgba(79,70,229,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "none";
              el.style.boxShadow = "var(--shadow-card)";
            }}
          >
            <p style={{ fontSize: "1.8rem", marginBottom: "0.35rem" }}>{icon}</p>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1.75rem",
                fontWeight: 800,
                lineHeight: 1,
                color,
                background: highlight ? undefined : G,
                WebkitBackgroundClip: highlight ? undefined : "text",
                WebkitTextFillColor: highlight ? undefined : "transparent",
              }}
            >
              {value}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}