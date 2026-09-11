"use client";

import { useEffect, useRef }  from "react";
import { useTranslations }    from "next-intl";
import type { Experience }    from "@/types";
import { splitTitle }         from "@/lib/utils";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  const val = obj[`${field}_${locale}`] as string | undefined;
  return (val && val.trim() !== "" ? val : (obj[`${field}_en`] as string)) ?? "";
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
  const titleParts = splitTitle(tl("title"), tl("titleHighlight"));
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
        {(() => {
          const list = (safeLocale === "ps" ? (e.achievements_ps as string[] | undefined) :
                        safeLocale === "fa" ? (e.achievements_fa as string[] | undefined) :
                        undefined);
          const achievements = (list && list.length > 0) ? list : (e.achievements as string[] | undefined);
          return achievements && achievements.length > 0 ? (
            <ul style={{ margin:"0.6rem 0 0.9rem", paddingLeft:"1.1rem", display:"flex", flexDirection:"column", gap:"0.3rem" }}>
              {achievements.map((a, i) => (
                <li key={i} style={{ fontSize:"0.82rem", color:"var(--text-secondary)", lineHeight:1.6 }}>{a}</li>
              ))}
            </ul>
          ) : null;
        })()}
      </>
    );
  }

  return (
    <section id="experience" style={{ padding:"4.25rem 0", ...bgStyle }}>
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
          <h2 className="section-title reveal reveal-delay-1">
            {titleParts ? <>{titleParts.before}<span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{titleParts.match}</span>{titleParts.after}</> : tl("title")}
          </h2>
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

        {/* TIMELINE layout (default) — Phase 34: rebuilt as a CV career history.
            Was one glass-card per role with an indigo date pill, indigo organisation text
            and cyan technology pills. Now: date first, then role, then organisation, then
            summary/achievements — the reading order of a professional CV — carried by
            typography and a single rail instead of a card per job.
            Rail/dot/offset use LOGICAL properties so the timeline mirrors correctly in
            Pashto/Dari; the previous paddingLeft + borderLeft + left:-2.25rem put the rail
            on the wrong side in RTL. */}
        {layout === "timeline" && (
          <div style={{ position:"relative", paddingInlineStart:"1.75rem", borderInlineStart:"1px solid var(--border)" }}>
            {items.map((exp, idx) => {
              const e = exp as unknown as Record<string, unknown>;
              const period = `${fmtYear(exp.startDate)} — ${exp.isCurrent ? tl("present") : exp.endDate ? fmtYear(exp.endDate) : ""}`;
              return (
                <div key={exp.id} className="reveal" style={{ position:"relative", marginBottom: idx===items.length-1?"0":"2.75rem", transitionDelay:`${idx*0.1}s`, minWidth:0 }}>
                  <span aria-hidden style={{ position:"absolute", insetInlineStart:"-2.03rem", top:"0.45rem", width:"9px", height:"9px", borderRadius:"50%", background: exp.isCurrent ? "#4f46e5" : "var(--border-hover)", outline:"3px solid var(--bg-secondary)" }} />

                  <p style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-muted)", marginBottom:"0.3rem" }}>
                    {period}{e.employmentType ? ` · ${e.employmentType as string}` : ""}
                  </p>

                  <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", minWidth:0, marginBottom:"0.15rem" }}>
                    {e.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.logoUrl as string} alt="" style={{ width:"28px", height:"28px", borderRadius:"6px", objectFit:"cover", flexShrink:0, background:"#fff" }} />
                    ) : null}
                    <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(1.05rem,2.2vw,1.2rem)", lineHeight:1.3, wordBreak:"break-word", minWidth:0 }}>
                      {pick(exp as Record<string,unknown>,"role",safeLocale)}
                      {e.featured ? <span title={tl("featured")} style={{ fontSize:"0.8rem", marginInlineStart:"0.35rem" }}>⭐</span> : null}
                    </h3>
                  </div>

                  <p style={{ fontSize:"0.95rem", fontWeight:500, color:"var(--text-secondary)", marginBottom:"0.7rem", wordBreak:"break-word" }}>
                    {pick(exp as Record<string,unknown>,"organization",safeLocale)}
                  </p>

                  <p style={{ fontSize:"0.92rem", lineHeight:1.75, color:"var(--text-secondary)", marginBottom:"0.2rem", wordBreak:"break-word", maxWidth:"62ch" }}>
                    {pick(exp as Record<string,unknown>,"description",safeLocale)}
                  </p>

                  <ExpMeta exp={exp} />

                  {exp.technologies.length > 0 && (
                    <p style={{ fontSize:"0.85rem", color:"var(--text-muted)", marginTop:"0.7rem", lineHeight:1.7, wordBreak:"break-word" }}>
                      <span style={{ fontWeight:600, color:"var(--text-secondary)" }}>{tl("technologies")}: </span>
                      {exp.technologies.join(" · ")}
                    </p>
                  )}
                </div>
              );
            })}
            {items.length===0 && (
              <p style={{ color:"var(--text-muted)", fontSize:"0.9rem", padding:"2rem 0.5rem" }}>{tl("noEntries")}</p>
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
              <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>{tl("noEntries")}</p>
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
              <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>{tl("noEntries")}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
