import { redirect }   from "next/navigation";
import { auth }       from "@/lib/auth";
import AdminSidebar    from "@/components/admin/AdminSidebar";
import AdminHeader     from "@/components/admin/AdminHeader";
import AdminLoadingBar from "@/components/admin/AdminLoadingBar";
import { prisma }      from "@/lib/prisma";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not authenticated → send to login (no loop — login is outside this layout)
  if (!session?.user) {
    redirect("/admin/login");
  }

  const newMessages = await prisma.contactMessage.count({
    where: { status: "NEW" },
  });

  return (
    <div
      style={{
        display:       "flex",
        minHeight:     "100vh",
        background:    "var(--bg-primary)",
        color:         "var(--text-primary)",
        fontFamily:    "var(--font-inter)",
      }}
    >
      <AdminLoadingBar />
      
      <AdminSidebar newMessages={newMessages} />
      <div
        style={{
          flex:           1,
          display:        "flex",
          flexDirection:  "column",
          minWidth:       0,
          minHeight:      "100vh",
        }}
      >
        <AdminHeader user={session.user} />
        <main style={{ flex: 1, padding: "1.75rem", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
