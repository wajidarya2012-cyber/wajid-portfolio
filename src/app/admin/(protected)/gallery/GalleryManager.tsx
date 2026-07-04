"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter }   from "next/navigation";
import type { GalleryItem } from "@/types";

const CATEGORIES = ["professional","events","training","achievements","general"];

export default function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const router = useRouter();
  const [items, setItems]       = useState(initialItems);
  const [filter, setFilter]     = useState("all");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]           = useState<string|null>(null);
  const [category, setCategory] = useState("general");
  const [caption, setCaption]   = useState("");

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "gallery");
      const uploadRes  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) continue;
      const saveRes  = await fetch("/api/v1/admin/gallery", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ url:uploadData.data.url, publicId:uploadData.data.publicId, category, caption_en:caption, caption_ps:"", caption_fa:"", sortOrder:items.length }),
      });
      const saveData = await saveRes.json();
      if (saveData.success) setItems(p=>[...p, saveData.data]);
    }
    setUploading(false);
    setCaption("");
    setMsg("Uploaded successfully!");
    router.refresh();
  }, [category, caption, items.length, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept:{"image/*":[".jpg",".jpeg",".png",".webp"]}, maxSize:5*1024*1024,
  });

  async function deleteItem(id: string, publicId: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/v1/admin/gallery/${id}`, { method:"DELETE" });
    if (publicId) await fetch("/api/v1/admin/upload", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ publicId }) });
    setItems(p=>p.filter(i=>i.id!==id));
    setMsg("Deleted.");
  }

  const filtered = filter==="all" ? items : items.filter(i=>i.category===filter);

  const inp: React.CSSProperties = { background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {msg && <div className="alert-success">✅ {msg}</div>}

      {/* Upload zone */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.875rem" }}>Upload Photos</h3>
        <div style={{ display:"flex", gap:"0.75rem", marginBottom:"0.875rem", flexWrap:"wrap" }}>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{ ...inp, flex:1, minWidth:"140px" }}>
            {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption (optional)" style={{ ...inp, flex:2 }} />
        </div>
        <div {...getRootProps()} style={{ border:`2px dashed ${isDragActive?"#4f46e5":"var(--border)"}`, borderRadius:"12px", padding:"2.5rem", textAlign:"center", cursor:"pointer", transition:"all 0.2s", background:isDragActive?"rgba(79,70,229,0.06)":"transparent" }}>
          <input {...getInputProps()} />
          <p style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>🖼</p>
          <p style={{ fontSize:"0.875rem", fontWeight:600, marginBottom:"0.25rem" }}>{isDragActive?"Drop images here":"Drag & drop images"}</p>
          <p style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>or click to select · JPG, PNG, WebP · Max 5MB each</p>
          {uploading && <p style={{ marginTop:"0.75rem", color:"#06b6d4", fontSize:"0.82rem" }}>⏳ Uploading…</p>}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap" }}>
        {["all",...CATEGORIES].map(cat=>(
          <button key={cat} onClick={()=>setFilter(cat)}
            style={{ padding:"0.35rem 0.875rem", borderRadius:"9999px", border:"1px solid", fontSize:"0.78rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s",
              borderColor:filter===cat?"#4f46e5":"var(--border)",
              background:filter===cat?"#4f46e5":"var(--bg-card)",
              color:filter===cat?"#fff":"var(--text-secondary)" }}>
            {cat.charAt(0).toUpperCase()+cat.slice(1)} {cat==="all"?`(${items.length})`:`(${items.filter(i=>i.category===cat).length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"0.875rem" }}>
        {filtered.map(item=>(
          <div key={item.id} style={{ position:"relative", borderRadius:"10px", overflow:"hidden", aspectRatio:"4/3", background:"var(--bg-secondary)", group:"true" }}>
            <img src={item.url} alt={item.caption_en??""} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.65)", opacity:0, transition:"opacity 0.2s", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}
              onMouseEnter={e=>(e.currentTarget.style.opacity="1")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="0")}>
              <span className="accent-badge">{item.category}</span>
              {item.caption_en && <p style={{ fontSize:"0.72rem", color:"white", textAlign:"center", padding:"0 0.5rem" }}>{item.caption_en}</p>}
              <button className="btn-danger" style={{ fontSize:"0.72rem", padding:"0.3rem 0.75rem" }} onClick={()=>deleteItem(item.id, item.publicId)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length===0&&<div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>No photos in this category.</div>}
    </div>
  );
}
