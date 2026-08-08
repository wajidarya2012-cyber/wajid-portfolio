"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Education } from "@/types";
import { reorder } from "@/lib/reorder";

const EMPTY = {
  degree_en:"", degree_ps:"", degree_fa:"",
  institution_en:"", institution_ps:"", institution_fa:"",
  fieldOfStudy_en:"", fieldOfStudy_ps:"", fieldOfStudy_fa:"",
  description_en:"", description_ps:"", description_fa:"",
  location:"", startYear: new Date().getFullYear(), endYear:"" as number|"", gpa:"", icon:"🎓",
  logoUrl:"", logoPublicId:"",
  honors_en:[] as string[], honors_ps:[] as string[], honors_fa:[] as string[],
  courses_en:[] as string[], courses_ps:[] as string[], courses_fa:[] as string[],
  featured:false, visible:true, isCurrent:false,
  sortOrder:0,
};

// Honors/Courses are trilingual string[] fields — index via a typed key instead of
// `as Record<string,string[]>` on the whole (mixed-type) form state (see CLAUDE.md §9).
type LocaleArrayField = "honors" | "courses";
type Locale = "en" | "ps" | "fa";
function localeArrayKey(field: LocaleArrayField, locale: Locale): `${LocaleArrayField}_${Locale}` {
  return `${field}_${locale}`;
}

interface SectionConfig {
  title_en?:string; title_ps?:string; title_fa?:string;
  subtitle_en?:string; subtitle_ps?:string; subtitle_fa?:string;
  description_en?:string; description_ps?:string; description_fa?:string;
  visible?:boolean; order?:number; background?:"default"|"transparent"|"gradient";
}

const TABS = [{key:"en",label:"EN",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

export default function EducationManager({ initialData, initialSectionConfig }: { initialData: Education[]; initialSectionConfig: Record<string, unknown> }) {
  const router = useRouter();
  const [items, setItems]   = useState(initialData);
  const [editing, setEditing] = useState<string|"new"|null>(null);
  const [form, setForm]     = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<string|null>(null);
  const [tab, setTab]       = useState<"en"|"ps"|"fa">("en");
  const [honorInput, setHonorInput]   = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  const [search, setSearch]         = useState("");
  const [listSort, setListSort]     = useState("order");

  const [section, setSection] = useState<SectionConfig>({
    title_en:"", title_ps:"", title_fa:"", subtitle_en:"", subtitle_ps:"", subtitle_fa:"",
    description_en:"", description_ps:"", description_fa:"",
    visible:true, order:3, background:"default",
    ...initialSectionConfig,
  });
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionMsg, setSectionMsg] = useState<string|null>(null);

  function set(k:string, v:unknown) { setForm(p=>({...p,[k]:v})); }

  function addHonor() {
    const h = honorInput.trim();
    if (!h) return;
    const key = tab==="en"?"honors_en":tab==="ps"?"honors_ps":"honors_fa";
    setForm(p=>({...p,[key]:[...p[key],h]}));
    setHonorInput("");
  }
  function addCourse() {
    const c = courseInput.trim();
    if (!c) return;
    const key = tab==="en"?"courses_en":tab==="ps"?"courses_ps":"courses_fa";
    setForm(p=>({...p,[key]:[...p[key],c]}));
    setCourseInput("");
  }

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "education-logos");
      const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) { set("logoUrl", data.data.url); set("logoPublicId", data.data.publicId); }
      else setMsg("Error: " + (data?.error ?? "Logo upload failed."));
    } catch (err) {
      setMsg("Error: " + (err instanceof Error ? err.message : "Network error."));
    } finally {
      setLogoUploading(false);
    }
  }

  async function save() {
    if (!form.degree_en.trim() || !form.institution_en.trim()) {
      setMsg("Degree and Institution (English) are required."); return;
    }
    const startYearNum = Number(form.startYear);
    const endYearNum   = form.isCurrent || form.endYear === "" ? null : Number(form.endYear);
    if (isNaN(startYearNum) || startYearNum < 1950 || startYearNum > 2100) {
      setMsg("Start Year must be between 1950 and 2100."); return;
    }
    if (endYearNum !== null && (isNaN(endYearNum) || endYearNum < 1950 || endYearNum > 2100)) {
      setMsg("End Year must be between 1950 and 2100 (or leave blank)."); return;
    }

    setSaving(true); setMsg(null);
    const payload = {
      ...form,
      degree_ps:      form.degree_ps      || form.degree_en,
      degree_fa:      form.degree_fa      || form.degree_en,
      institution_ps: form.institution_ps || form.institution_en,
      institution_fa: form.institution_fa || form.institution_en,
      startYear: startYearNum,
      endYear:   endYearNum,
    };
    const isNew = editing==="new";
    const res   = await fetch(isNew?"/api/v1/admin/education":`/api/v1/admin/education/${editing}`, {
      method:isNew?"POST":"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMsg("Saved!"); setEditing(null); router.refresh(); }
    else setMsg(data.error ?? "Error saving.");
  }

  async function del(id:string) {
    if (!confirm("Delete?")) return;
    const res  = await fetch(`/api/v1/admin/education/${id}`,{method:"DELETE"});
    const data = await res.json();
    if (!data.success) { setMsg("Error: " + (data.error ?? "Failed to delete.")); return; }
    setItems(p=>p.filter(i=>i.id!==id)); setMsg("Deleted.");
  }

  async function toggleFlag(item: Education, field: "featured"|"visible") {
    const e = item as unknown as Record<string, unknown>;
    const res = await fetch(`/api/v1/admin/education/${item.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        degree_en:item.degree_en, degree_ps:item.degree_ps, degree_fa:item.degree_fa,
        institution_en:item.institution_en, institution_ps:item.institution_ps, institution_fa:item.institution_fa,
        startYear:item.startYear, endYear:item.endYear,
        [field]: !e[field],
      }),
    });
    const data = await res.json();
    if (data.success) router.refresh();
  }

  async function move(id: string, dir: -1|1) {
    const result = reorder(items, "sortOrder", i => i.id === id, dir);
    if (!result) return;
    const prevItems = items;
    setItems(result.list); // optimistic — reflect the new order immediately
    try {
      await Promise.all(result.changed.map(item => fetch(`/api/v1/admin/education/${item.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          degree_en:item.degree_en, degree_ps:item.degree_ps, degree_fa:item.degree_fa,
          institution_en:item.institution_en, institution_ps:item.institution_ps, institution_fa:item.institution_fa,
          startYear:item.startYear, endYear:item.endYear, sortOrder: item.sortOrder,
        }),
      })));
      router.refresh();
    } catch {
      setItems(prevItems);
      setMsg("Error: Failed to reorder.");
    }
  }

  async function saveSection() {
    setSectionSaving(true); setSectionMsg(null);
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ education_section_config: JSON.stringify(section) }) });
    const data = await res.json();
    setSectionSaving(false);
    setSectionMsg(data.success ? "Section settings saved!" : "Error: Failed to save.");
    if (data.success) router.refresh();
  }

  function startEdit(item: Education) {
    const e = item as unknown as Record<string, unknown>;
    setForm({
      degree_en:item.degree_en, degree_ps:item.degree_ps, degree_fa:item.degree_fa,
      institution_en:item.institution_en, institution_ps:item.institution_ps, institution_fa:item.institution_fa,
      fieldOfStudy_en:item.fieldOfStudy_en??"", fieldOfStudy_ps:item.fieldOfStudy_ps??"", fieldOfStudy_fa:item.fieldOfStudy_fa??"",
      description_en:item.description_en??"", description_ps:item.description_ps??"", description_fa:item.description_fa??"",
      location:item.location??"", startYear:item.startYear, endYear:item.endYear??"", gpa:item.gpa??"", icon:item.icon,
      logoUrl:(e.logoUrl as string)??"", logoPublicId:(e.logoPublicId as string)??"",
      honors_en:(e.honors_en as string[])??[], honors_ps:(e.honors_ps as string[])??[], honors_fa:(e.honors_fa as string[])??[],
      courses_en:(e.courses_en as string[])??[], courses_ps:(e.courses_ps as string[])??[], courses_fa:(e.courses_fa as string[])??[],
      featured:(e.featured as boolean)??false, visible:(e.visible as boolean)??true, isCurrent:(e.isCurrent as boolean)??false,
      sortOrder:item.sortOrder,
    });
    setEditing(item.id);
    setTab("en");
  }

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };

  const filteredItems = items.filter(i => {
    const q = search.trim().toLowerCase();
    return !q || i.degree_en.toLowerCase().includes(q) || i.institution_en.toLowerCase().includes(q);
  });
  const displayItems = [...filteredItems].sort((a,b) => {
    const ea = a as unknown as Record<string,unknown>, eb = b as unknown as Record<string,unknown>;
    switch (listSort) {
      case "newest":   return b.startYear - a.startYear;
      case "oldest":   return a.startYear - b.startYear;
      case "featured": return ((eb.featured as boolean)?1:0) - ((ea.featured as boolean)?1:0);
      case "order":
      default:         return a.sortOrder - b.sortOrder;
    }
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {msg && <div className={msg.includes("Saved") || msg.includes("Deleted") ? "alert-success" : "alert-error"}>{msg.includes("Saved") || msg.includes("Deleted") ? "✅" : "❌"} {msg}</div>}

      {/* Section Settings */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.25rem" }}>Education Section — Layout & Content</h3>
        <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginBottom:"1rem" }}>Leave title/subtitle/description empty to use the site defaults.</p>
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
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem", marginBottom:"1rem" }}>
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
              <input type="checkbox" checked={section.visible !== false} onChange={e=>setSection(p=>({...p,visible:e.target.checked}))} /> Show section
            </label>
          </div>
        </div>
        {sectionMsg && <div className={sectionMsg.startsWith("Error")?"alert-error":"alert-success"} style={{ marginBottom:"0.75rem" }}>{sectionMsg}</div>}
        <button className="btn-primary" style={{ fontSize:"0.8rem" }} onClick={saveSection} disabled={sectionSaving}>{sectionSaving?"Saving…":"Save Section Settings"}</button>
      </div>

      <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={()=>{setForm({...EMPTY,sortOrder:items.length?Math.max(...items.map(i=>i.sortOrder))+1:0});setEditing("new");setTab("en");}}>+ Add Education</button>

      {editing && (
        <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <h3 style={{ fontWeight:700 }}>{editing==="new"?"New Education":"Edit Education"}</h3>

          {/* Logo */}
          <div>
            <label style={lbl}>Institution Logo (optional — falls back to the emoji icon below)</label>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
              <div style={{ width:"56px", height:"56px", borderRadius:"10px", overflow:"hidden", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {form.logoUrl ? <img src={form.logoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:"1.5rem" }}>{form.icon}</span>}
              </div>
              <input type="file" accept="image/*" id="edu-logo-upload" style={{ display:"none" }} onChange={e=>{ const f=e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
              <label htmlFor="edu-logo-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>{logoUploading?"Uploading…":form.logoUrl?"Replace Logo":"Upload Logo"}</label>
              {form.logoUrl && <button className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={()=>{set("logoUrl","");set("logoPublicId","");}}>Remove</button>}
            </div>
          </div>

          <div style={{ display:"flex", gap:"0.35rem", padding:"0.3rem", borderRadius:"10px", background:"var(--bg-secondary)", width:"fit-content" }}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)}
                style={{ padding:"0.4rem 0.875rem", borderRadius:"7px", border:"none", fontSize:"0.78rem", fontWeight:600, cursor:"pointer", background:tab===t.key?"#4f46e5":"transparent", color:tab===t.key?"#fff":"var(--text-muted)" }}>
                {t.label}
              </button>
            ))}
          </div>
          {TABS.filter(t=>t.key===tab).map(({key,dir})=>(
            <div key={key} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div><label style={lbl}>Degree *</label><input value={(form as Record<string,unknown>)[`degree_${key}`] as string} onChange={e=>set(`degree_${key}`,e.target.value)} style={{ ...inp, direction:dir as "ltr"|"rtl" }} /></div>
                <div><label style={lbl}>Institution *</label><input value={(form as Record<string,unknown>)[`institution_${key}`] as string} onChange={e=>set(`institution_${key}`,e.target.value)} style={{ ...inp, direction:dir as "ltr"|"rtl" }} /></div>
              </div>
              <div><label style={lbl}>Field of Study</label><input value={(form as Record<string,unknown>)[`fieldOfStudy_${key}`] as string} onChange={e=>set(`fieldOfStudy_${key}`,e.target.value)} style={{ ...inp, direction:dir as "ltr"|"rtl" }} /></div>
              <div><label style={lbl}>Description</label><textarea value={(form as Record<string,unknown>)[`description_${key}`] as string} onChange={e=>set(`description_${key}`,e.target.value)} rows={3} style={{ ...inp, resize:"vertical", direction:dir as "ltr"|"rtl" }} /></div>

              <div>
                <label style={lbl}>Honors / Awards ({key.toUpperCase()})</label>
                <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.5rem" }}>
                  <input value={honorInput} onChange={e=>setHonorInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addHonor();}}} placeholder="Add honor or award…" style={{ ...inp, flex:1, direction:dir as "ltr"|"rtl" }} />
                  <button className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={addHonor}>Add</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                  {form[localeArrayKey("honors",key)].map((h,i)=>(
                    <span key={i} className="tag-badge" style={{ cursor:"pointer" }} onClick={()=>setForm(p=>({...p,[`honors_${key}`]:p[localeArrayKey("honors",key)].filter((_,idx)=>idx!==i)}))}>{h} ✕</span>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>Courses / Specializations ({key.toUpperCase()})</label>
                <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.5rem" }}>
                  <input value={courseInput} onChange={e=>setCourseInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCourse();}}} placeholder="Add course or specialization…" style={{ ...inp, flex:1, direction:dir as "ltr"|"rtl" }} />
                  <button className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={addCourse}>Add</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                  {form[localeArrayKey("courses",key)].map((c,i)=>(
                    <span key={i} className="tag-badge" style={{ cursor:"pointer" }} onClick={()=>setForm(p=>({...p,[`courses_${key}`]:p[localeArrayKey("courses",key)].filter((_,idx)=>idx!==i)}))}>{c} ✕</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 60px", gap:"0.75rem" }}>
            <div><label style={lbl}>Location</label><input value={form.location} onChange={e=>set("location",e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Start Year *</label><input type="number" value={form.startYear} onChange={e=>set("startYear",Number(e.target.value))} style={inp} /></div>
            <div>
              <label style={lbl}>End Year</label>
              <input type="number" value={form.endYear} onChange={e=>set("endYear",e.target.value)} placeholder="Present" disabled={form.isCurrent} style={{ ...inp, opacity:form.isCurrent?0.5:1 }} />
            </div>
            <div><label style={lbl}>Icon</label><input value={form.icon} onChange={e=>set("icon",e.target.value)} style={inp} /></div>
          </div>
          <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap", alignItems:"center" }}>
            <div><label style={lbl}>GPA (optional)</label><input value={form.gpa} onChange={e=>set("gpa",e.target.value)} placeholder="e.g. 3.8/4.0" style={{ ...inp, maxWidth:"200px" }} /></div>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.85rem" }}>
              <input type="checkbox" checked={form.isCurrent} onChange={e=>setForm(p=>({...p,isCurrent:e.target.checked,endYear:e.target.checked?"":p.endYear}))} /> Currently studying here
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.85rem" }}>
              <input type="checkbox" checked={form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} /> Featured
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.85rem" }}>
              <input type="checkbox" checked={form.visible} onChange={e=>setForm(p=>({...p,visible:e.target.checked}))} /> Visible
            </label>
          </div>
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
            <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search, sort */}
      <div className="admin-card" style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search degree or institution…" style={{ ...inp, flex:"1 1 200px", maxWidth:"280px" }} />
        <select value={listSort} onChange={e=>setListSort(e.target.value)} style={{ ...inp, width:"180px" }}>
          <option value="order">Sort: Display Order</option>
          <option value="newest">Sort: Newest Start Year</option>
          <option value="oldest">Sort: Oldest Start Year</option>
          <option value="featured">Sort: Featured First</option>
        </select>
        <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginLeft:"auto" }}>{displayItems.length} of {items.length}</span>
      </div>

      {displayItems.map((item, idx, arr) => {
        const e = item as unknown as Record<string, unknown>;
        return (
          <div key={item.id} className="admin-card" style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
              <button onClick={()=>move(item.id,-1)} disabled={idx===0} className="btn-ghost" style={{ padding:"0.15rem 0.4rem", fontSize:"0.7rem", lineHeight:1 }}>▲</button>
              <button onClick={()=>move(item.id,1)} disabled={idx===arr.length-1} className="btn-ghost" style={{ padding:"0.15rem 0.4rem", fontSize:"0.7rem", lineHeight:1 }}>▼</button>
            </div>
            {(e.logoUrl as string) ? (
              <img src={e.logoUrl as string} alt="" style={{ width:"40px", height:"40px", borderRadius:"9px", objectFit:"cover", flexShrink:0, background:"#fff" }} />
            ) : (
              <span style={{ fontSize:"2rem" }}>{item.icon}</span>
            )}
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexWrap:"wrap" }}>
                <p style={{ fontWeight:700 }}>{item.degree_en}</p>
                {(e.featured as boolean) && <span title="Featured">⭐</span>}
                {!(e.visible as boolean) && <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>(hidden)</span>}
              </div>
              <p style={{ fontSize:"0.82rem", color:"#818cf8" }}>{item.institution_en}</p>
              <p style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{item.startYear}—{(e.isCurrent as boolean) ? "Present" : item.endYear ?? "Present"} {item.location ? `· ${item.location}` : ""}</p>
            </div>
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
              <button className="btn-ghost" style={{ fontSize:"0.72rem", padding:"0.3rem 0.6rem" }} onClick={()=>toggleFlag(item,"featured")}>{(e.featured as boolean)?"Unfeature":"Feature"}</button>
              <button className="btn-ghost" style={{ fontSize:"0.72rem", padding:"0.3rem 0.6rem" }} onClick={()=>toggleFlag(item,"visible")}>{(e.visible as boolean)?"Hide":"Show"}</button>
              <button className="btn-ghost" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>startEdit(item)}>Edit</button>
              <button className="btn-danger" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>del(item.id)}>Delete</button>
            </div>
          </div>
        );
      })}
      {displayItems.length === 0 && items.length > 0 && (
        <div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>No entries match your search.</div>
      )}
      {items.length === 0 && (
        <div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>No education entries yet. Click &quot;Add Education&quot; to get started.</div>
      )}
    </div>
  );
}
