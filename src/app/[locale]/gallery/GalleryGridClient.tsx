"use client";

import { useState, useMemo } from "react";
import ImageLightbox, { type LightboxImage } from "@/components/public/ImageLightbox";

const PAGE_SIZE = 12;

type Album = { slug: string; name_en?: string; name_ps?: string; name_fa?: string };

function pick(obj: Record<string, unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default function GalleryGridClient({
  items, albums, locale,
}: {
  items: any[];
  albums: Album[];
  locale: string;
}) {
  const [search, setSearch] = useState("");
  const [album, setAlbum]   = useState("all");
  const [tag, setTag]       = useState("all");
  const [sort, setSort]     = useState("newest");
  const [page, setPage]     = useState(1);
  const [lightboxItems, setLightboxItems] = useState<LightboxImage[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const tags = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => (i.tags ?? []).forEach((t: string) => set.add(t)));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(i => {
      const matchAlbum = album === "all" || i.category === album;
      const matchTag   = tag === "all" || (i.tags ?? []).includes(tag);
      const matchSearch = !q ||
        pick(i, "title", locale).toLowerCase().includes(q) ||
        pick(i, "caption", locale).toLowerCase().includes(q);
      return matchAlbum && matchTag && matchSearch;
    });
  }, [items, search, album, tag, locale]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    switch (sort) {
      case "oldest":     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "mostViewed": return b.viewCount - a.viewCount;
      case "featured":   return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      case "newest":
      default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }), [filtered, sort]);

  const pages   = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown   = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function albumLabel(slug: string) {
    const a = albums.find(x => x.slug === slug);
    if (!a) return slug.charAt(0).toUpperCase() + slug.slice(1);
    return (locale === "ps" ? a.name_ps : locale === "fa" ? a.name_fa : a.name_en) || a.name_en || slug;
  }

  function openLightbox(i: number) {
    setLightboxItems(shown.map(it => ({ id: it.id, url: it.url, caption: pick(it, "caption", locale) || pick(it, "title", locale) })));
    setLightboxIndex(i);
    fetch(`/api/v1/gallery/${shown[i].id}/view`, { method: "POST" }).catch(() => {});
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.4rem 1rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
    border: "1px solid", borderColor: active ? "#4f46e5" : "var(--border)",
    background: active ? "#4f46e5" : "var(--bg-card)",
    color: active ? "#fff" : "var(--text-secondary)",
  });

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search photos..."
          style={{ flex: "1 1 200px", maxWidth: "300px", padding: "0.55rem 1rem", borderRadius: "9999px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }}
        />
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding: "0.5rem 0.9rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer" }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostViewed">Most Viewed</option>
          <option value="featured">Featured First</option>
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <button onClick={() => { setAlbum("all"); setPage(1); }} style={pillStyle(album === "all")}>All Albums</button>
        {albums.map(a => (
          <button key={a.slug} onClick={() => { setAlbum(a.slug); setPage(1); }} style={pillStyle(album === a.slug)}>{albumLabel(a.slug)}</button>
        ))}
      </div>

      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.75rem" }}>
          <button onClick={() => { setTag("all"); setPage(1); }} style={{ ...pillStyle(tag === "all"), fontSize: "0.7rem", padding: "0.3rem 0.8rem" }}>All Tags</button>
          {tags.map(t => (
            <button key={t} onClick={() => { setTag(t); setPage(1); }} style={{ ...pillStyle(tag === t), fontSize: "0.7rem", padding: "0.3rem 0.8rem" }}>{t}</button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</p>
          <p>No photos match your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" }}>
          {shown.map((item, i) => (
            <button
              key={item.id}
              onClick={() => openLightbox(i)}
              style={{ position: "relative", borderRadius: "12px", overflow: "hidden", aspectRatio: "4/3", background: "var(--bg-secondary)", border: "1px solid var(--border)", cursor: "pointer", padding: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={pick(item, "altText", locale) || pick(item, "title", locale) || ""}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {item.featured && (
                <span style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(79,70,229,0.85)", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.55rem", borderRadius: "9999px" }}>⭐</span>
              )}
              {pick(item, "title", locale) && (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.75),transparent 50%)", display: "flex", alignItems: "flex-end", padding: "0.6rem" }}>
                  <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600, textAlign: "left" }}>{pick(item, "title", locale)}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem" }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width: "34px", height: "34px", borderRadius: "8px", ...pillStyle(p === current), fontSize: "0.8rem" }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {lightboxItems && (
        <ImageLightbox
          images={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxItems(null)}
          onIndexChange={(i) => { setLightboxIndex(i); fetch(`/api/v1/gallery/${shown[i].id}/view`, { method: "POST" }).catch(() => {}); }}
        />
      )}
    </div>
  );
}
