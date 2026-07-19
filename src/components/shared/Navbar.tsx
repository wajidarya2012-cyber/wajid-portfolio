"use client";

import { useState, useEffect, useRef }        from "react";
import Link                            from "next/link";
import { usePathname, useRouter }      from "next/navigation";
import { useTranslations }             from "next-intl";
import { useTheme }                    from "./ThemeProvider";
import { locales }                     from "@/i18n";

const NAV_LINKS = [
  { key:"about",          href:"#about"          },
  { key:"skills",         href:"#skills"         },
  { key:"experience",     href:"#experience"     },
  { key:"certifications", href:"#certifications" },
  { key:"projects",       href:"#projects"       },
  { key:"blog",           href:"/blog"           },
  { key:"contact",        href:"#contact"        },
];

const SECTION_IDS = ["about","skills","experience","certifications","projects","contact"];

const LOCALE_LABELS: Record<string,string> = { en:"EN", ps:"پښتو", fa:"دری" };

function resolveHref(href: string, locale: string, pathname: string): string {
  if (!href.startsWith("#")) return `/${locale}${href}`;
  return pathname === `/${locale}` ? href : `/${locale}${href}`;
}

export default function Navbar({ locale, brandName = "W.Arya", brandTagline = "IT Manager & Developer" }: { locale: string; brandName?: string; brandTagline?: string }) {
  const t                          = useTranslations("nav");
  const { theme, toggleTheme }     = useTheme();
  const pathname                   = usePathname();
  const router                     = useRouter();
  const [scrolled, setScrolled]    = useState(false);
  const [menuOpen, setMenuOpen]    = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const clickLockRef = useRef<string | null>(null);
  const clickLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScrollBg = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScrollBg, { passive:true });

    // Track which section is currently most visible using IntersectionObserver
    // (avoids the manual-scroll-math race that could show two "active" links at once).
    const visibleRatios = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { visibleRatios.set(entry.target.id, entry.intersectionRatio); });

      // A click just fired — trust it over the observer for a short grace period
      // so smooth-scroll doesn't briefly re-activate a section it's passing through.
      if (clickLockRef.current) return;

      let bestId = "";
      let bestRatio = 0;
      visibleRatios.forEach((ratio, id) => {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });
      if (bestId) setActiveHash(`#${bestId}`);
    }, { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1], rootMargin: "-80px 0px -40% 0px" });

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => { window.removeEventListener("scroll", onScrollBg); observer.disconnect(); };
  }, []);

  function handleNavClick(href: string) {
    if (!href.startsWith("#")) return;
    setActiveHash(href);
    clickLockRef.current = href;
    if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current);
    clickLockTimerRef.current = setTimeout(() => { clickLockRef.current = null; }, 900);
  }

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1]    = newLocale;
    router.push(segments.join("/") || "/");
  }

  const navStyle: React.CSSProperties = {
    position:"fixed", top:0, left:0, right:0, zIndex:500,
    height:"64px", display:"flex", alignItems:"center",
    transition:"background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
    background: scrolled ? "rgba(6,11,24,0.97)" : "rgba(6,11,24,0.55)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
    boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.35)" : "none",
  };

  return (
    <>
      <nav style={navStyle} role="navigation" aria-label="Main navigation">
        <div className="section-container" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", height:"100%" }}>

          {/* Logo */}
          <Link href={`/${locale}`} style={{ textDecoration:"none", display:"flex", flexDirection:"column", lineHeight:1.1 }}>
            <span style={{ fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"1.2rem", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {brandName}
            </span>
            <span style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-fira)", letterSpacing:"0.05em" }}>
              {brandTagline}
            </span>
          </Link>

          {/* Desktop links */}
          <ul style={{ display:"none", listStyle:"none", alignItems:"center", gap:"1.75rem", margin:0, padding:0 }} className="desktop-nav">
            {NAV_LINKS.map(({ key, href }) => {
              const isActive = href === activeHash || (href.startsWith("/") && pathname.includes(href));
              return (
                <li key={key}>
                  <a href={resolveHref(href, locale, pathname)}
                    onClick={() => handleNavClick(href)}
                    style={{ textDecoration:"none", fontSize:"0.82rem", fontWeight:600, transition:"color 0.2s, opacity 0.2s", position:"relative", paddingBottom:"4px",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                      opacity: isActive ? 1 : 0.85,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; (e.currentTarget as HTMLElement).style.opacity = "0.85"; } }}>
                    {t(key)}
                    <span style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", borderRadius:"2px", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", transform:isActive?"scaleX(1)":"scaleX(0)", transformOrigin:"left", transition:"transform 0.25s ease" }} />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
            {/* Locale */}
            <select value={locale} onChange={e=>switchLocale(e.target.value)} aria-label="Language"
              style={{ fontSize:"0.75rem", fontWeight:600, padding:"0.32rem 1.6rem 0.32rem 0.65rem", borderRadius:"9999px", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"var(--text-secondary)", cursor:"pointer", outline:"none", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 0.5rem center" }}>
              {locales.map(l => (
                <option key={l} value={l} style={{ background:"#0a0f1e", color:"white" }}>{LOCALE_LABELS[l]}</option>
              ))}
            </select>

            {/* Theme */}
            <button onClick={toggleTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`}
              style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", transition:"all 0.2s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(79,70,229,0.5)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.1)"; }}>
              {theme==="dark" ? "🌙" : "☀️"}
            </button>

            {/* Hamburger */}
            <button onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen} className="hamburger-btn"
              style={{ display:"none", flexDirection:"column", gap:"5px", width:"36px", height:"36px", alignItems:"center", justifyContent:"center", background:"transparent", border:"none", cursor:"pointer", padding:"4px" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display:"block", width:"20px", height:"2px", background:"var(--text-primary)", borderRadius:"2px", transition:"all 0.25s",
                  transform: menuOpen ? (i===0?"rotate(45deg) translateY(7px)":i===2?"rotate(-45deg) translateY(-7px)":"none") : "none",
                  opacity:   menuOpen && i===1 ? 0 : 1 }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div onClick={()=>setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:498, background:"rgba(0,0,0,0.4)" }} />
      )}

      {/* Mobile menu panel */}
      <div style={{ position:"fixed", top:"64px", left:0, right:0, zIndex:499, background:"rgba(6,11,24,0.98)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"1.25rem 1.5rem 2rem", display:"flex", flexDirection:"column", gap:"0.25rem", transform:menuOpen?"translateY(0)":"translateY(-110%)", transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)", pointerEvents:menuOpen?"all":"none" }} className="mobile-menu-panel">
        {NAV_LINKS.map(({ key, href }) => (
          <a key={key} href={resolveHref(href, locale, pathname)}
            onClick={()=>{ handleNavClick(href); setMenuOpen(false); }}
            style={{ fontSize:"1rem", fontWeight:600, color:"rgba(255,255,255,0.75)", textDecoration:"none", padding:"0.875rem 0", borderBottom:"1px solid rgba(255,255,255,0.06)", transition:"color 0.2s" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="#fff"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.75)"; }}>
            {t(key)}
          </a>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 768px) { .desktop-nav { display: flex !important; } }
        @media (max-width: 767px) { .hamburger-btn { display: flex !important; } }
      `,
        }}
      />
    </>
  );
}