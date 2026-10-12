import slugify from "slugify";

// ── Slug generator ─────────────────────────────────────────────────────────
// Lives apart from @/lib/utils on purpose: slugify is CommonJS and can't be tree-shaken, so while
// it was imported there every public component that used a utils helper shipped its character map.
// Only the admin project form needs it.
export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}
