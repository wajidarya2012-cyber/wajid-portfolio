import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { splitTitle } from "@/lib/utils";
import { localizedSeo } from "@/lib/localeUrls";
import type { Metadata } from "next";
import BlogListClient from "./BlogListClient";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const s = await prisma.siteSettings.findMany({
    where: { key: { in: ["seo_default_description"] } },
  }).catch(() => []);
  const map = Object.fromEntries(s.map(x => [x.key, x.value]));
  const tm = await getTranslations({ locale, namespace: "blog" });
  const description = map.seo_default_description || tm("description");
  const seo = localizedSeo({ type: "blog" }, locale);
  return {
    title: tm("title"),
    description,
    alternates: seo.alternates,
    openGraph: { ...seo.openGraph, title: tm("title"), description },
  };
}

export default async function BlogListPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const tl = await getTranslations({ locale, namespace: "blog" });
  const titleParts = splitTitle(tl("title"), tl("titleHighlight"));

  const posts = await prisma.blogPost.findMany({
    where:   { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  }).catch(() => []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>
      <div className="section-container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <span className="section-eyebrow">{tl("eyebrow")}</span>
          <h1 className="section-title">
            {titleParts ? (
              <>
                {titleParts.before}
                <span style={{ background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {titleParts.match}
                </span>
                {titleParts.after}
              </>
            ) : tl("title")}
          </h1>
          <div className="divider" />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "520px" }}>
            {tl("description")}
          </p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>✍️</p>
            <p>{tl("noPosts")}</p>
          </div>
        ) : (
          <BlogListClient posts={posts} locale={locale} />
        )}
      </div>
    </div>
  );
}
