"use client";

import { useState, useMemo } from "react";
import BlogPostCard from "@/components/public/BlogPostCard";

const PAGE_SIZE = 9;

export default function BlogListClient({ posts, locale }: { posts: any[]; locale: string }) {
  const [search, setSearch] = useState("");
  const [tag, setTag]       = useState("all");
  const [page, setPage]     = useState(1);

  function pick(obj: Record<string, unknown>, field: string): string {
    return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
  }

  const tags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => (p.tags ?? []).forEach((t: string) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(p => {
      const matchesTag = tag === "all" || (p.tags ?? []).includes(tag);
      const matchesSearch = !q ||
        pick(p, "title").toLowerCase().includes(q) ||
        pick(p, "excerpt").toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [posts, search, tag, locale]);

  const pages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown   = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search articles..."
          style={{ flex: "1 1 220px", maxWidth: "320px", padding: "0.6rem 1rem", borderRadius: "9999px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }}
        />
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["all", ...tags].map(t => (
              <button
                key={t}
                onClick={() => { setTag(t); setPage(1); }}
                style={{
                  padding: "0.4rem 1rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                  border: "1px solid", borderColor: tag === t ? "#4f46e5" : "var(--border)",
                  background: tag === t ? "#4f46e5" : "var(--bg-card)",
                  color: tag === t ? "#fff" : "var(--text-secondary)",
                }}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</p>
          <p>No articles match your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: "1.5rem" }}>
          {shown.map(post => (
            <BlogPostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem" }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: "34px", height: "34px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                border: "1px solid", borderColor: p === current ? "#4f46e5" : "var(--border)",
                background: p === current ? "#4f46e5" : "var(--bg-card)",
                color: p === current ? "#fff" : "var(--text-secondary)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
