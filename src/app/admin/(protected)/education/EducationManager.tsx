"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Education } from "@/types";

const EMPTY = {
  degree_en:"", degree_ps:"", degree_fa:"",
  institution_en:"", institution_ps:"", institution_fa:"",
  fieldOfStudy_en:"", fieldOfStudy_ps:"", fieldOfStudy_fa:"",
  description_en:"", description_ps:"", description_fa:"",
  location:"", startYear: new Date().getFullYear(), endYear:"" as number|"", gpa:"", icon:"🎓", sortOrder:0,
};

export default function EducationManager({ initialData }: { initialData: Education[] }) {
  const router = useRouter();
  const [items, setItems]   = useState(initialData);
  const [editing, setEditing] = useState<string|"new"|null>(null);
  const [form, setForm]     = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<string|null>(null);
  const [tab, setTab]       = useState<"en"|"ps"|"fa">("en");

  function set(k:string, v:unknown) { setForm(p=>({...p,[k]:v})); }

  async function save() {
    setSaving(true);
    const payload = { ...form, endYear: form.endYear === "" ? null : Number(form.endYear) };
    const isNew   = editing==="new";
    const res     = await fetch(isNew?"/api/v1/admin/education":`/api/v1/admin/education/${editing}`, {
      method:isNew?"POST":"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMsg("Saved!"); setEditing(null); router.refresh(); }
    else setMsg("Error saving.");
  }

  async function del(id:string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/v1/admin/education/${id}`,{method:"DELETE"});
    setItems(p=>p.filter(i=>i.id!==id)); setMsg("Deleted.");
  }

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };
  const TABS = [{key:"en",label:"EN",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {msg && <div className="alert-success">✅ {msg}</div>}
      <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={()=>{setForm({...EMPTY,sortOrder:items.length});setEditing("new");}}>+ Add Education</button>

      {editing && (
        <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <h3 style={{ fontWeight:700 }}>{editing==="new"?"New Education":"Edit Education"}</h3>
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
            </div>
          ))}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 60px", gap:"0.75rem" }}>
            <div><label style={lbl}>Location</label><input value={form.location} onChange={e=>set("location",e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Start Year *</label><input type="number" value={form.startYear} onChange={e=>set("startYear",Number(e.target.value))} style={inp} /></div>
            <div><label style={lbl}>End Year</label><input type="number" value={form.endYear} onChange={e=>set("endYear",e.target.value)} placeholder="Present" style={inp} /></div>
            <div><label style={lbl}>Icon</label><input value={form.icon} onChange={e=>set("icon",e.target.value)} style={inp} /></div>
          </div>
          <div><label style={lbl}>GPA (optional)</label><input value={form.gpa} onChange={e=>set("gpa",e.target.value)} placeholder="e.g. 3.8/4.0" style={{ ...inp, maxWidth:"200px" }} /></div>
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
            <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {items.map(item=>(
        <div key={item.id} className="admin-card" style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
          <span style={{ fontSize:"2rem" }}>{item.icon}</span>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:700 }}>{item.degree_en}</p>
            <p style={{ fontSize:"0.82rem", color:"#818cf8" }}>{item.institution_en}</p>
            <p style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{item.startYear}—{item.endYear ?? "Present"} {item.location ? `· ${item.location}` : ""}</p>
          </div>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            <button className="btn-ghost" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>{setForm({degree_en:item.degree_en,degree_ps:item.degree_ps,degree_fa:item.degree_fa,institution_en:item.institution_en,institution_ps:item.institution_ps,institution_fa:item.institution_fa,fieldOfStudy_en:item.fieldOfStudy_en??"",fieldOfStudy_ps:item.fieldOfStudy_ps??"",fieldOfStudy_fa:item.fieldOfStudy_fa??"",description_en:item.description_en??"",description_ps:item.description_ps??"",description_fa:item.description_fa??"",location:item.location??"",startYear:item.startYear,endYear:item.endYear??"",gpa:item.gpa??"",icon:item.icon,sortOrder:item.sortOrder});setEditing(item.id);}}>Edit</button>
            <button className="btn-danger" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>del(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
