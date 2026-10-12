import type { Metadata } from "next";
import Script from "next/script";
import { Syne, Inter, Fira_Code, Noto_Naskh_Arabic } from "next/font/google";
import { prisma } from "@/lib/prisma";
import "./globals.css";

// Self-hosted via next/font instead of a Google Fonts @import in globals.css, which chained
// HTML → CSS → fonts.googleapis.com CSS before first paint. Same families and weights as the
// old @import; each loader defines the CSS variable globals.css and Tailwind already read.
// Fira and Noto are not preloaded: Fira is small UI text, and preloading Noto would make
// English pages download the Arabic font.
// adjustFontFallback:false keeps each stack as "<font>", <generic> like the old @import.
// Syne/Inter/Fira have no Arabic glyphs, so Pashto/Dari text styled with them falls through
// to the system font; next/font's metric-adjusted local("Arial") fallback face would
// otherwise catch those glyphs and change how ps/fa headings and labels render.
const syne  = Syne({ subsets:["latin"], weight:["400","600","700","800"], display:"swap", variable:"--font-syne", fallback:["sans-serif"], adjustFontFallback:false });
const inter = Inter({ subsets:["latin"], weight:["300","400","500","600","700"], display:"swap", variable:"--font-inter", fallback:["sans-serif"], adjustFontFallback:false });
const fira  = Fira_Code({ subsets:["latin"], weight:["400","500"], display:"swap", variable:"--font-fira", fallback:["monospace"], adjustFontFallback:false, preload:false });
const noto  = Noto_Naskh_Arabic({ subsets:["arabic","latin"], weight:["400","500","600","700"], display:"swap", variable:"--font-noto-arabic", fallback:["sans-serif"], adjustFontFallback:false, preload:false });
const fontVariables = `${syne.variable} ${inter.variable} ${fira.variable} ${noto.variable}`;

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
      {/* Font variables live on <body>, not <html>: the theme script above and ThemeProvider
          overwrite document.documentElement.className wholesale, which would drop them. */}
      <body className={fontVariables} style={{ margin:0, padding:0 }}>
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
