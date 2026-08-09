"use client";

import { useState }     from "react";
import Link             from "next/link";
import { useRouter }    from "next/navigation";
import type { Project, ProjectCategory, ProjectImage } from "@/types";
import { reorder } from "@/lib/reorder";

type ProjectRow = Project & { category: ProjectCategory | null; images: ProjectImage[] };

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  DRAFT:    "bg-yellow-500/15  text-yellow-400  border-yellow-500/25",
  ARCHIVED: "bg-slate-500/15   text-slate-400   border-slate-500/25",
};

export default function AdminProjectsClient({
  projects,
  categories,
}: {
  projects:   ProjectRow[];
  categories: ProjectCategory[];
}) {
  const router              = useRouter();
  const [search, setSearch] = useState("");
  const [catFilter, setCat] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
  const filtered = sorted.filter((p) => {
    const matchSearch = p.title_en.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || p.categoryId === catFilter;
    return matchSearch && matchCat;
  });

  async function patch(id: string, data: Record<string, unknown>) {
    setBusyId(id);
    await fetch(`/api/v1/admin/projects/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    setBusyId(null);
    router.refresh();
  }

  async function toggleField(p: ProjectRow, field: "featured" | "visible" | "showOnHomepage") {
    await patch(p.id, { [field]: !p[field] });
  }

  async function move(id: string, dir: -1 | 1) {
    const result = reorder(sorted, "sortOrder", p => p.id === id, dir);
    if (!result) return;
    setBusyId(id);
    await Promise.all(result.changed.map(p => fetch(`/api/v1/admin/projects/${p.id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ sortOrder: p.sortOrder }),
    })));
    setBusyId(null);
    router.refresh();
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/v1/admin/projects/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b flex flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input-field max-w-xs"
        />
        <select
          value={catFilter}
          onChange={(e) => setCat(e.target.value)}
          className="input-field max-w-[180px]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name_en}</option>
          ))}
        </select>
        <span className="text-xs self-center ml-auto" style={{ color: "var(--text-muted)" }}>
          {filtered.length} results
        </span>
      </div>

      {/* Table — desktop/tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: "var(--border)" }}>
              {["Order", "Project", "Category", "Status", "Views", "Featured", "Visible", "Homepage", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr key={p.id} className="border-b hover:bg-white/[0.03] transition-colors" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => move(p.id, -1)} disabled={idx === 0 || busyId === p.id} className="text-xs leading-none px-1 disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>▲</button>
                    <button onClick={() => move(p.id, 1)} disabled={idx === filtered.length - 1 || busyId === p.id} className="text-xs leading-none px-1 disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>▼</button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium max-w-[200px]">
                  <p className="truncate">{p.title_en}</p>
                  <p className="text-xs font-code mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>/{p.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                    {p.category?.name_en ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLE[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-code text-xs text-accent-500">{p.viewCount}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleField(p, "featured")} disabled={busyId === p.id} title="Toggle featured">
                    {p.featured ? "⭐" : "☆"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleField(p, "visible")} disabled={busyId === p.id} title="Toggle visible"
                    className="text-xs px-2 py-1 rounded-full border" style={{ borderColor:"var(--border)", color: p.visible ? "#34d399" : "var(--text-muted)" }}>
                    {p.visible ? "Shown" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleField(p, "showOnHomepage")} disabled={busyId === p.id} title="Toggle homepage display"
                    className="text-xs px-2 py-1 rounded-full border" style={{ borderColor:"var(--border)", color: p.showOnHomepage ? "#818cf8" : "var(--text-muted)" }}>
                    {p.showOnHomepage ? "On" : "Off"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg border hover:border-primary-500 hover:text-white transition-all"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.title_en)}
                      disabled={deleting === p.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      {deleting === p.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No projects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden divide-y" style={{ borderColor: "var(--border)" }}>
        {filtered.map((p, idx) => (
          <div key={p.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{p.title_en}</p>
                <p className="text-xs font-code mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>/{p.slug}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => move(p.id, -1)} disabled={idx === 0 || busyId === p.id}
                  className="text-sm leading-none w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-30"
                  style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }} aria-label="Move up">▲</button>
                <button onClick={() => move(p.id, 1)} disabled={idx === filtered.length - 1 || busyId === p.id}
                  className="text-sm leading-none w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-30"
                  style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }} aria-label="Move down">▼</button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                {p.category?.name_en ?? "—"}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLE[p.status]}`}>
                {p.status}
              </span>
              <span className="text-xs font-code text-accent-500">👁 {p.viewCount}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => toggleField(p, "featured")} disabled={busyId === p.id}
                className="text-xs px-2.5 py-1.5 rounded-full border" style={{ borderColor: "var(--border)", color: p.featured ? "#facc15" : "var(--text-muted)" }}>
                {p.featured ? "⭐ Featured" : "☆ Feature"}
              </button>
              <button onClick={() => toggleField(p, "visible")} disabled={busyId === p.id}
                className="text-xs px-2.5 py-1.5 rounded-full border" style={{ borderColor: "var(--border)", color: p.visible ? "#34d399" : "var(--text-muted)" }}>
                {p.visible ? "Shown" : "Hidden"}
              </button>
              <button onClick={() => toggleField(p, "showOnHomepage")} disabled={busyId === p.id}
                className="text-xs px-2.5 py-1.5 rounded-full border" style={{ borderColor: "var(--border)", color: p.showOnHomepage ? "#818cf8" : "var(--text-muted)" }}>
                {p.showOnHomepage ? "Homepage: On" : "Homepage: Off"}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link href={`/admin/projects/${p.id}`}
                className="flex-1 text-center text-xs px-3 py-2 rounded-lg border hover:border-primary-500 hover:text-white transition-all"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                Edit
              </Link>
              <button onClick={() => handleDelete(p.id, p.title_en)} disabled={deleting === p.id}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                {deleting === p.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No projects found.</div>
        )}
      </div>
    </div>
  );
}
