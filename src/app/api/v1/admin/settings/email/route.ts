import { NextRequest, NextResponse } from "next/server";
import { prisma }  from "@/lib/prisma";
import bcrypt      from "bcryptjs";
import { z }       from "zod";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

const changeEmailSchema = z.object({
  currentPassword: z.string().min(6),
  newEmail:        z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body   = await request.json();
  const parsed = changeEmailSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ success:false, error:firstIssue }, { status:422 });
  }

  const dbUser = await prisma.user.findUnique({ where:{ id:user!.id } });
  if (!dbUser) return NextResponse.json({ success:false, error:"User not found" }, { status:404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.password);
  if (!valid) return NextResponse.json({ success:false, error:"Current password is incorrect" }, { status:401 });

  const existing = await prisma.user.findUnique({ where:{ email: parsed.data.newEmail } });
  if (existing && existing.id !== user!.id) {
    return NextResponse.json({ success:false, error:"This email is already in use." }, { status:409 });
  }

  await prisma.user.update({ where:{ id:user!.id }, data:{ email: parsed.data.newEmail } });
  await logActivity(user!.id, "UPDATE", "User", "Changed admin login email", user!.id, request);
  return NextResponse.json({ success:true });
}