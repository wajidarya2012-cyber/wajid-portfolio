import { prisma }     from "@/lib/prisma";
import SettingsForm   from "./SettingsForm";
export const metadata = { title: "Settings | Admin" };

export default async function SettingsPage() {
  const [settings, profile] = await Promise.all([
    prisma.siteSettings.findMany({ orderBy:{ group:"asc" } }),
    prisma.profile.findFirst(),
  ]);
  const settingsMap = Object.fromEntries(settings.map(s=>[s.key,s.value]));
  return (
    <div style={{ maxWidth:"800px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Settings</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Configure site-wide settings, SEO, and admin account.</p>
      </div>
      <SettingsForm settingsMap={settingsMap} profile={profile} />
    </div>
  );
}
