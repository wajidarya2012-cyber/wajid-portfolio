import type {
  Project,
  ProjectImage,
  ProjectFeature,
  ProjectLink,
  ProjectCategory,
  Skill,
  SkillCategory,
  Experience,
  Education,
  Certification,
  BlogPost,
  GalleryItem,
  ContactMessage,
  Profile,
  ActivityLog,
  User,
} from "@prisma/client";

// ── Re-export Prisma types ─────────────────────────────────────────────────
export type {
  Project, ProjectImage, ProjectFeature, ProjectLink, ProjectCategory,
  Skill, SkillCategory, Experience, Education, Certification,
  BlogPost, GalleryItem, ContactMessage, Profile, ActivityLog, User,
};

// ── Enriched / joined types ────────────────────────────────────────────────
export type ProjectWithRelations = Project & {
  category:  ProjectCategory | null;
  images:    ProjectImage[];
  features:  ProjectFeature[];
  links:     ProjectLink[];
};

export type SkillWithCategory = Skill & {
  category: SkillCategory;
};

export type SkillCategoryWithSkills = SkillCategory & {
  skills: Skill[];
};

export type ActivityLogWithUser = ActivityLog & {
  user: Pick<User, "id" | "name" | "email">;
};

// ── API response wrapper ───────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data:    T[];
  meta: {
    total:    number;
    page:     number;
    limit:    number;
    pages:    number;
  };
}

// ── Analytics ──────────────────────────────────────────────────────────────
export interface AnalyticsSummary {
  totalVisitors:     number;
  totalPageViews:    number;
  cvDownloads:       number;
  contactSubmits:    number;
  newMessages:       number;
  totalProjects:     number;
  publishedPosts:    number;
  galleryItems:      number;
}

export interface VisitorTrend {
  date:   string;
  views:  number;
  unique: number;
}

export interface TopPage {
  page:   string;
  views:  number;
}

export interface TopProject {
  id:       string;
  title_en: string;
  slug:     string;
  views:    number;
}

export interface CountryStats {
  country: string;
  count:   number;
}

// ── Locale types ───────────────────────────────────────────────────────────
export type Locale = "en" | "ps" | "fa";

// ── Theme ──────────────────────────────────────────────────────────────────
export type Theme = "dark" | "light";

// ── Upload ─────────────────────────────────────────────────────────────────
export interface UploadedFile {
  url:      string;
  publicId: string;
  name:     string;
  size:     number;
  type:     string;
}

// ── Admin sidebar nav ──────────────────────────────────────────────────────
export interface NavItem {
  label:    string;
  href:     string;
  icon:     string;
  badge?:   number;
  children?: NavItem[];
}
