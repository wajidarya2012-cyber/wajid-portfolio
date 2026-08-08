import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma }        from "@/lib/prisma";
import GalleryGridClient  from "./GalleryGridClient";
import AnalyticsTracker   from "@/components/public/AnalyticsTracker";
import { splitTitle }     from "@/lib/utils";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

type Album = { slug: string; name_en?: string; name_ps?: string; name_fa?: string };
type SectionConfig = {
  title_en?: string; title_ps?: string; title_fa?: string;
  subtitle_en?: string; subtitle_ps?: string; subtitle_fa?: string;
  description_en?: string; description_ps?: string; description_fa?: string;
  seoTitle?: string; seoDescription?: string;
};

function pick(obj: Record<string, unknown>, field: string, locale: string): string {
  const val = obj[`${field}_${locale}`] as string | undefined;
  return (val && val.trim() !== "" ? val : (obj[`${field}_en`] as string)) ?? "";
}

async function getConfig() {
  const rows = await prisma.siteSettings.findMany({
    where: { key: { in: ["gallery_albums", "gallery_section_config"] } },
  }).catch(() => []);
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  let albums: Album[] = [];
  let section: SectionConfig = {};
  try { albums = map.gallery_albums ? JSON.parse(map.gallery_albums) : []; } catch {}
  try { section = map.gallery_section_config ? JSON.parse(map.gallery_section_config) : {}; } catch {}
  return { albums, section };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const { section } = await getConfig();
  const tl          = await getTranslations({ locale, namespace: "gallery" });
  const title       = section.seoTitle       || pick(section as unknown as Record<string,unknown>, "title", locale) || tl("title");
  const description = section.seoDescription || tl("defaultDescription");
  return { title: `${title} | Gallery`, description };
}

export default async function GalleryPage({ params: { locale } }: { params: { locale: string } }) {
  const [items, { albums, section }, tl] = await Promise.all([
    prisma.galleryItem.findMany({
      where:   { visible: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    }).catch(() => []),
    getConfig(),
    getTranslations({ locale, namespace: "gallery" }),
  ]);

  const customTitle  = pick(section as unknown as Record<string,unknown>, "title", locale);
  const subtitle     = pick(section as unknown as Record<string,unknown>, "subtitle", locale);
  const description = pick(section as unknown as Record<string,unknown>, "description", locale);
  const titleParts   = splitTitle(tl("title"), tl("titleHighlight"));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>
      <div className="section-container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <span className="section-eyebrow">{tl("eyebrow")}</span>
          <h1 className="section-title">
            {customTitle ? customTitle : titleParts ? <>{titleParts.before}<span style={{ background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{titleParts.match}</span>{titleParts.after}</> : tl("title")}
          </h1>
          {subtitle && <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: "-0.5rem" }}>{subtitle}</p>}
          <div className="divider" />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "520px" }}>
            {description || tl("defaultDescription")}
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🖼</p>
            <p>{tl("noPhotosYet")}</p>
          </div>
        ) : (
          <GalleryGridClient items={items} albums={albums} locale={locale} />
        )}
      </div>

      <AnalyticsTracker page={`/${locale}/gallery`} event="GALLERY_VIEW" />
    </div>
  );
}
