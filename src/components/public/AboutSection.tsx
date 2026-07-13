"use client";

import { useEffect, useRef } from "react";
import { useTranslations }   from "next-intl";
import type { Profile }       from "@/types";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default function AboutSection({ profile, locale }: { profile: Profile|null; locale:string }) {
  const tl  = useTranslations("about");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold:0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  type CoreValue = { icon:string; title_en:string; title_ps:string; title_fa:string; desc_en:string; desc_ps:string; desc_fa:string };
  const DEFAULT_VALUES: CoreValue[] = [
    { icon:"💡", title_en:"Innovation",    title_ps:"", title_fa:"", desc_en:"Solving complex problems with creative digital solutions", desc_ps:"", desc_fa:"" },
    { icon:"🛡️", title_en:"Reliability",   title_ps:"", title_fa:"", desc_en:"Building systems organizations can depend on",              desc_ps:"", desc_fa:"" },
    { icon:"🤝", title_en:"Collaboration", title_ps:"", title_fa:"", desc_en:"Working effectively with teams and stakeholders",           desc_ps:"", desc_fa:"" },
    { icon:"📈", title_en:"Growth",        title_ps:"", title_fa:"", desc_en:"Continuously learning and evolving with technology",        desc_ps:"", desc_fa:"" },
  ];
  const VALUES = ((profile?.coreValues as CoreValue[] | null) ?? DEFAULT_VALUES);

  const INFO = [
    { icon:"👤", label:tl("info.name"),          value: profile ? pick(profile as Record<string,unknown>,"fullName",locale) : "Wajid Ali Arya" },
    { icon:"💼", label:tl("info.role"),          value: "IT Manager · Software Developer · DBA · Network Specialist" },
    { icon:"🎓", label:tl("info.education"),     value: pick(profile as Record<string,unknown> ?? {}, "education", locale) || "B.Sc. Computer Science — IT & Networks" },
    { icon:"📍", label:tl("info.location"),      value: profile?.location ?? "Jalalabad, Nangarhar, Afghanistan" },
    { icon:"🛠️", label:tl("info.specialization"),value: pick(profile as Record<string,unknown> ?? {}, "specialization", locale) || "Database Admin · Networking · Software Dev · IT Security" },
    { icon:"🌐", label:tl("info.languages"),     value: pick(profile as Record<string,unknown> ?? {}, "languages", locale) || "Pashto · Dari · English" },
  ];

  return (
    <section id="about" style={{ padding:"5.5rem 0", background:"var(--bg-secondary)", position:"relative", overflow:"hidden" }}>
      {/* Ambient glow */}
      <div style={{ position:"absolute", top:"10%", right:"-10%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(79,70,229,0.08),transparent 70%)", pointerEvents:"none" }} />

      <div className="section-container" ref={ref} style={{ position:"relative", zIndex:1 }}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">About <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Me</span></h2>
        <div className="divider reveal reveal-delay-2" />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))", gap:"3rem", alignItems:"start" }}>

          {/* Left column */}
          <div className="reveal">
            <div className="glass-card" style={{ borderRadius:"20px", padding:"clamp(1.5rem,3vw,2.25rem)", marginBottom:"1.5rem", borderLeft:"3px solid #4f46e5" }}>
              <p style={{ fontSize:"clamp(0.92rem,1.6vw,1.05rem)", lineHeight:1.95, color:"var(--text-secondary)" }}>
                {profile ? pick(profile as Record<string,unknown>,"aboutText",locale) :
                  "Computer Science graduate with strong experience in IT Operations, Database Management, Networking, System Administration, and Software Development across multiple organizations in Afghanistan, building technology solutions that create real value."}
              </p>
            </div>

            {/* Values */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))", gap:"0.875rem" }}>
              {VALUES.map((v, idx) => (
                <div key={idx} className="glass-card" style={{ borderRadius:"16px", padding:"1.25rem", cursor:"default", transition:"all 0.3s", minWidth:0, transitionDelay:`${idx*0.06}s` }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(79,70,229,0.45)"; el.style.transform="translateY(-4px) scale(1.02)"; el.style.boxShadow="0 12px 32px rgba(79,70,229,0.18)"; }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="var(--border)"; el.style.transform="none"; el.style.boxShadow="var(--shadow-card)"; }}>
                  <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(79,70,229,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", marginBottom:"0.75rem" }}>
                    {v.icon}
                  </div>
                  <h4 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.9rem", marginBottom:"0.35rem", wordBreak:"break-word" }}>{pick(v as unknown as Record<string,unknown>, "title", locale)}</h4>
                  <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", lineHeight:1.65, margin:0 }}>{pick(v as unknown as Record<string,unknown>, "desc", locale)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — info panel */}
          <div className="reveal reveal-delay-1">
            <div className="glass-card" style={{ borderRadius:"20px", padding:"clamp(1.5rem,3vw,2rem)", minWidth:0 }}>
              <p style={{ fontSize:"0.68rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"#06b6d4", marginBottom:"1.25rem", fontFamily:"var(--font-fira)" }}>
                Quick Facts
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
                {INFO.map(({icon,label,value}, idx) => (
                  <div key={label} style={{ display:"flex", gap:"0.875rem", padding:"0.9rem 0", borderBottom: idx===INFO.length-1?"none":"1px solid var(--border)" }}>
                    <span style={{ fontSize:"1.1rem", flexShrink:0, opacity:0.85 }}>{icon}</span>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:"0.68rem", color:"var(--text-muted)", marginBottom:"0.2rem", textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</p>
                      <p style={{ fontWeight:600, fontSize:"0.85rem", margin:0, wordBreak:"break-word", overflowWrap:"anywhere", color:"var(--text-primary)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}