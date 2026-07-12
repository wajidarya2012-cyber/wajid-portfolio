"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Experience } from "@/types";

const EMPTY = {
  role_en:"", role_ps:"", role_fa:"",
  organization_en:"", organization_ps:"", organization_fa:"",
  description_en:"", description_ps:"", description_fa:"",
  technologies:[] as string[],
  startDate:"", endDate:"", isCurrent:false, sortOrder:0,
};

export default function ExperienceManager({ initialData }: { initialData: Experience[] }) {
  const router = useRouter();
  const [items, setItems]     = useState<Experience[]>(initialData);
  const [editing, setEditing] = useState<string|"new"|null>(null);
  const [form, setForm]       = useState(EMPTY);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<string|null>(null);
  const [tab, setTab]         = useState<"en"|"ps"|"fa">("en");

  function startNew() {
    setForm({ ...EMPTY, sortOrder: items.length });
    setEditing("new");
    setTab("en");
  }

  function startEdit(item: Experience) {
    setForm({
      role_en: item.role_en, role_ps: item.role_ps, role_fa: item.role_fa,
      organization_en: item.organization_en, organization_ps: item.organization_ps, organization_fa: item.organization_fa,
      description_en: item.description_en, description_ps: item.description_ps, description_fa: item.description_fa,
      technologies: item.technologies,
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0,10) : "",
      endDate:   item.endDate   ? new Date(item.endDate).toISOString().slice(0,10)   : "",
      isCurrent: item.isCurrent,
      sortOrder: item.sortOrder,
    });
    setEditing(item.id);
    setTab("en");
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

  function addTech() {
    const t = techInput.trim();
    if (t && !form.technologies.includes(t)) setForm(p=>({...p,technologies:[...p.technologies,t]}));
    setTechInput("");
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)",
    borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit",
    fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none",
  };

  // FIXED: Added dir:"ltr" to English tab
  const TABS = [{key:"en",label:"English",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {msg && <div className="alert-success">✅ {msg}</div>}

      <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={startNew}>+ Add Experience</button>

      {/* Edit / New form */}
      {editing && (
        <div className="admin-card">
          <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>
            {editing === "new" ? "New Experience" : "Edit Experience"}
          </h3>

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
                  <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" }}>Job Title *</label>
                  <input value={(form as Record<string,unknown>)[`role_${key}`] as string}
                    onChange={e=>setForm(p=>({...p,[`role_${key}`]:e.target.value}))}
                    style={{ ...inp, direction:dir as "rtl"|"ltr"|undefined }} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" }}>Organization *</label>
                  <input value={(form as Record<string,unknown>)[`organization_${key}`] as string}
                    onChange={e=>setForm(p=>({...p,[`organization_${key}`]:e.target.value}))}
                    style={{ ...inp, direction:dir as "rtl"|"ltr"|undefined }} />
                </div>
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" }}>Description *</label>
                <textarea value={(form as Record<string,unknown>)[`description_${key}`] as string}
                  onChange={e=>setForm(p=>({...p,[`description_${key}`]:e.target.value}))}
                  rows={4} style={{ ...inp, resize:"vertical", direction:dir as "rtl"|"ltr"|undefined }} />
              </div>
            </div>
          ))}

          {/* Dates & technologies */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginTop:"0.875rem" }}>
            <div>
              <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" }}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} style={inp} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" }}>End Date</label>
              <input type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} disabled={form.isCurrent} style={{ ...inp, opacity:form.isCurrent?0.5:1 }} />
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:"0.1rem" }}>
              <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.85rem" }}>
                <input type="checkbox" checked={form.isCurrent} onChange={e=>setForm(p=>({...p,isCurrent:e.target.checked,endDate:e.target.checked?"":p.endDate}))} />
                Current Position
              </label>
            </div>
          </div>

          <div style={{ marginTop:"0.875rem" }}>
            <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" }}>Technologies</label>
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

          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.25rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
            <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {items.map(item => (
        <div key={item.id} className="admin-card" style={{ display:"flex", gap:"1rem", alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", flexWrap:"wrap", marginBottom:"0.25rem" }}>
              <p style={{ fontWeight:700 }}>{item.role_en}</p>
              {item.isCurrent && <span className="success-badge">Current</span>}
            </div>
            <p style={{ fontSize:"0.82rem", color:"#818cf8", marginBottom:"0.25rem" }}>{item.organization_en}</p>
            <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>
              {new Date(item.startDate).getFullYear()} — {item.isCurrent ? "Present" : item.endDate ? new Date(item.endDate).getFullYear() : ""}
            </p>
          </div>
          <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
            <button className="btn-ghost" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>startEdit(item)}>Edit</button>
            <button className="btn-danger" style={{ fontSize:"0.78rem", padding:"0.35rem 0.75rem" }} onClick={()=>del(item.id)}>Delete</button>
          </div>
        </div>
      ))}
      {items.length === 0 && !editing && (
        <div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
          No experience entries yet. Click "Add Experience" to get started.
        </div>
      )}
    </div>
  );
}