// Fixed routes/section IDs — not database-driven. Admins may only override label text
// (per locale), display order, visibility, and new-tab behaviour for these existing keys.
export const NAV_LINKS = [
  { key:"about",          href:"#about"          },
  { key:"skills",         href:"#skills"         },
  { key:"experience",     href:"#experience"     },
  { key:"education",      href:"#education"      },
  { key:"certifications", href:"#certifications" },
  { key:"journey",        href:"#journey"        },
  { key:"projects",       href:"#projects"       },
  { key:"gallery",        href:"/gallery"        },
  { key:"blog",           href:"/blog"           },
  { key:"contact",        href:"#contact"        },
];

// Single source of truth for default section order — used as (1) the nav's default link
// order in Settings → Navigation Menu before an admin has explicitly reordered a key, and
// (2) `[locale]/page.tsx`'s fallback homepage section order before an admin has set an
// explicit nav order OR (for Skills/Experience/Education/Gallery) that section's own
// "Position on Homepage" field. Keeping this in one place — rather than duplicating literal
// order numbers in the nav admin UI and in page.tsx separately — is what lets reordering the
// nav and reordering the homepage section stay in sync. See resolveSectionOrder() below and
// docs/PUBLIC_MODULES.md.
export const DEFAULT_SECTION_ORDER: Record<string, number> = {
  about: 0, skills: 1, experience: 2, education: 3, certifications: 4, journey: 5,
  gallery: 5.5, projects: 6, blog: 7, contact: 8,
};

export type NavItemConfig = {
  key: string;
  label_en?: string; label_ps?: string; label_fa?: string;
  order?: number;
  visible?: boolean;
  newTab?: boolean;
};

// Resolves the effective display order for a nav/section key, in priority order:
// 1. An explicit order saved for this key in Settings → Navigation Menu (`nav_items`) —
//    read regardless of that item's `visible` flag, so a temporarily-hidden nav item keeps
//    its intended position for when it's shown again, and disabling a nav item never affects
//    where its homepage section renders (nav visibility and section visibility are separate
//    concerns — see docs/PUBLIC_MODULES.md).
// 2. `fallback`, if the caller passes one — used for the sections that also expose their own
//    admin-configurable "Position on Homepage" field (Skills/Experience/Education/Gallery).
// 3. `DEFAULT_SECTION_ORDER`'s fixed default for this key.
export function resolveSectionOrder(
  key: string,
  navConfig: NavItemConfig[] | undefined,
  fallback?: number,
): number {
  const cfg = (navConfig ?? []).find(c => c.key === key);
  if (typeof cfg?.order === "number") return cfg.order;
  if (typeof fallback === "number") return fallback;
  return DEFAULT_SECTION_ORDER[key] ?? 0;
}

export function buildNavItems(
  navConfig: NavItemConfig[] | undefined,
  locale: string,
  t: (key: string) => string,
  sectionOrder?: Record<string, number>,
) {
  return NAV_LINKS
    .map((link) => {
      const cfg = (navConfig ?? []).find(c => c.key === link.key);
      const label = (cfg && (locale === "ps" ? cfg.label_ps : locale === "fa" ? cfg.label_fa : cfg.label_en)) || t(link.key);
      return {
        key:     link.key,
        href:    link.href,
        label,
        order:   resolveSectionOrder(link.key, navConfig, sectionOrder?.[link.key]),
        visible: cfg?.visible !== false,
        newTab:  cfg?.newTab === true,
      };
    })
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);
}
