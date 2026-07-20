"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Skill { id:string; name_en:string; name_ps:string; name_fa:string; percentage:number; sortOrder:number; categoryId:string; icon?:string|null; visible:boolean; featured:boolean; }
interface Category { id:string; name_en:string; name_ps:string; name_fa:string; icon:string; sortOrder:number; visible:boolean; skills:Skill[]; }
interface SectionConfig {
  title_en?:string; title_ps?:string; title_fa?:string;
  subtitle_en?:string; subtitle_ps?:string; subtitle_fa?:string;
  description_en?:string; description_ps?:string; description_fa?:string;
  visible?:boolean; order?:number;
  layout?:"grid"|"cards"|"compact";
  background?:"default"|"transparent"|"gradient"|"image";
  backgroundImage?:string;
}

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

export default function SkillsManager({ initialCategories, initialSectionConfig }: { initialCategories: Category[]; initialSectionConfig: SectionConfig }) {
  const router = useRouter();
  const [cats, setCats]       = useState<Category[]>(initialCategories);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<string|null>(null);
  const [newCat, setNewCat]   = useState({ name_en:"", name_ps:"", name_fa:"", icon:"💻" });
  const [newSkill, setNewSkill] = useState<Record<string,{ name_en:string; name_ps:string; name_fa:string; percentage:number; icon:string }>>({});

  const [editingCatId, setEditingCatId] = useState<string|null>(null);
  const [catForm, setCatForm] = useState({ name_en:"", name_ps:"", name_fa:"", icon:"", visible:true });

  const [editingSkillId, setEditingSkillId] = useState<string|null>(null);
  const [skillForm, setSkillForm] = useState({ name_en:"", name_ps:"", name_fa:"", percentage:80, icon:"", visible:true, featured:false });

  const [section, setSection] = useState<SectionConfig>({
    title_en:"", title_ps:"", title_fa:"", subtitle_en:"", subtitle_ps:"", subtitle_fa:"",
    description_en:"", description_ps:"", description_fa:"",
    visible:true, order:1, layout:"grid", background:"default", backgroundImage:"",
    ...initialSectionConfig,
  });
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionMsg, setSectionMsg] = useState<string|null>(null);
  const [bgUploading, setBgUploading] = useState(false);

  const inputSm: React.CSSProperties = {
    flex:1, background:"var(--bg-secondary)", border:"1px solid var(--border)",
    borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit",
    fontSize:"0.8rem", padding:"0.5rem 0.75rem", outline:"none",
  };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.72rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };

  /* ── Section config ── */
  async function uploadBgImage(file: File) {
    setBgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "skills-bg");
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
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ skills_section_config: JSON.stringify(section) }) });
    const data = await res.json();
    setSectionSaving(false);
    setSectionMsg(data.success ? "Section settings saved!" : "Error: Failed to save.");
    if (data.success) router.refresh();
  }

  /* ── Categories ── */
  async function addCategory() {
    if (!newCat.name_en) return;
    setSaving(true);
    const res  = await fetch("/api/v1/admin/skills/categories", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...newCat, sortOrder: cats.length }) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setNewCat({ name_en:"", name_ps:"", name_fa:"", icon:"💻" }); router.refresh(); setMsg("Category added!"); }
  }
  async function deleteCategory(id: string) {
    if (!confirm("Delete this category and all its skills?")) return;
    const res  = await fetch(`/api/v1/admin/skills/categories/${id}`, { method:"DELETE" });
    const data = await res.json();
    if (!data.success) { setMsg("Error: " + (data.error ?? "Failed to delete category.")); return; }
    setCats(prev => prev.filter(c => c.id !== id));
    setMsg("Category deleted.");
  }
  function startEditCategory(cat: Category) {
    setEditingCatId(cat.id);
    setCatForm({ name_en:cat.name_en, name_ps:cat.name_ps, name_fa:cat.name_fa, icon:cat.icon, visible:cat.visible });
  }
  async function saveCategory(id: string) {
    setSaving(true);
    const res  = await fetch(`/api/v1/admin/skills/categories/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(catForm) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setEditingCatId(null); router.refresh(); setMsg("Category updated!"); }
    else setMsg("Error: " + (data.error ?? "Failed to update category."));
  }
  async function moveCategory(id: string, dir: -1 | 1) {
    const sorted = [...cats].sort((a,b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(c => c.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/v1/admin/skills/categories/${a.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/v1/admin/skills/categories/${b.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    router.refresh();
  }

  /* ── Skills ── */
  async function addSkill(catId: string) {
    const sk = newSkill[catId];
    if (!sk?.name_en) return;
    setSaving(true);
    const res  = await fetch("/api/v1/admin/skills", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...sk, categoryId: catId, sortOrder: cats.find(c=>c.id===catId)?.skills.length ?? 0 }) });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setNewSkill(prev => ({ ...prev, [catId]: { name_en:"", name_ps:"", name_fa:"", percentage:80, icon:"" } }));
      router.refresh();
      setMsg("Skill added!");
    }
  }
  async function deleteSkill(id: string) {
    const res  = await fetch(`/api/v1/admin/skills/${id}`, { method:"DELETE" });
    const data = await res.json();
    if (!data.success) { setMsg("Error: " + (data.error ?? "Failed to delete skill.")); return; }
    setCats(prev => prev.map(c => ({ ...c, skills: c.skills.filter(s => s.id !== id) })));
    setMsg("Skill deleted.");
  }
  function startEditSkill(skill: Skill) {
    setEditingSkillId(skill.id);
    setSkillForm({ name_en:skill.name_en, name_ps:skill.name_ps, name_fa:skill.name_fa, percentage:skill.percentage, icon:skill.icon ?? "", visible:skill.visible, featured:skill.featured });
  }
  async function saveSkill(id: string) {
    setSaving(true);
    const res  = await fetch(`/api/v1/admin/skills/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(skillForm) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setEditingSkillId(null); router.refresh(); setMsg("Skill updated!"); }
    else setMsg("Error: " + (data.error ?? "Failed to update skill."));
  }
  async function moveSkill(catId: string, id: string, dir: -1 | 1) {
    const cat = cats.find(c => c.id === catId); if (!cat) return;
    const sorted = [...cat.skills].sort((a,b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(s => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/v1/admin/skills/${a.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/v1/admin/skills/${b.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    router.refresh();
  }
  async function toggleSkillFlag(skill: Skill, field: "visible"|"featured") {
    const res = await fetch(`/api/v1/admin/skills/${skill.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ [field]: !skill[field] }) });
    const data = await res.json();
    if (data.success) router.refresh();
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {msg && <div className="alert-success" style={{ marginBottom:"0.5rem" }}>✅ {msg}</div>}

      {/* Section Settings */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.25rem" }}>Skills Section — Layout & Content</h3>
        <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginBottom:"1rem" }}>
          Controls the section as a whole. Leave title/subtitle/description empty to use the site defaults.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div><label style={lbl}>Title (EN)</label><input value={section.title_en} onChange={e=>setSection(p=>({...p,title_en:e.target.value}))} style={inputSm} /></div>
          <div><label style={lbl}>Title (پښتو)</label><input value={section.title_ps} onChange={e=>setSection(p=>({...p,title_ps:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
          <div><label style={lbl}>Title (دری)</label><input value={section.title_fa} onChange={e=>setSection(p=>({...p,title_fa:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div><label style={lbl}>Subtitle (EN)</label><input value={section.subtitle_en} onChange={e=>setSection(p=>({...p,subtitle_en:e.target.value}))} style={inputSm} /></div>
          <div><label style={lbl}>Subtitle (پښتو)</label><input value={section.subtitle_ps} onChange={e=>setSection(p=>({...p,subtitle_ps:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
          <div><label style={lbl}>Subtitle (دری)</label><input value={section.subtitle_fa} onChange={e=>setSection(p=>({...p,subtitle_fa:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
          <div><label style={lbl}>Description (EN)</label><input value={section.description_en} onChange={e=>setSection(p=>({...p,description_en:e.target.value}))} style={inputSm} /></div>
          <div><label style={lbl}>Description (پښتو)</label><input value={section.description_ps} onChange={e=>setSection(p=>({...p,description_ps:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
          <div><label style={lbl}>Description (دری)</label><input value={section.description_fa} onChange={e=>setSection(p=>({...p,description_fa:e.target.value}))} style={{...inputSm,direction:"rtl"}} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"0.75rem" }}>
          <div>
            <label style={lbl}>Layout</label>
            <select value={section.layout} onChange={e=>setSection(p=>({...p,layout:e.target.value as SectionConfig["layout"]}))} style={inputSm}>
              <option value="grid">Grid (default)</option>
              <option value="cards">Cards</option>
              <option value="compact">Compact List</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Background</label>
            <select value={section.background} onChange={e=>setSection(p=>({...p,background:e.target.value as SectionConfig["background"]}))} style={inputSm}>
              <option value="default">Default</option>
              <option value="transparent">Transparent</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Position on Homepage</label>
            <input type="number" min={0} max={6} value={section.order} onChange={e=>setSection(p=>({...p,order:Number(e.target.value)}))} style={inputSm} />
          </div>
          <div>
            <label style={lbl}>Visible</label>
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
            <input type="file" accept="image/*" id="skills-bg-upload" style={{ display:"none" }} onChange={e => { const f=e.target.files?.[0]; if (f) uploadBgImage(f); }} />
            <label htmlFor="skills-bg-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>{bgUploading ? "Uploading…" : "Upload Background"}</label>
          </div>
        )}
        {sectionMsg && <div className={sectionMsg.startsWith("Error")?"alert-error":"alert-success"} style={{ marginBottom:"0.75rem" }}>{sectionMsg}</div>}
        <button className="btn-primary" style={{ fontSize:"0.8rem" }} onClick={saveSection} disabled={sectionSaving || bgUploading}>{sectionSaving?"Saving…":"Save Section Settings"}</button>
      </div>

      {/* Add Category */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.875rem" }}>Add Skill Category</h3>
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          <input value={newCat.icon} onChange={e=>setNewCat(p=>({...p,icon:e.target.value}))} placeholder="Icon 💻" style={{ ...inputSm, flex:"none", width:"64px" }} />
          <input value={newCat.name_en} onChange={e=>setNewCat(p=>({...p,name_en:e.target.value}))} placeholder="Category Name (EN)" style={inputSm} />
          <input value={newCat.name_ps} onChange={e=>setNewCat(p=>({...p,name_ps:e.target.value}))} placeholder="پښتو" style={{ ...inputSm, direction:"rtl" }} />
          <input value={newCat.name_fa} onChange={e=>setNewCat(p=>({...p,name_fa:e.target.value}))} placeholder="دری" style={{ ...inputSm, direction:"rtl" }} />
          <button className="btn-primary" style={{ padding:"0.5rem 1rem", fontSize:"0.8rem", flexShrink:0 }} onClick={addCategory} disabled={saving}>
            + Add Category
          </button>
        </div>
      </div>

      {/* Categories & Skills */}
      {[...cats].sort((a,b)=>a.sortOrder-b.sortOrder).map((cat, catIdx) => (
        <div key={cat.id} className="admin-card">
          {/* Category header */}
          {editingCatId === cat.id ? (
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", alignItems:"center", marginBottom:"1rem", padding:"0.75rem", background:"var(--bg-secondary)", borderRadius:"8px" }}>
              <input value={catForm.icon} onChange={e=>setCatForm(p=>({...p,icon:e.target.value}))} style={{ ...inputSm, flex:"none", width:"56px" }} />
              <input value={catForm.name_en} onChange={e=>setCatForm(p=>({...p,name_en:e.target.value}))} placeholder="EN" style={inputSm} />
              <input value={catForm.name_ps} onChange={e=>setCatForm(p=>({...p,name_ps:e.target.value}))} placeholder="پښتو" style={{...inputSm,direction:"rtl"}} />
              <input value={catForm.name_fa} onChange={e=>setCatForm(p=>({...p,name_fa:e.target.value}))} placeholder="دری" style={{...inputSm,direction:"rtl"}} />
              <label style={{ display:"flex", alignItems:"center", gap:"0.35rem", fontSize:"0.78rem", whiteSpace:"nowrap" }}>
                <input type="checkbox" checked={catForm.visible} onChange={e=>setCatForm(p=>({...p,visible:e.target.checked}))} /> Visible
              </label>
              <button className="btn-primary" style={{ fontSize:"0.75rem", padding:"0.4rem 0.75rem" }} onClick={()=>saveCategory(cat.id)} disabled={saving}>Save</button>
              <button className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.4rem 0.75rem" }} onClick={()=>setEditingCatId(null)}>Cancel</button>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", flexWrap:"wrap", gap:"0.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
                  <button onClick={()=>moveCategory(cat.id,-1)} disabled={catIdx===0} className="btn-ghost" style={{ padding:"0.1rem 0.35rem", fontSize:"0.65rem", lineHeight:1 }}>▲</button>
                  <button onClick={()=>moveCategory(cat.id,1)} disabled={catIdx===cats.length-1} className="btn-ghost" style={{ padding:"0.1rem 0.35rem", fontSize:"0.65rem", lineHeight:1 }}>▼</button>
                </div>
                <span style={{ fontSize:"1.4rem" }}>{cat.icon}</span>
                <div>
                  <p style={{ fontWeight:700, fontSize:"0.95rem" }}>{cat.name_en} {!cat.visible && <span style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>(hidden)</span>}</p>
                  <p style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>{cat.skills.length} skills</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                <button className="btn-ghost" style={{ padding:"0.35rem 0.75rem", fontSize:"0.75rem" }} onClick={()=>startEditCategory(cat)}>Edit</button>
                <button className="btn-danger" style={{ padding:"0.35rem 0.75rem", fontSize:"0.75rem" }} onClick={() => deleteCategory(cat.id)}>Delete</button>
              </div>
            </div>
          )}

          {/* Skills list */}
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"1rem" }}>
            {[...cat.skills].sort((a,b)=>a.sortOrder-b.sortOrder).map((skill, sIdx, arr) => (
              editingSkillId === skill.id ? (
                <div key={skill.id} style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", alignItems:"center", padding:"0.6rem 0.75rem", borderRadius:"8px", background:"var(--bg-secondary)" }}>
                  <input value={skillForm.icon} onChange={e=>setSkillForm(p=>({...p,icon:e.target.value}))} placeholder="🔧" style={{ ...inputSm, flex:"none", width:"48px" }} />
                  <input value={skillForm.name_en} onChange={e=>setSkillForm(p=>({...p,name_en:e.target.value}))} placeholder="EN" style={inputSm} />
                  <input value={skillForm.name_ps} onChange={e=>setSkillForm(p=>({...p,name_ps:e.target.value}))} placeholder="پښتو" style={{...inputSm,direction:"rtl",maxWidth:"110px"}} />
                  <input value={skillForm.name_fa} onChange={e=>setSkillForm(p=>({...p,name_fa:e.target.value}))} placeholder="دری" style={{...inputSm,direction:"rtl",maxWidth:"110px"}} />
                  <input type="number" min={0} max={100} value={skillForm.percentage} onChange={e=>setSkillForm(p=>({...p,percentage:Number(e.target.value)}))} style={{ ...inputSm, width:"64px", flex:"none" }} />
                  <label style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem", whiteSpace:"nowrap" }}>
                    <input type="checkbox" checked={skillForm.visible} onChange={e=>setSkillForm(p=>({...p,visible:e.target.checked}))} /> Visible
                  </label>
                  <label style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem", whiteSpace:"nowrap" }}>
                    <input type="checkbox" checked={skillForm.featured} onChange={e=>setSkillForm(p=>({...p,featured:e.target.checked}))} /> Featured
                  </label>
                  <button className="btn-primary" style={{ fontSize:"0.72rem", padding:"0.35rem 0.65rem" }} onClick={()=>saveSkill(skill.id)} disabled={saving}>Save</button>
                  <button className="btn-ghost" style={{ fontSize:"0.72rem", padding:"0.35rem 0.65rem" }} onClick={()=>setEditingSkillId(null)}>Cancel</button>
                </div>
              ) : (
                <div key={skill.id} style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.6rem 0.75rem", borderRadius:"8px", background:"var(--bg-secondary)" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
                    <button onClick={()=>moveSkill(cat.id,skill.id,-1)} disabled={sIdx===0} className="btn-ghost" style={{ padding:"0.05rem 0.3rem", fontSize:"0.6rem", lineHeight:1 }}>▲</button>
                    <button onClick={()=>moveSkill(cat.id,skill.id,1)} disabled={sIdx===arr.length-1} className="btn-ghost" style={{ padding:"0.05rem 0.3rem", fontSize:"0.6rem", lineHeight:1 }}>▼</button>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"0.82rem", fontWeight:600, display:"flex", alignItems:"center", gap:"0.35rem" }}>
                      {skill.icon && <span>{skill.icon}</span>} {skill.name_en}
                      {skill.featured && <span title="Featured" style={{ fontSize:"0.7rem" }}>⭐</span>}
                      {!skill.visible && <span style={{ fontSize:"0.65rem", color:"var(--text-muted)" }}>(hidden)</span>}
                    </p>
                    <p style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>{skill.name_ps} / {skill.name_fa}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <div style={{ width:"90px", height:"6px", borderRadius:"3px", background:"var(--border)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:"3px", background:G, width:`${skill.percentage}%` }} />
                    </div>
                    <span style={{ fontSize:"0.75rem", fontFamily:"var(--font-fira)", color:"#06b6d4", minWidth:"32px" }}>{skill.percentage}%</span>
                  </div>
                  <button className="btn-ghost" style={{ fontSize:"0.7rem", padding:"0.25rem 0.5rem" }} onClick={()=>toggleSkillFlag(skill,"featured")}>{skill.featured?"Unfeature":"Feature"}</button>
                  <button className="btn-ghost" style={{ fontSize:"0.7rem", padding:"0.25rem 0.5rem" }} onClick={()=>toggleSkillFlag(skill,"visible")}>{skill.visible?"Hide":"Show"}</button>
                  <button className="btn-ghost" style={{ fontSize:"0.7rem", padding:"0.25rem 0.5rem" }} onClick={()=>startEditSkill(skill)}>Edit</button>
                  <button onClick={() => deleteSkill(skill.id)}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"1rem", padding:"0.2rem 0.4rem", borderRadius:"4px", transition:"color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color="#f87171")}
                    onMouseLeave={e=>(e.currentTarget.style.color="var(--text-muted)")}>
                    ✕
                  </button>
                </div>
              )
            ))}
            {cat.skills.length === 0 && (
              <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", padding:"0.5rem 0" }}>No skills yet.</p>
            )}
          </div>

          {/* Add skill form */}
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:"0.875rem" }}>
            <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--text-muted)", marginBottom:"0.5rem" }}>ADD SKILL</p>
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              <input value={newSkill[cat.id]?.icon ?? ""} onChange={e => setNewSkill(p=>({...p,[cat.id]:{...(p[cat.id]??{name_en:"",name_ps:"",name_fa:"",percentage:80,icon:""}),icon:e.target.value}}))}
                placeholder="🔧" style={{ ...inputSm, flex:"none", width:"48px" }} />
              <input value={newSkill[cat.id]?.name_en ?? ""} onChange={e => setNewSkill(p=>({...p,[cat.id]:{...(p[cat.id]??{name_ps:"",name_fa:"",percentage:80,icon:""}),name_en:e.target.value}}))}
                placeholder="Skill Name (EN)" style={inputSm} />
              <input value={newSkill[cat.id]?.name_ps ?? ""} onChange={e => setNewSkill(p=>({...p,[cat.id]:{...(p[cat.id]??{name_en:"",name_fa:"",percentage:80,icon:""}),name_ps:e.target.value}}))}
                placeholder="پښتو" style={{ ...inputSm, direction:"rtl", maxWidth:"120px" }} />
              <input value={newSkill[cat.id]?.name_fa ?? ""} onChange={e => setNewSkill(p=>({...p,[cat.id]:{...(p[cat.id]??{name_en:"",name_ps:"",percentage:80,icon:""}),name_fa:e.target.value}}))}
                placeholder="دری" style={{ ...inputSm, direction:"rtl", maxWidth:"120px" }} />
              <input type="number" min={0} max={100} value={newSkill[cat.id]?.percentage ?? 80}
                onChange={e => setNewSkill(p=>({...p,[cat.id]:{...(p[cat.id]??{name_en:"",name_ps:"",name_fa:"",icon:""}),percentage:Number(e.target.value)}}))}
                style={{ ...inputSm, width:"70px", flex:"none" }} />
              <button className="btn-ghost" style={{ fontSize:"0.8rem", flexShrink:0 }} onClick={() => addSkill(cat.id)} disabled={saving}>
                + Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
