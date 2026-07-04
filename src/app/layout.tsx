import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default:  "Wajid Ali Arya | IT Manager · Software Developer · DBA",
    template: "%s | Wajid Ali Arya",
  },
  description: "Professional portfolio of Wajid Ali Arya (واجد علی آریا) — IT & Network Manager, Software Developer, Database Administrator, and Network & Systems Specialist based in Jalalabad, Afghanistan.",
  keywords: ["Wajid Ali Arya","واجد علی آریا","IT Manager","Software Developer","Database Administrator","Afghanistan","Jalalabad","Network Specialist"],
  authors:  [{ name:"Wajid Ali Arya" }],
  creator:  "Wajid Ali Arya",
  icons: { icon:"/favicon.svg", shortcut:"/favicon.svg" },
  openGraph: {
    type:      "website",
    siteName:  "Wajid Ali Arya Portfolio",
    title:     "Wajid Ali Arya | IT Manager & Software Developer",
    description:"Transforming Ideas into Digital Solutions through Software Development, IT Management, and Innovation.",
    locale:    "en_US",
  },
  twitter: {
    card:  "summary_large_image",
    title: "Wajid Ali Arya | IT Manager & Software Developer",
  },
  robots: { index:true, follow:true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className="dark">
      <head>
        {/* Theme init — runs before paint, no flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.className=t;}catch(e){document.documentElement.className='dark';}})();` }} />
      </head>
      <body style={{ margin:0, padding:0 }}>{children}</body>
    </html>
  );
}
