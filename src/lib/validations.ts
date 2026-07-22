import { z } from "zod";

// ── Shared helpers ─────────────────────────────────────────────────────────
const trilingualString = (minLen = 1) => ({
  en: z.string().min(minLen),
  ps: z.string().min(minLen),
  fa: z.string().min(minLen),
});

// ── Profile ────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  fullName_en:   z.string().min(2),
  fullName_ps:   z.string().min(2),
  fullName_fa:   z.string().min(2),
  title_en:      z.string().min(2),
  title_ps:      z.string().min(2),
  title_fa:      z.string().min(2),
  bio_en:        z.string().min(10),
  bio_ps:        z.string().min(10),
  bio_fa:        z.string().min(10),
  aboutText_en:  z.string().min(10),
  aboutText_ps:  z.string().min(10),
  aboutText_fa:  z.string().min(10),
  email:         z.string().email(),
  phone:         z.string().optional(),
  location:      z.string().optional(),
  linkedinUrl:   z.string().url().optional().or(z.literal("")),
  githubUrl:     z.string().url().optional().or(z.literal("")),
  twitterUrl:    z.string().url().optional().or(z.literal("")),
  websiteUrl:    z.string().url().optional().or(z.literal("")),
});

// ── Project Category ───────────────────────────────────────────────────────
export const projectCategorySchema = z.object({
  name_en:   z.string().min(2),
  name_ps:   z.string().min(1),
  name_fa:   z.string().min(1),
  description_en: z.string().optional(),
  description_ps: z.string().optional(),
  description_fa: z.string().optional(),
  slug:      z.string().min(2).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  color:     z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  icon:      z.string().min(1),
  sortOrder: z.number().int().min(0).optional(),
  visible:   z.boolean().optional(),
  featured:  z.boolean().optional(),
});

// ── Project ────────────────────────────────────────────────────────────────
export const projectSchema = z.object({
  title_en:       z.string().min(2),
  title_ps:       z.string().min(1),
  title_fa:       z.string().min(1),
  slug:           z.string().min(2).regex(/^[a-z0-9-]+$/),
  description_en: z.string().min(10),
  description_ps: z.string().min(1),
  description_fa: z.string().min(1),
  challenge_en:   z.string().optional(),
  challenge_ps:   z.string().optional(),
  challenge_fa:   z.string().optional(),
  technologies:   z.array(z.string()).min(1),
  categoryId:     z.preprocess((v) => (v === "" ? null : v), z.string().uuid().optional().nullable()),
  status:         z.enum(["ACTIVE", "ARCHIVED", "DRAFT"]).default("ACTIVE"),
  featured:       z.boolean().default(false),
  sortOrder:      z.number().int().min(0).optional(),
  startDate:      z.string().datetime().optional().nullable(),
  endDate:        z.string().datetime().optional().nullable(),
});

// ── Project Feature ────────────────────────────────────────────────────────
export const projectFeatureSchema = z.object({
  projectId: z.string().uuid(),
  text_en:   z.string().min(2),
  text_ps:   z.string().min(2),
  text_fa:   z.string().min(2),
  sortOrder: z.number().int().min(0).optional(),
});

// ── Project Link ───────────────────────────────────────────────────────────
export const projectLinkSchema = z.object({
  projectId: z.string().uuid(),
  label_en:  z.string().min(1),
  label_ps:  z.string().min(1),
  label_fa:  z.string().min(1),
  url:       z.string().url(),
  type:      z.enum(["demo", "github", "download", "video"]).default("demo"),
});

// ── Skill Category ─────────────────────────────────────────────────────────
export const skillCategorySchema = z.object({
  name_en:   z.string().min(2),
  name_ps:   z.string().min(1),
  name_fa:   z.string().min(1),
  icon:      z.string().min(1),
  sortOrder: z.number().int().min(0).optional(),
  visible:   z.boolean().optional(),
});

// ── Skill ──────────────────────────────────────────────────────────────────
export const skillSchema = z.object({
  name_en:    z.string().min(2),
  name_ps:    z.string().min(2),
  name_fa:    z.string().min(2),
  percentage: z.number().int().min(0).max(100),
  categoryId: z.string().min(1),
  sortOrder:  z.number().int().min(0).optional(),
  icon:       z.string().optional(),
  visible:    z.boolean().optional(),
  featured:   z.boolean().optional(),
});

// ── Experience ─────────────────────────────────────────────────────────────
export const experienceSchema = z.object({
  role_en:          z.string().min(2),
  role_ps:          z.string().min(1),
  role_fa:          z.string().min(1),
  organization_en:  z.string().min(2),
  organization_ps:  z.string().min(1),
  organization_fa:  z.string().min(1),
  description_en:   z.string().min(10),
  description_ps:   z.string().min(1),
  description_fa:   z.string().min(1),
  technologies:     z.array(z.string()).optional(),
  achievements:     z.array(z.string()).optional(),
  logoUrl:          z.string().optional().nullable(),
  logoPublicId:     z.string().optional().nullable(),
  employmentType:   z.string().optional().nullable(),
  featured:         z.boolean().optional(),
  visible:          z.boolean().optional(),
  startDate:        z.string().datetime(),
  endDate:          z.string().datetime().optional().nullable(),
  isCurrent:        z.boolean().default(false),
  sortOrder:        z.number().int().min(0).optional(),
});

// ── Education ─────────────────────────────────────────────────────────────
export const educationSchema = z.object({
  degree_en:      z.string().min(2),
  degree_ps:      z.string().min(1),
  degree_fa:      z.string().min(1),
  institution_en: z.string().min(2),
  institution_ps: z.string().min(1),
  institution_fa: z.string().min(1),
  fieldOfStudy_en: z.string().optional(),
  fieldOfStudy_ps: z.string().optional(),
  fieldOfStudy_fa: z.string().optional(),
  description_en: z.string().optional(),
  description_ps: z.string().optional(),
  description_fa: z.string().optional(),
  location:       z.string().optional(),
  startYear:      z.coerce.number().int().min(1950).max(2100),
  endYear:        z.coerce.number().int().min(1950).max(2100).nullable().optional(),
  gpa:            z.string().optional(),
  icon:           z.string().optional(),
  sortOrder:      z.number().int().optional(),
});

// ── Certification ─────────────────────────────────────────────────────────
export const certificationSchema = z.object({
  name_en:      z.string().min(2),
  name_ps:      z.string().min(1),
  name_fa:      z.string().min(1),
  issuer_en:    z.string().min(2),
  issuer_ps:    z.string().min(1),
  issuer_fa:    z.string().min(1),
  description_en: z.string().optional(),
  description_ps: z.string().optional(),
  description_fa: z.string().optional(),
  icon:           z.string().optional(),
  year:           z.number().int().optional().nullable(),
  credentialUrl:  z.string().url().optional().or(z.literal("")),
  sortOrder:      z.number().int().min(0).optional(),
});

// ── Journey Slide ────────────────────────────────────────────────────────────
export const journeySlideSchema = z.object({
  title_en:   z.string().min(2),
  title_ps:   z.string().min(1),
  title_fa:   z.string().min(1),
  caption_en: z.string().optional(),
  caption_ps: z.string().optional(),
  caption_fa: z.string().optional(),
  imageUrl:      z.string().min(1),
  imagePublicId: z.string().optional(),
  sortOrder:     z.number().int().min(0).optional(),
});

// ── Blog Post ──────────────────────────────────────────────────────────────
export const blogPostSchema = z.object({
  title_en:     z.string().min(2),
  title_ps:     z.string().min(1),
  title_fa:     z.string().min(1),
  slug:         z.string().min(2).regex(/^[a-z0-9-]+$/),
  content_en:   z.string().min(10),
  content_ps:   z.string().min(1),
  content_fa:   z.string().min(1),
  excerpt_en:   z.string().optional(),
  excerpt_ps:   z.string().optional(),
  excerpt_fa:   z.string().optional(),
  metaTitle_en: z.string().optional(),
  metaTitle_ps: z.string().optional(),
  metaTitle_fa: z.string().optional(),
  metaDesc_en:  z.string().optional(),
  metaDesc_ps:  z.string().optional(),
  metaDesc_fa:  z.string().optional(),
  coverImage:      z.string().url().optional().or(z.literal("")),
  coverPublicId:   z.string().optional(),
  featuredVideoUrl: z.string().url().optional().or(z.literal("")),
  status:       z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

// ── Gallery ────────────────────────────────────────────────────────────────
export const galleryItemSchema = z.object({
  caption_en: z.string().optional(),
  caption_ps: z.string().optional(),
  caption_fa: z.string().optional(),
  category:   z.string().min(1),
  sortOrder:  z.number().int().min(0).optional(),
});

// ── Contact ────────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  phone:   z.string().optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
});

// ── Analytics Track ────────────────────────────────────────────────────────
export const analyticsTrackSchema = z.object({
  sessionId: z.string().uuid(),
  page:      z.string().min(1),
  event:     z.enum(["PAGE_VIEW", "PROJECT_VIEW", "CV_DOWNLOAD", "CONTACT_SUBMIT", "BLOG_VIEW"]),
  projectId: z.string().uuid().optional(),
  referrer:  z.string().optional(),
});

// ── Auth ───────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword:     z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/, "Must contain uppercase and number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path:    ["confirmPassword"],
  });

export type ProfileInput          = z.infer<typeof profileSchema>;
export type ProjectCategoryInput  = z.infer<typeof projectCategorySchema>;
export type ProjectInput          = z.infer<typeof projectSchema>;
export type SkillCategoryInput    = z.infer<typeof skillCategorySchema>;
export type SkillInput            = z.infer<typeof skillSchema>;
export type ExperienceInput       = z.infer<typeof experienceSchema>;
export type EducationInput        = z.infer<typeof educationSchema>;
export type CertificationInput    = z.infer<typeof certificationSchema>;
export type JourneySlideInput     = z.infer<typeof journeySlideSchema>;
export type BlogPostInput         = z.infer<typeof blogPostSchema>;
export type GalleryItemInput      = z.infer<typeof galleryItemSchema>;
export type ContactInput          = z.infer<typeof contactSchema>;
export type AnalyticsTrackInput   = z.infer<typeof analyticsTrackSchema>;
export type LoginInput            = z.infer<typeof loginSchema>;