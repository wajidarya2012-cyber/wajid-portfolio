import { prisma }        from "@/lib/prisma";
import AdminLoginForm    from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const profile = await prisma.profile.findFirst().catch(() => null);

  return (
    <AdminLoginForm
      brandName={profile?.loginBrandName ?? "W.Arya"}
      subtitle={profile?.loginSubtitle ?? "Admin Dashboard"}
      footerNote={profile?.loginFooterNote ?? "Protected area — authorised personnel only."}
    />
  );
}