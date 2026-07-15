"use client";

import { useState, useRef }  from "react";
import { useRouter }         from "next/navigation";
import type { Profile }      from "@/types";

const LOCALES = [
  { key:"en", label:"English",  dir:"ltr" },
  { key:"ps", label:"پښتو",    dir:"rtl" },
  { key:"fa", label:"دری",      dir:"rtl" },
] as const;

type TabKey = "en"|"ps"|"fa";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [tab, setTab]         = useState<TabKey>("en");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{type:"success"|"error"; text:string}|null>(null);
  const [photoPreview, setPhotoPreview] = useState<string|null>(profile?.photoUrl ?? null);
  const [uploading, setUploading]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName_en:  profile?.fullName_en  ?? "Wajid Ali Arya",
    fullName_ps:  profile?.fullName_ps  ?? "واجد علی آریا",
    fullName_fa:  profile?.fullName_fa  ?? "واجد علی آریا",
    title_en:     profile?.title_en     ?? "",
    title_ps:     profile?.title_ps     ?? "",
    title_fa:     profile?.title_fa     ?? "",
    bio_en:       profile?.bio_en       ?? "",
    bio_ps:       profile?.bio_ps       ?? "",
    bio_fa:       profile?.bio_fa       ?? "",
    aboutText_en: profile?.aboutText_en ?? "",
    aboutText_ps: profile?.aboutText_ps ?? "",
    aboutText_fa: profile?.aboutText_fa ?? "",
    email:        profile?.email        ?? "",
    phone:        profile?.phone        ?? "",
    location:     profile?.location     ?? "Jalalabad, Nangarhar, Afghanistan",
    linkedinUrl:  profile?.linkedinUrl  ?? "",
    githubUrl:    profile?.githubUrl    ?? "",
    twitterUrl:   profile?.twitterUrl   ?? "",
    websiteUrl:   profile?.websiteUrl   ?? "",
    photoUrl:     profile?.photoUrl     ?? "",
    photoPublicId:profile?.photoPublicId?? "",
    cvUrl:        profile?.cvUrl        ?? "",
    cvPublicId:   profile?.cvPublicId   ?? "",
    availableText_en: profile?.availableText_en ?? "Available for Opportunities",
    availableText_ps: profile?.availableText_ps ?? "",
    availableText_fa: profile?.availableText_fa ?? "",
    badgeTitle_en: profile?.badgeTitle_en ?? "CS Graduate",
    badgeTitle_ps: profile?.badgeTitle_ps ?? "",
    badgeTitle_fa: profile?.badgeTitle_fa ?? "",
    badgeSub_en:   profile?.badgeSub_en   ?? "IT & Networks",
    badgeSub_ps:   profile?.badgeSub_ps   ?? "",
    badgeSub_fa:   profile?.badgeSub_fa   ?? "",
    yearsExperience: profile?.yearsExperience ?? 8,
    projectsCount:   profile?.projectsCount   ?? 4,
    education_en:      profile?.education_en      ?? "B.Sc. Computer Science — IT & Networks",
    education_ps:      profile?.education_ps      ?? "",
    education_fa:      profile?.education_fa      ?? "",
    specialization_en: profile?.specialization_en ?? "Database Admin · Networking · Software Dev · IT Security",
    specialization_ps: profile?.specialization_ps ?? "",
    specialization_fa: profile?.specialization_fa ?? "",
    languages_en:      profile?.languages_en      ?? "Pashto · Dari · English",
    languages_ps:      profile?.languages_ps      ?? "",
    languages_fa:      profile?.languages_fa      ?? "",
    footerTagline_en: profile?.footerTagline_en ?? "Building technology solutions that create real value — from Jalalabad, Afghanistan to the world.",
    footerTagline_ps: profile?.footerTagline_ps ?? "",
    footerTagline_fa: profile?.footerTagline_fa ?? "",
    certificationsCount: profile?.certificationsCount ?? 4,
    organizationsCount:  profile?.organizationsCount  ?? 10,
    loginBrandName:  profile?.loginBrandName  ?? "W.Arya",
    loginSubtitle:   profile?.loginSubtitle   ?? "Admin Dashboard",
    loginFooterNote: profile?.loginFooterNote ?? "Protected area — authorised personnel only.",
    footerRights_en:    profile?.footerRights_en    ?? "All rights reserved.",
    footerRights_ps:    profile?.footerRights_ps    ?? "",
    footerRights_fa:    profile?.footerRights_fa    ?? "",
    footerBuiltWith_en: profile?.footerBuiltWith_en ?? "Built with Next.js & Tailwind CSS",
    footerBuiltWith_ps: profile?.footerBuiltWith_ps ?? "",
    footerBuiltWith_fa: profile?.footerBuiltWith_fa ?? "",
  });

  const [coreValues, setCoreValues] = useState<{ icon:string; title_en:string; title_ps:string; title_fa:string; desc_en:string; desc_ps:string; desc_fa:string }[]>(
    (profile?.coreValues as { icon:string; title_en:string; title_ps:string; title_fa:string; desc_en:string; desc_ps:string; desc_fa:string }[] | null) ?? [
      { icon:"💡", title_en:"Innovation",     title_ps:"", title_fa:"", desc_en:"Solving complex problems with creative digital solutions", desc_ps:"", desc_fa:"" },
      { icon:"🛡️", title_en:"Reliability",    title_ps:"", title_fa:"", desc_en:"Building systems organizations can depend on",              desc_ps:"", desc_fa:"" },
      { icon:"🤝", title_en:"Collaboration",  title_ps:"", title_fa:"", desc_en:"Working effectively with teams and stakeholders",           desc_ps:"", desc_fa:"" },
      { icon:"📈", title_en:"Growth",         title_ps:"", title_fa:"", desc_en:"Continuously learning and evolving with technology",        desc_ps:"", desc_fa:"" },
    ]
  );

  function setValueField(idx: number, field: string, value: string) {
    setCoreValues(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  }

  function set(key: string, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handlePhotoUpload(file: File) {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "profile");
    const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
    const data = await res.json();
    setUploading(false);
    if (data.success) {
      setPhotoPreview(data.data.url);
      setForm(prev => ({ ...prev, photoUrl: data.data.url, photoPublicId: data.data.publicId }));
    } else {
      setMsg({ type:"error", text:"Photo upload failed." });
    }
  }

  async function handleCvUpload(file: File) {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "cv");
    fd.append("type", "document");
    const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
    const data = await res.json();
    setUploading(false);
    if (data.success) {
      setForm(prev => ({ ...prev, cvUrl: data.data.url, cvPublicId: data.data.publicId }));
      setMsg({ type:"success", text:"CV uploaded successfully." });
    } else {
      setMsg({ type:"error", text:"CV upload failed." });
    }
  }

  async function handleSave() {
    setSaving(true); setMsg(null);
    const res  = await fetch("/api/v1/admin/profile", {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...form, coreValues }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMsg({ type:"success", text:"Profile saved successfully!" });
      router.refresh();
    } else {
      setMsg({ type:"error", text: data.error ?? "Failed to save." });
    }
  }

  const inputStyle: React.CSSProperties = {
    width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)",
    borderRadius:"8px", color:"var(--text-primary)", fontFamily:"inherit",
    fontSize:"0.875rem", padding:"0.7rem 0.875rem", outline:"none",
    transition:"border-color 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    display:"block", fontSize:"0.75rem", fontWeight:600,
    color:"var(--text-secondary)", marginBottom:"0.35rem",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>

      {/* Photo card */}
      <div className="admin-card" style={{ display:"flex", alignItems:"center", gap:"2rem", flexWrap:"wrap" }}>
        {/* Avatar */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:"100px", height:"100px", borderRadius:"50%", padding:"3px", background:G }}>
            <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"var(--bg-secondary)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <span style={{ fontSize:"2.5rem", opacity:0.4 }}>👤</span>
              }
            </div>
          </div>
          {uploading && (
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"0.75rem" }}>
              ...
            </div>
          )}
        </div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontWeight:700, marginBottom:"0.25rem" }}>Profile Photo</h3>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:"0.875rem" }}>
            Upload a professional headshot. Recommended: 400×400px, JPG or PNG.
          </p>
          <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
              onChange={e => { const f=e.target.files?.[0]; if(f) handlePhotoUpload(f); }} />
            <button className="btn-primary" style={{ padding:"0.5rem 1.25rem", fontSize:"0.8rem" }}
              onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : photoPreview ? "Replace Photo" : "Upload Photo"}
            </button>
            {photoPreview && (
              <button className="btn-danger" style={{ padding:"0.5rem 1rem" }}
                onClick={() => { setPhotoPreview(null); setForm(p=>({...p,photoUrl:"",photoPublicId:""})); }}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Language tabs */}
      <div style={{ display:"flex", gap:"0.35rem", padding:"0.35rem", borderRadius:"12px", background:"var(--bg-secondary)", width:"fit-content" }}>
        {LOCALES.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as TabKey)}
            style={{ padding:"0.45rem 1.1rem", borderRadius:"8px", fontSize:"0.82rem", fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.2s",
              background: tab===key ? "#4f46e5" : "transparent",
              color:      tab===key ? "#fff"    : "var(--text-muted)",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Trilingual content */}
      {LOCALES.filter(l => l.key === tab).map(({ key, dir }) => (
        <div key={key} className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"0.25rem" }}>
            Content — {LOCALES.find(l=>l.key===key)?.label}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input value={(form as Record<string,unknown>)[`fullName_${key}`] as string}
                onChange={e => set(`fullName_${key}`, e.target.value)}
                style={{ ...inputStyle, direction: dir }} />
            </div>
            <div>
              <label style={labelStyle}>Professional Title *</label>
              <input value={(form as Record<string,unknown>)[`title_${key}`] as string}
                onChange={e => set(`title_${key}`, e.target.value)}
                style={{ ...inputStyle, direction: dir }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Short Bio (Hero Section) *</label>
            <textarea value={(form as Record<string,unknown>)[`bio_${key}`] as string}
              onChange={e => set(`bio_${key}`, e.target.value)}
              rows={3} style={{ ...inputStyle, resize:"vertical", direction: dir }} />
          </div>
          <div>
            <label style={labelStyle}>About Text (About Section) *</label>
            <textarea value={(form as Record<string,unknown>)[`aboutText_${key}`] as string}
              onChange={e => set(`aboutText_${key}`, e.target.value)}
              rows={5} style={{ ...inputStyle, resize:"vertical", direction: dir }} />
          </div>
        </div>
      ))}

      {/* Contact info */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>Contact Information</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          {[
            { key:"email",    label:"Email *",   type:"email",  ph:"your@email.com" },
            { key:"phone",    label:"Phone",     type:"tel",    ph:"+93 XXX XXX XXXX" },
            { key:"location", label:"Location",  type:"text",   ph:"City, Country" },
          ].map(({ key, label, type, ph }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type={type} value={(form as Record<string,unknown>)[key] as string}
                onChange={e => set(key, e.target.value)}
                placeholder={ph} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Social links */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>Social & Links</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          {[
            { key:"linkedinUrl", label:"LinkedIn URL", ph:"https://linkedin.com/in/..." },
            { key:"githubUrl",   label:"GitHub URL",   ph:"https://github.com/..." },
            { key:"twitterUrl",  label:"Twitter URL",  ph:"https://twitter.com/..." },
            { key:"websiteUrl",  label:"Website URL",  ph:"https://yoursite.com" },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type="url" value={(form as Record<string,unknown>)[key] as string}
                onChange={e => set(key, e.target.value)}
                placeholder={ph} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Hero Badges & Stats */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>Hero Section — Badges & Stats</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
          <div>
            <label style={labelStyle}>Availability Badge Text (EN)</label>
            <input value={form.availableText_en} onChange={e => set("availableText_en", e.target.value)} placeholder="Available for Opportunities" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Profile Badge Title (EN)</label>
            <input value={form.badgeTitle_en} onChange={e => set("badgeTitle_en", e.target.value)} placeholder="CS Graduate" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Profile Badge Subtitle (EN)</label>
            <input value={form.badgeSub_en} onChange={e => set("badgeSub_en", e.target.value)} placeholder="IT & Networks" style={inputStyle} />
          </div>
          <div />
          <div>
            <label style={labelStyle}>Years of Experience</label>
            <input type="number" min={0} value={form.yearsExperience} onChange={e => set("yearsExperience", Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Projects Count</label>
            <input type="number" min={0} value={form.projectsCount} onChange={e => set("projectsCount", Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>About Section — Quick Facts</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
          <div>
            <label style={labelStyle}>Education (EN)</label>
            <input value={form.education_en} onChange={e => set("education_en", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Specialization (EN)</label>
            <input value={form.specialization_en} onChange={e => set("specialization_en", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Languages (EN)</label>
            <input value={form.languages_en} onChange={e => set("languages_en", e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>About Section — Core Values</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {coreValues.map((v, idx) => (
            <div key={idx} style={{ display:"grid", gridTemplateColumns:"60px 1fr 2fr", gap:"0.75rem", alignItems:"start", padding:"0.75rem", background:"var(--bg-secondary)", borderRadius:"8px" }}>
              <input value={v.icon} onChange={e => setValueField(idx, "icon", e.target.value)} style={{ ...inputStyle, textAlign:"center" }} />
              <input value={v.title_en} onChange={e => setValueField(idx, "title_en", e.target.value)} placeholder="Title" style={inputStyle} />
              <input value={v.desc_en} onChange={e => setValueField(idx, "desc_en", e.target.value)} placeholder="Description" style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer & Stats */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>Footer & Stats Section</h3>
        <div style={{ marginBottom:"1rem" }}>
          <label style={labelStyle}>Footer Tagline (EN)</label>
          <textarea value={form.footerTagline_en} onChange={e => set("footerTagline_en", e.target.value)} rows={2} style={{ ...inputStyle, resize:"vertical" }} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <div>
            <label style={labelStyle}>Certifications Count</label>
            <input type="number" min={0} value={form.certificationsCount} onChange={e => set("certificationsCount", Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Organizations Served</label>
            <input type="number" min={0} value={form.organizationsCount} onChange={e => set("organizationsCount", Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>Footer — Copyright Line</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <div>
            <label style={labelStyle}>Rights Text (EN)</label>
            <input value={form.footerRights_en} onChange={e => set("footerRights_en", e.target.value)} placeholder="All rights reserved." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Built With Text (EN)</label>
            <input value={form.footerBuiltWith_en} onChange={e => set("footerBuiltWith_en", e.target.value)} placeholder="Built with Next.js & Tailwind CSS" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Admin Login Branding */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>Admin Login Page Branding</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
          <div>
            <label style={labelStyle}>Brand Name</label>
            <input value={form.loginBrandName} onChange={e => set("loginBrandName", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Subtitle</label>
            <input value={form.loginSubtitle} onChange={e => set("loginSubtitle", e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Footer Note</label>
          <input value={form.loginFooterNote} onChange={e => set("loginFooterNote", e.target.value)} style={inputStyle} />
        </div>
      </div>

      {/* CV Upload */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"0.5rem" }}>Resume / CV</h3>
        <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:"0.875rem" }}>
          Upload your CV as PDF. It will be available as a download link on the portfolio.
        </p>
        {form.cvUrl && (
          <div style={{ marginBottom:"0.75rem", padding:"0.75rem", borderRadius:"8px", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span>✅</span>
            <a href={form.cvUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:"0.8rem", color:"#34d399" }}>
              CV uploaded — click to preview
            </a>
          </div>
        )}
        <input type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }} id="cv-upload"
          onChange={e => { const f=e.target.files?.[0]; if(f) handleCvUpload(f); }} />
        <label htmlFor="cv-upload" className="btn-secondary" style={{ padding:"0.6rem 1.25rem", fontSize:"0.82rem", cursor:"pointer" }}>
          {uploading ? "Uploading…" : form.cvUrl ? "Replace CV" : "Upload CV (PDF)"}
        </label>
      </div>

      {/* Messages */}
      {msg && (
        <div className={msg.type === "success" ? "alert-success" : "alert-error"}>
          {msg.type === "success" ? "✅" : "❌"} {msg.text}
        </div>
      )}

      {/* Save */}
      <div style={{ display:"flex", gap:"0.75rem", paddingBottom:"2rem" }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}