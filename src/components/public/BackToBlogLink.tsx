"use client";

import Link from "next/link";

export default function BackToBlogLink({ locale }: { locale: string }) {
  return (
    <Link href={`/${locale}/blog`}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem", transition: "color 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#818cf8"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
      ← Back to Blog
    </Link>
  );
}