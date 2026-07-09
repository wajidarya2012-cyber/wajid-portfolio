import { prisma } from "@/lib/prisma";
import Link from "next/link";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string, unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default async function BlogListPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const posts = await prisma.blogPost.findMany({
    where:   { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  }).catch(() => []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>
      <div className="section-container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <span className="section-eyebrow">Writing</span>
          <h1 className="section-title">
            Blog &amp;{" "}
            <span style={{ background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Articles
            </span>
          </h1>
          <div className="divider" />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "520px" }}>
            Thoughts on technology, software development, and IT management.
          </p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>✍️</p>
            <p>No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: "1.5rem" }}>
            {posts.map((post) => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <article
                  className="glass-card"
                  style={{ borderRadius: "16px", padding: "1.75rem", cursor: "pointer", transition: "all 0.25s", height: "100%", display: "flex", flexDirection: "column" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.borderColor = "rgba(79,70,229,0.4)"; el.style.boxShadow = "0 12px 32px rgba(79,70,229,0.15)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.borderColor = "var(--border)"; el.style.boxShadow = "var(--shadow-card)"; }}
                >
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
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}