import { notFound }  from "next/navigation";
import { prisma }    from "@/lib/prisma";
import BlogPostForm  from "../BlogPostForm";
export const metadata = { title: "Edit Post | Admin" };
export default async function EditPostPage({ params }: { params:{id:string} }) {
  const post = await prisma.blogPost.findUnique({ where:{ id:params.id } });
  if (!post) notFound();
  return (
    <div style={{ maxWidth:"900px" }}>
      <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"2rem" }}>Edit: {post.title_en}</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
