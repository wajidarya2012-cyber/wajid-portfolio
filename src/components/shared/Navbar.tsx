"use client";

import { useState, useEffect, useRef }        from "react";
import Link                            from "next/link";
import { usePathname, useRouter }      from "next/navigation";
import { useTranslations }             from "next-intl";
import { useTheme }                    from "./ThemeProvider";
import { locales }                     from "@/i18n";
import { buildNavItems, NAV_LINKS, type NavItemConfig } from "@/lib/navConfig";

const LOCALE_LABELS: Record<string,string> = { en:"EN", ps:"پښتو", fa:"دری" };

function resolveHref(href: string, locale: string, pathname: string): string {
  if (!href.startsWith("#")) return `/${locale}${href}`;
  return pathname === `/${locale}` ? href : `/${locale}${href}`;
}

export default function Navbar({ locale, brandName = "W.Arya", brandTagline = "IT Manager & Developer", logoUrl, navConfig, sectionOrder }: { locale: string; brandName?: string; brandTagline?: string; logoUrl?: string; navConfig?: NavItemConfig[]; sectionOrder?: Record<string, number> }) {
  const t                          = useTranslations("nav");
  const { theme, toggleTheme }     = useTheme();
  const pathname                   = usePathname();
  const router                     = useRouter();
  const [scrolled, setScrolled]    = useState(false);
  const [menuOpen, setMenuOpen]    = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const clickLockRef = useRef<string | null>(null);
  const clickLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const updateActiveRef = useRef<() => void>(() => {});

  // Nav order/visibility already reflects the real homepage section order (see
  // buildNavItems's `sectionOrder` param) — deriving the highlighted-section id list from
  // the same visible, ordered nav items (rather than a separate hardcoded id array) keeps
  // active-section tracking from drifting out of sync when sections are reordered/hidden.
  const navItems = buildNavItems(navConfig, locale, t, sectionOrder);
  const anchorIds = navItems.filter(item => item.href.startsWith("#")).map(item => item.key);
  const anchorKey = anchorIds.join(",");

  const releaseClickLock = () => { clickLockRef.current = null; updateActiveRef.current(); };

  useEffect(() => {
    const onScrollBg = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScrollBg, { passive:true });

    // Active section = the homepage section covering the most of the viewport below the
    // navbar. A pure function of scroll position, so it is direction-independent and can't
    // flicker or go stale. (The previous IntersectionObserver ranked by intersectionRatio —
    // the share of the *section* visible, which favours short sections — only refreshed at
    // threshold crossings, and never updated while no linked section was in its band, which
    // left the last item stuck over the hero and over sections without a nav link.)
    // Candidates are every homepage section, linked or not, so an unlinked section such as
    // Certifications can be the primary one; it then maps to the nearest linked section above it.
    const sectionIds = ["hero", ...NAV_LINKS.map(l => l.key)];
    const linked = new Set(anchorKey ? anchorKey.split(",") : []);

    const update = () => {
      if (clickLockRef.current) return;
      const sections = sectionIds
        .map(id => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      const top = navRef.current?.getBoundingClientRect().bottom ?? 0;
      const vh  = window.innerHeight;

      let primary = -1, bestPx = 0;
      sections.forEach((el, i) => {
        const r  = el.getBoundingClientRect();
        const px = Math.min(r.bottom, vh) - Math.max(r.top, top);
        if (px > bestPx) { bestPx = px; primary = i; }
      });

      // At the very bottom a short final section may never be the largest — prefer the last
      // linked section that is on screen so it can still become active.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const r = sections[i].getBoundingClientRect();
          if (linked.has(sections[i].id) && r.top < vh && r.bottom > top) { primary = i; break; }
        }
      }

      let id = "";
      for (let i = primary; i >= 0; i--) {
        if (sections[i].id === "hero") break;
        if (linked.has(sections[i].id)) { id = sections[i].id; break; }
      }
      setActiveHash(id ? `#${id}` : "");
    };
    updateActiveRef.current = update;

    let raf = 0;
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    const onScrollActive = () => {
      // After a nav click, hold the clicked item until the smooth scroll settles rather than
      // for a fixed time, so sections passed on the way never flash active.
      if (clickLockRef.current) {
        if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current);
        clickLockTimerRef.current = setTimeout(releaseClickLock, 150);
        return;
      }
      schedule();
    };
    window.addEventListener("scroll", onScrollActive, { passive:true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", onScrollBg);
      window.removeEventListener("scroll", onScrollActive);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      cancelAnimationFrame(raf);
    };
    // Re-bind when the page changes (this navbar persists across routes in the layout) or the
    // linked sections change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, anchorKey]);

  useEffect(() => () => { if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current); }, []);

  function handleNavClick(href: string) {
    if (!href.startsWith("#")) return;
    setActiveHash(href);
    clickLockRef.current = href;
    if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current);
    // Released 150ms after scrolling stops (see onScrollActive); this covers a click that
    // causes no scroll at all, e.g. the section is already in place.
    clickLockTimerRef.current = setTimeout(releaseClickLock, 900);
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
    background: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
    backdropFilter: "blur(24px) saturate(150%)",
    WebkitBackdropFilter: "blur(24px) saturate(150%)",
    borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
    boxShadow: scrolled
      ? `var(--nav-shadow), inset 0 1px 0 var(--nav-highlight)`
      : `inset 0 1px 0 var(--nav-highlight)`,
  };

  return (
    <>
      <nav ref={navRef} style={navStyle} role="navigation" aria-label="Main navigation">
        {/* Subtle brand-gradient hairline along the bottom edge — reinforces depth without being a distinct animated element */}
        <div aria-hidden style={{
          position:"absolute", left:0, right:0, bottom:0, height:"1px", pointerEvents:"none",
          background:"linear-gradient(90deg, transparent 0%, rgba(79,70,229,0.5) 30%, rgba(6,182,212,0.5) 70%, transparent 100%)",
          opacity: scrolled ? 0.9 : 0.35,
          transition:"opacity 0.35s ease",
        }} />
        <div className="section-container nav-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", height:"100%" }}>

          {/* Logo */}
          <Link href={`/${locale}`} className="nav-brand" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"0.6rem" }}>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brandName} className="nav-brand-logo" style={{ height:"32px", width:"auto", maxWidth:"120px", objectFit:"contain" }} />
            )}
            <span className="nav-brand-text" style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
              <span className="nav-brand-name" style={{ fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"1.2rem", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                {brandName}
              </span>
              <span className="nav-brand-tagline" style={{ fontSize:"0.58rem", color:"var(--text-muted)", fontFamily:"var(--font-fira)", letterSpacing:"0.05em" }}>
                {brandTagline}
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul style={{ display:"none", listStyle:"none", alignItems:"center", gap:"1.75rem", margin:0, padding:0 }} className="desktop-nav">
            {navItems.map(({ key, href, label, newTab }) => {
              const isActive = href === activeHash || (href.startsWith("/") && pathname.includes(href));
              return (
                <li key={key}>
                  <a href={resolveHref(href, locale, pathname)}
                    onClick={() => handleNavClick(href)}
                    target={newTab ? "_blank" : undefined}
                    rel={newTab ? "noopener noreferrer" : undefined}
                    style={{ textDecoration:"none", fontSize:"0.82rem", fontWeight:600, transition:"color 0.2s, opacity 0.2s", position:"relative", paddingBottom:"4px",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      opacity: isActive ? 1 : 0.85,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.opacity = "0.85"; } }}>
                    {label}
                    <span style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", borderRadius:"2px", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", transform:isActive?"scaleX(1)":"scaleX(0)", transformOrigin:"left", transition:"transform 0.25s ease" }} />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Controls */}
          <div className="nav-controls" style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
            {/* Locale */}
            <select value={locale} onChange={e=>switchLocale(e.target.value)} aria-label="Language" className="nav-locale"
              style={{ fontSize:"0.75rem", fontWeight:600, padding:"0.32rem 1.6rem 0.32rem 0.65rem", borderRadius:"9999px", border:"1px solid var(--border)", background:"var(--bg-card)", color:"var(--text-secondary)", cursor:"pointer", outline:"none", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 0.5rem center" }}>
              {locales.map(l => (
                <option key={l} value={l} style={{ background:"var(--bg-secondary)", color:"var(--text-primary)" }}>{LOCALE_LABELS[l]}</option>
              ))}
            </select>

            {/* Theme */}
            <button onClick={toggleTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`} className="nav-theme"
              style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--bg-card)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", transition:"all 0.2s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(79,70,229,0.5)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor="var(--border)"; }}>
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
      <div style={{ position:"fixed", top:"64px", left:0, right:0, zIndex:499, background:"var(--nav-bg-scrolled)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderBottom:"1px solid var(--border)", padding:"1.25rem 1.5rem 2rem", display:"flex", flexDirection:"column", gap:"0.25rem", transform:menuOpen?"translateY(0)":"translateY(-110%)", transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)", pointerEvents:menuOpen?"all":"none" }} className="mobile-menu-panel">
        {navItems.map(({ key, href, label, newTab }) => (
          <a key={key} href={resolveHref(href, locale, pathname)}
            onClick={()=>{ handleNavClick(href); setMenuOpen(false); }}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noopener noreferrer" : undefined}
            style={{ fontSize:"1rem", fontWeight:600, color:"var(--text-secondary)", textDecoration:"none", padding:"0.875rem 0", borderBottom:"1px solid var(--border)", transition:"color 0.2s" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-primary)"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-secondary)"; }}>
            {label}
          </a>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 768px) { .desktop-nav { display: flex !important; } }
        @media (max-width: 767px) { .hamburger-btn { display: flex !important; } }
        /* Mobile brand: never let flexbox squeeze the brand into wrapping lines. The controls keep
           their size; the brand text stays on one line, and an over-long admin tagline ends in an
           ellipsis instead of wrapping into the controls. (overflow-x: clip keeps descenders.) */
        @media (max-width: 767px) {
          .nav-brand, .nav-brand-text { min-width: 0; }
          .nav-brand-logo, .nav-controls { flex-shrink: 0; }
          .nav-brand-name, .nav-brand-tagline { white-space: nowrap; }
          .nav-brand-tagline { overflow-x: clip; text-overflow: ellipsis; }
        }
        /* Narrow phones: logo + "W. Arya" + tagline + 3 controls need ~369px but only ~328px exist
           at 360px — reclaim the difference with small, even trims rather than hiding anything. */
        @media (max-width: 420px) {
          .section-container.nav-row { padding-left: 0.75rem; padding-right: 0.75rem; }
          .nav-brand { gap: 0.45rem !important; }
          .nav-brand-logo { height: 26px !important; }
          .nav-brand-tagline { font-size: 0.55rem !important; letter-spacing: 0.02em !important; }
          .nav-controls { gap: 0.4rem !important; }
          .nav-locale { padding: 0.3rem 1.4rem 0.3rem 0.55rem !important; }
          .nav-theme, .hamburger-btn { width: 34px !important; height: 34px !important; }
        }
      `,
        }}
      />
    </>
  );
}