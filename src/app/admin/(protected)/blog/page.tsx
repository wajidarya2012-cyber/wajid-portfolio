import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeletePostBtn from "./DeletePostBtn";
export const metadata = { title: "Blog | Admin" };
export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy:{ createdAt:"desc" } });
  const STATUS_STYLE: Record<string,string> = {
    PUBLISHED:"success-badge", DRAFT:"warning-badge", ARCHIVED:"tag-badge",
  };
  return (
    <div style={{ maxWidth:"900px" }}>
      <div style={{ marginBottom:"2rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Blog Posts</h1>
          <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>{posts.length} total posts</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary" style={{ fontSize:"0.875rem" }}>+ New Post</Link>
      </div>

      <div className="admin-card" style={{ padding:0, overflow:"hidden" }}>
        {/* The card clips (and <main> has overflow-x:hidden), so on narrow screens the table must
            scroll inside its own child element — otherwise Date/Actions are cut off and Edit/Delete
            become unreachable. Same pattern as ActivityLogTable.tsx. */}
        <div style={{ overflowX:"auto" }}>
        {/* Phones only: give columns readable widths and let the wrapper scroll. Tablet/desktop keep the original fluid table. */}
        <style>{`@media (max-width: 640px) { .blog-admin-table { min-width: 44rem; } .blog-admin-table td:first-child { min-width: 15rem; } }`}</style>
        <table className="data-table blog-admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Views</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post=>(
              <tr key={post.id}>
                <td>
                  <p style={{ fontWeight:600, fontSize:"0.875rem" }}>{post.title_en}</p>
                  <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-fira)", overflowWrap:"anywhere" }}>/{post.slug}</p>
                  {post.tags.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem", marginTop:"0.35rem" }}>
                      {post.tags.slice(0,3).map(t => <span key={t} className="tag-badge" style={{ fontSize:"0.62rem" }}>{t}</span>)}
                    </div>
                  )}
                </td>
                <td><span className={STATUS_STYLE[post.status]||"tag-badge"}>{post.status}</span></td>
                <td style={{ textAlign:"center" }}>{post.featured ? "⭐" : ""}</td>
                <td style={{ fontFamily:"var(--font-fira)", color:"#06b6d4", fontSize:"0.82rem" }}>{post.viewCount}</td>
                <td style={{ fontSize:"0.8rem", color:"var(--text-muted)", whiteSpace:"nowrap" }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display:"flex", gap:"0.5rem", whiteSpace:"nowrap" }}>
                    <Link href={`/admin/blog/${post.id}`} className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }}>Edit</Link>
                    <DeletePostBtn id={post.id} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length===0&&(
              <tr><td colSpan={6} style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>No blog posts yet.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

