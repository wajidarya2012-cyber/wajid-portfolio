"use client";

import Link               from "next/link";
import { useTranslations } from "next-intl";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

const NAV_COLS = [
  {
    title: "Portfolio",
    links: [
      { label:"About",          href:"#about"          },
      { label:"Skills",         href:"#skills"         },
      { label:"Experience",     href:"#experience"     },
      { label:"Projects",       href:"#projects"       },
      { label:"Certifications", href:"#certifications" },
    ],
  },
  {
    title: "Content",
    links: [
      { label:"Blog",     href:"#" },
      { label:"Gallery",  href:"#" },
      { label:"Contact",  href:"#contact" },
    ],
  },
];

const SOCIALS = [
  { label:"LinkedIn", icon:"in",  href:"#" },
  { label:"GitHub",   icon:"gh",  href:"#" },
  { label:"Email",    icon:"@",   href:"mailto:wajid.arya@example.com" },
];

const ROLES = [
  "IT & Network Manager",
  "Software Developer",
  "Database Administrator",
  "Network & Systems Specialist",
];

export default function Footer({ locale }: { locale: string }) {
  const tl = useTranslations("footer");

  return (
    <footer style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", overflow:"hidden" }}>
      {/* Main footer */}
      <div className="section-container" style={{ padding:"clamp(2.5rem,5vw,3.5rem) 1.25rem 2rem" }}>
        <div className="footer-grid">

          {/* Brand col */}
          <div>
            <div style={{ marginBottom:"1rem" }}>
              <span style={{ fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"1.35rem", background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", display:"block", lineHeight:1.2 }}>
                Wajid Ali Arya
              </span>
              <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.68rem", color:"var(--text-muted)", letterSpacing:"0.08em" }}>
                واجد علی آریا
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.25rem", marginBottom:"1rem" }}>
              {ROLES.map(role => (
                <span key={role} style={{ fontSize:"0.78rem", color:"var(--text-secondary)", lineHeight:1.5 }}>
                  {role}
                </span>
              ))}
            </div>
            <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", lineHeight:1.75, maxWidth:"260px", marginBottom:"1.25rem" }}>
              Building technology solutions that create real value — from Jalalabad, Afghanistan to the world.
            </p>
            {/* Socials */}
            <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
              {SOCIALS.map(({ label, icon, href }) => (
                <a key={label} href={href} aria-label={label}
                  style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--bg-card)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.72rem", fontWeight:700, color:"var(--text-secondary)", textDecoration:"none", transition:"all 0.2s", flexShrink:0 }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="#4f46e5"; el.style.color="#818cf8"; el.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="var(--border)"; el.style.color="var(--text-secondary)"; el.style.transform="none"; }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav cols */}
          {NAV_COLS.map(col => (
            <div key={col.title}>
              <p style={{ fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--text-muted)", marginBottom:"1rem" }}>
                {col.title}
              </p>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} style={{ fontSize:"0.82rem", color:"var(--text-secondary)", textDecoration:"none", transition:"color 0.2s" }}
                      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-primary)"; }}
                      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-secondary)"; }}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop:"1px solid var(--border)" }}>
        <div className="section-container" style={{ padding:"1rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
          <p style={{ fontSize:"0.73rem", color:"var(--text-muted)" }}>
            © {new Date().getFullYear()} Wajid Ali Arya. {tl("rights")}
          </p>
          <p style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>
            {tl("builtWith")}
          </p>
          <Link href="/admin/login" style={{ fontSize:"0.72rem", color:"var(--text-muted)", textDecoration:"none", opacity:0.5, transition:"opacity 0.2s" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.opacity="1"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.opacity="0.5"; }}>
            Admin ↗
          </Link>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(2, 1fr);
          gap: 3rem;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }
        }
      `,
        }}
      />
    </footer>
  );
}