"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations }              from "next-intl";
import { useForm }                      from "react-hook-form";
import { zodResolver }                  from "@hookform/resolvers/zod";
import { contactSchema, ContactInput }  from "@/lib/validations";

export default function ContactSection({ profile, locale, workingHours }: { profile: any; locale: string; workingHours?: string }) {
  const tl                          = useTranslations("contact");
  const [status, setStatus]         = useState<"idle"|"sending"|"success"|"error">("idle");
  const ref                         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const { register, handleSubmit, reset, formState:{ errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactInput) {
    setStatus("sending");
    try {
      const res = await fetch("/api/v1/contact", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data),
      });
      if (res.ok) { setStatus("success"); reset(); }
      else          setStatus("error");
    } catch { setStatus("error"); }
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)",
    borderRadius:"8px", color:"var(--text-primary)", fontFamily:"inherit",
    fontSize:"0.875rem", padding:"0.75rem 1rem", outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s",
  };
  const lbl: React.CSSProperties = {
    display:"block", fontSize:"0.75rem", fontWeight:600,
    color:"var(--text-secondary)", marginBottom:"0.35rem",
  };

    const ITEMS = [
    { icon:"✉", label:tl("email"),     value: profile?.email ?? "wajid.arya@example.com", href:`mailto:${profile?.email ?? "wajid.arya@example.com"}` },
    { icon:"📞", label:tl("phone"),    value: profile?.phone ?? "+93 XXX XXX XXXX",        href:`tel:${(profile?.phone ?? "").replace(/\s/g,"") || "+93XXXXXXXXX"}` },
    { icon:"📍", label:tl("location"), value: profile?.location ?? "Jalalabad, Nangarhar, Afghanistan", href:"#" },
    ...(workingHours ? [{ icon:"🕐", label:tl("workingHours"), value: workingHours, href:"#" }] : []),
  ];

  return (
    <section id="contact" style={{ padding:"5.5rem 0", background:"var(--bg-primary)" }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">
          Contact{" "}
          <span style={{ background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Me</span>
        </h2>
        <div className="divider reveal reveal-delay-2" style={{ marginBottom:"2.5rem" }} />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))", gap:"2.5rem" }}>

          {/* Left — info */}
          <div className="reveal">
            <h3 style={{ fontFamily:"var(--font-syne)", fontSize:"clamp(1.1rem,3vw,1.3rem)", fontWeight:700, marginBottom:"0.75rem" }}>
              {tl("subtitle")}
            </h3>
            <p style={{ color:"var(--text-secondary)", fontSize:"0.925rem", lineHeight:1.85, marginBottom:"1.75rem", maxWidth:"min(480px,100%)" }}>
              {tl("desc")}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {ITEMS.map(({ icon, label, value, href }) => (
                <a key={label} href={href}
                  style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"1rem", padding:"0.875rem 1.25rem", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--bg-card)", backdropFilter:"blur(10px)", transition:"all 0.2s", minWidth:0, overflow:"hidden" }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.transform="translateX(4px)"; }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="var(--border)"; el.style.transform="none"; }}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"10px", background:"linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(79,70,229,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
                    {icon}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:"0.68rem", color:"var(--text-muted)", marginBottom:"0.15rem", fontWeight:500 }}>{label}</p>
                    <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text-primary)", wordBreak:"break-word" }}>{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <form onSubmit={handleSubmit(onSubmit)} className="glass-card reveal reveal-delay-1"
            style={{ borderRadius:"20px", padding:"clamp(1.25rem,4vw,2rem)", display:"flex", flexDirection:"column", gap:"1rem" }}>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:"1rem" }}>
              <div>
                <label style={lbl}>{tl("form.name")} *</label>
                <input {...register("name")} placeholder="Your full name" style={inp}
                  onFocus={e=>{ (e.target as HTMLInputElement).style.borderColor="#4f46e5"; (e.target as HTMLInputElement).style.boxShadow="0 0 0 3px rgba(79,70,229,0.15)"; }}
                  onBlur={e=>{  (e.target as HTMLInputElement).style.borderColor="var(--border)"; (e.target as HTMLInputElement).style.boxShadow="none"; }} />
                {errors.name && <p style={{ fontSize:"0.72rem", color:"#f87171", marginTop:"0.25rem" }}>{errors.name.message}</p>}
              </div>
              <div>
                <label style={lbl}>{tl("form.email")} *</label>
                <input {...register("email")} type="email" placeholder="your@email.com" style={inp}
                  onFocus={e=>{ (e.target as HTMLInputElement).style.borderColor="#4f46e5"; (e.target as HTMLInputElement).style.boxShadow="0 0 0 3px rgba(79,70,229,0.15)"; }}
                  onBlur={e=>{  (e.target as HTMLInputElement).style.borderColor="var(--border)"; (e.target as HTMLInputElement).style.boxShadow="none"; }} />
                {errors.email && <p style={{ fontSize:"0.72rem", color:"#f87171", marginTop:"0.25rem" }}>{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label style={lbl}>{tl("form.phone")}</label>
              <input {...register("phone")} placeholder="+93 XXX XXX XXXX" style={inp} />
            </div>

            <div>
              <label style={lbl}>{tl("form.subject")} *</label>
              <input {...register("subject")} placeholder="Project inquiry, collaboration, job opportunity…" style={inp}
                onFocus={e=>{ (e.target as HTMLInputElement).style.borderColor="#4f46e5"; (e.target as HTMLInputElement).style.boxShadow="0 0 0 3px rgba(79,70,229,0.15)"; }}
                onBlur={e=>{  (e.target as HTMLInputElement).style.borderColor="var(--border)"; (e.target as HTMLInputElement).style.boxShadow="none"; }} />
              {errors.subject && <p style={{ fontSize:"0.72rem", color:"#f87171", marginTop:"0.25rem" }}>{errors.subject.message}</p>}
            </div>

            <div>
              <label style={lbl}>{tl("form.message")} *</label>
              <textarea {...register("message")} rows={5} placeholder="Tell me about your project, timeline, and budget…" style={{ ...inp, resize:"vertical" }}
                onFocus={e=>{ (e.target as HTMLTextAreaElement).style.borderColor="#4f46e5"; (e.target as HTMLTextAreaElement).style.boxShadow="0 0 0 3px rgba(79,70,229,0.15)"; }}
                onBlur={e=>{  (e.target as HTMLTextAreaElement).style.borderColor="var(--border)"; (e.target as HTMLTextAreaElement).style.boxShadow="none"; }} />
              {errors.message && <p style={{ fontSize:"0.72rem", color:"#f87171", marginTop:"0.25rem" }}>{errors.message.message}</p>}
            </div>

            <button type="submit" disabled={status==="sending"} className="btn-primary"
              style={{ justifyContent:"center", opacity:status==="sending"?0.65:1, cursor:status==="sending"?"not-allowed":"pointer" }}>
              {status==="sending" ? <>⟳ {tl("form.sending")}</> : <>✉ {tl("form.send")}</>}
            </button>

            {status==="success" && (
              <div className="alert-success" style={{ textAlign:"center" }}>✅ {tl("form.success")}</div>
            )}
            {status==="error" && (
              <div className="alert-error" style={{ textAlign:"center" }}>❌ {tl("form.error")}</div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}