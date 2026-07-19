"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { JourneySlide } from "@/types";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";
const AUTOPLAY_MS = 5500;

function pick(obj: Record<string, unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default function JourneySection({ slides, locale }: { slides: JourneySlide[]; locale: string }) {
  const tl        = useTranslations("journey");
  const ref       = useRef<HTMLDivElement>(null);
  const [index, setIndex]   = useState(0);
  const [paused, setPaused] = useState(false);
  const len = slides.length;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const next = useCallback(() => setIndex(i => (i + 1) % len), [len]);
  const prev = useCallback(() => setIndex(i => (i - 1 + len) % len), [len]);

  useEffect(() => {
    if (paused || len <= 1) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, len, next]);

  // Keep index valid if slide count changes
  useEffect(() => { if (index >= len && len > 0) setIndex(0); }, [len, index]);

  return (
    <section id="journey" style={{ padding:"5.5rem 0", background:"var(--bg-primary)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .journey-frame { aspect-ratio: 4 / 3 !important; }
        }
      `}} />
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">
          Professional{" "}
          <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Journey</span>
        </h2>
        <div className="divider reveal reveal-delay-2" style={{ marginBottom:"2.5rem" }} />

        {len === 0 ? (
          <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>No journey milestones yet.</p>
        ) : (
          <div
            className="glass-card reveal"
            style={{ borderRadius:"20px", padding:"clamp(0.75rem,2vw,1rem)", overflow:"hidden" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="journey-frame" style={{ position:"relative", width:"100%", aspectRatio:"16/8", borderRadius:"14px", overflow:"hidden", background:"var(--bg-secondary)" }}>
              {slides.map((slide, i) => {
                const title   = pick(slide as unknown as Record<string,unknown>, "title", locale);
                const caption = pick(slide as unknown as Record<string,unknown>, "caption", locale);
                return (
                  <div
                    key={slide.id}
                    style={{
                      position:"absolute", inset:0,
                      opacity: i === index ? 1 : 0,
                      transition:"opacity 0.6s ease",
                      pointerEvents: i === index ? "auto" : "none",
                    }}
                    aria-hidden={i !== index}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.imageUrl}
                      alt={title || "Journey milestone"}
                      loading="lazy"
                      decoding="async"
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", display:"block" }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                    />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.25) 45%,transparent 75%)" }} />
                    <div style={{ position:"absolute", left:0, right:0, bottom:0, padding:"clamp(1rem,3vw,2rem)" }}>
                      {title && (
                        <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"clamp(1rem,2.6vw,1.5rem)", color:"#fff", marginBottom:"0.4rem", wordBreak:"break-word" }}>
                          {title}
                        </h3>
                      )}
                      {caption && (
                        <p style={{ fontSize:"clamp(0.78rem,1.6vw,0.9rem)", color:"rgba(255,255,255,0.85)", maxWidth:"640px", lineHeight:1.6 }}>
                          {caption}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {len > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous slide"
                    style={{ position:"absolute", top:"50%", left:"0.75rem", transform:"translateY(-50%)", width:"38px", height:"38px", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.3)", background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", transition:"all 0.2s", zIndex:2 }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="#4f46e5"; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(0,0,0,0.35)"; }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next slide"
                    style={{ position:"absolute", top:"50%", right:"0.75rem", transform:"translateY(-50%)", width:"38px", height:"38px", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.3)", background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", transition:"all 0.2s", zIndex:2 }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="#4f46e5"; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(0,0,0,0.35)"; }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {len > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:"0.6rem", padding:"1rem 0 0.25rem", flexWrap:"wrap" }}>
                {slides.map((slide, i) => {
                  const thumbTitle = pick(slide as unknown as Record<string,unknown>, "title", locale);
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Go to slide: ${thumbTitle || i + 1}`}
                      style={{
                        position:"relative", width:"72px", height:"48px", borderRadius:"8px", overflow:"hidden", cursor:"pointer",
                        padding:0, border: i === index ? "2px solid #4f46e5" : "2px solid transparent",
                        opacity: i === index ? 1 : 0.55, transition:"all 0.25s ease", flexShrink:0,
                        boxShadow: i === index ? "0 0 0 2px rgba(79,70,229,0.25)" : "none",
                      }}
                      onMouseEnter={e=>{ if (i!==index) (e.currentTarget as HTMLElement).style.opacity="0.85"; }}
                      onMouseLeave={e=>{ if (i!==index) (e.currentTarget as HTMLElement).style.opacity="0.55"; }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", display:"block", background:"var(--bg-secondary)" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
