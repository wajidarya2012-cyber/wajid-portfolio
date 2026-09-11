import { notFound }  from "next/navigation";
import { t as pick, formatDate } from "@/lib/utils";
import { localizedSeo, localizedUrl } from "@/lib/localeUrls";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { prisma }    from "@/lib/prisma";
import Link          from "next/link";
import DOMPurify     from "isomorphic-dompurify";
import BackToBlogLink   from "@/components/public/BackToBlogLink";
import ShareButtons     from "@/components/public/ShareButtons";
import AnalyticsTracker from "@/components/public/AnalyticsTracker";
import { readingTime }  from "@/lib/utils";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } }).catch(() => null);
}

export async function generateMetadata({ params: { locale, slug } }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const post = await getPost(slug);
  if (!post) return {};
  const p = post as unknown as Record<string, unknown>;
  const title       = pick(p, "metaTitle", locale) || pick(p, "title", locale);
  const description = pick(p, "metaDesc", locale)  || pick(p, "excerpt", locale);
  const seo = localizedSeo({ type: "blogPost", slug }, locale);
  return {
    title,
    description,
    alternates: seo.alternates,
    openGraph: { ...seo.openGraph, title, description, type: "article", ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}) },
    twitter:   { card: "summary_large_image", title, ...(post.coverImage ? { images: [post.coverImage] } : {}) },
  };
}

export default async function BlogPostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const post = await getPost(slug);
  if (!post) notFound();

  const tl = await getTranslations({ locale, namespace: "blog" });

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data:  { viewCount: { increment: 1 } },
  }).catch(() => null);

  const related = post.tags.length > 0
    ? await prisma.blogPost.findMany({
        where:   { status: "PUBLISHED", id: { not: post.id }, tags: { hasSome: post.tags } },
        orderBy: { publishedAt: "desc" },
        take:    3,
      }).catch(() => [])
    : await prisma.blogPost.findMany({
        where:   { status: "PUBLISHED", id: { not: post.id } },
        orderBy: { publishedAt: "desc" },
        take:    3,
      }).catch(() => []);

  const pageUrl = localizedUrl({ type: "blogPost", slug }, locale);
  const title   = pick(post as Record<string, unknown>, "title", locale);
  const content = pick(post as Record<string, unknown>, "content", locale);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>
      <div className="section-container" style={{ paddingTop: "3rem", paddingBottom: "5rem", maxWidth: "48rem" }}>

        {/* Back link */}
        <BackToBlogLink locale={locale} />

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1rem", wordBreak: "break-word" }}>
            {title}
            {post.featured && <span style={{ fontSize: "1.1rem", marginLeft: "0.5rem" }}>⭐</span>}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
            {post.publishedAt && (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-fira)", margin: 0 }}>
                {formatDate(post.publishedAt, locale)}
                {" · "}{readingTime(content)} {tl("minRead")}
                {post.viewCount > 0 ? ` · ${post.viewCount} views` : ""}
              </p>
            )}
          </div>
          {post.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
              {post.tags.map(t => <span key={t} className="tag-badge">{t}</span>)}
            </div>
          )}
          <ShareButtons url={pageUrl} title={title} />
        </div>

        {/* Featured image */}
        {post.coverImage && (
          <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden", marginBottom: "2rem" }}>
            <img src={post.coverImage} alt="" style={{ width: "100%", display: "block" }} />
          </div>
        )}

        {/* Featured video */}
        {post.featuredVideoUrl && (
          <div style={{ marginBottom: "2rem" }}>
            {/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(post.featuredVideoUrl) ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "16px", overflow: "hidden" }}>
                <iframe
                  src={post.featuredVideoUrl.replace("watch?v=", "embed/")}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video src={post.featuredVideoUrl} controls style={{ width: "100%", borderRadius: "16px", display: "block" }} />
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Footer */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <Link href={`/${locale}/blog`} className="btn-secondary" style={{ fontSize: "0.875rem" }}>
            ← {tl("backToBlog")}
          </Link>
          <ShareButtons url={pageUrl} title={title} />
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              {tl("relatedArticles")}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))", gap: "1rem" }}>
              {related.map(r => (
                <Link key={r.id} href={`/${locale}/blog/${r.slug}`} className="glass-card" style={{ borderRadius: "14px", overflow: "hidden", textDecoration: "none", display: "block" }}>
                  <div style={{ height: "110px", background: "var(--bg-secondary)" }}>
                    {r.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <p style={{ padding: "0.75rem 0.875rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {pick(r as unknown as Record<string, unknown>, "title", locale)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnalyticsTracker page={`/${locale}/blog/${slug}`} event="BLOG_VIEW" />
    </div>
  );
}
