import { Fragment } from "react";
import { prisma }          from "@/lib/prisma";
import HeroSection         from "@/components/public/HeroSection";
import AboutSection        from "@/components/public/AboutSection";
import SkillsSection       from "@/components/public/SkillsSection";
import ExperienceSection   from "@/components/public/ExperienceSection";
import EducationSection    from "@/components/public/EducationSection";
import CertSection         from "@/components/public/CertSection";
import JourneySection      from "@/components/public/JourneySection";
import ProjectsSection     from "@/components/public/ProjectsSection";
import StatsSection        from "@/components/public/StatsSection";
import ContactSection      from "@/components/public/ContactSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const profile = await prisma.profile.findFirst().catch(() => null);
  const name    = locale==="ps" ? profile?.fullName_ps : locale==="fa" ? profile?.fullName_fa : profile?.fullName_en ?? "Wajid Ali Arya";
  const title   = locale==="ps" ? profile?.title_ps   : locale==="fa" ? profile?.title_fa    : profile?.title_en   ?? "IT Manager & Software Developer";
  return {
    title:       `${name} | ${title}`,
    description: locale==="ps" ? profile?.bio_ps : locale==="fa" ? profile?.bio_fa : profile?.bio_en ?? "Professional portfolio",
    openGraph: {
      title:       `${name} | ${title}`,
      description: locale==="ps" ? profile?.bio_ps : locale==="fa" ? profile?.bio_fa : profile?.bio_en ?? "",
      locale,
    },
  };
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const safeLocale = ["en","ps","fa"].includes(locale) ? locale : "en";

const [profile, skillCats, experience, education, certifications, journeySlides, projects, siteSettings] = await Promise.all([
    prisma.profile.findFirst().catch(() => null),
    prisma.skillCategory.findMany({
      include: { skills: { orderBy: { sortOrder:"asc" } } },
      orderBy: { sortOrder:"asc" },
    }).catch(() => []),
    prisma.experience.findMany({ orderBy: { sortOrder:"asc" } }).catch(() => []),
    prisma.education.findMany({  orderBy: { sortOrder:"asc" } }).catch(() => []),
    prisma.certification.findMany({ orderBy: { sortOrder:"asc" } }).catch(() => []),
    prisma.journeySlide.findMany({ orderBy: { sortOrder:"asc" } }).catch(() => []),
    prisma.project.findMany({
      where:   { status:"ACTIVE" },
      include: {
        category: true,
        images:   { orderBy: { sortOrder:"asc" } },
        features: { orderBy: { sortOrder:"asc" } },
        links:    true,
      },
      orderBy: [{ featured:"desc" }, { sortOrder:"asc" }],
    }).catch(() => []),
    prisma.siteSettings.findMany({ where: { key: { in: ["contact_working_hours", "hero_bg_images", "skills_section_config", "experience_section_config"] } } }).catch(() => []),
  ]);
  const workingHours = siteSettings.find(s => s.key === "contact_working_hours")?.value;
  const heroBgImagesRaw = siteSettings.find(s => s.key === "hero_bg_images")?.value;
  let heroBgImages: string[] = [];
  try { const parsed = heroBgImagesRaw ? JSON.parse(heroBgImagesRaw) : []; if (Array.isArray(parsed)) heroBgImages = parsed.filter(u => typeof u === "string"); } catch {}
  let skillsConfig: import("@/components/public/SkillsSection").SkillsSectionConfig = {};
  try { const raw = siteSettings.find(s => s.key === "skills_section_config")?.value; if (raw) skillsConfig = JSON.parse(raw); } catch {}
  let experienceConfig: import("@/components/public/ExperienceSection").ExperienceSectionConfig = {};
  try { const raw = siteSettings.find(s => s.key === "experience_section_config")?.value; if (raw) experienceConfig = JSON.parse(raw); } catch {}

  // Middle homepage sections support a configurable display order (currently Skills and
  // Experience expose an override) — default order matches the original fixed sequence.
  const middleSections = [
    { key:"about",          order:0,                          node:<AboutSection      profile={profile}           locale={safeLocale} /> },
    { key:"skills",         order:skillsConfig.order ?? 1,     node:<SkillsSection     categories={skillCats}      locale={safeLocale} config={skillsConfig} /> },
    { key:"experience",     order:experienceConfig.order ?? 2,     node:<ExperienceSection experience={experience}     locale={safeLocale} config={experienceConfig} /> },
    { key:"education",      order:3,                          node:<EducationSection  education={education}       locale={safeLocale} /> },
    { key:"certifications", order:4,                          node:<CertSection       certifications={certifications} locale={safeLocale} /> },
    { key:"journey",        order:5,                          node:<JourneySection    slides={journeySlides}      locale={safeLocale} /> },
    { key:"projects",       order:6,                          node:<ProjectsSection   projects={projects}         locale={safeLocale} /> },
  ].sort((a, b) => a.order - b.order);

  return (
    <>
      <HeroSection       profile={profile}           locale={safeLocale} heroBgImages={heroBgImages} />
      {middleSections.map(s => <Fragment key={s.key}>{s.node}</Fragment>)}
      <StatsSection profile={profile} />
      <ContactSection    profile={profile}    locale={safeLocale} workingHours={workingHours} />
    </>
  );
}