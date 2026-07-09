import { notFound }  from "next/navigation";
import { prisma }    from "@/lib/prisma";
import Link          from "next/link";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string, unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default async function BlogPostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  }).catch(() => null);

  if (!post) notFound();

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data:  { viewCount: { increment: 1 } },
  }).catch(() => null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>
      <div className="section-container" style={{ paddingTop: "3rem", paddingBottom: "5rem", maxWidth: "48rem" }}>

        {/* Back link */}
        <Link href={`/${locale}/blog`}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem", transition: "color 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#818cf8"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
          ← Back to Blog
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1rem", wordBreak: "break-word" }}>
            {pick(post as Record<string, unknown>, "title", locale)}
          </h1>
          {post.publishedAt && (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-fira)" }}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>

        {/* Content */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: pick(post as Record<string, unknown>, "content", locale) }}
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Footer */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
          <Link href={`/${locale}/blog`} className="btn-secondary" style={{ fontSize: "0.875rem" }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}