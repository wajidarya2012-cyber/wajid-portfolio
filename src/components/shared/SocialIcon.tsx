export type SocialPlatform =
  | "linkedin" | "github" | "twitter" | "whatsapp" | "instagram"
  | "youtube" | "tiktok" | "website" | "email" | "phone";

const PATHS: Record<SocialPlatform, JSX.Element> = {
  linkedin: (
    <path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5ZM8 19H5V9h3v10ZM6.5 7.7A1.7 1.7 0 1 1 6.5 4.3a1.7 1.7 0 0 1 0 3.4ZM20 19h-3v-5.3c0-1.4-.5-2.3-1.7-2.3-.9 0-1.5.6-1.7 1.3-.1.2-.1.5-.1.8V19h-3s.1-9 0-10h3v1.4c.4-.6 1.1-1.6 2.8-1.6 2.1 0 3.6 1.4 3.6 4.3V19Z"/>
  ),
  github: (
    <path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.7-1.4-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.5.1-3.2 0 0 1-.3 3.4 1.2a11.6 11.6 0 0 1 6.2 0c2.4-1.6 3.4-1.2 3.4-1.2.7 1.7.2 2.9.1 3.2.8.9 1.3 2 1.3 3.2 0 4.6-2.7 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0Z"/>
  ),
  twitter: (
    <path d="M18.9 1.2h3.3l-7.2 8.2 8.5 11.3h-6.6l-5.2-6.8-5.9 6.8H2.4l7.7-8.8L1.9 1.2h6.8l4.7 6.2 5.5-6.2Zm-1.2 17.5h1.8L6.4 3.1H4.5l13.2 15.6Z"/>
  ),
  whatsapp: (
    <path d="M12 0a12 12 0 0 0-10.4 17.9L0 24l6.3-1.6A12 12 0 1 0 12 0Zm0 21.8a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.6Zm5.4-7.3c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.4c.1-.1.1-.3 0-.4-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.2 3.4 5.4 4.7.8.3 1.4.5 1.8.7.8.2 1.5.2 2 .1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3Z"/>
  ),
  instagram: (
    <>
      <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17.9" cy="6.1" r="1.15"/>
    </>
  ),
  youtube: (
    <>
      <rect x="0.5" y="4" width="23" height="16" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9.8 8.6v6.8l6.2-3.4-6.2-3.4Z"/>
    </>
  ),
  tiktok: (
    <path d="M16.6 0h-3.3v15.4a2.9 2.9 0 1 1-2-2.7V9.3a6 6 0 1 0 5.3 6V8.1a8.2 8.2 0 0 0 4.9 1.6V6.4a4.9 4.9 0 0 1-4.9-4.9V0Z"/>
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <ellipse cx="12" cy="12" rx="4.2" ry="10.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M1.5 12h21M2.8 7h18.4M2.8 17h18.4" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    </>
  ),
  email: (
    <>
      <rect x="1" y="3.5" width="22" height="17" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7"/>
      <path d="m2.5 5.5 9.5 8 9.5-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  phone: (
    <path d="M6.6 2.2 3 3.5c-1.1.4-1.6 1.6-1.2 2.7A20.5 20.5 0 0 0 18 21.3c1.1.4 2.3-.1 2.7-1.2l1.3-3.6a1.9 1.9 0 0 0-1.1-2.4l-4.1-1.6a1.9 1.9 0 0 0-2.1.5l-1.4 1.6a15.1 15.1 0 0 1-6.9-6.9l1.6-1.4c.6-.5.8-1.4.5-2.1L7 3.3a1.9 1.9 0 0 0-2.4-1.1Z"/>
  ),
};

export default function SocialIcon({ platform, size = 16 }: { platform: SocialPlatform | string; size?: number }) {
  const el = PATHS[platform as SocialPlatform];
  if (!el) return <span style={{ fontSize: size * 0.7 }}>{platform}</span>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
      {el}
    </svg>
  );
}
