import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Profile | Admin" };

export default async function ProfilePage() {
  const [profile, heroBgSetting] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.siteSettings.findUnique({ where: { key: "hero_bg_images" } }),
  ]);
  let heroBgImages: string[] = [];
  try {
    const parsed = heroBgSetting?.value ? JSON.parse(heroBgSetting.value) : [];
    if (Array.isArray(parsed)) heroBgImages = parsed.filter(u => typeof u === "string");
  } catch {}

  return (
    <div style={{ maxWidth:"860px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Profile</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Manage your personal information, photo, and CV.</p>
      </div>
      <ProfileForm profile={profile} heroBgImages={heroBgImages} />
    </div>
  );
}
