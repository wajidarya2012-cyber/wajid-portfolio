"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations }              from "next-intl";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

const STATS = [
  { count:8,  suffix:"+", key:"years"          },
  { count:4,  suffix:"+", key:"projects"       },
  { count:4,  suffix:"",  key:"certifications" },
  { count:10, suffix:"+", key:"organizations"  },
];

function Counter({ target, suffix }: { target:number; suffix:string }) {
  const [val, setVal]  = useState(0);
  const ref            = useRef<HTMLDivElement>(null);
  const animated       = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1400;
        const start    = performance.now();
        const step     = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setVal(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
          else setVal(target);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ fontFamily:"var(--font-syne)", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:800, lineHeight:1, background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
      {val}{suffix}
    </div>
  );
}

export default function StatsSection() {
  const tl  = useTranslations("stats");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ padding:"4rem 0", background:"var(--bg-secondary)" }}>
      <div className="section-container" ref={ref}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))", gap:"1rem" }}>
          {STATS.map(({ count, suffix, key }, idx) => (
            <div key={key} className="glass-card reveal" style={{ borderRadius:"16px", padding:"clamp(1.25rem,3vw,2rem) 1rem", textAlign:"center", transition:"all 0.25s", transitionDelay:`${idx*0.08}s`, minWidth:0 }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-4px)"; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.boxShadow="0 12px 32px rgba(79,70,229,0.18)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="none"; el.style.borderColor="var(--border)"; el.style.boxShadow="var(--shadow-card)"; }}>
              <Counter target={count} suffix={suffix} />
              <p style={{ fontSize:"clamp(0.78rem,1.5vw,0.875rem)", color:"var(--text-secondary)", marginTop:"0.6rem", wordBreak:"break-word" }}>{tl(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}