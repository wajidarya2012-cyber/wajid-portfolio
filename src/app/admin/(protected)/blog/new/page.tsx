import BlogPostForm from "../BlogPostForm";
export const metadata = { title: "New Post | Admin" };
export default function NewPostPage() {
  return (
    <div style={{ maxWidth:"900px" }}>
      <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"2rem" }}>New Blog Post</h1>
      <BlogPostForm />
    </div>
  );
}
