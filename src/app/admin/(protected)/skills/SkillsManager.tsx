"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Skill { id:string; name_en:string; name_ps:string; name_fa:string; percentage:number; sortOrder:number; categoryId:string; }
interface Category { id:string; name_en:string; name_ps:string; name_fa:string; icon:string; sortOrder:number; skills:Skill[]; }

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

export default function SkillsManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [cats, setCats]       = useState<Category[]>(initialCategories);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<string|null>(null);
  const [newCat, setNewCat]   = useState({ name_en:"", name_ps:"", name_fa:"", icon:"💻" });
  const [editCat, setEditCat] = useState<string|null>(null);
  const [newSkill, setNewSkill] = useState<Record<string,{ name_en:string; name_ps:string; name_fa:string; percentage:number }>>({});

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

  async function addSkill(catId: string) {
    const sk = newSkill[catId];
    if (!sk?.name_en) return;
    setSaving(true);
    const res  = await fetch("/api/v1/admin/skills", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...sk, categoryId: catId, sortOrder: cats.find(c=>c.id===catId)?.skills.length ?? 0 }) });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setNewSkill(prev => ({ ...prev, [catId]: { name_en:"", name_ps:"", name_fa:"", percentage:80 } }));
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

  const inputSm: React.CSSProperties = {
    flex:1, background:"var(--bg-secondary)", border:"1px solid var(--border)",
    borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit",
    fontSize:"0.8rem", padding:"0.5rem 0.75rem", outline:"none",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {msg && <div className="alert-success" style={{ marginBottom:"0.5rem" }}>✅ {msg}</div>}

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
      {cats.map(cat => (
        <div key={cat.id} className="admin-card">
          {/* Category header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <span style={{ fontSize:"1.4rem" }}>{cat.icon}</span>
              <div>
                <p style={{ fontWeight:700, fontSize:"0.95rem" }}>{cat.name_en}</p>
                <p style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>{cat.skills.length} skills</p>
              </div>
            </div>
            <button className="btn-danger" style={{ padding:"0.35rem 0.75rem", fontSize:"0.75rem" }} onClick={() => deleteCategory(cat.id)}>
              Delete Category
            </button>
          </div>

          {/* Skills list */}
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"1rem" }}>
            {cat.skills.map(skill => (
              <div key={skill.id} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.6rem 0.75rem", borderRadius:"8px", background:"var(--bg-secondary)" }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:"0.82rem", fontWeight:600 }}>{skill.name_en}</p>
                  <p style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>{skill.name_ps} / {skill.name_fa}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  <div style={{ width:"100px", height:"6px", borderRadius:"3px", background:"var(--border)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:"3px", background:G, width:`${skill.percentage}%` }} />
                  </div>
                  <span style={{ fontSize:"0.75rem", fontFamily:"var(--font-fira)", color:"#06b6d4", minWidth:"32px" }}>{skill.percentage}%</span>
                </div>
                <button onClick={() => deleteSkill(skill.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"1rem", padding:"0.2rem 0.4rem", borderRadius:"4px", transition:"color 0.2s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#f87171")}
                  onMouseLeave={e=>(e.currentTarget.style.color="var(--text-muted)")}>
                  ✕
                </button>
              </div>
            ))}
            {cat.skills.length === 0 && (
              <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", padding:"0.5rem 0" }}>No skills yet.</p>
            )}
          </div>

          {/* Add skill form */}
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:"0.875rem" }}>
            <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--text-muted)", marginBottom:"0.5rem" }}>ADD SKILL</p>
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              <input value={newSkill[cat.id]?.name_en ?? ""} onChange={e => setNewSkill(p=>({...p,[cat.id]:{...p[cat.id]??{name_ps:"",name_fa:"",percentage:80},name_en:e.target.value}}))}
                placeholder="Skill Name (EN)" style={inputSm} />
              <input value={newSkill[cat.id]?.name_ps ?? ""} onChange={e => setNewSkill(p=>({...p,[cat.id]:{...p[cat.id]??{name_en:"",name_fa:"",percentage:80},name_ps:e.target.value}}))}
                placeholder="پښتو" style={{ ...inputSm, direction:"rtl", maxWidth:"120px" }} />
              <input value={newSkill[cat.id]?.name_fa ?? ""} onChange={e => setNewSkill(p=>({...p,[cat.id]:{...p[cat.id]??{name_en:"",name_ps:"",percentage:80},name_fa:e.target.value}}))}
                placeholder="دری" style={{ ...inputSm, direction:"rtl", maxWidth:"120px" }} />
              <input type="number" min={0} max={100} value={newSkill[cat.id]?.percentage ?? 80}
                onChange={e => setNewSkill(p=>({...p,[cat.id]:{...p[cat.id]??{name_en:"",name_ps:"",name_fa:""},percentage:Number(e.target.value)}}))}
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
