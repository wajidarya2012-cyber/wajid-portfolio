"use client";

import { useEffect, useRef }  from "react";
import { useTranslations }    from "next-intl";
import type { Experience }    from "@/types";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}
function fmtYear(date: Date|string): string {
  try { return new Date(date).getFullYear().toString(); } catch { return ""; }
}

export type ExperienceSectionConfig = {
  title_en?: string; title_ps?: string; title_fa?: string;
  subtitle_en?: string; subtitle_ps?: string; subtitle_fa?: string;
  description_en?: string; description_ps?: string; description_fa?: string;
  visible?: boolean;
  order?: number;
  layout?: "timeline" | "cards" | "compact";
  background?: "default" | "transparent" | "gradient" | "image";
  backgroundImage?: string;
};

export default function ExperienceSection({ experience, locale, config }: { experience:Experience[]; locale:string; config?: ExperienceSectionConfig }) {
  const tl  = useTranslations("experience");
  const safeLocale = ["en","ps","fa"].includes(locale) ? locale : "en";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold:0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (config?.visible === false) return null;

  const items = experience
    .filter(e => (e as unknown as { visible?: boolean }).visible !== false)
    .sort((a, b) => {
      const af = (a as unknown as { featured?: boolean }).featured ? 1 : 0;
      const bf = (b as unknown as { featured?: boolean }).featured ? 1 : 0;
      return bf - af;
    });

  const customTitle       = config ? pick(config as unknown as Record<string,unknown>, "title", locale) : "";
  const subtitle           = config ? pick(config as unknown as Record<string,unknown>, "subtitle", locale) : "";
  const customDescription = config ? pick(config as unknown as Record<string,unknown>, "description", locale) : "";
  const layout = config?.layout ?? "timeline";
  const bg     = config?.background ?? "default";

  const bgStyle: React.CSSProperties =
    bg === "transparent" ? { background:"transparent" } :
    bg === "gradient"    ? { background:"linear-gradient(180deg, var(--bg-secondary) 0%, rgba(6,182,212,0.06) 50%, var(--bg-secondary) 100%)" } :
    { background:"var(--bg-secondary)", position:"relative" };

  function ExpMeta({ exp }: { exp: Experience }) {
    const e = exp as unknown as Record<string, unknown>;
    return (
      <>
        {e.employmentType ? (
          <span style={{ fontSize:"0.65rem", color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>
            {e.employmentType as string}
          </span>
        ) : null}
        {(e.achievements as string[] | undefined)?.length ? (
          <ul style={{ margin:"0.6rem 0 0.9rem", paddingLeft:"1.1rem", display:"flex", flexDirection:"column", gap:"0.3rem" }}>
            {(e.achievements as string[]).map((a, i) => (
              <li key={i} style={{ fontSize:"0.82rem", color:"var(--text-secondary)", lineHeight:1.6 }}>{a}</li>
            ))}
          </ul>
        ) : null}
      </>
    );
  }

  return (
    <section id="experience" style={{ padding:"5.5rem 0", ...bgStyle }}>
      {bg === "image" && config?.backgroundImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.backgroundImage} alt="" aria-hidden="true" loading="lazy"
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.14 }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, var(--bg-secondary) 0%, rgba(0,0,0,0.15) 40%, var(--bg-secondary) 100%)" }} />
        </>
      )}
      <div className="section-container" ref={ref} style={{ position:"relative", zIndex:1 }}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        {customTitle ? (
          <h2 className="section-title reveal reveal-delay-1">{customTitle}</h2>
        ) : (
          <h2 className="section-title reveal reveal-delay-1">Work <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Experience</span></h2>
        )}
        {subtitle && (
          <p className="reveal reveal-delay-1" style={{ fontSize:"clamp(0.95rem,1.8vw,1.1rem)", color:"var(--text-secondary)", fontWeight:500, marginTop:"-0.5rem", marginBottom:"0.5rem" }}>
            {subtitle}
          </p>
        )}
        <div className="divider reveal reveal-delay-2" style={{ marginBottom: customDescription ? "1rem" : "2.5rem" }} />
        {customDescription && (
          <p className="reveal reveal-delay-2" style={{ color:"var(--text-secondary)", fontSize:"0.9rem", marginBottom:"2.5rem", maxWidth:"560px" }}>
            {customDescription}
          </p>
        )}

        {/* TIMELINE layout (default) */}
        {layout === "timeline" && (
          <div style={{ position:"relative", paddingLeft:"1.5rem", borderLeft:"2px solid rgba(79,70,229,0.3)" }}>
            {items.map((exp, idx) => {
              const e = exp as unknown as Record<string, unknown>;
              return (
                <div key={exp.id} className="reveal" style={{ position:"relative", marginBottom: idx===items.length-1?"0":"2.25rem", transitionDelay:`${idx*0.1}s` }}>
                  <div style={{ position:"absolute", left:"-2.25rem", top:"1.25rem", width:"14px", height:"14px", borderRadius:"50%", background:G, boxShadow:"0 0 0 4px rgba(79,70,229,0.18)", flexShrink:0 }} />
                  <div className="glass-card" style={{ borderRadius:"16px", padding:"clamp(1rem,3vw,1.5rem)", marginLeft:"0.5rem", transition:"all 0.25s", minWidth:0, overflow:"hidden" }}
                    onMouseEnter={ev=>{ const el=ev.currentTarget as HTMLElement; el.style.transform="translateX(4px)"; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.boxShadow="0 8px 28px rgba(79,70,229,0.12)"; }}
                    onMouseLeave={ev=>{ const el=ev.currentTarget as HTMLElement; el.style.transform="none"; el.style.borderColor="var(--border)"; el.style.boxShadow="var(--shadow-card)"; }}>
                    <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between", gap:"0.5rem", marginBottom:"0.5rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", minWidth:0, flex:1 }}>
                        {e.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.logoUrl as string} alt="" style={{ width:"32px", height:"32px", borderRadius:"8px", objectFit:"cover", flexShrink:0, background:"#fff" }} />
                        ) : null}
                        <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(0.95rem,2vw,1.05rem)", wordBreak:"break-word", minWidth:0 }}>
                          {pick(exp as Record<string,unknown>,"role",safeLocale)} {e.featured ? <span title="Featured" style={{ fontSize:"0.75rem" }}>⭐</span> : null}
                        </h3>
                      </div>
                      <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.7rem", padding:"0.22rem 0.75rem", borderRadius:"9999px", background:"rgba(79,70,229,0.1)", border:"1px solid rgba(79,70,229,0.25)", color:"#06b6d4", whiteSpace:"nowrap", flexShrink:0 }}>
                        {fmtYear(exp.startDate)} — {exp.isCurrent ? tl("present") : exp.endDate ? fmtYear(exp.endDate) : ""}
                      </span>
                    </div>
                    <p style={{ fontWeight:600, fontSize:"0.875rem", color:"#818cf8", marginBottom:"0.75rem", wordBreak:"break-word" }}>
                      {pick(exp as Record<string,unknown>,"organization",safeLocale)}
                    </p>
                    <ExpMeta exp={exp} />
                    <p style={{ fontSize:"0.875rem", lineHeight:1.8, color:"var(--text-secondary)", marginBottom:"1rem", wordBreak:"break-word" }}>
                      {pick(exp as Record<string,unknown>,"description",safeLocale)}
                    </p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                      {exp.technologies.map(tech => (
                        <span key={tech} className="accent-badge" style={{ fontSize:"0.68rem" }}>{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {items.length===0 && (
              <p style={{ color:"var(--text-muted)", fontSize:"0.875rem", padding:"2rem 0.5rem" }}>No experience entries yet.</p>
            )}
          </div>
        )}

        {/* CARDS layout — grid of self-contained cards, no connecting line */}
        {layout === "cards" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))", gap:"1.25rem" }}>
            {items.map((exp, idx) => {
              const e = exp as unknown as Record<string, unknown>;
              return (
                <div key={exp.id} className="glass-card reveal" style={{ borderRadius:"16px", padding:"1.5rem", transitionDelay:`${idx*0.08}s`, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem" }}>
                    {e.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.logoUrl as string} alt="" style={{ width:"36px", height:"36px", borderRadius:"9px", objectFit:"cover", flexShrink:0, background:"#fff" }} />
                    ) : null}
                    <div style={{ minWidth:0 }}>
                      <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.95rem", wordBreak:"break-word" }}>
                        {pick(exp as Record<string,unknown>,"role",safeLocale)} {e.featured ? "⭐" : ""}
                      </h3>
                      <p style={{ fontWeight:600, fontSize:"0.82rem", color:"#818cf8" }}>{pick(exp as Record<string,unknown>,"organization",safeLocale)}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.68rem", color:"#06b6d4" }}>
                    {fmtYear(exp.startDate)} — {exp.isCurrent ? tl("present") : exp.endDate ? fmtYear(exp.endDate) : ""}
                    {e.employmentType ? ` · ${e.employmentType}` : ""}
                  </span>
                  <ExpMeta exp={exp} />
                  <p style={{ fontSize:"0.82rem", lineHeight:1.75, color:"var(--text-secondary)", margin:"0.75rem 0" }}>
                    {pick(exp as Record<string,unknown>,"description",safeLocale)}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                    {exp.technologies.map(tech => <span key={tech} className="accent-badge" style={{ fontSize:"0.65rem" }}>{tech}</span>)}
                  </div>
                </div>
              );
            })}
            {items.length===0 && (
              <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>No experience entries yet.</p>
            )}
          </div>
        )}

        {/* COMPACT layout — dense single-line rows */}
        {layout === "compact" && (
          <div className="glass-card reveal" style={{ borderRadius:"18px", padding:"clamp(1.25rem,3vw,2rem)" }}>
            {items.map((exp, idx) => {
              const e = exp as unknown as Record<string, unknown>;
              return (
                <div key={exp.id} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.8rem 0", borderBottom: idx===items.length-1?"none":"1px solid var(--border)" }}>
                  {e.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.logoUrl as string} alt="" style={{ width:"28px", height:"28px", borderRadius:"7px", objectFit:"cover", flexShrink:0, background:"#fff" }} />
                  ) : null}
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontSize:"0.85rem", fontWeight:600, wordBreak:"break-word" }}>
                      {pick(exp as Record<string,unknown>,"role",safeLocale)} {e.featured ? "⭐" : ""}
                    </span>
                    <span style={{ fontSize:"0.78rem", color:"#818cf8" }}> · {pick(exp as Record<string,unknown>,"organization",safeLocale)}</span>
                  </div>
                  <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.68rem", color:"var(--text-muted)", whiteSpace:"nowrap" }}>
                    {fmtYear(exp.startDate)} — {exp.isCurrent ? tl("present") : exp.endDate ? fmtYear(exp.endDate) : ""}
                  </span>
                </div>
              );
            })}
            {items.length===0 && (
              <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>No experience entries yet.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
