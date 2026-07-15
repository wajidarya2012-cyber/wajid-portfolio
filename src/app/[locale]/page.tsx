import { prisma }          from "@/lib/prisma";
import HeroSection         from "@/components/public/HeroSection";
import AboutSection        from "@/components/public/AboutSection";
import SkillsSection       from "@/components/public/SkillsSection";
import ExperienceSection   from "@/components/public/ExperienceSection";
import EducationSection    from "@/components/public/EducationSection";
import CertSection         from "@/components/public/CertSection";
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

const [profile, skillCats, experience, education, certifications, projects] = await Promise.all([
    prisma.profile.findFirst().catch(() => null),
    prisma.skillCategory.findMany({
      include: { skills: { orderBy: { sortOrder:"asc" } } },
      orderBy: { sortOrder:"asc" },
    }).catch(() => []),
    prisma.experience.findMany({ orderBy: { sortOrder:"asc" } }).catch(() => []),
    prisma.education.findMany({  orderBy: { sortOrder:"asc" } }).catch(() => []),
    prisma.certification.findMany({ orderBy: { sortOrder:"asc" } }).catch(() => []),
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
  ]);

  return (
    <>
      <HeroSection       profile={profile}           locale={safeLocale} />
      <AboutSection      profile={profile}           locale={safeLocale} />
      <SkillsSection     categories={skillCats}      locale={safeLocale} />
      <ExperienceSection experience={experience}     locale={safeLocale} />
      <EducationSection  education={education}       locale={safeLocale} />
      <CertSection       certifications={certifications} locale={safeLocale} />
      <ProjectsSection   projects={projects}         locale={safeLocale} />
      <StatsSection profile={profile} />
      <ContactSection    profile={profile}    locale={safeLocale} />
    </>
  );
}