"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectCategory } from "@/types";

const EMPTY_NEW = { name_en: "", name_ps: "", name_fa: "", slug: "", color: "#4F46E5", icon: "folder" };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProjectCategoriesManager({ categories }: { categories: ProjectCategory[] }) {
  const router = useRouter();
  const [open, setOpen]           = useState(false);
  const [newCat, setNewCat]       = useState(EMPTY_NEW);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal]     = useState<{ name_en: string; name_ps: string; name_fa: string; slug: string; color: string }>({ name_en: "", name_ps: "", name_fa: "", slug: "", color: "#4F46E5" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function addCategory() {
    if (!newCat.name_en || newCat.name_en.length < 2) return;
    setSaving(true);
    setError(null);
    const payload = { ...newCat, slug: newCat.slug || slugify(newCat.name_en) };
    const res = await fetch("/api/v1/admin/project-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.success) { setError(data.error ?? "Failed to add category"); return; }
    setNewCat(EMPTY_NEW);
    router.refresh();
  }

  function startEdit(c: ProjectCategory) {
    setEditingId(c.id);
    setEditVal({ name_en: c.name_en, name_ps: c.name_ps, name_fa: c.name_fa, slug: c.slug, color: c.color });
    setError(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/v1/admin/project-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editVal),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.success) { setError(data.error ?? "Failed to update category"); return; }
    setEditingId(null);
    router.refresh();
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    setDeletingId(id);
    setError(null);
    const res = await fetch(`/api/v1/admin/project-categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    setDeletingId(null);
    if (!data.success) { setError(data.error ?? "Failed to delete category"); return; }
    router.refresh();
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          🗂 Manage Project Categories ({categories.length})
        </span>
        <span style={{ color: "var(--text-muted)" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          {error && (
            <div className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 mb-4">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-2 flex-wrap px-3 py-2 rounded-lg" style={{ border: "1px solid var(--border)" }}>
                {editingId === c.id ? (
                  <>
                    <input value={editVal.name_en} onChange={e => setEditVal(v => ({ ...v, name_en: e.target.value }))} placeholder="Name (EN)" className="input-field" style={{ maxWidth: "140px" }} />
                    <input value={editVal.name_ps} onChange={e => setEditVal(v => ({ ...v, name_ps: e.target.value }))} placeholder="پښتو" className="input-field" style={{ maxWidth: "120px" }} />
                    <input value={editVal.name_fa} onChange={e => setEditVal(v => ({ ...v, name_fa: e.target.value }))} placeholder="دری" className="input-field" style={{ maxWidth: "120px" }} />
                    <input value={editVal.slug} onChange={e => setEditVal(v => ({ ...v, slug: e.target.value }))} placeholder="slug" className="input-field" style={{ maxWidth: "120px" }} />
                    <input type="color" value={editVal.color} onChange={e => setEditVal(v => ({ ...v, color: e.target.value }))} style={{ width: "36px", height: "36px", padding: 0, border: "1px solid var(--border)", borderRadius: "6px", background: "transparent" }} />
                    <button onClick={() => saveEdit(c.id)} disabled={saving} className="btn-primary text-xs" style={{ padding: "0.4rem 0.75rem" }}>Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ width: "14px", height: "14px", borderRadius: "9999px", background: c.color, flexShrink: 0 }} />
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.name_en}</span>
                    <span className="text-xs font-code" style={{ color: "var(--text-muted)" }}>/{c.slug}</span>
                    <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                      {(c as any)._count?.projects ?? ""}
                    </span>
                    <button onClick={() => startEdit(c)} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Edit</button>
                    <button
                      onClick={() => deleteCategory(c.id, c.name_en)}
                      disabled={deletingId === c.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingId === c.id ? "…" : "Delete"}
                    </button>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No categories yet.</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <input value={newCat.name_en} onChange={e => setNewCat(v => ({ ...v, name_en: e.target.value }))} placeholder="Category Name (EN)" className="input-field" style={{ maxWidth: "160px" }} />
            <input value={newCat.name_ps} onChange={e => setNewCat(v => ({ ...v, name_ps: e.target.value }))} placeholder="پښتو" className="input-field" style={{ maxWidth: "120px" }} />
            <input value={newCat.name_fa} onChange={e => setNewCat(v => ({ ...v, name_fa: e.target.value }))} placeholder="دری" className="input-field" style={{ maxWidth: "120px" }} />
            <input value={newCat.slug} onChange={e => setNewCat(v => ({ ...v, slug: e.target.value }))} placeholder="slug (auto if blank)" className="input-field" style={{ maxWidth: "140px" }} />
            <input type="color" value={newCat.color} onChange={e => setNewCat(v => ({ ...v, color: e.target.value }))} style={{ width: "36px", height: "36px", padding: 0, border: "1px solid var(--border)", borderRadius: "6px", background: "transparent" }} />
            <button onClick={addCategory} disabled={saving || !newCat.name_en} className="btn-primary text-xs" style={{ padding: "0.5rem 1rem" }}>
              {saving ? "…" : "+ Add Category"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}