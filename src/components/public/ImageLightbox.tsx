"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export interface LightboxImage {
  id: string;
  url: string;
  caption?: string | null;
}

export default function ImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);

  const goPrev = useCallback(() => {
    setZoomed(false);
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  const goNext = useCallback(() => {
    setZoomed(false);
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [goPrev, goNext, onClose]);

  const img = images[index];
  if (!img) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.2s ease" }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{ position: "absolute", top: "1rem", right: "1rem", width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
      >
        ✕
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <span style={{ position: "absolute", top: "1.2rem", left: "1.2rem", color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", fontFamily: "var(--font-fira)" }}>
          {index + 1} / {images.length}
        </span>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); goPrev(); }}
          aria-label="Previous image"
          style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <div
        onClick={e => { e.stopPropagation(); setZoomed(z => !z); }}
        style={{
          position: "relative",
          width: "min(92vw, 1100px)",
          height: zoomed ? "92vh" : "min(80vh, 720px)",
          cursor: zoomed ? "zoom-out" : "zoom-in",
          transition: "height 0.25s ease",
        }}
      >
        <Image
          src={img.url}
          alt={img.caption ?? ""}
          fill
          style={{ objectFit: zoomed ? "contain" : "contain" }}
          sizes="92vw"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); goNext(); }}
          aria-label="Next image"
          style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
        >
          ›
        </button>
      )}

      {img.caption && (
        <p style={{ position: "absolute", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", maxWidth: "80vw", textAlign: "center" }}>
          {img.caption}
        </p>
      )}
    </div>
  );
}