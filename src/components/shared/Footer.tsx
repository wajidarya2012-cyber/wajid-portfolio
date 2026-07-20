"use client";

import Link               from "next/link";
import { useTranslations } from "next-intl";
import type { Profile }    from "@/types";
import { buildNavItems, type NavItemConfig } from "@/lib/navConfig";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

const ROLES = [
  "IT & Network Manager",
  "Software Developer",
  "Database Administrator",
  "Network & Systems Specialist",
];

type FooterVisibility = {
  showQuickLinks?: boolean;
  showContact?: boolean;
  showSocialLinks?: boolean;
  showWorkingHours?: boolean;
  showCopyright?: boolean;
};

export default function Footer({
  locale, profile, navConfig, footerVisibility, workingHours, legalLinks,
}: {
  locale: string;
  profile?: Profile | null;
  navConfig?: NavItemConfig[];
  footerVisibility?: FooterVisibility;
  workingHours?: string;
  legalLinks?: { privacyUrl?: string; termsUrl?: string };
}) {
  const tl = useTranslations("footer");
  const tn = useTranslations("nav");

  function pick(field: string): string {
    const obj = (profile ?? {}) as Record<string, unknown>;
    return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
  }

  const p = (profile ?? {}) as Record<string, unknown>;
  const SOCIALS = [
    p.linkedinUrl && { label:"LinkedIn", icon:"in", href: p.linkedinUrl as string },
    p.githubUrl   && { label:"GitHub",   icon:"gh", href: p.githubUrl   as string },
    p.twitterUrl  && { label:"Twitter",  icon:"tw", href: p.twitterUrl  as string },
    p.websiteUrl  && { label:"Website",  icon:"www", href: p.websiteUrl as string },
    p.email       && { label:"Email",    icon:"@",   href: `mailto:${p.email}` },
  ].filter(Boolean) as { label:string; icon:string; href:string }[];

  const vis = {
    showQuickLinks:   footerVisibility?.showQuickLinks   !== false,
    showContact:      footerVisibility?.showContact      !== false,
    showSocialLinks:  footerVisibility?.showSocialLinks  !== false,
    showWorkingHours: footerVisibility?.showWorkingHours !== false,
    showCopyright:    footerVisibility?.showCopyright    !== false,
  };

  const quickLinks = buildNavItems(navConfig, locale, tn);

  const contactItems = [
    p.email    && { icon:"✉", label:tl("contactEmail")    ?? "Email",    value: p.email as string,    href:`mailto:${p.email}` },
    p.phone    && { icon:"📞", label:tl("contactPhone")    ?? "Phone",    value: p.phone as string,    href:`tel:${(p.phone as string).replace(/\s/g,"")}` },
    p.location && { icon:"📍", label:tl("contactLocation") ?? "Location", value: p.location as string, href:"#" },
    (vis.showWorkingHours && workingHours) && { icon:"🕐", label:tl("contactHours") ?? "Hours", value: workingHours, href:"#" },
  ].filter(Boolean) as { icon:string; label:string; value:string; href:string }[];

  return (
    <footer style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", overflow:"hidden" }}>
      {/* Main footer */}
      <div className="section-container" style={{ padding:"clamp(2.5rem,5vw,3.5rem) 1.25rem 2rem" }}>
        <div className="footer-grid">

          {/* Brand col */}
          <div>
            <div style={{ marginBottom:"1rem" }}>
              <span style={{ fontFamily:"var(--font-syne)", fontWeight:800, fontSize:"1.35rem", background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", display:"block", lineHeight:1.2 }}>
                {pick("fullName") || "Wajid Ali Arya"}
              </span>
              <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.68rem", color:"var(--text-muted)", letterSpacing:"0.08em" }}>
                {(p.fullName_fa as string) || (p.fullName_ps as string) || "واجد علی آریا"}
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.25rem", marginBottom:"1rem" }}>
              {ROLES.map(role => (
                <span key={role} style={{ fontSize:"0.78rem", color:"var(--text-secondary)", lineHeight:1.5 }}>
                  {role}
                </span>
              ))}
            </div>
            <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", lineHeight:1.75, maxWidth:"260px", marginBottom:"1.25rem" }}>
              {pick("footerTagline") || "Building technology solutions that create real value — from Jalalabad, Afghanistan to the world."}
            </p>
            {/* Socials */}
            {vis.showSocialLinks && SOCIALS.length > 0 && (
              <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
                {SOCIALS.map(({ label, icon, href }) => (
                  <a key={label} href={href} aria-label={label}
                    style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--bg-card)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.72rem", fontWeight:700, color:"var(--text-secondary)", textDecoration:"none", transition:"all 0.2s", flexShrink:0 }}
                    onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="#4f46e5"; el.style.color="#818cf8"; el.style.transform="translateY(-2px)"; }}
                    onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="var(--border)"; el.style.color="var(--text-secondary)"; el.style.transform="none"; }}>
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links col */}
          {vis.showQuickLinks && quickLinks.length > 0 && (
            <div>
              <p style={{ fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--text-muted)", marginBottom:"1rem" }}>
                {tl("quickLinks") ?? "Quick Links"}
              </p>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                {quickLinks.map(({ key, href, label, newTab }) => (
                  <li key={key}>
                    <a href={href.startsWith("#") ? href : `/${locale}${href}`}
                      target={newTab ? "_blank" : undefined}
                      rel={newTab ? "noopener noreferrer" : undefined}
                      style={{ fontSize:"0.82rem", color:"var(--text-secondary)", textDecoration:"none", transition:"color 0.2s" }}
                      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-primary)"; }}
                      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-secondary)"; }}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact col */}
          {vis.showContact && contactItems.length > 0 && (
            <div>
              <p style={{ fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--text-muted)", marginBottom:"1rem" }}>
                {tl("contact") ?? "Contact"}
              </p>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"0.7rem" }}>
                {contactItems.map(({ icon, label, value, href }) => (
                  <li key={label}>
                    <a href={href} style={{ display:"flex", alignItems:"flex-start", gap:"0.5rem", fontSize:"0.8rem", color:"var(--text-secondary)", textDecoration:"none", transition:"color 0.2s" }}
                      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-primary)"; }}
                      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-secondary)"; }}>
                      <span style={{ flexShrink:0 }}>{icon}</span>
                      <span style={{ wordBreak:"break-word" }}>{value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop:"1px solid var(--border)" }}>
        <div className="section-container" style={{ padding:"1rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.75rem" }}>
          {vis.showCopyright ? (
            <p style={{ fontSize:"0.73rem", color:"var(--text-muted)" }}>
              © {new Date().getFullYear()} {pick("fullName") || "Wajid Ali Arya"}. {pick("footerRights") || tl("rights")}
            </p>
          ) : <span />}

          <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
            {legalLinks?.privacyUrl && (
              <a href={legalLinks.privacyUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:"0.72rem", color:"var(--text-muted)", textDecoration:"none" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-primary)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-muted)"; }}>
                {tl("privacyPolicy") ?? "Privacy Policy"}
              </a>
            )}
            {legalLinks?.termsUrl && (
              <a href={legalLinks.termsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:"0.72rem", color:"var(--text-muted)", textDecoration:"none" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-primary)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="var(--text-muted)"; }}>
                {tl("termsConditions") ?? "Terms & Conditions"}
              </a>
            )}
            <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", margin:0 }}>
              {pick("footerBuiltWith") || tl("builtWith")}
            </p>
            <Link href="/admin/login" style={{ fontSize:"0.72rem", color:"var(--text-muted)", textDecoration:"none", opacity:0.5, transition:"opacity 0.2s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.opacity="1"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.opacity="0.5"; }}>
              Admin ↗
            </Link>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(2, 1fr);
          gap: 3rem;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }
        }
      `,
        }}
      />
    </footer>
  );
}
