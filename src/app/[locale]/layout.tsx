import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { isRTL, locales }        from "@/i18n";
import Navbar                    from "@/components/shared/Navbar";
import Footer                    from "@/components/shared/Footer";
import TranslateWidget           from "@/components/shared/TranslateWidget";
import ThemeProvider             from "@/components/shared/ThemeProvider";
import ScrollUI                  from "@/components/shared/ScrollUI";
import { prisma }                from "@/lib/prisma";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params:   { locale: string };
}) {
  // Required by next-intl for the App Router: binds requestLocale for this render so
  // getMessages()/useTranslations() resolve the right locale instead of silently
  // falling back to the default (en) — must run before getMessages(). See
  // docs/DEBUGGING_GUIDE.md.
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir      = isRTL(locale) ? "rtl" : "ltr";
  const profile  = await prisma.profile.findFirst().catch(() => null);
  const brandSettings = await prisma.siteSettings.findMany({
    where: { key: { in: [
      "brand_name", "brand_tagline", "logo_url", "nav_items",
      "footer_visibility", "legal_privacy_url", "legal_terms_url", "contact_working_hours",
      "translate_widget_config", "skills_section_config", "experience_section_config",
      "education_section_config", "gallery_section_config",
    ] } },
  }).catch(() => []);
  const brandMap = Object.fromEntries(brandSettings.map(s => [s.key, s.value]));
  let navConfig: import("@/lib/navConfig").NavItemConfig[] = [];
  try { const parsed = brandMap.nav_items ? JSON.parse(brandMap.nav_items) : []; if (Array.isArray(parsed)) navConfig = parsed; } catch {}
  // Nav order for the Skills/Experience/Education/Gallery links defaults to their actual
  // configured homepage section order (same SiteSettings keys page.tsx reads), so the nav
  // stays in sync with the rendered section order instead of a separately-hardcoded nav
  // sequence. Once an admin sets an explicit order for a key in Settings → Navigation Menu,
  // that takes priority over this default (see resolveSectionOrder() in @/lib/navConfig).
  const sectionOrder: Record<string, number> = {};
  try { const raw = brandMap.skills_section_config;     if (raw) { const c = JSON.parse(raw); if (typeof c.order === "number") sectionOrder.skills     = c.order; } } catch {}
  try { const raw = brandMap.experience_section_config; if (raw) { const c = JSON.parse(raw); if (typeof c.order === "number") sectionOrder.experience = c.order; } } catch {}
  try { const raw = brandMap.education_section_config;  if (raw) { const c = JSON.parse(raw); if (typeof c.order === "number") sectionOrder.education  = c.order; } } catch {}
  try { const raw = brandMap.gallery_section_config;    if (raw) { const c = JSON.parse(raw); if (typeof c.order === "number") sectionOrder.gallery    = c.order; } } catch {}
  let footerVisibility: Record<string, boolean> = {};
  try { footerVisibility = brandMap.footer_visibility ? JSON.parse(brandMap.footer_visibility) : {}; } catch {}
  let translateConfig: import("@/components/shared/TranslateWidget").TranslateWidgetConfig = {};
  try { translateConfig = brandMap.translate_widget_config ? JSON.parse(brandMap.translate_widget_config) : {}; } catch {}

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <div dir={dir} lang={locale} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <ScrollUI />
          <Navbar locale={locale} brandName={brandMap.brand_name} brandTagline={brandMap.brand_tagline} logoUrl={brandMap.logo_url} navConfig={navConfig} sectionOrder={sectionOrder} />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer
            locale={locale}
            profile={profile}
            navConfig={navConfig}
            sectionOrder={sectionOrder}
            footerVisibility={footerVisibility}
            workingHours={brandMap.contact_working_hours}
            legalLinks={{ privacyUrl: brandMap.legal_privacy_url, termsUrl: brandMap.legal_terms_url }}
          />
          <TranslateWidget locale={locale} config={translateConfig} />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}