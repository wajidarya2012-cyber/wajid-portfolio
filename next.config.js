const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["geoip-lite"],
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
  // Phase 35: the app previously sent no security headers at all. These are the
  // headers that are safe to apply unconditionally - they do not restrict script,
  // style, image or font sources, so Next.js, Cloudinary, Google Analytics, the
  // Google Translate widget, next-intl routing and NextAuth are all unaffected.
  //
  // A Content-Security-Policy is deliberately NOT set here. This app inlines a
  // pre-hydration theme script, loads Google Fonts, gtag and the Translate widget,
  // and Next.js injects its own inline bootstrap - a CSP tight enough to be worth
  // having would need a nonce pipeline and careful per-source allow-listing, which
  // cannot be verified safe in this pass. Tracked as a recommendation instead.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stop MIME sniffing (matters for the Cloudinary-served uploads).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking: /admin/login must not be framable by another origin.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Do not leak full admin URLs/query strings to third-party origins.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // No feature of this site needs these.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Ignored by browsers over plain http, so local dev is unaffected.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: false,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);