// Fixed routes/section IDs — not database-driven. Admins may only override label text
// (per locale), display order, visibility, and new-tab behaviour for these existing keys.
export const NAV_LINKS = [
  { key:"about",          href:"#about"          },
  { key:"skills",         href:"#skills"         },
  { key:"experience",     href:"#experience"     },
  { key:"certifications", href:"#certifications" },
  { key:"projects",       href:"#projects"       },
  { key:"gallery",        href:"/gallery"        },
  { key:"blog",           href:"/blog"           },
  { key:"contact",        href:"#contact"        },
];

// Default nav order, expressed on the same numeric scale the homepage actually renders
// sections on (see `middleSections` in `src/app/[locale]/page.tsx`): about=0, skills/
// experience default to 1/2 but are admin-configurable via their `*_section_config.order`
// (see `sectionOrder` param below), certifications/journey/projects are fixed at 4/5/6,
// gallery/blog/contact trail after. Using this shared scale — instead of raw array index —
// means an admin-configured skills/experience order is reflected in the nav automatically,
// without needing a second "nav order" edit to stay in sync.
const DEFAULT_SECTION_ORDER: Record<string, number> = {
  about: 0, skills: 1, experience: 2, certifications: 4, projects: 6, gallery: 6.5, blog: 7, contact: 8,
};

export type NavItemConfig = {
  key: string;
  label_en?: string; label_ps?: string; label_fa?: string;
  order?: number;
  visible?: boolean;
  newTab?: boolean;
};

export function buildNavItems(
  navConfig: NavItemConfig[] | undefined,
  locale: string,
  t: (key: string) => string,
  sectionOrder?: Record<string, number>,
) {
  const configByKey = new Map((navConfig ?? []).map(c => [c.key, c]));
  const order = { ...DEFAULT_SECTION_ORDER, ...sectionOrder };
  return NAV_LINKS
    .map((link, i) => {
      const cfg = configByKey.get(link.key);
      const label = (cfg && (locale === "ps" ? cfg.label_ps : locale === "fa" ? cfg.label_fa : cfg.label_en)) || t(link.key);
      return {
        key:     link.key,
        href:    link.href,
        label,
        order:   cfg?.order ?? order[link.key] ?? i,
        visible: cfg?.visible !== false,
        newTab:  cfg?.newTab === true,
      };
    })
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);
}
