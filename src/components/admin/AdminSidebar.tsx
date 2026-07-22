"use client";

import { useState }   from "react";
import Link            from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label:"Dashboard",      href:"/admin/dashboard",      icon:"📊" },
  { label:"Profile",        href:"/admin/profile",        icon:"👤" },
  { label:"Projects",       href:"/admin/projects",       icon:"🗂"  },
  { label:"Project Categories", href:"/admin/project-categories", icon:"🏷️" },
  { label:"Skills",         href:"/admin/skills",         icon:"🔧" },
  { label:"Experience",     href:"/admin/experience",     icon:"💼" },
  { label:"Education",      href:"/admin/education",      icon:"🎓" },
  { label:"Certifications", href:"/admin/certifications", icon:"🏅" },
  { label:"Journey",        href:"/admin/journey",        icon:"🧭" },
  { label:"Blog",           href:"/admin/blog",           icon:"📝" },
  { label:"Gallery",        href:"/admin/gallery",        icon:"🖼"  },
  { label:"Messages",       href:"/admin/messages",       icon:"📬", badgeKey:"messages" },
  { label:"Analytics",      href:"/admin/analytics",      icon:"📈" },
  { label:"Activity Log",   href:"/admin/activity-log",   icon:"📋" },
  { label:"Settings",       href:"/admin/settings",       icon:"⚙️" },
];

interface Props { newMessages: number; }

export default function AdminSidebar({ newMessages }: Props) {
  const pathname           = usePathname();
  const [open, setOpen]    = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ height:"64px", display:"flex", alignItems:"center", padding:"0 1.25rem", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <Link href="/admin/dashboard" style={{ textDecoration:"none" }} onClick={()=>setOpen(false)}>
          <span style={{ fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"1.1rem", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            W.Arya
          </span>
          <span style={{ display:"block", fontSize:"0.62rem", color:"var(--text-muted)", fontFamily:"var(--font-fira)", marginTop:"-2px" }}>Admin Panel</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", padding:"0.75rem 0.625rem" }}>
        {NAV.map(({ label, href, icon, badgeKey }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`admin-sidebar-link ${active ? "active" : ""}`}
              style={{ marginBottom:"2px" }}
              onClick={() => setOpen(false)}>
              <span style={{ fontSize:"1rem", width:"20px", textAlign:"center", flexShrink:0 }}>{icon}</span>
              <span style={{ flex:1 }}>{label}</span>
              {badgeKey === "messages" && newMessages > 0 && (
                <span style={{ background:"#4f46e5", color:"white", fontSize:"0.65rem", fontWeight:700, padding:"0.1rem 0.5rem", borderRadius:"9999px", minWidth:"18px", textAlign:"center" }}>
                  {newMessages}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:"0.875rem 1.25rem", borderTop:"1px solid var(--border)", fontSize:"0.7rem", color:"var(--text-muted)", flexShrink:0 }}>
        <Link href="/en" target="_blank" style={{ color:"#818cf8", textDecoration:"none", fontSize:"0.75rem" }}>
          ↗ View Portfolio
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{ display:"none", position:"fixed", top:"14px", left:"1rem", zIndex:1100, width:"38px", height:"38px", borderRadius:"8px", border:"1px solid var(--border)", background:"var(--bg-secondary)", cursor:"pointer", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"5px" }}
        className="mobile-menu-btn"
        aria-label="Toggle menu">
        <span style={{ display:"block", width:"18px", height:"2px", background:"var(--text-primary)", borderRadius:"2px", transition:"all 0.2s", transform:open?"rotate(45deg) translateY(7px)":"none" }} />
        <span style={{ display:"block", width:"18px", height:"2px", background:"var(--text-primary)", borderRadius:"2px", opacity:open?0:1 }} />
        <span style={{ display:"block", width:"18px", height:"2px", background:"var(--text-primary)", borderRadius:"2px", transition:"all 0.2s", transform:open?"rotate(-45deg) translateY(-7px)":"none" }} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1050, display:"none" }} className="mobile-overlay" />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside style={{ width:"220px", flexShrink:0, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, overflowY:"auto", background:"var(--bg-secondary)", borderRight:"1px solid var(--border)" }}>
        <SidebarContent />
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex !important; }
          .mobile-overlay  { display: block !important; }
          aside { position: fixed !important; left: ${open?0:-240}px !important; z-index: 1060; width: 220px !important; transition: left 0.3s ease; }
        }
      `}</style>
    </>
  );
}
