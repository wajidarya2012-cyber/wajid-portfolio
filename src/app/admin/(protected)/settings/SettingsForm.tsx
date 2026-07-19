"use client";
import { useState, useRef }  from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";

export default function SettingsForm({ settingsMap, profile }: { settingsMap: Record<string,string>; profile: Profile|null }) {
  const router = useRouter();
  const [seo, setSeo]   = useState({
    seo_default_title:       settingsMap["seo_default_title"]       ?? "Wajid Ali Arya | IT Manager & Software Developer",
    seo_default_description: settingsMap["seo_default_description"] ?? "Technology Consultant based in Jalalabad, Afghanistan",
  });
  const [brand, setBrand] = useState({
    brand_name:    settingsMap["brand_name"]    ?? "W.Arya",
    brand_tagline: settingsMap["brand_tagline"] ?? "IT Manager & Developer",
  });
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandMsg, setBrandMsg] = useState<{type:"success"|"error";text:string}|null>(null);
  const [pwd, setPwd]   = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [emailForm, setEmailForm] = useState({ currentPassword:"", newEmail:"" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]   = useState<{type:"success"|"error";text:string}|null>(null);
  const [pwdMsg, setPwdMsg] = useState<{type:"success"|"error";text:string}|null>(null);
  const [emailMsg, setEmailMsg] = useState<{type:"success"|"error";text:string}|null>(null);

  const [backupDownloading, setBackupDownloading] = useState(false);
  const [restoring, setRestoring]   = useState(false);
  const [backupMsg, setBackupMsg]   = useState<{type:"success"|"error";text:string}|null>(null);
  const [pendingFile, setPendingFile] = useState<File|null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.875rem", padding:"0.7rem 0.875rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };

  async function saveSeo() {
    setSaving(true); setMsg(null);
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(seo) });
    const data = await res.json();
    setSaving(false);
    setMsg(data.success ? {type:"success",text:"SEO settings saved!"} : {type:"error",text:"Failed to save."});
  }
  async function saveBrand() {
    setBrandSaving(true); setBrandMsg(null);
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(brand) });
    const data = await res.json();
    setBrandSaving(false);
    setBrandMsg(data.success ? {type:"success",text:"Branding saved! Refresh the public site to see it."} : {type:"error",text:"Failed to save."});
    if (data.success) router.refresh();
  }
  async function changeEmail() {
    if (!emailForm.newEmail || !emailForm.currentPassword) { setEmailMsg({type:"error",text:"Both fields are required."}); return; }
    setEmailMsg(null);
    const res  = await fetch("/api/v1/admin/settings/email", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(emailForm) });
    const data = await res.json();
    if (data.success) { setEmailMsg({type:"success",text:"Login email updated! Use it next time you sign in."}); setEmailForm({currentPassword:"",newEmail:""}); }
    else setEmailMsg({type:"error",text:data.error??"Failed."});
  }

  async function changePassword() {
    if (pwd.newPassword !== pwd.confirmPassword) { setPwdMsg({type:"error",text:"Passwords do not match."}); return; }
    if (pwd.newPassword.length < 8) { setPwdMsg({type:"error",text:"New password must be at least 8 characters."}); return; }
    setPwdMsg(null);
    const res  = await fetch("/api/v1/admin/settings/password", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(pwd) });
    const data = await res.json();
    if (data.success) { setPwdMsg({type:"success",text:"Password changed successfully!"}); setPwd({currentPassword:"",newPassword:"",confirmPassword:""}); }
    else setPwdMsg({type:"error",text:data.error??"Failed."});
  }

  async function downloadBackup() {
    setBackupDownloading(true); setBackupMsg(null);
    try {
      const res = await fetch("/api/v1/admin/backup");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBackupMsg({ type:"error", text: data.error ?? "Failed to generate backup." });
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `wajid-portfolio-backup-${new Date().toISOString().slice(0,10)}.json`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setBackupMsg({ type:"success", text:"Backup downloaded successfully." });
    } catch {
      setBackupMsg({ type:"error", text:"Network error while downloading backup." });
    } finally {
      setBackupDownloading(false);
    }
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) return;
    setPendingFile(file);
    setConfirmOpen(true);
  }

  async function confirmRestore() {
    if (!pendingFile) return;
    setConfirmOpen(false);
    setRestoring(true); setBackupMsg(null);
    try {
      const text = await pendingFile.text();
      let payload: unknown;
      try { payload = JSON.parse(text); }
      catch { setBackupMsg({ type:"error", text:"Selected file is not valid JSON." }); setRestoring(false); return; }

      const res  = await fetch("/api/v1/admin/backup/restore", {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setBackupMsg({ type:"success", text:"Backup restored successfully! Reloading…" });
        setTimeout(() => router.refresh(), 1200);
      } else {
        setBackupMsg({ type:"error", text: data.error ?? "Restore failed." });
      }
    } catch {
      setBackupMsg({ type:"error", text:"Network error while restoring backup." });
    } finally {
      setRestoring(false);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function cancelRestore() {
    setConfirmOpen(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>

      {/* Current Name Info */}
      <div className="admin-card" style={{ borderLeft:"3px solid #06b6d4" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.5rem" }}>👤 Current Profile Name</h3>
        <p style={{ fontSize:"0.875rem", color:"var(--text-secondary)" }}>
          <strong>English:</strong> {profile?.fullName_en ?? "Not set"}<br/>
          <strong>Pashto:</strong> {profile?.fullName_ps ?? "Not set"}<br/>
          <strong>Dari:</strong> {profile?.fullName_fa ?? "Not set"}
        </p>
        <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:"0.5rem" }}>
          To update your name, go to <a href="/admin/profile" style={{ color:"#818cf8" }}>Profile settings</a>.
          Correct spelling: <strong>واجد علی آریا</strong>
        </p>
      </div>

      {/* Branding */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>🎨 Website Branding</h3>
        <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>
          Controls the logo text and tagline shown in the site navigation bar.
        </p>
        <div>
          <label style={lbl}>Logo / Site Name</label>
          <input value={brand.brand_name} onChange={e=>setBrand(p=>({...p,brand_name:e.target.value}))} style={inp} />
        </div>
        <div>
          <label style={lbl}>Tagline</label>
          <input value={brand.brand_tagline} onChange={e=>setBrand(p=>({...p,brand_tagline:e.target.value}))} style={inp} />
        </div>
        {brandMsg && <div className={brandMsg.type==="success"?"alert-success":"alert-error"}>{brandMsg.type==="success"?"✅":"❌"} {brandMsg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveBrand} disabled={brandSaving}>{brandSaving?"Saving…":"Save Branding"}</button>
      </div>

      {/* SEO */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>🔍 SEO Settings</h3>
        <div>
          <label style={lbl}>Default Page Title</label>
          <input value={seo.seo_default_title} onChange={e=>setSeo(p=>({...p,seo_default_title:e.target.value}))} style={inp} />
        </div>
        <div>
          <label style={lbl}>Default Meta Description</label>
          <textarea value={seo.seo_default_description} onChange={e=>setSeo(p=>({...p,seo_default_description:e.target.value}))} rows={3} style={{ ...inp, resize:"vertical" }} />
        </div>
        {msg && <div className={msg.type==="success"?"alert-success":"alert-error"}>{msg.type==="success"?"✅":"❌"} {msg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveSeo} disabled={saving}>{saving?"Saving…":"Save SEO Settings"}</button>
      </div>

      {/* Change Admin Email */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>✉️ Change Login Email</h3>
        <div>
          <label style={lbl}>New Email Address</label>
          <input type="email" value={emailForm.newEmail} onChange={e=>setEmailForm(p=>({...p,newEmail:e.target.value}))} style={inp} placeholder="new@email.com" />
        </div>
        <div>
          <label style={lbl}>Current Password (to confirm)</label>
          <input type="password" value={emailForm.currentPassword} onChange={e=>setEmailForm(p=>({...p,currentPassword:e.target.value}))} style={inp} autoComplete="current-password" />
        </div>
        {emailMsg && <div className={emailMsg.type==="success"?"alert-success":"alert-error"}>{emailMsg.type==="success"?"✅":"❌"} {emailMsg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={changeEmail}>Update Email</button>
      </div>

      {/* Change Password */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>🔒 Change Admin Password</h3>
        <div>
          <label style={lbl}>Current Password</label>
          <input type="password" value={pwd.currentPassword} onChange={e=>setPwd(p=>({...p,currentPassword:e.target.value}))} style={inp} autoComplete="current-password" />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
          <div>
            <label style={lbl}>New Password</label>
            <input type="password" value={pwd.newPassword} onChange={e=>setPwd(p=>({...p,newPassword:e.target.value}))} style={inp} autoComplete="new-password" />
          </div>
          <div>
            <label style={lbl}>Confirm New Password</label>
            <input type="password" value={pwd.confirmPassword} onChange={e=>setPwd(p=>({...p,confirmPassword:e.target.value}))} style={inp} autoComplete="new-password" />
          </div>
        </div>
        {pwdMsg && <div className={pwdMsg.type==="success"?"alert-success":"alert-error"}>{pwdMsg.type==="success"?"✅":"❌"} {pwdMsg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={changePassword}>Change Password</button>
      </div>

      {/* Backup & Restore */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>🗄️ Backup & Restore</h3>
        <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>
          Download a complete backup of your portfolio content (profile, projects, skills, experience, education, certifications, blog posts, gallery, messages, and settings). Restoring will replace all current content with the data in the selected backup file.
        </p>

        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.75rem" }}>
          <button className="btn-primary" onClick={downloadBackup} disabled={backupDownloading}>
            {backupDownloading ? "Preparing…" : "⬇️ Download Backup"}
          </button>

          <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display:"none" }}
            onChange={e => handleFileSelect(e.target.files?.[0])} />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={restoring}>
            {restoring ? "Restoring…" : "⬆️ Restore from Backup"}
          </button>
        </div>

        {backupMsg && <div className={backupMsg.type==="success"?"alert-success":"alert-error"}>{backupMsg.type==="success"?"✅":"❌"} {backupMsg.text}</div>}
      </div>

      {/* Restore confirmation dialog */}
      {confirmOpen && pendingFile && (
        <div
          onClick={cancelRestore}
          style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="admin-card"
            style={{ maxWidth:"420px", width:"100%", borderLeft:"3px solid #f59e0b" }}
          >
            <h3 style={{ fontWeight:700, fontSize:"1rem", marginBottom:"0.75rem" }}>⚠️ Confirm Restore</h3>
            <p style={{ fontSize:"0.85rem", color:"var(--text-secondary)", marginBottom:"0.5rem" }}>
              You are about to restore from:
            </p>
            <p style={{ fontSize:"0.8rem", fontFamily:"monospace", background:"var(--bg-secondary)", padding:"0.5rem 0.75rem", borderRadius:"6px", marginBottom:"0.875rem", wordBreak:"break-all" }}>
              {pendingFile.name}
            </p>
            <p style={{ fontSize:"0.82rem", color:"#f59e0b", marginBottom:"1.25rem" }}>
              This will permanently replace ALL current portfolio content (profile, projects, skills, experience, education, certifications, blog, gallery, messages, settings) with the data from this file. This cannot be undone.
            </p>
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button className="btn-primary" style={{ background:"#f59e0b" }} onClick={confirmRestore}>Yes, Restore Now</button>
              <button className="btn-ghost" onClick={cancelRestore}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="admin-card">
        <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem" }}>⚡ Quick Access</h3>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.75rem" }}>
          {[
            { label:"View Portfolio",  href:"/en",             icon:"🌐" },
            { label:"Edit Profile",    href:"/admin/profile",  icon:"👤" },
            { label:"Manage Projects", href:"/admin/projects", icon:"🗂"  },
            { label:"View Messages",   href:"/admin/messages", icon:"📬" },
            { label:"Analytics",       href:"/admin/analytics",icon:"📈" },
          ].map(({label,href,icon})=>(
            <a key={href} href={href} target={href.startsWith("/en")?"_blank":undefined} className="btn-ghost" style={{ fontSize:"0.82rem" }}>
              {icon} {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}