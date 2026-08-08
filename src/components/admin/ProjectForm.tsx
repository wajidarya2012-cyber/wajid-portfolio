"use client";

import { useState, useCallback } from "react";
import { useRouter }             from "next/navigation";
import { useForm }               from "react-hook-form";
import { zodResolver }           from "@hookform/resolvers/zod";
import { useDropzone }           from "react-dropzone";
import { projectSchema, ProjectInput } from "@/lib/validations";
import type { ProjectWithRelations, ProjectCategory } from "@/types";
import { createSlug }            from "@/lib/utils";

const LOCALES = [
  { key: "en", label: "English" },
  { key: "ps", label: "پښتو" },
  { key: "fa", label: "دری" },
] as const;

const STATUS_OPTIONS = ["ACTIVE", "DRAFT", "ARCHIVED"];
const LINK_TYPES = ["demo", "github", "documentation", "download", "video"] as const;

interface UploadedImage { url: string; publicId: string; isThumbnail: boolean; caption: string }

export default function ProjectForm({
  project,
  categories,
}: {
  project?:    ProjectWithRelations;
  categories:  ProjectCategory[];
}) {
  const router = useRouter();
  const isEdit = !!project;

  const [activeLocale, setActiveLocale]   = useState<"en" | "ps" | "fa">("en");
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState("");
  const [technologies, setTechnologies]   = useState<string[]>(project?.technologies ?? []);
  const [techInput, setTechInput]         = useState("");
  const [features, setFeatures]           = useState(
    project?.features.map(f => ({ id: f.id, en: f.text_en, ps: f.text_ps, fa: f.text_fa })) ?? []
  );
  const [images, setImages]               = useState<UploadedImage[]>(
    project?.images.map(i => ({ url: i.url, publicId: i.publicId, isThumbnail: i.isThumbnail, caption: i.caption ?? "" })) ?? []
  );
  const [links, setLinks]                 = useState(
    project?.links.map(l => ({ id: l.id, label_en: l.label_en, label_ps: l.label_ps, label_fa: l.label_fa, url: l.url, type: l.type })) ?? []
  );
  const [uploading, setUploading]         = useState(false);
  const [seoOpen, setSeoOpen]             = useState(false);

  const p = project as unknown as Record<string, unknown> | undefined;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      title_en: project.title_en, title_ps: project.title_ps, title_fa: project.title_fa,
      slug: project.slug,
      description_en: project.description_en, description_ps: project.description_ps, description_fa: project.description_fa,
      challenge_en: project.challenge_en ?? "", challenge_ps: project.challenge_ps ?? "", challenge_fa: project.challenge_fa ?? "",
      technologies: project.technologies,
      categoryId: project.categoryId ?? undefined,
      status: project.status,
      featured: project.featured,
      sortOrder: project.sortOrder,
      visible: (p?.visible as boolean) ?? true,
      showOnHomepage: (p?.showOnHomepage as boolean) ?? true,
      clientName: (p?.clientName as string) ?? "",
      location: (p?.location as string) ?? "",
      endDate: p?.endDate ? new Date(p.endDate as string).toISOString().slice(0, 10) : "",
      seoTitle_en: (p?.seoTitle_en as string) ?? "", seoTitle_ps: (p?.seoTitle_ps as string) ?? "", seoTitle_fa: (p?.seoTitle_fa as string) ?? "",
      seoDescription_en: (p?.seoDescription_en as string) ?? "", seoDescription_ps: (p?.seoDescription_ps as string) ?? "", seoDescription_fa: (p?.seoDescription_fa as string) ?? "",
    } : { status: "ACTIVE", featured: false, visible: true, showOnHomepage: true },
  });

  // Auto-generate slug from title_en
  const titleEn = watch("title_en");

  // ── Image dropzone ────────────────────────────────────────────────────
  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "projects");
      const res  = await fetch("/api/v1/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setImages(prev => [...prev, { url: data.data.url, publicId: data.data.publicId, isThumbnail: prev.length === 0, caption: "" }]);
      }
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 5 * 1024 * 1024,
  });

  function moveImage(i: number, dir: -1 | 1) {
    setImages(prev => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  // ── Technologies ───────────────────────────────────────────────────────
  function addTech() {
    const t = techInput.trim();
    if (t && !technologies.includes(t)) {
      const next = [...technologies, t];
      setTechnologies(next);
      setValue("technologies", next);
    }
    setTechInput("");
  }
  function removeTech(t: string) {
    const next = technologies.filter(x => x !== t);
    setTechnologies(next);
    setValue("technologies", next);
  }

  // ── Features ───────────────────────────────────────────────────────────
  function addFeature()                     { setFeatures(prev => [...prev, { id: "", en: "", ps: "", fa: "" }]); }
  function updateFeature(i: number, k: string, v: string) {
    setFeatures(prev => prev.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  }
  function removeFeature(i: number)         { setFeatures(prev => prev.filter((_, idx) => idx !== i)); }

  // ── Links ──────────────────────────────────────────────────────────────
  function addLink() { setLinks(prev => [...prev, { id:"", label_en:"", label_ps:"", label_fa:"", url:"", type:"demo" }]); }
  function updateLink(i: number, k: string, v: string) {
    setLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  }
  function removeLink(i: number) { setLinks(prev => prev.filter((_, idx) => idx !== i)); }

  // ── Submit ─────────────────────────────────────────────────────────────
  async function onSubmit(data: ProjectInput) {
    setSaving(true);
    setError("");
    try {
      const normalizedEndDate = data.endDate && !data.endDate.includes("T")
        ? new Date(`${data.endDate}T00:00:00.000Z`).toISOString()
        : data.endDate;
      const payload = { ...data, endDate: normalizedEndDate, technologies, features, images, links };
      const url     = isEdit ? `/api/v1/admin/projects/${project!.id}` : "/api/v1/admin/projects";
      const method  = isEdit ? "PUT" : "POST";
      const res     = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json    = await res.json();
      if (json.success) router.push("/admin/projects");
      else              setError(json.error ?? "Failed to save.");
    } catch {
      setError("Network error.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Locale tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-secondary)" }}>
        {LOCALES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveLocale(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeLocale === key ? "bg-primary-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Core fields — trilingual */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold mb-2">Content ({activeLocale.toUpperCase()})</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Title ({activeLocale})*</label>
            <input
              key={`title_${activeLocale}`}
              {...register(`title_${activeLocale}` as "title_en")}
              onBlur={(e) => { if (activeLocale === "en" && !isEdit) setValue("slug", createSlug(e.target.value)); }}
              className="input-field"
            />
            {errors[`title_${activeLocale}` as "title_en"] && (
              <p className="text-xs text-red-400 mt-1">{errors[`title_${activeLocale}` as "title_en"]?.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Slug (auto-generated)*</label>
            <input {...register("slug")} className="input-field font-code text-xs" />
            {errors.slug && <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Description ({activeLocale})*</label>
          <textarea key={`description_${activeLocale}`} {...register(`description_${activeLocale}` as "description_en")} rows={4} className="input-field resize-none" />
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Challenge Solved ({activeLocale})</label>
          <textarea key={`challenge_${activeLocale}`} {...register(`challenge_${activeLocale}` as "challenge_en")} rows={3} className="input-field resize-none" />
        </div>
      </div>

      {/* Meta */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold mb-2">Project Details</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Category</label>
            <select {...register("categoryId")} className="input-field">
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Status</label>
            <select {...register("status")} className="input-field">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Sort Order</label>
            <input {...register("sortOrder", { valueAsNumber: true })} type="number" className="input-field" />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Client / Organization</label>
            <input {...register("clientName")} placeholder="Optional" className="input-field" />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Location</label>
            <input {...register("location")} placeholder="Optional" className="input-field" />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Completion Date</label>
            <input {...register("endDate")} type="date" className="input-field" />
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register("featured")} type="checkbox" className="w-4 h-4 accent-primary-600 rounded" />
            <span className="text-sm">Feature this project on homepage</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register("visible")} type="checkbox" className="w-4 h-4 accent-primary-600 rounded" />
            <span className="text-sm">Visible on public site</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register("showOnHomepage")} type="checkbox" className="w-4 h-4 accent-primary-600 rounded" />
            <span className="text-sm">Show in homepage Projects section</span>
          </label>
        </div>
      </div>

      {/* Technologies */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display font-bold mb-4">Technologies</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
            placeholder="e.g. Python, Oracle, Node.js"
            className="input-field flex-1"
          />
          <button type="button" onClick={addTech} className="btn-secondary px-4 py-2 text-sm">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {technologies.map(t => (
            <span key={t} className="tag-badge flex items-center gap-1.5">
              {t}
              <button type="button" onClick={() => removeTech(t)} className="hover:text-red-400 transition-colors">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold">Key Features</h2>
          <button type="button" onClick={addFeature} className="text-xs px-3 py-1.5 rounded-lg border hover:border-primary-500 hover:text-white transition-all" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            + Add Feature
          </button>
        </div>
        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={i} className="grid sm:grid-cols-3 gap-2 items-start">
              <input value={f.en} onChange={e => updateFeature(i, "en", e.target.value)} placeholder="English" className="input-field text-xs" />
              <input value={f.ps} onChange={e => updateFeature(i, "ps", e.target.value)} placeholder="پښتو" className="input-field text-xs" dir="rtl" />
              <div className="flex gap-2">
                <input value={f.fa} onChange={e => updateFeature(i, "fa", e.target.value)} placeholder="دری" className="input-field text-xs flex-1" dir="rtl" />
                <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300 px-2 shrink-0">×</button>
              </div>
            </div>
          ))}
          {features.length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No features added yet.</p>}
        </div>
      </div>

      {/* Links */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold">Project Links</h2>
          <button type="button" onClick={addLink} className="text-xs px-3 py-1.5 rounded-lg border hover:border-primary-500 hover:text-white transition-all" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            + Add Link
          </button>
        </div>
        <div className="space-y-3">
          {links.map((l, i) => (
            <div key={i} className="grid sm:grid-cols-5 gap-2 items-start">
              <select value={l.type} onChange={e => updateLink(i, "type", e.target.value)} className="input-field text-xs">
                {LINK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input value={l.label_en} onChange={e => updateLink(i, "label_en", e.target.value)} placeholder="Label (EN)" className="input-field text-xs" />
              <input value={l.label_ps} onChange={e => updateLink(i, "label_ps", e.target.value)} placeholder="پښتو" className="input-field text-xs" dir="rtl" />
              <input value={l.label_fa} onChange={e => updateLink(i, "label_fa", e.target.value)} placeholder="دری" className="input-field text-xs" dir="rtl" />
              <div className="flex gap-2">
                <input value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="https://..." className="input-field text-xs flex-1" />
                <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-300 px-2 shrink-0">×</button>
              </div>
            </div>
          ))}
          {links.length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No links added yet.</p>}
        </div>
      </div>

      {/* Image upload */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display font-bold mb-4">Project Images</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive ? "border-primary-500 bg-primary-500/10" : "hover:border-primary-500/50"
          }`}
          style={{ borderColor: isDragActive ? "" : "var(--border)" }}
        >
          <input {...getInputProps()} />
          <p className="text-3xl mb-2">🖼</p>
          <p className="text-sm font-medium">{isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>JPG, PNG, WebP · Max 5MB each</p>
          {uploading && <p className="text-xs mt-2 text-accent-400 animate-pulse">Uploading...</p>}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <div className="flex gap-1 w-full">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="text-[10px] px-2 py-1 rounded bg-white/20 text-white flex-1 disabled:opacity-30">◀</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="text-[10px] px-2 py-1 rounded bg-white/20 text-white flex-1 disabled:opacity-30">▶</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.map((x, xi) => ({ ...x, isThumbnail: xi === i })))}
                    className={`text-[10px] px-2 py-1 rounded font-medium w-full ${img.isThumbnail ? "bg-primary-600 text-white" : "bg-white/20 text-white"}`}
                  >
                    {img.isThumbnail ? "✓ Thumbnail" : "Set Thumbnail"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, xi) => xi !== i))}
                    className="text-[10px] px-2 py-1 rounded bg-red-500/80 text-white w-full"
                  >
                    Remove
                  </button>
                </div>
                {img.isThumbnail && (
                  <span className="absolute top-1 left-1 text-[9px] bg-primary-600 text-white px-1.5 py-0.5 rounded font-bold">THUMB</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="glass-card rounded-2xl p-6">
        <button type="button" onClick={() => setSeoOpen(o => !o)} className="flex items-center justify-between w-full">
          <h2 className="font-display font-bold">SEO Settings (optional)</h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{seoOpen ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {seoOpen && (
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>SEO Title (EN)</label>
              <input {...register("seoTitle_en")} placeholder="Falls back to project title" className="input-field text-xs" />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>SEO Title (پښتو)</label>
              <input {...register("seoTitle_ps")} className="input-field text-xs" dir="rtl" />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>SEO Title (دری)</label>
              <input {...register("seoTitle_fa")} className="input-field text-xs" dir="rtl" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>SEO Description (EN)</label>
              <textarea {...register("seoDescription_en")} rows={2} placeholder="Falls back to project description" className="input-field text-xs resize-none" />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>SEO Description (پښتو)</label>
              <textarea {...register("seoDescription_ps")} rows={2} className="input-field text-xs resize-none" dir="rtl" />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>SEO Description (دری)</label>
              <textarea {...register("seoDescription_fa")} rows={2} className="input-field text-xs resize-none" dir="rtl" />
            </div>
          </div>
        )}
      </div>

      {/* Error & save */}
      {error && (
        <p className="text-sm text-red-400 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
