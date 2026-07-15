"use client";
import { useState }  from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";

export default function SettingsForm({ settingsMap, profile }: { settingsMap: Record<string,string>; profile: Profile|null }) {
  const router = useRouter();
  const [seo, setSeo]   = useState({
    seo_default_title:       settingsMap["seo_default_title"]       ?? "Wajid Ali Arya | IT Manager & Software Developer",
    seo_default_description: settingsMap["seo_default_description"] ?? "Technology Consultant based in Jalalabad, Afghanistan",
  });
  const [pwd, setPwd]   = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [emailForm, setEmailForm] = useState({ currentPassword:"", newEmail:"" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]   = useState<{type:"success"|"error";text:string}|null>(null);
  const [pwdMsg, setPwdMsg] = useState<{type:"success"|"error";text:string}|null>(null);
  const [emailMsg, setEmailMsg] = useState<{type:"success"|"error";text:string}|null>(null);

  const inp: React.CSSProperties = { width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.875rem", padding:"0.7rem 0.875rem", outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.3rem" };

  async function saveSeo() {
    setSaving(true); setMsg(null);
    const res  = await fetch("/api/v1/admin/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(seo) });
    const data = await res.json();
    setSaving(false);
    setMsg(data.success ? {type:"success",text:"SEO settings saved!"} : {type:"error",text:"Failed to save."});
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
