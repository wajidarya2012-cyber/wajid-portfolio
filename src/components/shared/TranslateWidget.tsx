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

const NATIVE_LOCALES = new Set(["en", "ps", "fa"]);

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
  const [ready, setReady]   = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState("");
  const initialised = useRef(false);

  const enabled      = config?.enabled === true;
  const showSelector = config?.showSelector !== false;
  const position     = config?.position ?? "bottom-right";
  const languages    = (config?.languages && config.languages.length > 0 ? config.languages : TRANSLATE_LANGUAGES.map(l => l.code))
    .filter(code => !NATIVE_LOCALES.has(code));
  const options      = TRANSLATE_LANGUAGES.filter(l => languages.includes(l.code));

  const label = (locale === "ps" ? config?.label_ps : locale === "fa" ? config?.label_fa : config?.label_en)
    || "Translate to...";

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

  if (!enabled || !showSelector || failed || options.length === 0) return null;

  function handleChange(code: string) {
    setSelected(code);
    setGoogTransCookie(code || null);
    window.location.reload();
  }

  const posStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 1200,
    ...(position === "top-right"    ? { top:"5.5rem", right:"1rem" } :
        position === "top-left"     ? { top:"5.5rem", left:"1rem" } :
        position === "bottom-left"  ? { bottom:"1rem", left:"1rem" } :
                                       { bottom:"1rem", right:"1rem" }),
  };

  return (
    <div style={posStyle} translate="no" className="notranslate">
      {/* Required hidden mount point for the Google Translate widget — not display:none,
          which would prevent it from initialising correctly. */}
      <div id="google_translate_element_root" style={{ position:"absolute", width:0, height:0, overflow:"hidden" }} />

      <select
        aria-label={label}
        value={selected}
        onChange={e => handleChange(e.target.value)}
        disabled={!ready && !selected}
        style={{
          appearance:"none",
          fontFamily:"inherit",
          fontSize:"0.78rem",
          fontWeight:600,
          padding:"0.55rem 2rem 0.55rem 0.9rem",
          borderRadius:"9999px",
          border:"1px solid var(--border)",
          background:"var(--bg-card)",
          color:"var(--text-primary)",
          boxShadow:"0 4px 16px rgba(0,0,0,0.18)",
          backdropFilter:"blur(10px)",
          cursor:"pointer",
          maxWidth:"180px",
        }}
      >
        <option value="">{label}</option>
        {options.map(l => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </select>

      {/* Hide Google's own banner/toolbar and body offset it injects, and stop it
          restyling text nodes it wraps — keeps the rest of the design untouched. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .goog-te-banner-frame, .skiptranslate iframe { display:none !important; }
        body { top: 0 !important; }
        .goog-text-highlight { background:none !important; box-shadow:none !important; }
      `}} />
    </div>
  );
}
