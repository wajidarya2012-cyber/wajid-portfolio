"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reorder } from "@/lib/reorder";

interface GalleryItem {
  id:string; url:string; publicId:string;
  title_en?:string|null; title_ps?:string|null; title_fa?:string|null;
  caption_en?:string|null; caption_ps?:string|null; caption_fa?:string|null;
  altText_en?:string|null; altText_ps?:string|null; altText_fa?:string|null;
  category:string; tags:string[];
  featured:boolean; visible:boolean; showOnHomepage:boolean;
  sortOrder:number; viewCount:number;
}
interface Album { slug:string; name_en:string; name_ps:string; name_fa:string; }
interface SectionConfig {
  title_en?:string; title_ps?:string; title_fa?:string;
  subtitle_en?:string; subtitle_ps?:string; subtitle_fa?:string;
  description_en?:string; description_ps?:string; description_fa?:string;
  visible?:boolean; order?:number; background?:"default"|"transparent"|"gradient";
  seoTitle?:string; seoDescription?:string;
}

const EMPTY_ITEM_EDIT = {
  title_en:"", title_ps:"", title_fa:"",
  caption_en:"", caption_ps:"", caption_fa:"",
  altText_en:"", altText_ps:"", altText_fa:"",
  category:"general", tags:[] as string[],
  featured:false, visible:true, showOnHomepage:true,
};

export default function GalleryManager({
  initialItems, initialAlbums, initialSectionConfig,
}: { initialItems: GalleryItem[]; initialAlbums: Album[]; initialSectionConfig: Record<string, unknown> }) {
  const router = useRouter();
  const [items, setItems]       = useState<GalleryItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState(initialAlbums[0]?.slug ?? "general");
  const [msg, setMsg]           = useState<string|null>(null);

  const [albums, setAlbums]     = useState<Album[]>(initialAlbums.length ? initialAlbums : [
    { slug:"general", name_en:"General", name_ps:"عمومي", name_fa:"عمومی" },
  ]);
  const [albumsSaving, setAlbumsSaving] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ slug:"", name_en:"", name_ps:"", name_fa:"" });

  const [section, setSection] = useState<SectionConfig>({
    title_en:"", title_ps:"", title_fa:"", subtitle_en:"", subtitle_ps:"", subtitle_fa:"",
    description_en:"", description_ps:"", description_fa:"",
    visible:true, order:5.5, background:"default", seoTitle:"", seoDescription:"",
    ...initialSectionConfig,
  });
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionMsg, setSectionMsg] = useState<string|null>(null);

  const [editingId, setEditingId] = useState<string|null>(null);
  const [editForm, setEditForm]   = useState(EMPTY_ITEM_EDIT);
  const [tagInput, setTagInput]   = useState("");

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.82rem", padding:"0.55rem 0.75rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.72rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };

  /* ── Section Settings ── */
  async function saveSection() {
    setSectionSaving(true); setSectionMsg(null);
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ gallery_section_config: JSON.stringify(section) }) });
    const data = await res.json();
    setSectionSaving(false);
    setSectionMsg(data.success ? "Section settings saved!" : "Error: Failed to save.");
    if (data.success) router.refresh();
  }

  /* ── Albums ── */
  function addAlbum() {
    if (!newAlbum.slug || !newAlbum.name_en) return;
    setAlbums(prev => [...prev, { ...newAlbum }]);
    setNewAlbum({ slug:"", name_en:"", name_ps:"", name_fa:"" });
  }
  function removeAlbum(slug: string) {
    if (!confirm(`Remove album "${slug}"? Items already using it will keep their category value.`)) return;
    setAlbums(prev => prev.filter(a => a.slug !== slug));
  }
  async function saveAlbums() {
    setAlbumsSaving(true);
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ gallery_albums: JSON.stringify(albums) }) });
    const data = await res.json();
    setAlbumsSaving(false);
    setMsg(data.success ? "Albums saved!" : "Error: Failed to save albums.");
    if (data.success) router.refresh();
  }

  /* ── Upload ── */
  async function handleUpload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "gallery");
      const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
      const data = await res.json();
      if (data.success) {
        await fetch("/api/v1/admin/gallery", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ url:data.data.url, publicId:data.data.publicId, category:uploadCategory, sortOrder:items.length }),
        });
      }
    }
    setUploading(false);
    router.refresh();
    setMsg("Photos uploaded!");
  }

  /* ── Item CRUD ── */
  function startEdit(item: GalleryItem) {
    setEditingId(item.id);
    setEditForm({
      title_en:item.title_en??"", title_ps:item.title_ps??"", title_fa:item.title_fa??"",
      caption_en:item.caption_en??"", caption_ps:item.caption_ps??"", caption_fa:item.caption_fa??"",
      altText_en:item.altText_en??"", altText_ps:item.altText_ps??"", altText_fa:item.altText_fa??"",
      category:item.category, tags:item.tags,
      featured:item.featured, visible:item.visible, showOnHomepage:item.showOnHomepage,
    });
  }
  async function saveEdit(id: string) {
    const res  = await fetch(`/api/v1/admin/gallery/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(editForm) });
    const data = await res.json();
    if (data.success) { setEditingId(null); router.refresh(); setMsg("Saved!"); }
    else setMsg("Error: " + (data.error ?? "Failed to save."));
  }
  async function del(id: string) {
    if (!confirm("Delete this photo?")) return;
    const res  = await fetch(`/api/v1/admin/gallery/${id}`, { method:"DELETE" });
    const data = await res.json();
    if (!data.success) { setMsg("Error: " + (data.error ?? "Failed to delete.")); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    setMsg("Deleted.");
  }
  async function toggleFlag(item: GalleryItem, field: "featured"|"visible"|"showOnHomepage") {
    const res = await fetch(`/api/v1/admin/gallery/${item.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ [field]: !item[field] }) });
    const data = await res.json();
    if (data.success) router.refresh();
  }
  async function move(id: string, dir: -1|1) {
    const result = reorder(items, "sortOrder", i => i.id === id, dir);
    if (!result) return;
    const prev = items;
    setItems(result.list); // optimistic — reflect the new order immediately
    try {
      await Promise.all(result.changed.map(item => fetch(`/api/v1/admin/gallery/${item.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: item.sortOrder }),
      })));
      router.refresh();
    } catch {
      setItems(prev);
      setMsg("Error: Failed to reorder.");
    }
  }
  function addTag() {
    const t = tagInput.trim();
    if (t && !editForm.tags.includes(t)) setEditForm(p=>({...p,tags:[...p.tags,t]}));
    setTagInput("");
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {msg && <div className="alert-success">✅ {msg}</div>}

      {/* Section Settings */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.25rem" }}>Gallery Section — Layout & Content</h3>
        <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginBottom:"1rem" }}>Controls the homepage preview strip and the full /gallery page.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div><label style={lbl}>Title (EN)</label><input value={section.title_en} onChange={e=>setSection(p=>({...p,title_en:e.target.value}))} style={inp} /></div>
          <div><label style={lbl}>Title (پښتو)</label><input value={section.title_ps} onChange={e=>setSection(p=>({...p,title_ps:e.target.value}))} style={{...inp,direction:"rtl"}} /></div>
          <div><label style={lbl}>Title (دری)</label><input value={section.title_fa} onChange={e=>setSection(p=>({...p,title_fa:e.target.value}))} style={{...inp,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div><label style={lbl}>Subtitle (EN)</label><input value={section.subtitle_en} onChange={e=>setSection(p=>({...p,subtitle_en:e.target.value}))} style={inp} /></div>
          <div><label style={lbl}>Subtitle (پښتو)</label><input value={section.subtitle_ps} onChange={e=>setSection(p=>({...p,subtitle_ps:e.target.value}))} style={{...inp,direction:"rtl"}} /></div>
          <div><label style={lbl}>Subtitle (دری)</label><input value={section.subtitle_fa} onChange={e=>setSection(p=>({...p,subtitle_fa:e.target.value}))} style={{...inp,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
          <div><label style={lbl}>Description (EN)</label><input value={section.description_en} onChange={e=>setSection(p=>({...p,description_en:e.target.value}))} style={inp} /></div>
          <div><label style={lbl}>Description (پښتو)</label><input value={section.description_ps} onChange={e=>setSection(p=>({...p,description_ps:e.target.value}))} style={{...inp,direction:"rtl"}} /></div>
          <div><label style={lbl}>Description (دری)</label><input value={section.description_fa} onChange={e=>setSection(p=>({...p,description_fa:e.target.value}))} style={{...inp,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div>
            <label style={lbl}>Background</label>
            <select value={section.background} onChange={e=>setSection(p=>({...p,background:e.target.value as SectionConfig["background"]}))} style={inp}>
              <option value="default">Default</option>
              <option value="transparent">Transparent</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Position on Homepage</label>
            <input type="number" step="0.1" value={section.order} onChange={e=>setSection(p=>({...p,order:Number(e.target.value)}))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Visible</label>
            <label style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.8rem", color:"var(--text-secondary)", padding:"0.55rem 0", cursor:"pointer" }}>
              <input type="checkbox" checked={section.visible !== false} onChange={e=>setSection(p=>({...p,visible:e.target.checked}))} /> Show on homepage
            </label>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
          <div><label style={lbl}>SEO Title (Gallery page)</label><input value={section.seoTitle} onChange={e=>setSection(p=>({...p,seoTitle:e.target.value}))} style={inp} /></div>
          <div><label style={lbl}>SEO Description</label><input value={section.seoDescription} onChange={e=>setSection(p=>({...p,seoDescription:e.target.value}))} style={inp} /></div>
        </div>
        {sectionMsg && <div className={sectionMsg.startsWith("Error")?"alert-error":"alert-success"} style={{ marginBottom:"0.75rem" }}>{sectionMsg}</div>}
        <button className="btn-primary" style={{ fontSize:"0.8rem" }} onClick={saveSection} disabled={sectionSaving}>{sectionSaving?"Saving…":"Save Section Settings"}</button>
      </div>

      {/* Albums */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.875rem" }}>Albums</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"0.875rem" }}>
          {albums.map(a => (
            <div key={a.slug} style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.5rem 0.75rem", background:"var(--bg-secondary)", borderRadius:"8px" }}>
              <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.72rem", color:"var(--text-muted)", minWidth:"90px" }}>{a.slug}</span>
              <span style={{ fontSize:"0.85rem", flex:1 }}>{a.name_en}</span>
              <button className="btn-danger" style={{ fontSize:"0.7rem", padding:"0.25rem 0.6rem" }} onClick={()=>removeAlbum(a.slug)}>Remove</button>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          <input value={newAlbum.slug} onChange={e=>setNewAlbum(p=>({...p,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")}))} placeholder="slug (e.g. events)" style={{ ...inp, width:"140px" }} />
          <input value={newAlbum.name_en} onChange={e=>setNewAlbum(p=>({...p,name_en:e.target.value}))} placeholder="Name (EN)" style={{ ...inp, flex:1, minWidth:"120px" }} />
          <input value={newAlbum.name_ps} onChange={e=>setNewAlbum(p=>({...p,name_ps:e.target.value}))} placeholder="پښتو" style={{ ...inp, width:"120px", direction:"rtl" }} />
          <input value={newAlbum.name_fa} onChange={e=>setNewAlbum(p=>({...p,name_fa:e.target.value}))} placeholder="دری" style={{ ...inp, width:"120px", direction:"rtl" }} />
          <button className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={addAlbum}>+ Add</button>
        </div>
        <button className="btn-primary" style={{ fontSize:"0.8rem", marginTop:"0.875rem" }} onClick={saveAlbums} disabled={albumsSaving}>{albumsSaving?"Saving…":"Save Albums"}</button>
      </div>

      {/* Upload */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.875rem" }}>Upload Photos</h3>
        <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center" }}>
          <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{ ...inp, width:"180px" }}>
            {albums.map(a => <option key={a.slug} value={a.slug}>{a.name_en}</option>)}
          </select>
          <input type="file" accept="image/*" multiple id="gallery-upload" style={{ display:"none" }}
            onChange={e => { if (e.target.files?.length) handleUpload(e.target.files); }} />
          <label htmlFor="gallery-upload" className="btn-primary" style={{ cursor:"pointer", fontSize:"0.85rem" }}>
            {uploading ? "Uploading…" : "+ Upload Photos"}
          </label>
          <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>You can select multiple files at once.</span>
        </div>
      </div>

      {/* Items grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1rem" }}>
        {[...items].sort((a,b)=>a.sortOrder-b.sortOrder).map((item, idx, arr) => (
          <div key={item.id} className="admin-card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ width:"100%", aspectRatio:"4/3", background:"var(--bg-secondary)", position:"relative" }}>
              <img src={item.url} alt={item.altText_en ?? ""} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", top:"0.4rem", left:"0.4rem", display:"flex", flexDirection:"column", gap:"2px" }}>
                <button onClick={()=>move(item.id,-1)} disabled={idx===0} style={{ background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", borderRadius:"4px", fontSize:"0.65rem", padding:"0.1rem 0.3rem" }}>▲</button>
                <button onClick={()=>move(item.id,1)} disabled={idx===arr.length-1} style={{ background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", borderRadius:"4px", fontSize:"0.65rem", padding:"0.1rem 0.3rem" }}>▼</button>
              </div>
              {item.featured && <span style={{ position:"absolute", top:"0.4rem", right:"0.4rem", fontSize:"0.9rem" }}>⭐</span>}
            </div>
            <div style={{ padding:"0.75rem" }}>
              <p style={{ fontSize:"0.8rem", fontWeight:600, marginBottom:"0.2rem", wordBreak:"break-word" }}>{item.title_en || item.caption_en || "Untitled"}</p>
              <p style={{ fontSize:"0.68rem", color:"var(--text-muted)", marginBottom:"0.6rem" }}>{item.category} · 👁 {item.viewCount}</p>

              {editingId === item.id ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                  <input value={editForm.title_en} onChange={e=>setEditForm(p=>({...p,title_en:e.target.value}))} placeholder="Title (EN)" style={inp} />
                  <input value={editForm.caption_en} onChange={e=>setEditForm(p=>({...p,caption_en:e.target.value}))} placeholder="Caption (EN)" style={inp} />
                  <input value={editForm.altText_en} onChange={e=>setEditForm(p=>({...p,altText_en:e.target.value}))} placeholder="Alt text (EN, accessibility)" style={inp} />
                  <select value={editForm.category} onChange={e=>setEditForm(p=>({...p,category:e.target.value}))} style={inp}>
                    {albums.map(a => <option key={a.slug} value={a.slug}>{a.name_en}</option>)}
                  </select>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTag();}}} placeholder="Add tag…" style={{ ...inp, flex:1 }} />
                    <button className="btn-ghost" style={{ fontSize:"0.75rem" }} onClick={addTag}>Add</button>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem" }}>
                    {editForm.tags.map(t => <span key={t} className="tag-badge" style={{ fontSize:"0.62rem", cursor:"pointer" }} onClick={()=>setEditForm(p=>({...p,tags:p.tags.filter(x=>x!==t)}))}>{t} ✕</span>)}
                  </div>
                  <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                    <label style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.72rem" }}><input type="checkbox" checked={editForm.featured} onChange={e=>setEditForm(p=>({...p,featured:e.target.checked}))} /> Featured</label>
                    <label style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.72rem" }}><input type="checkbox" checked={editForm.visible} onChange={e=>setEditForm(p=>({...p,visible:e.target.checked}))} /> Visible</label>
                    <label style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.72rem" }}><input type="checkbox" checked={editForm.showOnHomepage} onChange={e=>setEditForm(p=>({...p,showOnHomepage:e.target.checked}))} /> Homepage</label>
                  </div>
                  <div style={{ display:"flex", gap:"0.5rem" }}>
                    <button className="btn-primary" style={{ fontSize:"0.75rem" }} onClick={()=>saveEdit(item.id)}>Save</button>
                    <button className="btn-ghost" style={{ fontSize:"0.75rem" }} onClick={()=>setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                  <button className="btn-ghost" style={{ fontSize:"0.7rem", padding:"0.3rem 0.6rem" }} onClick={()=>toggleFlag(item,"featured")}>{item.featured?"Unfeature":"Feature"}</button>
                  <button className="btn-ghost" style={{ fontSize:"0.7rem", padding:"0.3rem 0.6rem" }} onClick={()=>toggleFlag(item,"visible")}>{item.visible?"Hide":"Show"}</button>
                  <button className="btn-ghost" style={{ fontSize:"0.7rem", padding:"0.3rem 0.6rem" }} onClick={()=>toggleFlag(item,"showOnHomepage")}>{item.showOnHomepage?"Homepage:On":"Homepage:Off"}</button>
                  <button className="btn-ghost" style={{ fontSize:"0.7rem", padding:"0.3rem 0.6rem" }} onClick={()=>startEdit(item)}>Edit</button>
                  <button className="btn-danger" style={{ fontSize:"0.7rem", padding:"0.3rem 0.6rem" }} onClick={()=>del(item.id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
          No photos yet. Upload some above to get started.
        </div>
      )}
    </div>
  );
}
