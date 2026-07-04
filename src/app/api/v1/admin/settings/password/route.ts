import { NextRequest, NextResponse } from "next/server";
import { prisma }  from "@/lib/prisma";
import bcrypt      from "bcryptjs";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body   = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ success:false, error:firstIssue }, { status:422 });
  }

  const dbUser = await prisma.user.findUnique({ where:{ id:user!.id } });
  if (!dbUser) return NextResponse.json({ success:false, error:"User not found" }, { status:404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.password);
  if (!valid) return NextResponse.json({ success:false, error:"Current password is incorrect" }, { status:401 });

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where:{ id:user!.id }, data:{ password:hashed } });
  await logActivity(user!.id, "UPDATE", "User", "Changed admin password", user!.id, request);
  return NextResponse.json({ success:true });
}
