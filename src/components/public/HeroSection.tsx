"use client";

import { useEffect, useRef, useState } from "react";
import Image                  from "next/image";
import { useTranslations }    from "next-intl";
import type { Profile }       from "@/types";
import AnalyticsTracker       from "./AnalyticsTracker";

const G = "linear-gradient(135deg,#4f46e5 0%,#06b6d4 100%)";

const DEFAULT_TECHS = ["Python","Java","C++","Oracle DB","MS SQL Server","Node.js","Network Mgmt","IT Security"];
const BG_ROTATE_MS = 6500;

type RoleItem = { en?: string; ps?: string; fa?: string };

function pickLocale<T extends Record<string, unknown>>(obj: T | null | undefined, field: string, locale: string, fallback = ""): string {
  if (!obj) return fallback;
  const val = (obj[`${field}_${locale}`] ?? obj[`${field}_en`]) as string | undefined;
  return val || fallback;
}

export default function HeroSection({ profile, locale, heroBgImages = [] }: { profile: Profile | null; locale: string; heroBgImages?: string[] }) {
  const t         = useTranslations("hero");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const typeRef   = useRef<HTMLSpanElement>(null);
  const [bgIndex, setBgIndex] = useState(0);

  const p = (profile ?? {}) as unknown as Record<string, unknown>;

  // Visibility toggles — missing keys default to visible (true).
  const visibility = (p.heroVisibility as Record<string, boolean> | null) ?? {};
  const show = (key: string) => visibility[key] !== false;

  /* ── Background slideshow rotation ── */
  useEffect(() => {
    if (!show("showBackground") || heroBgImages.length <= 1) return;
    const id = setInterval(() => setBgIndex(i => (i + 1) % heroBgImages.length), BG_ROTATE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroBgImages.length]);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d")!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);

    type P = { x:number;y:number;sx:number;sy:number;size:number;op:number;char:boolean };
    const pts: P[] = Array.from({ length:60 }, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      sx:(Math.random()-.5)*.35, sy:(Math.random()-.5)*.35,
      size:Math.random()*1.4+.4, op:Math.random()*.35+.08,
      char:Math.random()>.65,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.x+=p.sx; p.y+=p.sy;
        if(p.x<0||p.x>canvas.width)  p.x=Math.random()*canvas.width;
        if(p.y<0||p.y>canvas.height) p.y=Math.random()*canvas.height;
        ctx.globalAlpha=p.op;
        if(p.char){ ctx.fillStyle="#4f46e5"; ctx.font=`${p.size*7}px monospace`; ctx.fillText(Math.random()>.5?"0":"1",p.x,p.y); }
        else { ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fillStyle=Math.random()>.5?"#4f46e5":"#06b6d4"; ctx.fill(); }
      });
      ctx.globalAlpha=1;
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);

  /* ── Typewriter (rotating roles) ── */
  useEffect(() => {
    let phrases = ["IT & Network Manager","Software Developer","Database Administrator","Network & Systems Specialist","Technology Consultant"];
    const customRoles = p.heroRoles as RoleItem[] | null;
    if (Array.isArray(customRoles) && customRoles.length > 0) {
      const localised = customRoles.map(r => (locale==="ps" ? r.ps : locale==="fa" ? r.fa : r.en) || r.en).filter(Boolean) as string[];
      if (localised.length > 0) phrases = localised;
    } else {
      try { const r = t.raw("roles"); if (Array.isArray(r)) phrases = r as string[]; } catch {}
    }
    let pi=0, ci=0, del=false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const el=typeRef.current; if(!el) return;
      const ph=phrases[pi];
      if(!del){ el.textContent=ph.slice(0,ci+1); ci++; if(ci===ph.length){del=true;timer=setTimeout(tick,2000);return;} }
      else    { el.textContent=ph.slice(0,ci-1); ci--; if(ci===0){del=false;pi=(pi+1)%phrases.length;} }
      timer=setTimeout(tick,del?50:80);
    };
    timer=setTimeout(tick,800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, locale]);

  const fullName = locale==="ps" ? profile?.fullName_ps
                 : locale==="fa" ? profile?.fullName_fa
                 : profile?.fullName_en ?? "Wajid Ali Arya";
  const bio      = locale==="ps" ? profile?.bio_ps
                 : locale==="fa" ? profile?.bio_fa
                 : profile?.bio_en;

  const availableText = (locale==="ps" ? profile?.availableText_ps : locale==="fa" ? profile?.availableText_fa : profile?.availableText_en)
                       || profile?.availableText_en || "Available for Opportunities";
  const badgeTitle    = (locale==="ps" ? profile?.badgeTitle_ps : locale==="fa" ? profile?.badgeTitle_fa : profile?.badgeTitle_en)
                       || profile?.badgeTitle_en || "CS Graduate";
  const badgeSub      = (locale==="ps" ? profile?.badgeSub_ps : locale==="fa" ? profile?.badgeSub_fa : profile?.badgeSub_en)
                       || profile?.badgeSub_en || "IT & Networks";
  const yearsExp      = profile?.yearsExperience ?? 8;
  const projectsCnt   = profile?.projectsCount   ?? 4;

  // Greeting kicker (optional) — falls back to the built-in translation, admin can override per-locale.
  const greeting = pickLocale(p, "heroGreeting", locale, t("greeting"));
  // Subtitle — reuses the existing Professional Title field.
  const subtitle = pickLocale(p, "title", locale);

  // Primary/secondary CTA — falls back to the original hardcoded Contact/CV-download behaviour.
  const ctaPrimaryText  = pickLocale(p, "heroCtaPrimaryText", locale, t("contactBtn"));
  const ctaPrimaryUrl   = (p.heroCtaPrimaryUrl as string) || "#contact";
  const customSecondary = (p.heroCtaSecondaryUrl as string) || "";
  const ctaSecondaryText = pickLocale(p, "heroCtaSecondaryText", locale, t("cvBtn"));
  const ctaSecondaryUrl  = customSecondary || (profile?.cvUrl ? `${profile.cvUrl}?fl_attachment=CV` : "#contact");
  const ctaSecondaryIsExternal = !!customSecondary || !!profile?.cvUrl;

  // Social links — built from existing Profile contact/social fields, empty ones hidden automatically.
  const socialLinks = [
    profile?.linkedinUrl && { label:"LinkedIn", icon:"in",  href: profile.linkedinUrl },
    profile?.githubUrl   && { label:"GitHub",   icon:"gh",  href: profile.githubUrl },
    profile?.twitterUrl  && { label:"Twitter",  icon:"tw",  href: profile.twitterUrl },
    profile?.websiteUrl  && { label:"Website",  icon:"www", href: profile.websiteUrl },
    profile?.email        && { label:"Email",    icon:"@",   href: `mailto:${profile.email}` },
    profile?.phone         && { label:"Phone",    icon:"📞",  href: `tel:${profile.phone}` },
  ].filter(Boolean) as { label:string; icon:string; href:string }[];

  const techTags = (Array.isArray(p.heroTechTags) && (p.heroTechTags as string[]).length > 0)
    ? (p.heroTechTags as string[])
    : DEFAULT_TECHS;

  const showBg = show("showBackground") && heroBgImages.length > 0;

  return (
    <section id="hero" style={{ minHeight:"100vh", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", paddingTop:"64px", background:"var(--bg-primary)" }}>
      {/* Optional background image / slideshow */}
      {showBg && (
        <>
          {heroBgImages.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? "eager" : "lazy"}
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: i === bgIndex ? 0.32 : 0, transition:"opacity 1.4s ease" }}
            />
          ))}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, var(--bg-primary) 0%, rgba(0,0,0,0.25) 40%, var(--bg-primary) 100%)" }} />
        </>
      )}
      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.28, pointerEvents:"none" }} />
      {/* Radial glow */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 65% 45%, rgba(79,70,229,0.1), transparent)", pointerEvents:"none" }} />
      {/* Bottom gradient fade */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"180px", background:"linear-gradient(to top,var(--bg-primary),transparent)", pointerEvents:"none" }} />

      <div className="section-container" style={{ position:"relative", zIndex:1, width:"100%", paddingTop:"3.5rem", paddingBottom:"4rem" }}>
        <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,340px)", gap:"clamp(2rem,5vw,4rem)", alignItems:"center" }}>

          {/* ── LEFT ── */}
          <div>
            {/* Available badge */}
            {show("showAvailabilityBadge") && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.35rem 0.875rem 0.35rem 0.625rem", borderRadius:"9999px", border:"1px solid rgba(79,70,229,0.3)", background:"rgba(79,70,229,0.08)", marginBottom:"1.75rem", backdropFilter:"blur(8px)" }}>
                <span style={{ display:"inline-block", width:"7px", height:"7px", borderRadius:"50%", background:"#06b6d4", animation:"pulseDot 2.2s ease-in-out infinite", flexShrink:0 }} />
                <span style={{ fontSize:"0.72rem", fontWeight:600, color:"#06b6d4", fontFamily:"var(--font-fira)", letterSpacing:"0.04em" }}>
                  {availableText}
                </span>
              </div>
            )}

            {/* Greeting kicker */}
            {show("showGreeting") && greeting && (
              <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.9rem", color:"var(--text-muted)", marginBottom:"0.5rem" }}>
                {greeting}
              </p>
            )}

            {/* Name */}
            <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"clamp(1.9rem,5vw,3.8rem)", fontWeight:800, lineHeight:1.08, letterSpacing:"-0.03em", marginBottom:"0.5rem", color:"var(--text-primary)", wordBreak:"break-word" }}>
              {fullName}
            </h1>

            {/* Subtitle (Professional Title) */}
            {show("showSubtitle") && subtitle && (
              <p style={{ fontFamily:"var(--font-syne)", fontSize:"clamp(1rem,2.2vw,1.2rem)", fontWeight:600, color:"var(--text-secondary)", marginBottom:"0.5rem" }}>
                {subtitle}
              </p>
            )}

            {/* Typewriter */}
            <div style={{ fontFamily:"var(--font-fira)", fontSize:"clamp(0.875rem,2vw,1rem)", color:"#06b6d4", marginBottom:"1.25rem", minHeight:"1.6rem", display:"flex", alignItems:"center", gap:"2px" }}>
              <span ref={typeRef} />
              <span style={{ display:"inline-block", width:"2px", height:"1.1em", background:"#06b6d4", animation:"blink 1s step-end infinite", verticalAlign:"middle", flexShrink:0 }} />
            </div>

            {/* Bio */}
            <p style={{ fontSize:"clamp(0.875rem,1.5vw,1rem)", lineHeight:1.85, color:"var(--text-secondary)", maxWidth:"min(520px,100%)", marginBottom:"2rem" }}>
              {bio ?? t("bio")}
            </p>

            {/* CTA buttons */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.875rem", marginBottom:"2.25rem" }}>
              <a href={ctaPrimaryUrl} className="btn-primary">✉ {ctaPrimaryText}</a>
              <a href={ctaSecondaryUrl} target={ctaSecondaryIsExternal ? "_blank" : "_self"} rel="noopener noreferrer" className="btn-secondary">
                ↓ {ctaSecondaryText}
              </a>
            </div>

            {/* Social links */}
            {show("showSocialLinks") && socialLinks.length > 0 && (
              <div style={{ display:"flex", gap:"0.625rem", marginBottom:"2.5rem", flexWrap:"wrap" }}>
                {socialLinks.map(({ label, icon, href }) => (
                  <a key={label} href={href} aria-label={label}
                    style={{ width:"40px", height:"40px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--bg-card)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, color:"var(--text-secondary)", textDecoration:"none", transition:"all 0.2s", backdropFilter:"blur(10px)" }}
                    onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="#4f46e5"; el.style.color="#818cf8"; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 6px 20px rgba(79,70,229,0.3)"; }}
                    onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="var(--border)"; el.style.color="var(--text-secondary)"; el.style.transform="none"; el.style.boxShadow="none"; }}>
                    {icon}
                  </a>
                ))}
              </div>
            )}

            {/* Featured tech stack */}
            {show("showTechTags") && techTags.length > 0 && (
              <div>
                <p style={{ fontSize:"0.68rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--text-muted)", marginBottom:"0.75rem", fontFamily:"var(--font-fira)" }}>
                  Core Technologies
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.45rem" }}>
                  {techTags.map(tech => (
                    <span key={tech} className="tag-badge">{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — photo ── */}
          <div className="hero-photo-col" style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
            <div style={{ position:"relative", width:"320px", height:"320px" }}>
              {/* Outer spinning ring */}
              <div style={{ position:"absolute", inset:"-22px", borderRadius:"50%", border:"2px dashed rgba(79,70,229,0.28)", animation:"spinSlow 24s linear infinite", pointerEvents:"none" }} />
              {/* Inner glow ring */}
              <div style={{ position:"absolute", inset:"-8px", borderRadius:"50%", background:"conic-gradient(from 0deg,#4f46e5,#06b6d4,#4f46e5)", opacity:0.15, animation:"spinSlow 8s linear infinite reverse", pointerEvents:"none" }} />

              {/* Photo */}
              <div style={{ width:"320px", height:"320px", borderRadius:"50%", padding:"3px", background:G, animation:"float 7s ease-in-out infinite", boxShadow:"0 0 60px rgba(79,70,229,0.35)" }}>
                <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"var(--bg-secondary)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {profile?.photoUrl
                    ? <Image src={profile.photoUrl} alt={fullName ?? "Wajid Ali Arya"} width={320} height={320} style={{ objectFit:"cover", objectPosition:"center 30%", width:"100%", height:"100%" }} priority unoptimized />
                    : (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.5rem" }}>
                        <span style={{ fontSize:"5rem", opacity:0.3 }}>👤</span>
                        <span style={{ fontSize:"0.65rem", color:"var(--text-muted)", fontFamily:"var(--font-fira)", textAlign:"center", padding:"0 1rem" }}>Upload photo in Admin</span>
                      </div>
                    )
                  }
                </div>
              </div>

              {/* CS badge */}
              {show("showProfileBadge") && (
                <div className="glass-card" style={{ position:"absolute", top:"8px", left:"-24px", borderRadius:"14px", padding:"0.65rem 0.875rem", display:"flex", alignItems:"center", gap:"0.5rem", animation:"float 7s ease-in-out infinite", animationDelay:"-2s" }}>
                  <span style={{ fontSize:"1.3rem" }}>🏆</span>
                  <div>
                    <p style={{ fontSize:"0.68rem", fontWeight:700, lineHeight:1.2, margin:0 }}>{badgeTitle}</p>
                    <p style={{ fontSize:"0.6rem", color:"var(--text-muted)", margin:0 }}>{badgeSub}</p>
                  </div>
                </div>
              )}

              {/* Stats badge */}
              {show("showStats") && (
                <div className="glass-card" style={{ position:"absolute", bottom:"8px", right:"-24px", borderRadius:"14px", padding:"0.65rem 1rem", display:"flex", gap:"0.875rem", alignItems:"center", animation:"float 7s ease-in-out infinite", animationDelay:"-4s" }}>
                  {[{n:`${yearsExp}+`,l:t("yearsShort")},{n:`${projectsCnt}+`,l:t("projectsShort")}].map(({n,l},i) => (
                    <div key={l} style={{ textAlign:"center" }}>
                      <p style={{ fontFamily:"var(--font-syne)", fontSize:"1.3rem", fontWeight:800, margin:0, background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</p>
                      <p style={{ fontSize:"0.58rem", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", margin:0 }}>{l}</p>
                      {i===0 && <div style={{ position:"absolute", top:"25%", right:"50%", width:"1px", height:"50%", background:"var(--border)" }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {show("showScrollIndicator") && (
        <a href="#about" aria-label="Scroll to next section"
          style={{ position:"absolute", bottom:"1.75rem", left:"50%", transform:"translateX(-50%)", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"0.35rem", textDecoration:"none", opacity:0.6, transition:"opacity 0.2s", animation:"bounceDown 2.4s ease-in-out infinite" }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.opacity="1"; }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.opacity="0.6"; }}>
          <span style={{ width:"22px", height:"36px", borderRadius:"12px", border:"2px solid var(--text-muted)", display:"flex", justifyContent:"center", padding:"6px 0" }}>
            <span style={{ width:"4px", height:"8px", borderRadius:"2px", background:"var(--text-muted)", animation:"scrollDot 1.8s ease-in-out infinite" }} />
          </span>
        </a>
      )}

      <AnalyticsTracker page={`/${locale}`} event="PAGE_VIEW" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bounceDown { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(6px); } }
        @keyframes scrollDot  { 0%,100% { opacity: 1; transform: translateY(0); } 50% { opacity: 0.3; transform: translateY(8px); } }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; gap: 2rem !important; }
          .hero-photo-col { order: -1; }
          .hero-grid > div:first-child > div { justify-content: center; }
          .hero-grid > div:first-child > div[style*="flex-wrap"] { justify-content: center; }
          .hero-grid > div:first-child { padding: 0 0.5rem; }
        }
        @media (max-width: 600px) {
          .hero-photo-col > div { width: 220px !important; height: 220px !important; }
          .hero-photo-col > div > div:nth-child(3) { width: 220px !important; height: 220px !important; }
        }
        @media (max-width: 380px) {
          .hero-photo-col > div { width: 180px !important; height: 180px !important; }
          .hero-photo-col > div > div:nth-child(3) { width: 180px !important; height: 180px !important; }
        }
      `,
        }}
      />
    </section>
  );
}
