"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/types";

const EMPTY = {
  title_en:"", title_ps:"", title_fa:"",
  slug:"",
  content_en:"", content_ps:"", content_fa:"",
  excerpt_en:"", excerpt_ps:"", excerpt_fa:"",
  metaTitle_en:"", metaTitle_ps:"", metaTitle_fa:"",
  metaDesc_en:"", metaDesc_ps:"", metaDesc_fa:"",
  coverImage:"", coverPublicId:"", featuredVideoUrl:"",
  status:"DRAFT" as "DRAFT"|"PUBLISHED"|"ARCHIVED",
};

function toSlug(s:string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }

export default function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [tab, setTab]       = useState<"en"|"ps"|"fa">("en");
  const [form, setForm]     = useState(post ? {
    title_en:post.title_en, title_ps:post.title_ps, title_fa:post.title_fa,
    slug:post.slug, content_en:post.content_en, content_ps:post.content_ps, content_fa:post.content_fa,
    excerpt_en:post.excerpt_en??"", excerpt_ps:post.excerpt_ps??"", excerpt_fa:post.excerpt_fa??"",
    metaTitle_en:post.metaTitle_en??"", metaTitle_ps:post.metaTitle_ps??"", metaTitle_fa:post.metaTitle_fa??"",
    metaDesc_en:post.metaDesc_en??"", metaDesc_ps:post.metaDesc_ps??"", metaDesc_fa:post.metaDesc_fa??"",
    coverImage:post.coverImage??"", coverPublicId:post.coverPublicId??"", featuredVideoUrl:post.featuredVideoUrl??"",
    status:post.status as "DRAFT"|"PUBLISHED"|"ARCHIVED",
  } : EMPTY);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]             = useState<{type:"success"|"error";text:string}|null>(null);

  async function handleCoverUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "blog");
    const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
    const data = await res.json();
    setUploading(false);
    if (data.success) {
      setForm(p => ({ ...p, coverImage: data.data.url, coverPublicId: data.data.publicId }));
    } else {
      setMsg({ type:"error", text:"Cover image upload failed." });
    }
  }

  function set(k:string,v:string) { setForm(p=>({...p,[k]:v})); }

  async function save() {
    setSaving(true); setMsg(null);
    const isNew = !post;
    // Auto-fill PS/FA fields from EN if left empty (schema requires min(1))
    const payload = {
      ...form,
      title_ps:   form.title_ps   || form.title_en,
      title_fa:   form.title_fa   || form.title_en,
      content_ps: form.content_ps || form.content_en,
      content_fa: form.content_fa || form.content_en,
      coverImage:      form.coverImage      || undefined,
      coverPublicId:   form.coverPublicId   || undefined,
      featuredVideoUrl: form.featuredVideoUrl || undefined,
    };
    const res   = await fetch(isNew?"/api/v1/admin/blog":`/api/v1/admin/blog/${post!.id}`, {
      method:isNew?"POST":"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMsg({type:"success",text:"Saved!"}); if(isNew) router.push("/admin/blog"); }
    else setMsg({type:"error",text:data.error??"Failed."});
  }

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.875rem", padding:"0.65rem 0.875rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };
  const TABS = [{key:"en",label:"English",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {/* Status & Slug row */}
      {/* Status & Slug row */}
      <div className="admin-card" style={{ display:"grid", gridTemplateColumns:"1fr 160px", gap:"1rem", alignItems:"end" }}>
        <div>
          <label style={lbl}>URL Slug *</label>
          <input value={form.slug} onChange={e=>set("slug",toSlug(e.target.value))} placeholder="my-blog-post" style={{ ...inp, fontFamily:"var(--font-fira)" }} />
          <p style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>/blog/{form.slug || "slug"}</p>
        </div>
        <div>
          <label style={lbl}>Status</label>
          <select value={form.status} onChange={e=>set("status",e.target.value)} style={{ ...inp, cursor:"pointer" }}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Featured media */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <label style={lbl}>Featured Image</label>
        {form.coverImage && (
          <div style={{ position:"relative", width:"100%", maxWidth:"320px", borderRadius:"10px", overflow:"hidden", border:"1px solid var(--border)" }}>
            <img src={form.coverImage} alt="Cover" style={{ width:"100%", display:"block" }} />
          </div>
        )}
        <div style={{ display:"flex", gap:"0.75rem", alignItems:"center", flexWrap:"wrap" }}>
          <input type="file" accept="image/*" id="cover-upload" style={{ display:"none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
          <label htmlFor="cover-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>
            {uploading ? "Uploading…" : form.coverImage ? "Replace Image" : "Upload Image"}
          </label>
          {form.coverImage && (
            <button className="btn-danger" style={{ fontSize:"0.8rem" }}
              onClick={() => setForm(p => ({ ...p, coverImage:"", coverPublicId:"" }))}>
              Remove
            </button>
          )}
        </div>

        <div>
          <label style={lbl}>Featured Video URL (optional)</label>
          <input value={form.featuredVideoUrl} onChange={e => set("featuredVideoUrl", e.target.value)}
            placeholder="https://youtube.com/watch?v=... or .mp4 link" style={inp} />
          <p style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>
            Shown on the blog details page. If a Featured Image is also set, the image is used on cards/thumbnails and the video appears in the article.
          </p>
        </div>
      </div>

      {/* Locale tabs */}
      <div style={{ display:"flex", gap:"0.35rem", padding:"0.3rem", borderRadius:"10px", background:"var(--bg-secondary)", width:"fit-content" }}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as "en"|"ps"|"fa")}
            style={{ padding:"0.4rem 0.875rem", borderRadius:"7px", border:"none", fontSize:"0.78rem", fontWeight:600, cursor:"pointer",
              background:tab===t.key?"#4f46e5":"transparent", color:tab===t.key?"#fff":"var(--text-muted)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content per locale */}
      {TABS.filter(t=>t.key===tab).map(({key,dir})=>(
        <div key={key} className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <div>
            <label style={lbl}>Title *</label>
            <input value={(form as Record<string,string>)[`title_${key}`]}
              onChange={e=>{ set(`title_${key}`,e.target.value); if(key==="en"&&!post) set("slug",toSlug(e.target.value)); }}
              style={{ ...inp, fontSize:"1rem", fontWeight:600, direction:dir as "ltr"|"rtl" }} />
          </div>
          <div>
            <label style={lbl}>Content *</label>
            <textarea value={(form as Record<string,string>)[`content_${key}`]}
              onChange={e=>set(`content_${key}`,e.target.value)}
              rows={14} style={{ ...inp, resize:"vertical", direction:dir as "ltr"|"rtl", lineHeight:1.7 }}
              placeholder="Write your article content here. HTML is supported." />
          </div>
          <div>
            <label style={lbl}>Excerpt (summary)</label>
            <textarea value={(form as Record<string,string>)[`excerpt_${key}`]}
              onChange={e=>set(`excerpt_${key}`,e.target.value)}
              rows={2} style={{ ...inp, resize:"vertical", direction:dir as "ltr"|"rtl" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", paddingTop:"0.5rem", borderTop:"1px solid var(--border)" }}>
            <div>
              <label style={lbl}>SEO Meta Title</label>
              <input value={(form as Record<string,string>)[`metaTitle_${key}`]} onChange={e=>set(`metaTitle_${key}`,e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>SEO Meta Description</label>
              <input value={(form as Record<string,string>)[`metaDesc_${key}`]} onChange={e=>set(`metaDesc_${key}`,e.target.value)} style={inp} />
            </div>
          </div>
        </div>
      ))}

      {msg && <div className={msg.type==="success"?"alert-success":"alert-error"}>{msg.type==="success"?"✅":"❌"} {msg.text}</div>}

      <div style={{ display:"flex", gap:"0.75rem", paddingBottom:"2rem" }}>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save Post"}</button>
        <button className="btn-ghost" onClick={()=>router.push("/admin/blog")}>Cancel</button>
      </div>
    </div>
  );
}