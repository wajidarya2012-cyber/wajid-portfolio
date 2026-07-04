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

  const VALUES = [
    { icon:"💡", key:"innovation" }, { icon:"🛡️", key:"reliability" },
    { icon:"🤝", key:"collaboration" }, { icon:"📈", key:"growth" },
  ] as const;

  const INFO = [
    { label:tl("info.name"),          value: profile ? pick(profile as Record<string,unknown>,"fullName",locale) : "Wajid Ali Arya" },
    { label:tl("info.role"),          value: "IT Manager · Software Developer · DBA · Network Specialist" },
    { label:tl("info.education"),     value: "B.Sc. Computer Science — IT & Networks" },
    { label:tl("info.location"),      value: profile?.location ?? "Jalalabad, Nangarhar, Afghanistan" },
    { label:tl("info.specialization"),value: "Database Admin · Networking · Software Dev · IT Security" },
    { label:tl("info.languages"),     value: "Pashto · Dari · English" },
  ];

  return (
    <section id="about" style={{ padding:"5.5rem 0", background:"var(--bg-secondary)" }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">About <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Me</span></h2>
        <div className="divider reveal reveal-delay-2" />

        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"2.5rem" }}>

          {/* Bio */}
          <div className="reveal">
            <p style={{ fontSize:"clamp(0.9rem,1.5vw,1rem)", lineHeight:1.9, color:"var(--text-secondary)", maxWidth:"min(700px,100%)", marginBottom:"2rem" }}>
              {profile ? pick(profile as Record<string,unknown>,"aboutText",locale) :
                "Computer Science graduate with strong experience in IT Operations, Database Management, Networking, System Administration, and Software Development across multiple organizations in Afghanistan, building technology solutions that create real value."}
            </p>

            {/* Values */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))", gap:"0.875rem" }}>
              {VALUES.map(({icon,key}) => (
                <div key={key} className="glass-card" style={{ borderRadius:"14px", padding:"1.1rem", cursor:"default", transition:"all 0.25s", minWidth:0 }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 8px 28px rgba(79,70,229,0.15)"; }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="var(--border)"; el.style.transform="none"; el.style.boxShadow="var(--shadow-card)"; }}>
                  <span style={{ fontSize:"1.5rem", display:"block", marginBottom:"0.6rem" }}>{icon}</span>
                  <h4 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.88rem", marginBottom:"0.3rem", wordBreak:"break-word" }}>{tl(`values.${key}`)}</h4>
                  <p style={{ fontSize:"0.76rem", color:"var(--text-muted)", lineHeight:1.6, margin:0 }}>{tl(`values.${key}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:"0.625rem", minWidth:0 }} className="reveal reveal-delay-1">
            {INFO.map(({label,value}) => (
              <div key={label} className="glass-card" style={{ borderRadius:"12px", padding:"0.875rem 1.25rem", borderLeft:"3px solid #4f46e5", transition:"transform 0.2s", minWidth:0, overflow:"hidden" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform="translateX(5px)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform="none"; }}>
                <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.68rem", color:"#06b6d4", marginBottom:"0.2rem", letterSpacing:"0.05em" }}>{label}</p>
                <p style={{ fontWeight:600, fontSize:"0.875rem", margin:0, wordBreak:"break-word", overflowWrap:"anywhere" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}