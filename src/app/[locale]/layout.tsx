import { NextIntlClientProvider } from "next-intl";
import { getMessages }           from "next-intl/server";
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
  const messages = await getMessages();
  const dir      = isRTL(locale) ? "rtl" : "ltr";
  const profile  = await prisma.profile.findFirst().catch(() => null);
  const brandSettings = await prisma.siteSettings.findMany({
    where: { key: { in: [
      "brand_name", "brand_tagline", "logo_url", "nav_items",
      "footer_visibility", "legal_privacy_url", "legal_terms_url", "contact_working_hours",
      "translate_widget_config",
    ] } },
  }).catch(() => []);
  const brandMap = Object.fromEntries(brandSettings.map(s => [s.key, s.value]));
  let navConfig: import("@/lib/navConfig").NavItemConfig[] = [];
  try { const parsed = brandMap.nav_items ? JSON.parse(brandMap.nav_items) : []; if (Array.isArray(parsed)) navConfig = parsed; } catch {}
  let footerVisibility: Record<string, boolean> = {};
  try { footerVisibility = brandMap.footer_visibility ? JSON.parse(brandMap.footer_visibility) : {}; } catch {}
  let translateConfig: import("@/components/shared/TranslateWidget").TranslateWidgetConfig = {};
  try { translateConfig = brandMap.translate_widget_config ? JSON.parse(brandMap.translate_widget_config) : {}; } catch {}

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <div dir={dir} lang={locale} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <ScrollUI />
          <Navbar locale={locale} brandName={brandMap.brand_name} brandTagline={brandMap.brand_tagline} logoUrl={brandMap.logo_url} navConfig={navConfig} />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer
            locale={locale}
            profile={profile}
            navConfig={navConfig}
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