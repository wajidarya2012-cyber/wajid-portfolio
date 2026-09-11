"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SocialIcon   from "@/components/shared/SocialIcon";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore, share icons still work
    }
  }

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { platform: "twitter",  href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { platform: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { platform: "whatsapp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { platform: "email",    href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
  ];

  const btnStyle: React.CSSProperties = {
    width: "38px", height: "38px", borderRadius: "50%",
    border: "1px solid var(--border)", background: "var(--bg-card)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.2s", flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>{t("share")}:</span>
      {targets.map(({ platform, href }) => (
        <a
          key={platform}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${platform}`}
          style={btnStyle}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#4f46e5"; el.style.color = "#818cf8"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-secondary)"; }}
        >
          <SocialIcon platform={platform} size={15} />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label={t("copyLink")}
        style={{ ...btnStyle, cursor: "pointer", fontSize: "0.85rem" }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#4f46e5"; el.style.color = "#818cf8"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-secondary)"; }}
      >
        {copied ? "✓" : "🔗"}
      </button>
    </div>
  );
}
