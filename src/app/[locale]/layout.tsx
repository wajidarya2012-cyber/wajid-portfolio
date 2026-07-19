import { NextIntlClientProvider } from "next-intl";
import { getMessages }           from "next-intl/server";
import { isRTL, locales }        from "@/i18n";
import Navbar                    from "@/components/shared/Navbar";
import Footer                    from "@/components/shared/Footer";
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
    where: { key: { in: ["brand_name", "brand_tagline"] } },
  }).catch(() => []);
  const brandMap = Object.fromEntries(brandSettings.map(s => [s.key, s.value]));

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <div dir={dir} lang={locale} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <ScrollUI />
          <Navbar locale={locale} brandName={brandMap.brand_name} brandTagline={brandMap.brand_tagline} />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer locale={locale} profile={profile} />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}