"use client";
import { useState, useRef }  from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";
import { TRANSLATE_LANGUAGES } from "@/lib/translateLanguages";

export default function SettingsForm({ settingsMap, profile }: { settingsMap: Record<string,string>; profile: Profile|null }) {
  const router = useRouter();
  const [seo, setSeo]   = useState({
    seo_default_title:        settingsMap["seo_default_title"]        ?? "Wajid Ali Arya | IT Manager & Software Developer",
    seo_default_description:  settingsMap["seo_default_description"]  ?? "Technology Consultant based in Jalalabad, Afghanistan",
    og_image_url:              settingsMap["og_image_url"]             ?? "",
    og_image_public_id:        settingsMap["og_image_public_id"]       ?? "",
    ga_measurement_id:         settingsMap["ga_measurement_id"]        ?? "",
    google_site_verification: settingsMap["google_site_verification"] ?? "",
  });
  const [brand, setBrand] = useState({
    brand_name:            settingsMap["brand_name"]            ?? "W.Arya",
    brand_tagline:         settingsMap["brand_tagline"]         ?? "IT Manager & Developer",
    logo_url:               settingsMap["logo_url"]              ?? "",
    logo_public_id:         settingsMap["logo_public_id"]         ?? "",
    favicon_url:            settingsMap["favicon_url"]           ?? "",
    favicon_public_id:      settingsMap["favicon_public_id"]      ?? "",
    contact_working_hours: settingsMap["contact_working_hours"] ?? "",
  });
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandMsg, setBrandMsg] = useState<{type:"success"|"error";text:string}|null>(null);
  const [logoUploading, setLogoUploading]       = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [ogUploading, setOgUploading]           = useState(false);

  // Navigation menu — keys/routes are fixed in code; only label/order/visibility/newTab are editable.
  const NAV_DEFAULTS = [
    { key:"about",          defaultLabel:"About" },
    { key:"skills",         defaultLabel:"Skills" },
    { key:"experience",     defaultLabel:"Experience" },
    { key:"certifications", defaultLabel:"Certifications" },
    { key:"projects",       defaultLabel:"Projects" },
    { key:"blog",           defaultLabel:"Blog" },
    { key:"contact",        defaultLabel:"Contact" },
  ];
  type NavItem = { key:string; label_en:string; label_ps:string; label_fa:string; order:number; visible:boolean; newTab:boolean };
  const [navItems, setNavItems] = useState<NavItem[]>(() => {
    let saved: Partial<NavItem>[] = [];
    try { saved = settingsMap["nav_items"] ? JSON.parse(settingsMap["nav_items"]) : []; } catch {}
    const byKey = new Map(saved.map(s => [s.key, s]));
    return NAV_DEFAULTS.map((d, i) => {
      const s = byKey.get(d.key);
      return {
        key: d.key,
        label_en: s?.label_en ?? "", label_ps: s?.label_ps ?? "", label_fa: s?.label_fa ?? "",
        order: s?.order ?? i, visible: s?.visible !== false, newTab: s?.newTab === true,
      };
    }).sort((a,b) => a.order - b.order);
  });
  const [navSaving, setNavSaving] = useState(false);
  const [navMsg, setNavMsg] = useState<{type:"success"|"error";text:string}|null>(null);

  function setNavField(key: string, field: keyof NavItem, value: string | number | boolean) {
    setNavItems(prev => prev.map(item => item.key === key ? { ...item, [field]: value } : item));
  }
  function moveNavItem(key: string, dir: -1 | 1) {
    setNavItems(prev => {
      const sorted = [...prev].sort((a,b) => a.order - b.order);
      const idx = sorted.findIndex(i => i.key === key);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      [sorted[idx].order, sorted[swapIdx].order] = [sorted[swapIdx].order, sorted[idx].order];
      return sorted.map(i => ({ ...i }));
    });
  }
  async function saveNavItems() {
    setNavSaving(true); setNavMsg(null);
    const res  = await fetch("/api/v1/admin/settings", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ nav_items: JSON.stringify(navItems) }),
    });
    const data = await res.json();
    setNavSaving(false);
    setNavMsg(data.success ? { type:"success", text:"Navigation menu saved!" } : { type:"error", text:"Failed to save." });
    if (data.success) router.refresh();
  }

  // Footer — legal links + section visibility toggles
  const [footer, setFooter] = useState({
    legal_privacy_url: settingsMap["legal_privacy_url"] ?? "",
    legal_terms_url:   settingsMap["legal_terms_url"]   ?? "",
  });
  const FOOTER_VIS_DEFAULTS = { showQuickLinks:true, showContact:true, showSocialLinks:true, showWorkingHours:true, showCopyright:true };
  const [footerVisibility, setFooterVisibility] = useState<Record<string, boolean>>(() => {
    let saved: Record<string, boolean> = {};
    try { saved = settingsMap["footer_visibility"] ? JSON.parse(settingsMap["footer_visibility"]) : {}; } catch {}
    return { ...FOOTER_VIS_DEFAULTS, ...saved };
  });
  const [footerSaving, setFooterSaving] = useState(false);
  const [footerMsg, setFooterMsg] = useState<{type:"success"|"error";text:string}|null>(null);

  async function saveFooter() {
    setFooterSaving(true); setFooterMsg(null);
    const res  = await fetch("/api/v1/admin/settings", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...footer, footer_visibility: JSON.stringify(footerVisibility) }),
    });
    const data = await res.json();
    setFooterSaving(false);
    setFooterMsg(data.success ? { type:"success", text:"Footer settings saved!" } : { type:"error", text:"Failed to save." });
    if (data.success) router.refresh();
  }

  // Website Translation (Google Translate widget for 100+ non-native languages)
  const [translate, setTranslate] = useState(() => {
    let saved: Record<string, unknown> = {};
    try { saved = settingsMap["translate_widget_config"] ? JSON.parse(settingsMap["translate_widget_config"]) : {}; } catch {}
    return {
      enabled: (saved.enabled as boolean) ?? false,
      showSelector: (saved.showSelector as boolean) ?? true,
      position: (saved.position as string) ?? "bottom-right",
      alignment: (saved.alignment as string) ?? "right",
      languages: (saved.languages as string[]) ?? TRANSLATE_LANGUAGES.map(l=>l.code),
      defaultLanguage: (saved.defaultLanguage as string) ?? "",
      label_en: (saved.label_en as string) ?? "Translate to...",
      label_ps: (saved.label_ps as string) ?? "",
      label_fa: (saved.label_fa as string) ?? "",
    };
  });
  const [translateSaving, setTranslateSaving] = useState(false);
  const [translateMsg, setTranslateMsg] = useState<{type:"success"|"error";text:string}|null>(null);

  function toggleTranslateLanguage(code: string) {
    setTranslate(p => ({
      ...p,
      languages: p.languages.includes(code) ? p.languages.filter(c=>c!==code) : [...p.languages, code],
    }));
  }
  async function saveTranslate() {
    setTranslateSaving(true); setTranslateMsg(null);
    const res  = await fetch("/api/v1/admin/settings", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ translate_widget_config: JSON.stringify(translate) }),
    });
    const data = await res.json();
    setTranslateSaving(false);
    setTranslateMsg(data.success ? { type:"success", text:"Translation settings saved!" } : { type:"error", text:"Failed to save." });
    if (data.success) router.refresh();
  }
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

  async function uploadBrandingImage(
    file: File,
    urlKey: "logo_url" | "favicon_url" | "og_image_url",
    idKey: "logo_public_id" | "favicon_public_id" | "og_image_public_id",
    setBusy: (b: boolean) => void,
    target: "brand" | "seo",
  ) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "branding");
      const res  = await fetch("/api/v1/admin/upload", { method:"POST", body:fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        if (target === "brand") setBrand(p => ({ ...p, [urlKey]: data.data.url, [idKey]: data.data.publicId }));
        else                    setSeo(p   => ({ ...p, [urlKey]: data.data.url, [idKey]: data.data.publicId }));
      } else {
        setBrandMsg({ type:"error", text: data?.error ?? "Image upload failed." });
      }
    } catch (err) {
      setBrandMsg({ type:"error", text: err instanceof Error ? err.message : "Network error during upload." });
    } finally {
      setBusy(false);
    }
  }

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
          Controls the logo, tagline, and contact info shown across the public site.
        </p>
        <div>
          <label style={lbl}>Logo / Site Name</label>
          <input value={brand.brand_name} onChange={e=>setBrand(p=>({...p,brand_name:e.target.value}))} style={inp} />
        </div>
        <div>
          <label style={lbl}>Tagline</label>
          <input value={brand.brand_tagline} onChange={e=>setBrand(p=>({...p,brand_tagline:e.target.value}))} style={inp} />
        </div>
        <div>
          <label style={lbl}>Logo Image (optional — shown instead of text logo)</label>
          <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
            <div style={{ width:"96px", height:"48px", borderRadius:"6px", overflow:"hidden", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {brand.logo_url ? <img src={brand.logo_url} alt="Logo" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} /> : <span style={{ fontSize:"1.2rem", opacity:0.4 }}>🖼</span>}
            </div>
            <input type="file" accept="image/*" id="logo-upload" style={{ display:"none" }}
              onChange={e => { const f=e.target.files?.[0]; if (f) uploadBrandingImage(f,"logo_url","logo_public_id",setLogoUploading,"brand"); }} />
            <label htmlFor="logo-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>
              {logoUploading ? "Uploading…" : brand.logo_url ? "Replace Logo" : "Upload Logo"}
            </label>
            {brand.logo_url && (
              <button type="button" className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={()=>setBrand(p=>({...p,logo_url:"",logo_public_id:""}))}>Remove</button>
            )}
          </div>
        </div>
        <div>
          <label style={lbl}>Favicon (optional)</label>
          <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
            <div style={{ width:"48px", height:"48px", borderRadius:"6px", overflow:"hidden", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {brand.favicon_url ? <img src={brand.favicon_url} alt="Favicon" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} /> : <span style={{ fontSize:"1.2rem", opacity:0.4 }}>🖼</span>}
            </div>
            <input type="file" accept="image/*" id="favicon-upload" style={{ display:"none" }}
              onChange={e => { const f=e.target.files?.[0]; if (f) uploadBrandingImage(f,"favicon_url","favicon_public_id",setFaviconUploading,"brand"); }} />
            <label htmlFor="favicon-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>
              {faviconUploading ? "Uploading…" : brand.favicon_url ? "Replace Favicon" : "Upload Favicon"}
            </label>
            {brand.favicon_url && (
              <button type="button" className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={()=>setBrand(p=>({...p,favicon_url:"",favicon_public_id:""}))}>Remove</button>
            )}
          </div>
        </div>
        <div>
          <label style={lbl}>Working Hours (optional — shown in Contact section)</label>
          <input value={brand.contact_working_hours} onChange={e=>setBrand(p=>({...p,contact_working_hours:e.target.value}))} style={inp} placeholder="Sat – Thu, 9:00 AM – 5:00 PM" />
        </div>
        {brandMsg && <div className={brandMsg.type==="success"?"alert-success":"alert-error"}>{brandMsg.type==="success"?"✅":"❌"} {brandMsg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveBrand} disabled={brandSaving || logoUploading || faviconUploading}>{brandSaving?"Saving…":"Save Branding"}</button>
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
        <div>
          <label style={lbl}>Default Open Graph Image (social share preview)</label>
          <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
            <div style={{ width:"96px", height:"54px", borderRadius:"6px", overflow:"hidden", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {seo.og_image_url ? <img src={seo.og_image_url} alt="OG preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:"1.2rem", opacity:0.4 }}>🖼</span>}
            </div>
            <input type="file" accept="image/*" id="og-upload" style={{ display:"none" }}
              onChange={e => { const f=e.target.files?.[0]; if (f) uploadBrandingImage(f,"og_image_url","og_image_public_id",setOgUploading,"seo"); }} />
            <label htmlFor="og-upload" className="btn-secondary" style={{ fontSize:"0.8rem", cursor:"pointer" }}>
              {ogUploading ? "Uploading…" : seo.og_image_url ? "Replace Image" : "Upload Image"}
            </label>
            {seo.og_image_url && (
              <button type="button" className="btn-ghost" style={{ fontSize:"0.8rem" }} onClick={()=>setSeo(p=>({...p,og_image_url:"",og_image_public_id:""}))}>Remove</button>
            )}
          </div>
        </div>
        <div>
          <label style={lbl}>Google Analytics Measurement ID (optional)</label>
          <input value={seo.ga_measurement_id} onChange={e=>setSeo(p=>({...p,ga_measurement_id:e.target.value}))} style={inp} placeholder="G-XXXXXXXXXX" />
        </div>
        <div>
          <label style={lbl}>Google Site Verification Code (optional)</label>
          <input value={seo.google_site_verification} onChange={e=>setSeo(p=>({...p,google_site_verification:e.target.value}))} style={inp} placeholder="verification meta content value" />
        </div>
        {msg && <div className={msg.type==="success"?"alert-success":"alert-error"}>{msg.type==="success"?"✅":"❌"} {msg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveSeo} disabled={saving || ogUploading}>{saving?"Saving…":"Save SEO Settings"}</button>
      </div>

      {/* Navigation Menu */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>🧭 Navigation Menu</h3>
        <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>
          Rename, reorder, show/hide, or open-in-new-tab any menu item. Routes stay fixed — only these fields are editable.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
          {navItems.map((item, idx) => {
            const def = NAV_DEFAULTS.find(d => d.key === item.key);
            return (
              <div key={item.key} style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr 1fr auto auto auto", gap:"0.5rem", alignItems:"center", padding:"0.75rem", background:"var(--bg-secondary)", borderRadius:"8px" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                  <button type="button" onClick={()=>moveNavItem(item.key,-1)} disabled={idx===0} className="btn-ghost" style={{ padding:"0.15rem 0.4rem", fontSize:"0.7rem", lineHeight:1 }}>▲</button>
                  <button type="button" onClick={()=>moveNavItem(item.key,1)} disabled={idx===navItems.length-1} className="btn-ghost" style={{ padding:"0.15rem 0.4rem", fontSize:"0.7rem", lineHeight:1 }}>▼</button>
                </div>
                <input value={item.label_en} onChange={e=>setNavField(item.key,"label_en",e.target.value)} placeholder={`${def?.defaultLabel} (EN)`} style={inp} />
                <input value={item.label_ps} onChange={e=>setNavField(item.key,"label_ps",e.target.value)} placeholder="پښتو" style={{ ...inp, direction:"rtl" }} />
                <input value={item.label_fa} onChange={e=>setNavField(item.key,"label_fa",e.target.value)} placeholder="دری" style={{ ...inp, direction:"rtl" }} />
                <label style={{ display:"flex", alignItems:"center", gap:"0.35rem", fontSize:"0.75rem", color:"var(--text-secondary)", whiteSpace:"nowrap", cursor:"pointer" }}>
                  <input type="checkbox" checked={item.visible} onChange={e=>setNavField(item.key,"visible",e.target.checked)} /> Visible
                </label>
                <label style={{ display:"flex", alignItems:"center", gap:"0.35rem", fontSize:"0.75rem", color:"var(--text-secondary)", whiteSpace:"nowrap", cursor:"pointer" }}>
                  <input type="checkbox" checked={item.newTab} onChange={e=>setNavField(item.key,"newTab",e.target.checked)} /> New tab
                </label>
                <span style={{ fontSize:"0.7rem", color:"var(--text-muted)", fontFamily:"monospace" }}>{item.key}</span>
              </div>
            );
          })}
        </div>
        {navMsg && <div className={navMsg.type==="success"?"alert-success":"alert-error"}>{navMsg.type==="success"?"✅":"❌"} {navMsg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveNavItems} disabled={navSaving}>{navSaving?"Saving…":"Save Navigation"}</button>
      </div>

      {/* Footer Settings */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>🦶 Footer Settings</h3>
        <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>
          Quick Links reuse the Navigation Menu above. Contact info, working hours, and social links reuse your Profile — edit those there.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <div>
            <label style={lbl}>Privacy Policy URL (optional)</label>
            <input value={footer.legal_privacy_url} onChange={e=>setFooter(p=>({...p,legal_privacy_url:e.target.value}))} style={inp} placeholder="https://..." />
          </div>
          <div>
            <label style={lbl}>Terms & Conditions URL (optional)</label>
            <input value={footer.legal_terms_url} onChange={e=>setFooter(p=>({...p,legal_terms_url:e.target.value}))} style={inp} placeholder="https://..." />
          </div>
        </div>
        <div>
          <p style={{ ...lbl, marginBottom:"0.6rem" }}>Show / Hide Footer Sections</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
            {[
              { key:"showQuickLinks",   label:"Quick Links" },
              { key:"showContact",      label:"Contact Information" },
              { key:"showSocialLinks",  label:"Social Links" },
              { key:"showWorkingHours", label:"Working Hours" },
              { key:"showCopyright",    label:"Copyright Line" },
            ].map(({ key, label }) => (
              <label key={key} style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.82rem", color:"var(--text-secondary)", cursor:"pointer" }}>
                <input type="checkbox" checked={footerVisibility[key] !== false}
                  onChange={e => setFooterVisibility(prev => ({ ...prev, [key]: e.target.checked }))} />
                {label}
              </label>
            ))}
          </div>
        </div>
        {footerMsg && <div className={footerMsg.type==="success"?"alert-success":"alert-error"}>{footerMsg.type==="success"?"✅":"❌"} {footerMsg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveFooter} disabled={footerSaving}>{footerSaving?"Saving…":"Save Footer Settings"}</button>
      </div>

      {/* Website Translation */}
      <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        <h3 style={{ fontWeight:700, fontSize:"0.95rem" }}>🌐 Website Translation</h3>
        <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>
          Adds an optional "Translate to…" selector for 100+ additional languages, powered by Google Translate.
          English, Pashto, and Dari always keep using the site&apos;s own native translations.
        </p>
        <div style={{ display:"flex", gap:"1.5rem" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem", cursor:"pointer" }}>
            <input type="checkbox" checked={translate.enabled} onChange={e=>setTranslate(p=>({...p,enabled:e.target.checked}))} /> Enable translation feature
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem", cursor:"pointer" }}>
            <input type="checkbox" checked={translate.showSelector} onChange={e=>setTranslate(p=>({...p,showSelector:e.target.checked}))} /> Show selector widget
          </label>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
          <div>
            <label style={lbl}>Widget Position</label>
            <select value={translate.position} onChange={e=>setTranslate(p=>({...p,position:e.target.value}))} style={inp}>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Alignment</label>
            <select value={translate.alignment} onChange={e=>setTranslate(p=>({...p,alignment:e.target.value}))} style={inp}>
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem" }}>
          <div>
            <label style={lbl}>&quot;Translate to…&quot; Label (EN)</label>
            <input value={translate.label_en} onChange={e=>setTranslate(p=>({...p,label_en:e.target.value}))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Label (پښتو)</label>
            <input value={translate.label_ps} onChange={e=>setTranslate(p=>({...p,label_ps:e.target.value}))} style={{...inp,direction:"rtl"}} placeholder="ژباړه کول..." />
          </div>
          <div>
            <label style={lbl}>Label (دری)</label>
            <input value={translate.label_fa} onChange={e=>setTranslate(p=>({...p,label_fa:e.target.value}))} style={{...inp,direction:"rtl"}} placeholder="ترجمه به..." />
          </div>
        </div>
        <div>
          <label style={lbl}>Default Language (optional — leave as Original to show native content until the visitor chooses)</label>
          <select value={translate.defaultLanguage} onChange={e=>setTranslate(p=>({...p,defaultLanguage:e.target.value}))} style={{...inp, maxWidth:"280px"}}>
            <option value="">Original (no auto-translate)</option>
            {TRANSLATE_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Available Languages ({translate.languages.length} selected)</label>
          <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.5rem" }}>
            <button type="button" className="btn-ghost" style={{ fontSize:"0.75rem" }} onClick={()=>setTranslate(p=>({...p,languages:TRANSLATE_LANGUAGES.map(l=>l.code)}))}>Select All</button>
            <button type="button" className="btn-ghost" style={{ fontSize:"0.75rem" }} onClick={()=>setTranslate(p=>({...p,languages:[]}))}>Clear All</button>
          </div>
          <div style={{ maxHeight:"220px", overflowY:"auto", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"0.4rem", padding:"0.75rem", background:"var(--bg-secondary)", borderRadius:"8px", border:"1px solid var(--border)" }}>
            {TRANSLATE_LANGUAGES.map(l => (
              <label key={l.code} style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.78rem", color:"var(--text-secondary)", cursor:"pointer" }}>
                <input type="checkbox" checked={translate.languages.includes(l.code)} onChange={()=>toggleTranslateLanguage(l.code)} />
                {l.name}
              </label>
            ))}
          </div>
        </div>
        {translateMsg && <div className={translateMsg.type==="success"?"alert-success":"alert-error"}>{translateMsg.type==="success"?"✅":"❌"} {translateMsg.text}</div>}
        <button className="btn-primary" style={{ alignSelf:"flex-start" }} onClick={saveTranslate} disabled={translateSaving}>{translateSaving?"Saving…":"Save Translation Settings"}</button>
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