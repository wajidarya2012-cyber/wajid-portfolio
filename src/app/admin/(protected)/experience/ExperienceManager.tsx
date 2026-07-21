"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Experience } from "@/types";

const EMPTY = {
  role_en:"", role_ps:"", role_fa:"",
  organization_en:"", organization_ps:"", organization_fa:"",
  description_en:"", description_ps:"", description_fa:"",
  technologies:[] as string[],
  achievements:[] as string[],
  logoUrl:"", logoPublicId:"",
  employmentType:"",
  featured:false, visible:true,
  startDate:"", endDate:"", isCurrent:false, sortOrder:0,
};

const EMPLOYMENT_TYPES = ["Full-time","Part-time","Contract","Internship","Freelance","Volunteer"];

interface SectionConfig {
  title_en?:string; title_ps?:string; title_fa?:string;
  subtitle_en?:string; subtitle_ps?:string; subtitle_fa?:string;
  description_en?:string; description_ps?:string; description_fa?:string;
  visible?:boolean; order?:number;
  layout?:"timeline"|"cards"|"compact";
  background?:"default"|"transparent"|"gradient"|"image";
  backgroundImage?:string;
}

export default function ExperienceManager({ initialData, initialSectionConfig }: { initialData: Experience[]; initialSectionConfig: SectionConfig }) {
  const router = useRouter();
  const [items, setItems]     = useState<Experience[]>(initialData);
  const [editing, setEditing] = useState<string|"new"|null>(null);
  const [form, setForm]       = useState(EMPTY);
  const [techInput, setTechInput] = useState("");
  const [achInput, setAchInput]   = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<string|null>(null);
  const [tab, setTab]         = useState<"en"|"ps"|"fa">("en");

  const [section, setSection] = useState<SectionConfig>({
    title_en:"", title_ps:"", title_fa:"", subtitle_en:"", subtitle_ps:"", subtitle_fa:"",
    description_en:"", description_ps:"", description_fa:"",
    visible:true, order:2, layout:"timeline", background:"default", backgroundImage:"",
    ...initialSectionConfig,
  });
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionMsg, setSectionMsg] = useState<string|null>(null);
  const [bgUploading, setBgUploading] = useState(false);

  function startNew() {
    setForm({ ...EMPTY, sortOrder: items.length });
    setEditing("new");
    setTab("en");
  }

  function startEdit(item: Experience) {
    const e = item as unknown as Record<string, unknown>;
    setForm({
      role_en: item.role_en, role_ps: item.role_ps, role_fa: item.role_fa,
      organization_en: item.organization_en, organization_ps: item.organization_ps, organization_fa: item.organization_fa,
      description_en: item.description_en, description_ps: item.description_ps, description_fa: item.description_fa,
      technologies: item.technologies,
      achievements: (e.achievements as string[]) ?? [],
      logoUrl: (e.logoUrl as string) ?? "", logoPublicId: (e.logoPublicId as string) ?? "",
      employmentType: (e.employmentType as string) ?? "",
      featured: (e.featured as boolean) ?? false, visible: (e.visible as boolean) ?? true,
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0,10) : "",
      endDate:   item.endDate   ? new Date(item.endDate).toISOString().slice(0,10)   : "",
      isCurrent: item.isCurrent,
      sortOrder: item.sortOrder,
    });
    setEditing(item.id);
    setTab("en");
  }

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "experience-logos");
      const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) setForm(p => ({ ...p, logoUrl: data.data.url, logoPublicId: data.data.publicId }));
      else setMsg("Error: " + (data?.error ?? "Logo upload failed."));
    } catch (err) {
      setMsg("Error: " + (err instanceof Error ? err.message : "Network error."));
    } finally {
      setLogoUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      endDate:   form.endDate   ? new Date(form.endDate).toISOString()   : null,
    };
    const isNew = editing === "new";
    const res  = await fetch(isNew ? "/api/v1/admin/experience" : `/api/v1/admin/experience/${editing}`, {
      method: isNew ? "POST" : "PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMsg("Saved!"); setEditing(null); router.refresh(); }
    else setMsg("Error: " + (data.error ?? "Failed"));
  }

  async function del(id: string) {
    if (!confirm("Delete this experience entry?")) return;
    const res  = await fetch(`/api/v1/admin/experience/${id}`, { method:"DELETE" });
    const data = await res.json();
    if (!data.success) { setMsg("Error: " + (data.error ?? "Failed to delete.")); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    setMsg("Deleted.");
  }

  async function moveItem(id: string, dir: -1 | 1) {
    const sorted = [...items].sort((a,b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(i => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/v1/admin/experience/${a.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...a, startDate:new Date(a.startDate).toISOString(), endDate:a.endDate?new Date(a.endDate).toISOString():null, sortOrder:b.sortOrder }) }),
      fetch(`/api/v1/admin/experience/${b.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...b, startDate:new Date(b.startDate).toISOString(), endDate:b.endDate?new Date(b.endDate).toISOString():null, sortOrder:a.sortOrder }) }),
    ]);
    router.refresh();
  }

  async function toggleFlag(item: Experience, field: "visible"|"featured") {
    const e = item as unknown as Record<string, unknown>;
    const res = await fetch(`/api/v1/admin/experience/${item.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...item, startDate:new Date(item.startDate).toISOString(), endDate:item.endDate?new Date(item.endDate).toISOString():null, [field]: !e[field] }),
    });
    const data = await res.json();
    if (data.success) router.refresh();
  }

  function addTech() {
    const t = techInput.trim();
    if (t && !form.technologies.includes(t)) setForm(p=>({...p,technologies:[...p.technologies,t]}));
    setTechInput("");
  }
  function addAchievement() {
    const a = achInput.trim();
    if (a) setForm(p=>({...p,achievements:[...p.achievements,a]}));
    setAchInput("");
  }

  async function uploadSectionBg(file: File) {
    setBgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "experience-bg");
      const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) setSection(p => ({ ...p, backgroundImage: data.data.url }));
      else setSectionMsg("Error: " + (data?.error ?? "Image upload failed."));
    } catch (err) {
      setSectionMsg("Error: " + (err instanceof Error ? err.message : "Network error."));
    } finally {
      setBgUploading(false);
    }
  }
  async function saveSection() {
    setSectionSaving(true); setSectionMsg(null);
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ experience_section_config: JSON.stringify(section) }) });
    const data = await res.json();
    setSectionSaving(false);
    setSectionMsg(data.success ? "Section settings saved!" : "Error: Failed to save.");
    if (data.success) router.refresh();
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)",
    borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit",
    fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none",
  };
  const inputSm: React.CSSProperties = { ...inp, fontSize:"0.8rem", padding:"0.5rem 0.75rem" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };
  const lblSm: React.CSSProperties = { ...lbl, fontSize:"0.72rem" };

  const TABS = [{key:"en",label:"English",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {msg && <div className="alert-success">✅ {msg}</div>}

      {/* Section Settings */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.25rem" }}>Experience Section — Layout & Content</h3>
        <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginBottom:"1rem" }}>
          Controls the section as a whole. Leave title/subtitle/description empty to use the site defaults.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div><label style={lblSm}>Title (EN)</label><input value={section.title_en} onChange={e=>setSection(p=>({...p,title_en:e.target.value}))} style={inputSm} /></div>
          <div><label style={lblSm}>Title (پښتو)</label><input value={section.title_ps} onChange={e=>setSection(p=>({...p,title_ps:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
          <div><label style={lblSm}>Title (دری)</label><input value={section.title_fa} onChange={e=>setSection(p=>({...p,title_fa:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div><label style={lblSm}>Subtitle (EN)</label><input value={section.subtitle_en} onChange={e=>setSection(p=>({...p,subtitle_en:e.target.value}))} style={inputSm} /></div>
          <div><label style={lblSm}>Subtitle (پښتو)</label><input value={section.subtitle_ps} onChange={e=>setSection(p=>({...p,subtitle_ps:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
          <div><label style={lblSm}>Subtitle (دری)</label><input value={section.subtitle_fa} onChange={e=>setSection(p=>({...p,subtitle_fa:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
          <div><label style={lblSm}>Description (EN)</label><input value={section.description_en} onChange={e=>setSection(p=>({...p,description_en:e.target.value}))} style={inputSm} /></div>
          <div><label style={lblSm}>Description (پښتو)</label><input value={section.description_ps} onChange={e=>setSection(p=>({...p,description_ps:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
          <div><label style={lblSm}>Description (دری)</label><input value={section.description_fa} onChange={e=>setSection(p=>({...p,description_fa:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div>
            <label style={lblSm}>Layout</label>
            <select value={section.layout} onChange={e=>setSection(p=>({...p,layout:e.target.value as SectionConfig["layout"]}))} style={inputSm}>
              <option value="timeline">Timeline (default)</option>
              <option value="cards">Cards</option>
              <option value="compact">Compact List</option>
            </select>
          </div>
          <div>
            <label style={lblSm}>Background</label>
            <select value={section.background} onChange={e=>setSection(p=>({...p,background:e.target.value as SectionConfig["background"]}))} style={inputSm}>
              <option value="default">Default</option>
              <option value="transparent">Transparent</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div>
            <label style={lblSm}>Position on Homepage</label>
            <input type="number" min={0} max={6} value={section.order} onChange={e=>setSection(p=>({...p,order:Number(e.target.value)}))} style={inputSm} />
          </div>
          <div>
            <label style={lblSm}>Visible</label>
            <label style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.8rem", color:"var(--text-secondary)", padding:"0.5rem 0", cursor:"pointer" }}>
              <input type="checkbox" checked={section.visible !== false} onChange={e=>setSection(p=>({...p,visible:e.target.checked}))} /> Show section
            </label>
          </div>
        </div>
        {section.background === "image" && (
          <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem", flexWrap:"wrap" }}>
            <div style={{ width:"96px", height:"54px", borderRadius:"6px", overflow:"hidden", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {section.backgroundImage ? <img src={section.backgroundImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ opacity:0.4 }}>🖼</span>}
            </div>
            <input type="file" accept="image/*" id="exp-bg-upload" style={{ display:"none" }} onChange={e => { const f=e.target.files?.[0]; if (f) uploadSectionBg(f); }} />
            <label htmlFor="exp-bg-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>{bgUploading ? "Uploading…" : "Upload Background"}</label>
          </div>
        )}
        {sectionMsg && <div className={sectionMsg.startsWith("Error")?"alert-error":"alert-success"} style={{ marginBottom:"0.75rem" }}>{sectionMsg}</div>}
        <button className="btn-primary" style={{ fontSize:"0.8rem" }} onClick={saveSection} disabled={sectionSaving || bgUploading}>{sectionSaving?"Saving…":"Save Section Settings"}</button>
      </div>

      <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={startNew}>+ Add Experience</button>

      {/* Edit / New form */}
      {editing && (
        <div className="admin-card">
          <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>
            {editing === "new" ? "New Experience" : "Edit Experience"}
          </h3>

          {/* Logo */}
          <div style={{ marginBottom:"1rem" }}>
            <label style={lbl}>Company Logo (optional)</label>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
              <div style={{ width:"56px", height:"56px", borderRadius:"10px", overflow:"hidden", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {form.logoUrl ? <img src={form.logoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ opacity:0.4 }}>🏢</span>}
              </div>
              <input type="file" accept="image/*" id="exp-logo-upload" style={{ display:"none" }} onChange={e => { const f=e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
              <label htmlFor="exp-logo-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>{logoUploading ? "Uploading…" : form.logoUrl ? "Replace Logo" : "Upload Logo"}</label>
              {form.logoUrl && <button className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={()=>setForm(p=>({...p,logoUrl:"",logoPublicId:""}))}>Remove</button>}
            </div>
          </div>

          {/* Locale tabs */}
          <div style={{ display:"flex", gap:"0.35rem", marginBottom:"1rem", padding:"0.3rem", borderRadius:"10px", background:"var(--bg-secondary)", width:"fit-content" }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding:"0.4rem 0.9rem", borderRadius:"7px", border:"none", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s",
                  background: tab===t.key?"#4f46e5":"transparent", color: tab===t.key?"#fff":"var(--text-muted)" }}>
                {t.label}
              </button>
            ))}
          </div>

          {TABS.filter(t=>t.key===tab).map(({key,dir})=>(
            <div key={key} style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div>
                  <label style={lbl}>Job Title *</label>
                  <input value={(form as Record<string,unknown>)[`role_${key}`] as string}
                    onChange={e=>setForm(p=>({...p,[`role_${key}`]:e.target.value}))}
                    style={{ ...inp, direction:dir as "rtl"|"ltr"|undefined }} />
                </div>
                <div>
                  <label style={lbl}>Organization *</label>
                  <input value={(form as Record<string,unknown>)[`organization_${key}`] as string}
                    onChange={e=>setForm(p=>({...p,[`organization_${key}`]:e.target.value}))}
                    style={{ ...inp, direction:dir as "rtl"|"ltr"|undefined }} />
                </div>
              </div>
              <div>
                <label style={lbl}>Description *</label>
                <textarea value={(form as Record<string,unknown>)[`description_${key}`] as string}
                  onChange={e=>setForm(p=>({...p,[`description_${key}`]:e.target.value}))}
                  rows={4} style={{ ...inp, resize:"vertical", direction:dir as "rtl"|"ltr"|undefined }} />
              </div>
            </div>
          ))}

          {/* Dates, employment type, flags */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"0.75rem", marginTop:"0.875rem" }}>
            <div>
              <label style={lbl}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} style={inp} />
            </div>
            <div>
              <label style={lbl}>End Date</label>
              <input type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} disabled={form.isCurrent} style={{ ...inp, opacity:form.isCurrent?0.5:1 }} />
            </div>
            <div>
              <label style={lbl}>Employment Type</label>
              <select value={form.employmentType} onChange={e=>setForm(p=>({...p,employmentType:e.target.value}))} style={inp}>
                <option value="">—</option>
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:"0.1rem" }}>
              <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.85rem" }}>
                <input type="checkbox" checked={form.isCurrent} onChange={e=>setForm(p=>({...p,isCurrent:e.target.checked,endDate:e.target.checked?"":p.endDate}))} />
                Current Position
              </label>
            </div>
          </div>

          <div style={{ display:"flex", gap:"1.5rem", marginTop:"0.875rem" }}>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.85rem" }}>
              <input type="checkbox" checked={form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} /> Featured
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.85rem" }}>
              <input type="checkbox" checked={form.visible} onChange={e=>setForm(p=>({...p,visible:e.target.checked}))} /> Visible
            </label>
          </div>

          <div style={{ marginTop:"0.875rem" }}>
            <label style={lbl}>Technologies</label>
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.5rem" }}>
              <input value={techInput} onChange={e=>setTechInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTech();}}}
                placeholder="Add technology…" style={{ ...inp, flex:1 }} />
              <button className="btn-ghost" style={{ fontSize:"0.8rem", flexShrink:0 }} onClick={addTech}>Add</button>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
              {form.technologies.map(t=>(
                <span key={t} className="accent-badge" style={{ cursor:"pointer" }}
                  onClick={()=>setForm(p=>({...p,technologies:p.technologies.filter(x=>x!==t)}))}>
                  {t} ✕
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop:"0.875rem" }}>
            <label style={lbl}>Achievements / Responsibilities</label>
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.5rem" }}>
              <input value={achInput} onChange={e=>setAchInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addAchievement();}}}
                placeholder="Add achievement or responsibility…" style={{ ...inp, flex:1 }} />
              <button className="btn-ghost" style={{ fontSize:"0.8rem", flexShrink:0 }} onClick={addAchievement}>Add</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              {form.achievements.map((a,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.8rem", color:"var(--text-secondary)", background:"var(--bg-secondary)", borderRadius:"6px", padding:"0.4rem 0.6rem" }}>
                  <span style={{ flex:1 }}>{a}</span>
                  <button onClick={()=>setForm(p=>({...p,achievements:p.achievements.filter((_,idx)=>idx!==i)}))}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.25rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
            <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {[...items].sort((a,b)=>a.sortOrder-b.sortOrder).map((item, idx, arr) => {
        const e = item as unknown as Record<string, unknown>;
        return (
          <div key={item.id} className="admin-card" style={{ display:"flex", gap:"1rem", alignItems:"flex-start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
              <button onClick={()=>moveItem(item.id,-1)} disabled={idx===0} className="btn-ghost" style={{ padding:"0.15rem 0.4rem", fontSize:"0.7rem", lineHeight:1 }}>▲</button>
              <button onClick={()=>moveItem(item.id,1)} disabled={idx===arr.length-1} className="btn-ghost" style={{ padding:"0.15rem 0.4rem", fontSize:"0.7rem", lineHeight:1 }}>▼</button>
            </div>
            {(e.logoUrl as string) ? (
              <img src={e.logoUrl as string} alt="" style={{ width:"40px", height:"40px", borderRadius:"9px", objectFit:"cover", flexShrink:0, background:"#fff" }} />
            ) : null}
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", flexWrap:"wrap", marginBottom:"0.25rem" }}>
                <p style={{ fontWeight:700 }}>{item.role_en}</p>
                {item.isCurrent && <span className="success-badge">Current</span>}
                {(e.featured as boolean) && <span title="Featured">⭐</span>}
                {!(e.visible as boolean) && <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>(hidden)</span>}
              </div>
              <p style={{ fontSize:"0.82rem", color:"#818cf8", marginBottom:"0.25rem" }}>
                {item.organization_en}{e.employmentType ? ` · ${e.employmentType}` : ""}
              </p>
              <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>
                {new Date(item.startDate).getFullYear()} — {item.isCurrent ? "Present" : item.endDate ? new Date(item.endDate).getFullYear() : ""}
              </p>
            </div>
            <div style={{ display:"flex", gap:"0.5rem", flexShrink:0, flexWrap:"wrap", maxWidth:"220px", justifyContent:"flex-end" }}>
              <button className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.35rem 0.6rem" }} onClick={()=>toggleFlag(item,"featured")}>{(e.featured as boolean)?"Unfeature":"Feature"}</button>
              <button className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.35rem 0.6rem" }} onClick={()=>toggleFlag(item,"visible")}>{(e.visible as boolean)?"Hide":"Show"}</button>
              <button className="btn-ghost" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>startEdit(item)}>Edit</button>
              <button className="btn-danger" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>del(item.id)}>Delete</button>
            </div>
          </div>
        );
      })}
      {items.length === 0 && !editing && (
        <div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
          No experience entries yet. Click &quot;Add Experience&quot; to get started.
        </div>
      )}
    </div>
  );
}
