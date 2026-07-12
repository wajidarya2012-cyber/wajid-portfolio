"use client";

import Link from "next/link";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string, unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default function BlogPostCard({ post, locale }: { post: any; locale: string }) {
  return (
    <Link href={`/${locale}/blog/${post.slug}`} style={{ textDecoration: "none" }}>
      <article
        className="glass-card"
        style={{ borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.25s", height: "100%", display: "flex", flexDirection: "column" }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.borderColor = "rgba(79,70,229,0.4)"; el.style.boxShadow = "0 12px 32px rgba(79,70,229,0.15)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.borderColor = "var(--border)"; el.style.boxShadow = "var(--shadow-card)"; }}
      >
        {post.coverImage ? (
          <div style={{ width: "100%", height: "160px", overflow: "hidden", flexShrink: 0 }}>
            <img src={post.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ) : (
          <div style={{ width: "100%", height: "160px", background: "linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "2rem", opacity: 0.4 }}>✍️</span>
          </div>
        )}
        <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.75rem", lineHeight: 1.35, color: "var(--text-primary)", wordBreak: "break-word" }}>
          {pick(post as Record<string, unknown>, "title", locale)}
        </h2>
        {pick(post as Record<string, unknown>, "excerpt", locale) && (
          <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: "1.25rem", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {pick(post as Record<string, unknown>, "excerpt", locale)}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-fira)" }}>
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
          </span>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#06b6d4" }}>Read more →</span>
        </div>
        </div>
      </article>
    </Link>
  );
}