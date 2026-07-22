"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name_en: string; name_ps: string; name_fa: string;
  description_en?: string | null; description_ps?: string | null; description_fa?: string | null;
  slug: string; color: string; icon: string;
  sortOrder: number; visible: boolean; featured: boolean;
  _count?: { projects: number };
}

const EMPTY = {
  name_en:"", name_ps:"", name_fa:"",
  description_en:"", description_ps:"", description_fa:"",
  slug:"", color:"#4F46E5", icon:"folder", sortOrder:0, visible:true, featured:false,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

const TABS = [{key:"en",label:"English",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

export default function ProjectCategoriesFullManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [cats, setCats]       = useState<Category[]>(initialCategories);
  const [query, setQuery]     = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm]       = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [tab, setTab]         = useState<"en"|"ps"|"fa">("en");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{type:"success"|"error"; text:string} | null>(null);

  // Delete / reassign modal
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignTo, setReassignTo]     = useState("");
  const [deleting, setDeleting]         = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...cats].sort((a,b) => a.sortOrder - b.sortOrder);
    if (!q) return sorted;
    return sorted.filter(c =>
      c.name_en.toLowerCase().includes(q) || c.name_ps.includes(q) || c.name_fa.includes(q) || c.slug.includes(q)
    );
  }, [cats, query]);

  function startNew() {
    setForm({ ...EMPTY, sortOrder: cats.length });
    setSlugTouched(false);
    setEditing("new");
    setTab("en");
    setMsg(null);
  }

  function startEdit(cat: Category) {
    setForm({
      name_en:cat.name_en, name_ps:cat.name_ps, name_fa:cat.name_fa,
      description_en:cat.description_en ?? "", description_ps:cat.description_ps ?? "", description_fa:cat.description_fa ?? "",
      slug:cat.slug, color:cat.color, icon:cat.icon,
      sortOrder:cat.sortOrder, visible:cat.visible, featured:cat.featured,
    });
    setSlugTouched(true);
    setEditing(cat.id);
    setTab("en");
    setMsg(null);
  }

  async function save() {
    setSaving(true); setMsg(null);
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/v1/admin/project-categories" : `/api/v1/admin/project-categories/${editing}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMsg({type:"success",text:"Saved!"}); setEditing(null); router.refresh(); }
    else setMsg({type:"error", text: data.error ?? "Failed to save."});
  }

  async function moveCategory(id: string, dir: -1 | 1) {
    const sorted = [...cats].sort((a,b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(c => c.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/v1/admin/project-categories/${a.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/v1/admin/project-categories/${b.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    router.refresh();
  }

  function requestDelete(cat: Category) {
    setDeleteTarget(cat);
    setReassignTo("");
    setMsg(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const hasProjects = (deleteTarget._count?.projects ?? 0) > 0;
    const res = await fetch(`/api/v1/admin/project-categories/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hasProjects ? { reassignTo } : {}),
    });
    const data = await res.json();
    setDeleting(false);
    if (data.success) {
      setCats(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      setMsg({type:"success", text:"Category deleted."});
      router.refresh();
    } else {
      setMsg({type:"error", text: data.error ?? "Failed to delete."});
    }
  }

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };

  const otherCategories = cats.filter(c => c.id !== deleteTarget?.id);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {msg && <div className={msg.type==="success" ? "alert-success" : "alert-error"}>{msg.type==="success"?"✅":"❌"} {msg.text}</div>}

      <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
        <input
          value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Search categories…"
          style={{ ...inp, maxWidth:"280px" }}
        />
        <button className="btn-primary" onClick={startNew}>+ Add Category</button>
      </div>

      {editing && (
        <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <h3 style={{ fontWeight:700 }}>{editing==="new" ? "New Category" : "Edit Category"}</h3>

          <div style={{ display:"flex", gap:"0.35rem", padding:"0.3rem", borderRadius:"10px", background:"var(--bg-secondary)", width:"fit-content" }}>
            {TABS.map(t => (
              <button key={t.key} type="button" onClick={()=>setTab(t.key)}
                style={{ padding:"0.4rem 0.875rem", borderRadius:"7px", border:"none", fontSize:"0.78rem", fontWeight:600, cursor:"pointer",
                  background: tab===t.key ? "#4f46e5" : "transparent", color: tab===t.key ? "#fff" : "var(--text-muted)" }}>
                {t.label}
              </button>
            ))}
          </div>

          {TABS.filter(t=>t.key===tab).map(({key,dir}) => (
            <div key={key} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div>
                <label style={lbl}>Name ({key}) *</label>
                <input
                  value={(form as Record<string,unknown>)[`name_${key}`] as string}
                  onChange={e => {
                    const value = e.target.value;
                    setForm(p => ({
                      ...p,
                      [`name_${key}`]: value,
                      ...(key === "en" && !slugTouched ? { slug: slugify(value) } : {}),
                    }));
                  }}
                  style={{ ...inp, direction: dir }}
                />
              </div>
              <div>
                <label style={lbl}>Description ({key}) — optional</label>
                <textarea
                  value={(form as Record<string,unknown>)[`description_${key}`] as string}
                  onChange={e => setForm(p => ({ ...p, [`description_${key}`]: e.target.value }))}
                  rows={2} style={{ ...inp, resize:"vertical", direction: dir }}
                />
              </div>
            </div>
          ))}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
            <div>
              <label style={lbl}>Slug *</label>
              <input value={form.slug} onChange={e => { setSlugTouched(true); setForm(p=>({...p, slug: e.target.value})); }} style={inp} />
            </div>
            <div>
              <label style={lbl}>Sort Order</label>
              <input type="number" min={0} value={form.sortOrder} onChange={e=>setForm(p=>({...p,sortOrder:Number(e.target.value)}))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Icon (emoji or icon name)</label>
              <input value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} placeholder="folder" style={inp} />
            </div>
            <div>
              <label style={lbl}>Color</label>
              <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                <input type="color" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} style={{ width:"44px", height:"38px", padding:0, border:"1px solid var(--border)", borderRadius:"6px", background:"none", cursor:"pointer" }} />
                <input value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} style={inp} />
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:"1.5rem" }}>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem", cursor:"pointer" }}>
              <input type="checkbox" checked={form.visible} onChange={e=>setForm(p=>({...p,visible:e.target.checked}))} /> Visible on public site
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem", cursor:"pointer" }}>
              <input type="checkbox" checked={form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} /> Featured
            </label>
          </div>

          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
            <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
        {filtered.map((cat, idx) => (
          <div key={cat.id} className="admin-card" style={{ display:"flex", alignItems:"center", gap:"0.875rem", padding:"0.875rem 1rem" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
              <button onClick={()=>moveCategory(cat.id,-1)} disabled={idx===0} className="btn-ghost" style={{ padding:"0.1rem 0.35rem", fontSize:"0.65rem", lineHeight:1 }}>▲</button>
              <button onClick={()=>moveCategory(cat.id,1)} disabled={idx===filtered.length-1} className="btn-ghost" style={{ padding:"0.1rem 0.35rem", fontSize:"0.65rem", lineHeight:1 }}>▼</button>
            </div>
            <div style={{ width:"36px", height:"36px", borderRadius:"9px", background:cat.color+"22", border:`1px solid ${cat.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
              {cat.icon.length <= 2 ? cat.icon : "📁"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:700, fontSize:"0.9rem", display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
                {cat.name_en}
                {cat.featured && <span title="Featured" style={{ fontSize:"0.7rem" }}>⭐</span>}
                {!cat.visible && <span style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>(hidden)</span>}
              </p>
              <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"monospace" }}>
                /{cat.slug} · {cat._count?.projects ?? 0} project{(cat._count?.projects ?? 0) === 1 ? "" : "s"}
              </p>
            </div>
            <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
              <button className="btn-ghost" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>startEdit(cat)}>Edit</button>
              <button className="btn-danger" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>requestDelete(cat)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-card" style={{ textAlign:"center", padding:"2.5rem", color:"var(--text-muted)" }}>
            {query ? "No categories match your search." : "No categories yet. Click \"Add Category\" to get started."}
          </div>
        )}
      </div>

      {/* Delete / reassign modal */}
      {deleteTarget && (
        <div onClick={()=>setDeleteTarget(null)}
          style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div onClick={e=>e.stopPropagation()} className="admin-card" style={{ maxWidth:"440px", width:"100%", borderLeft:"3px solid #f87171" }}>
            <h3 style={{ fontWeight:700, fontSize:"1rem", marginBottom:"0.75rem" }}>⚠️ Delete &quot;{deleteTarget.name_en}&quot;</h3>
            {(deleteTarget._count?.projects ?? 0) > 0 ? (
              <>
                <p style={{ fontSize:"0.85rem", color:"var(--text-secondary)", marginBottom:"0.875rem" }}>
                  {deleteTarget._count?.projects} project(s) currently use this category. Choose another category to reassign them to before deleting.
                </p>
                <label style={lbl}>Reassign projects to</label>
                <select value={reassignTo} onChange={e=>setReassignTo(e.target.value)} style={{ ...inp, marginBottom:"1.25rem" }}>
                  <option value="">— Select a category —</option>
                  {otherCategories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </>
            ) : (
              <p style={{ fontSize:"0.85rem", color:"var(--text-secondary)", marginBottom:"1.25rem" }}>
                This category has no projects. This action cannot be undone.
              </p>
            )}
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button className="btn-primary"
                style={{ background: (deleteTarget._count?.projects ?? 0) > 0 && !reassignTo ? "var(--border)" : "#dc2626" }}
                disabled={deleting || ((deleteTarget._count?.projects ?? 0) > 0 && !reassignTo)}
                onClick={confirmDelete}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button className="btn-ghost" onClick={()=>setDeleteTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
