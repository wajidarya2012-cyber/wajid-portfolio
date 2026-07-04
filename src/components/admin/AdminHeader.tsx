"use client";

import { signOut }    from "next-auth/react";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/admin/dashboard":      "Dashboard",
  "/admin/profile":        "Profile",
  "/admin/projects":       "Projects",
  "/admin/skills":         "Skills",
  "/admin/experience":     "Experience",
  "/admin/education":      "Education",
  "/admin/certifications": "Certifications",
  "/admin/blog":           "Blog",
  "/admin/gallery":        "Gallery",
  "/admin/messages":       "Messages",
  "/admin/analytics":      "Analytics",
  "/admin/activity-log":   "Activity Log",
  "/admin/settings":       "Settings",
};

export default function AdminHeader({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  const title    = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "Admin";

  return (
    <header style={{ height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1.5rem", borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)", flexShrink:0, gap:"1rem" }}>
      {/* Page title */}
      <h2 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"1rem", color:"var(--text-primary)", paddingLeft:"2.5rem" }}>
        {title}
      </h2>

      {/* Right controls */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.875rem" }}>
        {/* User info */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"0.8rem", fontWeight:800, flexShrink:0 }}>
            {(user.name ?? user.email ?? "A")[0].toUpperCase()}
          </div>
          <div style={{ display:"none" }} className="user-name-block">
            <p style={{ fontSize:"0.78rem", fontWeight:600, lineHeight:1.2 }}>{user.name ?? "Admin"}</p>
            <p style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>{user.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl:"/admin/login" })}
          style={{ padding:"0.4rem 0.875rem", borderRadius:"6px", border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.06)", color:"#f87171", fontSize:"0.78rem", fontWeight:500, cursor:"pointer", transition:"all 0.2s" }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.14)"; }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.06)"; }}>
          Sign Out
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 768px) { .user-name-block { display: block !important; } }
      `,
        }}
      />
    </header>
  );
}
