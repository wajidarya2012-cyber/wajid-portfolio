"use client";

import { useEffect, useRef } from "react";
import { useTranslations }   from "next-intl";
import type { Certification } from "@/types";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default function CertSection({ certifications, locale }: { certifications:Certification[]; locale:string }) {
  const tl  = useTranslations("certifications");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold:0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="certifications" style={{ padding:"5.5rem 0", background:"var(--bg-secondary)" }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">Certifications &amp; <span style={{ background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Trainings</span></h2>
        <div className="divider reveal reveal-delay-2" style={{ marginBottom:"2.5rem" }} />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:"1.25rem" }}>
          {certifications.map((cert, idx) => (
            <div key={cert.id} className="glass-card reveal" style={{ borderRadius:"16px", padding:"clamp(1.25rem,3vw,1.75rem)", textAlign:"center", transition:"all 0.25s", transitionDelay:`${idx*0.08}s`, minWidth:0, display:"flex", flexDirection:"column", alignItems:"center" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-5px)"; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.boxShadow="0 12px 32px rgba(79,70,229,0.18)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="none"; el.style.borderColor="var(--border)"; el.style.boxShadow="var(--shadow-card)"; }}>

              <div style={{ width:"60px", height:"60px", borderRadius:"50%", margin:"0 auto 1rem", background:"linear-gradient(135deg,rgba(79,70,229,0.12),rgba(6,182,212,0.06))", border:"1px solid rgba(79,70,229,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", flexShrink:0 }}>
                {cert.icon}
              </div>

              <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(0.82rem,2vw,0.9rem)", marginBottom:"0.4rem", wordBreak:"break-word", lineHeight:1.35 }}>
                {pick(cert as Record<string,unknown>,"name",locale)}
              </h3>
              <p style={{ fontSize:"0.78rem", fontWeight:600, color:"#818cf8", marginBottom:"0.25rem", wordBreak:"break-word" }}>
                {pick(cert as Record<string,unknown>,"issuer",locale)}
              </p>
              {cert.year && (
                <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.7rem", color:"var(--text-muted)", marginBottom:"0.75rem" }}>
                  {cert.year}
                </p>
              )}
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:"0.25rem", fontSize:"0.75rem", color:"#06b6d4", textDecoration:"none", fontWeight:600, marginTop:"auto", paddingTop:"0.5rem", transition:"opacity 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.opacity="0.75"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.opacity="1"; }}>
                  View Credential →
                </a>
              )}
            </div>
          ))}
          {certifications.length===0 && (
            <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>No certifications yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}