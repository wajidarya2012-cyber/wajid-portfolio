"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { JourneySlide } from "@/types";

const EMPTY = {
  title_en:"", title_ps:"", title_fa:"",
  caption_en:"", caption_ps:"", caption_fa:"",
  imageUrl:"", imagePublicId:"", sortOrder:0,
};

const TABS = [{key:"en",label:"English",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

export default function JourneyManager({ initialData }: { initialData: JourneySlide[] }) {
  const router = useRouter();
  const [items, setItems]     = useState(initialData);
  const [editing, setEditing] = useState<string|"new"|null>(null);
  const [form, setForm]       = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]         = useState<string|null>(null);
  const [tab, setTab]         = useState<"en"|"ps"|"fa">("en");
  const fileRef = useRef<HTMLInputElement>(null);

  function set(k:string, v:unknown) { setForm(p=>({...p,[k]:v})); }

  async function handleImageUpload(file: File) {
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "journey");
      const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        set("imageUrl", data.data.url);
        set("imagePublicId", data.data.publicId);
        setMsg(null);
      } else {
        setMsg(`Error: ${data?.error ?? `Upload failed (status ${res.status})`}`);
      }
    } catch (err) {
      setMsg(`Error: ${err instanceof Error ? err.message : "Network error during upload."}`);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.imageUrl) { setMsg("Error: Please upload an image first."); return; }
    setSaving(true);
    const isNew = editing==="new";
    const res   = await fetch(isNew?"/api/v1/admin/journey":`/api/v1/admin/journey/${editing}`, {
      method:isNew?"POST":"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMsg("Saved successfully!"); setEditing(null); router.refresh(); }
    else setMsg("Error: " + (data.error ?? "Failed to save."));
  }

  async function del(id:string, publicId?:string|null) {
    if (!confirm("Delete this journey slide?")) return;
    const res  = await fetch(`/api/v1/admin/journey/${id}`,{method:"DELETE"});
    const data = await res.json();
    if (!data.success) { setMsg("Error: " + (data.error ?? "Failed to delete.")); return; }
    if (publicId) await fetch("/api/v1/admin/upload", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ publicId }) });
    setItems(p=>p.filter(i=>i.id!==id)); setMsg("Deleted.");
  }

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {msg && (
        <div className={msg.startsWith("Error:") ? "alert-error" : "alert-success"}>
          {msg.startsWith("Error:") ? "⚠️ " : "✅ "}{msg}
        </div>
      )}
      <button className="btn-primary" style={{ alignSelf:"flex-start" }}
        onClick={()=>{ setForm({...EMPTY,sortOrder:items.length}); setEditing("new"); setTab("en"); }}>
        + Add Slide
      </button>

      {editing && (
        <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <h3 style={{ fontWeight:700 }}>{editing==="new"?"New Journey Slide":"Edit Journey Slide"}</h3>

          {/* Image upload */}
          <div>
            <label style={lbl}>Slide Image *</label>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
              <div style={{ width:"140px", height:"90px", borderRadius:"8px", overflow:"hidden", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="Preview" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", display:"block" }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  : <span style={{ fontSize:"1.5rem", opacity:0.4 }}>🖼</span>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => { const f=e.target.files?.[0]; if(f) handleImageUpload(f); }} />
              <button type="button" className="btn-secondary" style={{ fontSize:"0.8rem" }}
                onClick={()=>fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : form.imageUrl ? "Replace Image" : "Upload Image"}
              </button>
            </div>
          </div>

          {/* Locale tabs */}
          <div style={{ display:"flex", gap:"0.35rem", padding:"0.3rem", borderRadius:"10px", background:"var(--bg-secondary)", width:"fit-content" }}>
            {TABS.map(t=>(
              <button key={t.key} type="button" onClick={()=>setTab(t.key as "en"|"ps"|"fa")}
                style={{ padding:"0.4rem 0.875rem", borderRadius:"7px", border:"none", fontSize:"0.78rem", fontWeight:600, cursor:"pointer",
                  background:tab===t.key?"#4f46e5":"transparent", color:tab===t.key?"#fff":"var(--text-muted)" }}>
                {t.label}
              </button>
            ))}
          </div>

          {TABS.filter(t=>t.key===tab).map(({key,dir})=>(
            <div key={key} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div>
                <label style={lbl}>Title ({key}) *</label>
                <input value={(form as Record<string,unknown>)[`title_${key}`] as string}
                  onChange={e=>set(`title_${key}`,e.target.value)}
                  style={{ ...inp, direction:dir as "ltr"|"rtl" }} />
              </div>
              <div>
                <label style={lbl}>Caption ({key})</label>
                <textarea value={(form as Record<string,unknown>)[`caption_${key}`] as string}
                  onChange={e=>set(`caption_${key}`,e.target.value)}
                  rows={2} style={{ ...inp, resize:"vertical", direction:dir as "ltr"|"rtl" }} />
              </div>
            </div>
          ))}

          <div style={{ maxWidth:"140px" }}>
            <label style={lbl}>Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={e=>set("sortOrder",Number(e.target.value))} style={inp} />
          </div>

          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving || uploading}>{saving?"Saving…":"Save"}</button>
            <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Grid of slides */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1rem" }}>
        {items.map(item=>(
          <div key={item.id} className="admin-card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ width:"100%", aspectRatio:"16/9", background:"var(--bg-secondary)" }}>
              <img src={item.imageUrl} alt={item.title_en} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", display:"block" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
            </div>
            <div style={{ padding:"0.875rem" }}>
              <p style={{ fontWeight:700, fontSize:"0.85rem", marginBottom:"0.25rem", wordBreak:"break-word" }}>{item.title_en}</p>
              {item.caption_en && <p style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:"0.75rem" }}>{item.caption_en}</p>}
              <div style={{ display:"flex", gap:"0.5rem" }}>
                <button className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }}
                  onClick={()=>{ setForm({
                    title_en:item.title_en, title_ps:item.title_ps, title_fa:item.title_fa,
                    caption_en:item.caption_en??"", caption_ps:item.caption_ps??"", caption_fa:item.caption_fa??"",
                    imageUrl:item.imageUrl, imagePublicId:item.imagePublicId??"", sortOrder:item.sortOrder,
                  }); setEditing(item.id); setTab("en"); }}>
                  Edit
                </button>
                <button className="btn-danger" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }} onClick={()=>del(item.id, item.imagePublicId)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length===0 && !editing && (
        <div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
          No journey slides yet. Click &quot;Add Slide&quot; to get started.
        </div>
      )}
    </div>
  );
}
