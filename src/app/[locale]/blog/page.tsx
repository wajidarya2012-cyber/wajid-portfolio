import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import BlogListClient from "./BlogListClient";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const s = await prisma.siteSettings.findMany({
    where: { key: { in: ["seo_default_title", "seo_default_description", "brand_name"] } },
  }).catch(() => []);
  const map = Object.fromEntries(s.map(x => [x.key, x.value]));
  const brand = map.brand_name || "Portfolio";
  return {
    title: `Blog | ${brand}`,
    description: map.seo_default_description || "Thoughts on technology, software development, and IT management.",
  };
}

export default async function BlogListPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const posts = await prisma.blogPost.findMany({
    where:   { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
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
          <BlogListClient posts={posts} locale={locale} />
        )}
      </div>
    </div>
  );
}
