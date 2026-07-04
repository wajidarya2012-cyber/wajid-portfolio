"use client";

import { useState, useEffect, useRef } from "react";
import Image                            from "next/image";
import { useTranslations }              from "next-intl";
import type { ProjectWithRelations }    from "@/types";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

const THUMB_BG: Record<string,string> = {
  healthcare:     "linear-gradient(135deg,rgba(79,70,229,0.28),rgba(6,182,212,0.18))",
  government:     "linear-gradient(135deg,rgba(245,158,11,0.22),rgba(249,115,22,0.18))",
  transportation: "linear-gradient(135deg,rgba(16,185,129,0.22),rgba(6,182,212,0.18))",
  security:       "linear-gradient(135deg,rgba(239,68,68,0.22),rgba(168,85,247,0.18))",
};
const THUMB_EMOJI: Record<string,string> = {
  healthcare:"🦷", government:"🚗", transportation:"🚌", security:"🛡️",
};

export default function ProjectsSection({ projects, locale }: { projects: ProjectWithRelations[]; locale: string }) {
  const tl                      = useTranslations("projects");
  const [active, setActive]     = useState("all");
  const [selected, setSelected] = useState<ProjectWithRelations|null>(null);
  const ref                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.05 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const cats    = ["all", ...Array.from(new Set(projects.map(p => p.category?.slug ?? "general")))];
  const filtered = active === "all" ? projects : projects.filter(p => p.category?.slug === active);

  return (
    <>
      <section id="projects" style={{ padding:"5.5rem 0", background:"var(--bg-primary)" }}>
        <div className="section-container" ref={ref}>
          <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
          <h2 className="section-title reveal reveal-delay-1">
            Software{" "}
            <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Projects</span>
          </h2>
          <div className="divider reveal reveal-delay-2" />
          <p className="reveal reveal-delay-3" style={{ color:"var(--text-secondary)", fontSize:"0.95rem", marginBottom:"2rem", maxWidth:"520px" }}>
            {tl("desc")}
          </p>

          {/* Filter */}
          <div className="reveal" style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"2.5rem" }}>
            {cats.map(cat => (
              <button key={cat} onClick={() => setActive(cat)}
                style={{ padding:"0.4rem 1.1rem", borderRadius:"9999px", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s", border:"1px solid",
                  borderColor: active===cat ? "#4f46e5" : "var(--border)",
                  background:  active===cat ? "#4f46e5" : "var(--bg-card)",
                  color:       active===cat ? "#fff"    : "var(--text-secondary)",
                }}>
                {cat === "all" ? tl("filters.all") : cat.charAt(0).toUpperCase()+cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,280px),1fr))", gap:"1.25rem" }}>
            {filtered.map((project, idx) => {
              const slug  = project.category?.slug ?? "general";
              const thumb = project.images[0];
              return (
                <article key={project.id} className="glass-card reveal" onClick={() => setSelected(project)}
                  style={{ borderRadius:"16px", overflow:"hidden", cursor:"pointer", transition:"all 0.3s", transitionDelay:`${idx*0.06}s`, minWidth:0, display:"flex", flexDirection:"column" }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-5px)"; el.style.borderColor="rgba(79,70,229,0.45)"; el.style.boxShadow="0 16px 40px rgba(79,70,229,0.2)"; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform="none"; el.style.borderColor="var(--border)"; el.style.boxShadow="var(--shadow-card)"; }}>

                  {/* Thumbnail */}
                  <div style={{ height:"160px", background:THUMB_BG[slug]??"linear-gradient(135deg,rgba(79,70,229,0.2),rgba(6,182,212,0.12))", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", flexShrink:0 }}>
                    {thumb
                      ? <Image src={thumb.url} alt={pick(project as Record<string,unknown>,"title",locale)} fill style={{ objectFit:"cover" }} />
                      : <span style={{ fontSize:"3rem" }}>{THUMB_EMOJI[slug]??"💻"}</span>
                    }
                    {project.featured && (
                      <span style={{ position:"absolute", top:"0.75rem", right:"0.75rem", background:"rgba(79,70,229,0.88)", color:"white", fontSize:"0.62rem", fontWeight:700, padding:"0.2rem 0.6rem", borderRadius:"9999px", backdropFilter:"blur(8px)" }}>
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <div style={{ padding:"1.25rem", display:"flex", flexDirection:"column", flex:1 }}>
                    <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.65rem", color:"#06b6d4", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"0.35rem" }}>
                      {pick((project.category ?? {name_en:"General"}) as Record<string,unknown>, "name", locale)}
                    </p>
                    <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(0.9rem,2vw,1rem)", marginBottom:"0.5rem", lineHeight:1.3, wordBreak:"break-word" }}>
                      {pick(project as Record<string,unknown>, "title", locale)}
                    </h3>
                    <p style={{ fontSize:"0.82rem", color:"var(--text-secondary)", lineHeight:1.7, marginBottom:"0.875rem", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden", flex:1 }}>
                      {pick(project as Record<string,unknown>, "description", locale)}
                    </p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem", marginBottom:"0.875rem" }}>
                      {project.technologies.slice(0,4).map(t => (
                        <span key={t} className="tag-badge" style={{ fontSize:"0.65rem" }}>{t}</span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="tag-badge" style={{ fontSize:"0.65rem" }}>+{project.technologies.length-4}</span>
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
                      <span style={{ fontSize:"0.78rem", fontWeight:600, color:"#06b6d4" }}>
                        {tl("viewDetails")} →
                      </span>
                      {project.viewCount > 0 && (
                        <span style={{ fontSize:"0.68rem", color:"var(--text-muted)", fontFamily:"var(--font-fira)" }}>
                          👁 {project.viewCount}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
              <p style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>🔍</p>
              <p>No projects in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"fadeIn 0.2s ease" }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"20px", maxWidth:"720px", width:"100%", maxHeight:"88vh", overflowY:"auto", animation:"scaleIn 0.25s ease" }}>

            {/* Modal header */}
            <div style={{ padding:"1.5rem 1.5rem 1rem", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", position:"sticky", top:0, background:"var(--bg-secondary)", zIndex:1 }}>
              <div>
                <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.68rem", color:"#06b6d4", marginBottom:"0.3rem", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                  {pick((selected.category ?? {}) as Record<string,unknown>, "name", locale)}
                </p>
                <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"1.15rem" }}>
                  {pick(selected as Record<string,unknown>, "title", locale)}
                </h3>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ width:"34px", height:"34px", borderRadius:"50%", border:"1px solid var(--border)", background:"transparent", color:"var(--text-secondary)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0, transition:"all 0.2s" }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="#4f46e5"; el.style.color="#818cf8"; }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="var(--border)"; el.style.color="var(--text-secondary)"; }}>
                ✕
              </button>
            </div>

            <div style={{ padding:"1.5rem" }}>
              {/* Technologies */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"1.25rem" }}>
                {selected.technologies.map(t => <span key={t} className="tag-badge">{t}</span>)}
              </div>

              <p style={{ fontSize:"0.9rem", lineHeight:1.85, color:"var(--text-secondary)", marginBottom:"1.5rem" }}>
                {pick(selected as Record<string,unknown>, "description", locale)}
              </p>

              {selected.features.length > 0 && (
                <div style={{ marginBottom:"1.5rem" }}>
                  <h4 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.875rem", color:"#06b6d4", marginBottom:"0.75rem" }}>✅ {tl("features")}</h4>
                  <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                    {selected.features.map(f => (
                      <li key={f.id} style={{ display:"flex", gap:"0.6rem", fontSize:"0.875rem", color:"var(--text-secondary)", lineHeight:1.6 }}>
                        <span style={{ color:"#4f46e5", marginTop:"0.15rem", flexShrink:0 }}>›</span>
                        {pick(f as Record<string,unknown>, "text", locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pick(selected as Record<string,unknown>, "challenge", locale) && (
                <div style={{ marginBottom:"1.5rem" }}>
                  <h4 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.875rem", color:"#06b6d4", marginBottom:"0.5rem" }}>🧩 {tl("challenge")}</h4>
                  <p style={{ fontSize:"0.875rem", lineHeight:1.85, color:"var(--text-secondary)" }}>
                    {pick(selected as Record<string,unknown>, "challenge", locale)}
                  </p>
                </div>
              )}

              {/* Gallery */}
              {selected.images.length > 1 && (
                <div>
                  <h4 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.875rem", color:"#06b6d4", marginBottom:"0.75rem" }}>🖼 {tl("gallery")}</h4>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"0.625rem" }}>
                    {selected.images.map(img => (
                      <div key={img.id} style={{ position:"relative", aspectRatio:"16/9", borderRadius:"10px", overflow:"hidden" }}>
                        <Image src={img.url} alt={img.caption??""} fill style={{ objectFit:"cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External links */}
              {selected.links.length > 0 && (
                <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", marginTop:"1.5rem", paddingTop:"1.25rem", borderTop:"1px solid var(--border)" }}>
                  {selected.links.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-secondary"
                      style={{ fontSize:"0.82rem", padding:"0.55rem 1.25rem" }}>
                      {pick(link as Record<string,unknown>, "label", locale)} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}