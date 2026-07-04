"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Certification } from "@/types";

const EMPTY = {
  name_en:"", name_ps:"", name_fa:"",
  issuer_en:"", issuer_ps:"", issuer_fa:"",
  description_en:"", description_ps:"", description_fa:"",
  icon:"🏅", year:"" as number|"", credentialUrl:"", sortOrder:0,
};

export default function CertManager({ initialData }: { initialData: Certification[] }) {
  const router = useRouter();
  const [items, setItems]     = useState(initialData);
  const [editing, setEditing] = useState<string|"new"|null>(null);
  const [form, setForm]       = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<string|null>(null);
  const [tab, setTab]         = useState<"en"|"ps"|"fa">("en");

  function set(k:string, v:unknown) { setForm(p=>({...p,[k]:v})); }

  async function save() {
    setSaving(true);
    const payload = { ...form, year: form.year===""?null:Number(form.year) };
    const isNew   = editing==="new";
    const res     = await fetch(isNew?"/api/v1/admin/certifications":`/api/v1/admin/certifications/${editing}`, {
      method:isNew?"POST":"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMsg("Saved successfully!"); setEditing(null); router.refresh(); }
    else setMsg("Error: " + (data.error ?? "Failed to save."));
  }

  async function del(id:string) {
    if (!confirm("Delete this certification?")) return;
    await fetch(`/api/v1/admin/certifications/${id}`,{method:"DELETE"});
    setItems(p=>p.filter(i=>i.id!==id)); setMsg("Deleted.");
  }

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.85rem", padding:"0.6rem 0.75rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };
  const TABS = [{key:"en",label:"English",dir:"ltr"},{key:"ps",label:"پښتو",dir:"rtl"},{key:"fa",label:"دری",dir:"rtl"}] as const;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {msg && <div className="alert-success">✅ {msg}</div>}
      <button className="btn-primary" style={{ alignSelf:"flex-start" }}
        onClick={()=>{ setForm({...EMPTY,sortOrder:items.length}); setEditing("new"); setTab("en"); }}>
        + Add Certification
      </button>

      {editing && (
        <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <h3 style={{ fontWeight:700 }}>{editing==="new"?"New Certification":"Edit Certification"}</h3>

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

          {TABS.filter(t=>t.key===tab).map(({key,dir})=>(
            <div key={key} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div>
                  <label style={lbl}>Certification Name *</label>
                  <input value={(form as Record<string,unknown>)[`name_${key}`] as string}
                    onChange={e=>set(`name_${key}`,e.target.value)}
                    style={{ ...inp, direction:dir as "ltr"|"rtl" }} />
                </div>
                <div>
                  <label style={lbl}>Issuing Organization *</label>
                  <input value={(form as Record<string,unknown>)[`issuer_${key}`] as string}
                    onChange={e=>set(`issuer_${key}`,e.target.value)}
                    style={{ ...inp, direction:dir as "ltr"|"rtl" }} />
                </div>
              </div>
              <div>
                <label style={lbl}>Description</label>
                <textarea value={(form as Record<string,unknown>)[`description_${key}`] as string}
                  onChange={e=>set(`description_${key}`,e.target.value)}
                  rows={2} style={{ ...inp, resize:"vertical", direction:dir as "ltr"|"rtl" }} />
              </div>
            </div>
          ))}

          <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 1fr", gap:"0.75rem" }}>
            <div>
              <label style={lbl}>Icon</label>
              <input value={form.icon} onChange={e=>set("icon",e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Year</label>
              <input type="number" value={form.year} onChange={e=>set("year",e.target.value)} placeholder="2024" style={inp} />
            </div>
            <div>
              <label style={lbl}>Credential URL</label>
              <input type="url" value={form.credentialUrl} onChange={e=>set("credentialUrl",e.target.value)} placeholder="https://..." style={inp} />
            </div>
          </div>

          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
            <button className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Grid of certs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1rem" }}>
        {items.map(item=>(
          <div key={item.id} className="admin-card" style={{ textAlign:"center", position:"relative" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>{item.icon}</div>
            <p style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.25rem" }}>{item.name_en}</p>
            <p style={{ fontSize:"0.78rem", color:"#818cf8", marginBottom:"0.25rem" }}>{item.issuer_en}</p>
            {item.year && <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginBottom:"0.75rem" }}>{item.year}</p>}
            <div style={{ display:"flex", gap:"0.5rem", justifyContent:"center" }}>
              <button className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }}
                onClick={()=>{ setForm({name_en:item.name_en,name_ps:item.name_ps,name_fa:item.name_fa,issuer_en:item.issuer_en,issuer_ps:item.issuer_ps,issuer_fa:item.issuer_fa,description_en:item.description_en??"",description_ps:item.description_ps??"",description_fa:item.description_fa??"",icon:item.icon,year:item.year??"",credentialUrl:item.credentialUrl??"",sortOrder:item.sortOrder}); setEditing(item.id); setTab("en"); }}>
                Edit
              </button>
              <button className="btn-danger" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }} onClick={()=>del(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {items.length===0 && !editing && (
        <div className="admin-card" style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
          No certifications yet. Click "Add Certification" to get started.
        </div>
      )}
    </div>
  );
}
