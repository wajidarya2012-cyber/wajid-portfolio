"use client";

import { useEffect, useState, useRef } from "react";
import { TRANSLATE_LANGUAGES } from "@/lib/translateLanguages";

export type TranslateWidgetConfig = {
  enabled?: boolean;
  showSelector?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  alignment?: "left" | "right";
  languages?: string[];
  defaultLanguage?: string;
  label_en?: string;
  label_ps?: string;
  label_fa?: string;
};

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement?: new (opts: Record<string, unknown>, el: string) => void } };
  }
}

function getGoogTransCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setGoogTransCookie(code: string | null) {
  const host = window.location.hostname;
  if (!code) {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host}`;
  } else {
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=.${host}`;
  }
}

export default function TranslateWidget({ locale, config }: { locale: string; config?: TranslateWidgetConfig }) {
  const [ready, setReady]       = useState(false);
  const [failed, setFailed]     = useState(false);
  const [selected, setSelected] = useState("");
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState("");
  const initialised = useRef(false);
  const rootRef     = useRef<HTMLDivElement>(null);

  const enabled      = config?.enabled === true;
  const showSelector = config?.showSelector !== false;
  const position     = config?.position ?? "bottom-right";
  const opensUpward  = position.startsWith("bottom");
  const alignRight   = (config?.alignment ?? (position.endsWith("right") ? "right" : "left")) === "right";
  const languages    = Array.isArray(config?.languages) ? config.languages : TRANSLATE_LANGUAGES.map(l => l.code);
  const options      = TRANSLATE_LANGUAGES.filter(l => languages.includes(l.code));
  const filtered     = query.trim()
    ? options.filter(l => l.name.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const label = (locale === "ps" ? config?.label_ps : locale === "fa" ? config?.label_fa : config?.label_en)
    || "Translate to...";
  const activeLabel = selected ? (options.find(l => l.code === selected)?.name ?? selected) : null;

  // Load the Google Translate script once, only when the widget is enabled.
  useEffect(() => {
    if (!enabled || initialised.current) return;
    initialised.current = true;

    const current = getGoogTransCookie();
    if (current) {
      const parts = current.split("/");
      setSelected(parts[2] ?? "");
    }

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", autoDisplay: false },
            "google_translate_element_root"
          );
          setReady(true);
        }
      } catch {
        setFailed(true);
      }
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [enabled]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!enabled || !showSelector || failed || options.length === 0) return null;

  function handleSelect(code: string) {
    setSelected(code);
    setOpen(false);
    setQuery("");
    setGoogTransCookie(code || null);
    window.location.reload();
  }

  const posStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 1200,
    ...(position === "top-right"    ? { top:"5.5rem", right:"1rem" } :
        position === "top-left"     ? { top:"5.5rem", left:"1rem" } :
        position === "bottom-left"  ? { bottom:"1.25rem", left:"1rem" } :
                                       { bottom:"1.25rem", right:"1rem" }),
  };

  return (
    <div ref={rootRef} style={posStyle} translate="no" className="notranslate translate-widget-root">
      {/* Required hidden mount point for the Google Translate widget — not display:none,
          which would prevent it from initialising correctly. */}
      <div id="google_translate_element_root" style={{ position:"absolute", width:0, height:0, overflow:"hidden" }} />

      <div style={{ position:"relative" }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={label}
          aria-expanded={open}
          disabled={!ready && !selected}
          className="translate-trigger-btn"
          style={{
            display:"flex", alignItems:"center", gap:"0.4rem",
            height:"36px", padding: activeLabel ? "0 0.75rem 0 0.6rem" : 0,
            width: activeLabel ? "auto" : "36px",
            borderRadius:"9999px",
            border:"1px solid var(--border)",
            background:"var(--bg-card)",
            backdropFilter:"blur(10px)",
            boxShadow:"0 4px 16px rgba(0,0,0,0.16)",
            color:"var(--text-primary)",
            cursor: (!ready && !selected) ? "default" : "pointer",
            fontFamily:"inherit", fontSize:"0.72rem", fontWeight:600,
            justifyContent:"center",
            transition:"all 0.2s",
            opacity: (!ready && !selected) ? 0.6 : 1,
          }}
        >
          <span style={{ fontSize:"0.95rem", lineHeight:1 }}>🌐</span>
          {activeLabel && <span style={{ maxWidth:"90px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{activeLabel}</span>}
        </button>

        {open && (
          <div
            className="glass-card translate-menu"
            style={{
              position:"absolute",
              ...(opensUpward ? { bottom:"calc(100% + 0.5rem)" } : { top:"calc(100% + 0.5rem)" }),
              ...(alignRight ? { right:0 } : { left:0 }),
              width:"200px",
              maxHeight:"280px",
              display:"flex", flexDirection:"column",
              borderRadius:"14px",
              overflow:"hidden",
              animation:"translateMenuIn 0.16s ease-out",
            }}
          >
            <div style={{ padding:"0.6rem 0.6rem 0.4rem" }}>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={label}
                style={{
                  width:"100%", fontSize:"0.75rem", fontFamily:"inherit",
                  padding:"0.4rem 0.6rem", borderRadius:"8px",
                  border:"1px solid var(--border)", background:"var(--bg-secondary)",
                  color:"var(--text-primary)", outline:"none",
                }}
              />
            </div>
            <div style={{ overflowY:"auto", padding:"0 0.4rem 0.4rem", display:"flex", flexDirection:"column", gap:"1px" }}>
              <button
                type="button"
                onClick={() => handleSelect("")}
                style={{
                  textAlign: alignRight ? "right" : "left", fontFamily:"inherit",
                  fontSize:"0.78rem", fontWeight: selected === "" ? 700 : 500,
                  color: selected === "" ? "#818cf8" : "var(--text-secondary)",
                  background: selected === "" ? "rgba(79,70,229,0.1)" : "transparent",
                  border:"none", borderRadius:"7px", padding:"0.45rem 0.6rem", cursor:"pointer",
                }}
                onMouseEnter={e => { if (selected !== "") (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"; }}
                onMouseLeave={e => { if (selected !== "") (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                Original
              </button>
              {filtered.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelect(l.code)}
                  style={{
                    textAlign: alignRight ? "right" : "left", fontFamily:"inherit",
                    fontSize:"0.78rem", fontWeight: selected === l.code ? 700 : 500,
                    color: selected === l.code ? "#818cf8" : "var(--text-secondary)",
                    background: selected === l.code ? "rgba(79,70,229,0.1)" : "transparent",
                    border:"none", borderRadius:"7px", padding:"0.45rem 0.6rem", cursor:"pointer",
                  }}
                  onMouseEnter={e => { if (selected !== l.code) (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"; }}
                  onMouseLeave={e => { if (selected !== l.code) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {l.name}
                </button>
              ))}
              {filtered.length === 0 && (
                <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", padding:"0.5rem 0.6rem" }}>No matches.</p>
              )}
            </div>
            <p style={{ fontSize:"0.6rem", color:"var(--text-muted)", opacity:0.6, textAlign:"center", padding:"0.35rem 0", margin:0, borderTop:"1px solid var(--border)" }}>
              Powered by Google Translate
            </p>
          </div>
        )}
      </div>

      {/* Hide Google's own banner/toolbar and body offset it injects, and stop it
          restyling text nodes it wraps — keeps the rest of the design untouched. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .goog-te-banner-frame, .skiptranslate iframe { display:none !important; }
        body { top: 0 !important; }
        .goog-text-highlight { background:none !important; box-shadow:none !important; }
        .translate-trigger-btn:hover:not(:disabled) { border-color: rgba(79,70,229,0.5) !important; }
        @keyframes translateMenuIn { from { opacity:0; transform:translateY(4px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @media (max-width: 480px) {
          .translate-widget-root { bottom: 0.75rem !important; }
          .translate-menu { width: 170px !important; }
        }
      `}} />
    </div>
  );
}
