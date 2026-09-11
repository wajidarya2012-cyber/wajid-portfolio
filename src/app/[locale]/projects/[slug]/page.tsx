import { notFound }    from "next/navigation";
import { t as pick, formatDate } from "@/lib/utils";
import { localizedSeo, localizedUrl } from "@/lib/localeUrls";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { prisma }      from "@/lib/prisma";
import Link            from "next/link";
import AnalyticsTracker from "@/components/public/AnalyticsTracker";
import ShareButtons    from "@/components/public/ShareButtons";
import ProjectImageGrid, { ProjectFeaturedImage } from "@/components/public/ProjectImageGrid";

async function getProject(slug: string) {
  return prisma.project.findFirst({
    where:   { slug, status: "ACTIVE" },
    include: {
      category: true,
      images:   { orderBy: { sortOrder: "asc" } },
      features: { orderBy: { sortOrder: "asc" } },
      links:    true,
    },
  }).catch(() => null);
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return {};
  const p = project as unknown as Record<string, unknown>;
  const title       = pick(p, "seoTitle", params.locale)       || pick(p, "title", params.locale);
  const description = pick(p, "seoDescription", params.locale) || pick(p, "description", params.locale);
  const thumb = project.images.find(i => i.isThumbnail) ?? project.images[0];
  const seo = localizedSeo({ type: "project", slug: params.slug }, params.locale);
  return {
    title,
    description,
    alternates: seo.alternates,
    openGraph: { ...seo.openGraph, title, description, ...(thumb ? { images: [{ url: thumb.url }] } : {}) },
    twitter:   { card: "summary_large_image", title, ...(thumb ? { images: [thumb.url] } : {}) },
  };
}

export default async function ProjectDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const project = await getProject(slug);
  if (!project || (project as unknown as { visible?: boolean }).visible === false) notFound();

  const related = project.categoryId
    ? await prisma.project.findMany({
        where:   { categoryId: project.categoryId, status: "ACTIVE", id: { not: project.id } },
        include: { category: true, images: { where: { isThumbnail: true }, take: 1 } },
        orderBy: { sortOrder: "asc" },
        take:    3,
      }).catch(() => [])
    : [];

  const tl = await getTranslations({ locale, namespace: "projects" });
  const p = project as unknown as Record<string, unknown>;
  const pageUrl = localizedUrl({ type: "project", slug }, locale);
  const title   = pick(project as Record<string,unknown>, "title", locale);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-primary)", paddingTop:"80px" }}>
      <div className="section-container" style={{ paddingTop:"3rem", paddingBottom:"5rem", maxWidth:"56rem" }}>

        <Link href={`/${locale}#projects`} style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", fontSize:"0.85rem", color:"var(--text-muted)", textDecoration:"none", marginBottom:"2rem" }}>
          ← {tl("backToProjects")}
        </Link>

        {/* Header */}
        <div style={{ marginBottom:"2rem" }}>
          {project.category && (
            <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.72rem", color:"#06b6d4", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.6rem" }}>
              {pick(project.category as unknown as Record<string,unknown>, "name", locale)}
            </p>
          )}
          <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"clamp(1.7rem,4.5vw,2.6rem)", fontWeight:800, lineHeight:1.15, letterSpacing:"-0.03em", marginBottom:"1rem", wordBreak:"break-word" }}>
            {title}
            {project.featured && <span style={{ fontSize:"1.2rem", marginLeft:"0.5rem" }}>⭐</span>}
          </h1>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1.25rem", fontSize:"0.82rem", color:"var(--text-muted)", marginBottom:"1rem" }}>
            {(p.clientName as string) && <span>🏢 {p.clientName as string}</span>}
            {(p.location as string)   && <span>📍 {p.location as string}</span>}
            {project.endDate          && <span>📅 {formatDate(project.endDate, locale, { year:"numeric", month:"long" })}</span>}
            {project.viewCount > 0    && <span>👁 {project.viewCount} {tl("views")}</span>}
          </div>
          <ShareButtons url={pageUrl} title={title} />
        </div>

        {/* Featured image */}
        {project.images.length > 0 && (
          <ProjectFeaturedImage
            images={project.images.map(img => ({ id: img.id, url: img.url, caption: img.caption }))}
            index={Math.max(0, project.images.findIndex(i => i.isThumbnail))}
            alt={title}
          />
        )}

        {/* Technologies */}
        {project.technologies.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"1.75rem" }}>
            {project.technologies.map(t => <span key={t} className="tag-badge">{t}</span>)}
          </div>
        )}

        <p style={{ fontSize:"0.95rem", lineHeight:1.9, color:"var(--text-secondary)", marginBottom:"1.75rem" }}>
          {pick(project as Record<string,unknown>, "description", locale)}
        </p>

        {project.features.length > 0 && (
          <div style={{ marginBottom:"1.75rem" }}>
            <h2 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"1rem", color:"#06b6d4", marginBottom:"0.875rem" }}>✅ {tl("features")}</h2>
            <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {project.features.map(f => (
                <li key={f.id} style={{ display:"flex", gap:"0.6rem", fontSize:"0.9rem", color:"var(--text-secondary)", lineHeight:1.7 }}>
                  <span style={{ color:"#4f46e5", flexShrink:0 }}>›</span>
                  {pick(f as unknown as Record<string,unknown>, "text", locale)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {pick(project as Record<string,unknown>, "challenge", locale) && (
          <div style={{ marginBottom:"1.75rem" }}>
            <h2 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"1rem", color:"#06b6d4", marginBottom:"0.6rem" }}>🧩 {tl("challenge")}</h2>
            <p style={{ fontSize:"0.9rem", lineHeight:1.9, color:"var(--text-secondary)" }}>
              {pick(project as Record<string,unknown>, "challenge", locale)}
            </p>
          </div>
        )}

        {/* Gallery */}
        <ProjectImageGrid
          images={project.images.map(img => ({ id: img.id, url: img.url, caption: img.caption }))}
          title={title}
        />

        {/* Links */}
        {project.links.length > 0 && (
          <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", marginBottom:"2.5rem", paddingTop:"1.5rem", borderTop:"1px solid var(--border)" }}>
            {project.links.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize:"0.85rem" }}>
                {pick(link as unknown as Record<string,unknown>, "label", locale)} ↗
              </a>
            ))}
          </div>
        )}

        {/* Related projects */}
        {related.length > 0 && (
          <div style={{ paddingTop:"2rem", borderTop:"1px solid var(--border)" }}>
            <h2 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"1.1rem", marginBottom:"1.25rem" }}>{tl("relatedProjects")}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))", gap:"1rem" }}>
              {related.map(r => {
                const thumb = r.images[0];
                return (
                  <Link key={r.id} href={`/${locale}/projects/${r.slug}`} className="glass-card" style={{ borderRadius:"14px", overflow:"hidden", textDecoration:"none", display:"block" }}>
                    <div style={{ height:"110px", background:"var(--bg-secondary)" }}>
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      )}
                    </div>
                    <p style={{ padding:"0.75rem 0.875rem", fontSize:"0.85rem", fontWeight:600, color:"var(--text-primary)" }}>
                      {pick(r as unknown as Record<string,unknown>, "title", locale)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnalyticsTracker page={`/${locale}/projects/${slug}`} event="PROJECT_VIEW" projectId={project.id} />
    </div>
  );
}
