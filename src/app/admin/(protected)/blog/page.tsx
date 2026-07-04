import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
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
                  <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-fira)" }}>/{post.slug}</p>
                </td>
                <td><span className={STATUS_STYLE[post.status]||"tag-badge"}>{post.status}</span></td>
                <td style={{ fontFamily:"var(--font-fira)", color:"#06b6d4", fontSize:"0.82rem" }}>{post.viewCount}</td>
                <td style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display:"flex", gap:"0.5rem" }}>
                    <Link href={`/admin/blog/${post.id}`} className="btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }}>Edit</Link>
                    <DeletePostBtn id={post.id} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length===0&&(
              <tr><td colSpan={5} style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>No blog posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeletePostBtn({ id }: { id: string }) {
  return (
    <form action={async () => {
      "use server";
      const { prisma: db } = await import("@/lib/prisma");
      await db.blogPost.delete({ where:{ id } });
    }}>
      <button type="submit" className="btn-danger" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }}
        onClick={e=>{ if(!confirm("Delete this post?")) e.preventDefault(); }}>
        Delete
      </button>
    </form>
  );
}