"use client";

import { useRouter } from "next/navigation";

export default function DeletePostBtn({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/v1/admin/blog/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="btn-danger"
      style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}
    >
      Delete
    </button>
  );
}