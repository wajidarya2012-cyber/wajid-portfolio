"use client";

// Client component so it can read the active locale: Next.js does not pass `params`
// to not-found.tsx, and this file renders inside [locale]/layout.tsx's
// NextIntlClientProvider, so useTranslations() resolves the right bundle.
// Previously this hardcoded English text and a fixed href="/en", which sent Pashto
// and Dari visitors to the English homepage.
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales } from "@/i18n";

export default function LocaleNotFound() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale = locales.includes(segment as (typeof locales)[number]) ? segment : "en";

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: "800", marginBottom: "1rem" }}>404</h1>
        <p style={{ marginBottom: "1rem" }}>{t("notFound")}</p>
        <Link href={`/${locale}`} style={{ color: "#6366f1" }}>{t("backHome")}</Link>
      </div>
    </div>
  );
}
