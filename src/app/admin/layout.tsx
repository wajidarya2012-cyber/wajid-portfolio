import type { Metadata }  from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default:  "Admin | Wajid Ali Arya",
    template: "%s | Admin",
  },
  icons: { icon: "/favicon.svg" },
};

/**
 * This layout wraps ALL /admin/* routes — including /admin/login.
 * It must NOT contain any authentication check or redirect,
 * otherwise the login page would cause an infinite redirect loop.
 *
 * Authentication is handled inside (protected)/layout.tsx which only
 * wraps authenticated pages (/admin/dashboard, /admin/profile, etc.)
 *
 * No manual <link> tags are rendered here — Next.js injects favicon
 * links from the `metadata.icons` export above. Manually duplicating
 * them in JSX causes a server/client <head> mismatch (hydration error)
 * because Next.js's own injected tags don't match hand-written ones.
 * Google Fonts are loaded globally via @import in globals.css instead.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.className=t;}catch(e){document.documentElement.className='dark';}})();`,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
