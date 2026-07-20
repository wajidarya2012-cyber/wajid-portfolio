// Fixed routes/section IDs — not database-driven. Admins may only override label text
// (per locale), display order, visibility, and new-tab behaviour for these existing keys.
export const NAV_LINKS = [
  { key:"about",          href:"#about"          },
  { key:"skills",         href:"#skills"         },
  { key:"experience",     href:"#experience"     },
  { key:"certifications", href:"#certifications" },
  { key:"projects",       href:"#projects"       },
  { key:"blog",           href:"/blog"           },
  { key:"contact",        href:"#contact"        },
];

export type NavItemConfig = {
  key: string;
  label_en?: string; label_ps?: string; label_fa?: string;
  order?: number;
  visible?: boolean;
  newTab?: boolean;
};

export function buildNavItems(navConfig: NavItemConfig[] | undefined, locale: string, t: (key: string) => string) {
  const configByKey = new Map((navConfig ?? []).map(c => [c.key, c]));
  return NAV_LINKS
    .map((link, i) => {
      const cfg = configByKey.get(link.key);
      const label = (cfg && (locale === "ps" ? cfg.label_ps : locale === "fa" ? cfg.label_fa : cfg.label_en)) || t(link.key);
      return {
        key:     link.key,
        href:    link.href,
        label,
        order:   cfg?.order ?? i,
        visible: cfg?.visible !== false,
        newTab:  cfg?.newTab === true,
      };
    })
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);
}
