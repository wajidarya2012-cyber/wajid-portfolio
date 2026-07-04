"use client";

import { useEffect, useState } from "react";

export default function ScrollUI() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setVisible(scrolled > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Back to top */}
      <button
        className={`back-to-top ${visible ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        style={{
          position: "fixed",
          bottom: "clamp(1rem,3vw,2rem)",
          right: "clamp(1rem,3vw,2rem)",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1rem",
          fontWeight: 700,
          boxShadow: "0 4px 20px rgba(79,70,229,0.45)",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 1000,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.85)",
          pointerEvents: visible ? "all" : "none",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(-3px) scale(1.08)";
          el.style.boxShadow = "0 8px 28px rgba(79,70,229,0.6)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.85)";
          el.style.boxShadow = "0 4px 20px rgba(79,70,229,0.45)";
        }}
      >
        ↑
      </button>
    </>
  );
}