import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const DEFAULTS = {
  seo_default_title:       "Wajid Ali Arya | IT Manager · Software Developer · DBA",
  seo_default_description: "Professional portfolio of Wajid Ali Arya (واجد علی آریا) — IT & Network Manager, Software Developer, Database Administrator, and Network & Systems Specialist based in Jalalabad, Afghanistan.",
  brand_name:              "Wajid Ali Arya",
};

async function getSiteSettings() {
  try {
    const rows = await prisma.siteSettings.findMany({
      where: { key: { in: [
        "seo_default_title", "seo_default_description", "brand_name",
        "favicon_url", "og_image_url", "ga_measurement_id", "google_site_verification",
      ] } },
    });
    return Object.fromEntries(rows.map(r => [r.key, r.value])) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title       = s.seo_default_title       || DEFAULTS.seo_default_title;
  const description = s.seo_default_description || DEFAULTS.seo_default_description;
  const brandName   = s.brand_name              || DEFAULTS.brand_name;
  const favicon     = s.favicon_url             || "/favicon.svg";
  const ogImage     = s.og_image_url;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: {
      default:  title,
      template: `%s | ${brandName}`,
    },
    description,
    keywords: ["Wajid Ali Arya","واجد علی آریا","IT Manager","Software Developer","Database Administrator","Afghanistan","Jalalabad","Network Specialist"],
    authors:  [{ name: brandName }],
    creator:  brandName,
    icons: { icon: favicon, shortcut: favicon },
    openGraph: {
      type:      "website",
      siteName:  `${brandName} Portfolio`,
      title,
      description,
      locale:    "en_US",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card:  "summary_large_image",
      title,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: { index:true, follow:true },
    ...(s.google_site_verification ? { verification: { google: s.google_site_verification } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();
  const gaId = s.ga_measurement_id;

  return (
    <html suppressHydrationWarning className="dark">
      <head>
        {/* Theme init — runs before paint, no flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.className=t;}catch(e){document.documentElement.className='dark';}})();` }} />
      </head>
      <body style={{ margin:0, padding:0 }}>
        {children}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
