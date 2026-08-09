import { Fragment } from "react";
import { setRequestLocale } from "next-intl/server";
import { prisma }          from "@/lib/prisma";
import { resolveSectionOrder, type NavItemConfig } from "@/lib/navConfig";
import HeroSection         from "@/components/public/HeroSection";
import AboutSection        from "@/components/public/AboutSection";
import SkillsSection       from "@/components/public/SkillsSection";
import ExperienceSection   from "@/components/public/ExperienceSection";
import EducationSection    from "@/components/public/EducationSection";
import CertSection         from "@/components/public/CertSection";
import JourneySection      from "@/components/public/JourneySection";
import GallerySection      from "@/components/public/GallerySection";
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
  // Required by next-intl for the App Router: binds requestLocale for this render so
  // getMessages()/useTranslations() resolve the right locale instead of silently
  // falling back to the default (en) — see docs/DEBUGGING_GUIDE.md.
  setRequestLocale(safeLocale);

const [profile, skillCats, experience, education, certifications, journeySlides, projects, galleryItems, siteSettings] = await Promise.all([
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
    prisma.galleryItem.findMany({
      where:   { visible: true, showOnHomepage: true },
      orderBy: [{ featured:"desc" }, { sortOrder:"asc" }],
      take:    8,
    }).catch(() => []),
    prisma.siteSettings.findMany({ where: { key: { in: ["contact_working_hours", "hero_bg_images", "skills_section_config", "experience_section_config", "gallery_section_config", "education_section_config", "nav_items"] } } }).catch(() => []),
  ]);
  const workingHours = siteSettings.find(s => s.key === "contact_working_hours")?.value;
  const heroBgImagesRaw = siteSettings.find(s => s.key === "hero_bg_images")?.value;
  let heroBgSlides: import("@/components/public/HeroSection").HeroBgSlide[] = [];
  try {
    const parsed = heroBgImagesRaw ? JSON.parse(heroBgImagesRaw) : [];
    if (Array.isArray(parsed)) {
      heroBgSlides = parsed
        .map((entry: unknown): Record<string, unknown> =>
          typeof entry === "string" ? { desktopUrl: entry } : (entry as Record<string, unknown>) ?? {})
        .filter((s: Record<string, unknown>): s is import("@/components/public/HeroSection").HeroBgSlide =>
          typeof s.desktopUrl === "string");
    }
  } catch {}
  let skillsConfig: import("@/components/public/SkillsSection").SkillsSectionConfig = {};
  try { const raw = siteSettings.find(s => s.key === "skills_section_config")?.value; if (raw) skillsConfig = JSON.parse(raw); } catch {}
  let experienceConfig: import("@/components/public/ExperienceSection").ExperienceSectionConfig = {};
  try { const raw = siteSettings.find(s => s.key === "experience_section_config")?.value; if (raw) experienceConfig = JSON.parse(raw); } catch {}
  let galleryConfig: import("@/components/public/GallerySection").GallerySectionConfig = {};
  try { const raw = siteSettings.find(s => s.key === "gallery_section_config")?.value; if (raw) galleryConfig = JSON.parse(raw); } catch {}
  let educationConfig: import("@/components/public/EducationSection").EducationSectionConfig = {};
  try { const raw = siteSettings.find(s => s.key === "education_section_config")?.value; if (raw) educationConfig = JSON.parse(raw); } catch {}

  // Settings → Navigation Menu (`nav_items`) is the single source of truth for section order,
  // for every section key that also has a nav link — see resolveSectionOrder() in
  // @/lib/navConfig and docs/PUBLIC_MODULES.md. A key's saved order is read regardless of
  // that nav item's visibility, so disabling a nav link never affects whether — or where —
  // its homepage section renders; visibility only controls the nav link itself (see
  // buildNavItems()/Navbar.tsx). Falls back to each section's own "Position on Homepage"
  // field (Skills/Experience/Education/Gallery), then to a fixed default, so nothing changes
  // for a site that has never touched Settings → Navigation Menu.
  let navConfig: NavItemConfig[] = [];
  try {
    const raw = siteSettings.find(s => s.key === "nav_items")?.value;
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) navConfig = parsed;
  } catch {}

  // Stats has no nav link of its own, so it always renders immediately before Contact rather
  // than being independently orderable.
  const middleSections = [
    { key:"about",          order:resolveSectionOrder("about", navConfig),                             node:<AboutSection      profile={profile}           locale={safeLocale} /> },
    { key:"skills",         order:resolveSectionOrder("skills", navConfig, skillsConfig.order),         node:<SkillsSection     categories={skillCats}      locale={safeLocale} config={skillsConfig} /> },
    { key:"experience",     order:resolveSectionOrder("experience", navConfig, experienceConfig.order), node:<ExperienceSection experience={experience}     locale={safeLocale} config={experienceConfig} /> },
    { key:"education",      order:resolveSectionOrder("education", navConfig, educationConfig.order),   node:<EducationSection  education={education}       locale={safeLocale} config={educationConfig} /> },
    { key:"certifications", order:resolveSectionOrder("certifications", navConfig),                     node:<CertSection       certifications={certifications} locale={safeLocale} /> },
    { key:"journey",        order:resolveSectionOrder("journey", navConfig),                            node:<JourneySection    slides={journeySlides}      locale={safeLocale} /> },
    { key:"gallery",        order:resolveSectionOrder("gallery", navConfig, galleryConfig.order),       node:<GallerySection    items={galleryItems}        locale={safeLocale} config={galleryConfig} /> },
    { key:"projects",       order:resolveSectionOrder("projects", navConfig),                           node:<ProjectsSection   projects={projects}         locale={safeLocale} /> },
    { key:"contact",        order:resolveSectionOrder("contact", navConfig),                            node:<><StatsSection profile={profile} /><ContactSection profile={profile} locale={safeLocale} workingHours={workingHours} /></> },
  ].sort((a, b) => a.order - b.order);

  return (
    <>
      <HeroSection       profile={profile}           locale={safeLocale} heroBgSlides={heroBgSlides} />
      {middleSections.map(s => <Fragment key={s.key}>{s.node}</Fragment>)}
    </>
  );
}