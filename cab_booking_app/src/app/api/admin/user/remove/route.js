import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec } from "@/lib/mysql";

export async function POST(request) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const userId = Number(formData.get("user_id") || 0);

  if (!userId) {
    return NextResponse.redirect(new URL("/admin/dashboard?error=missing", request.url));
  }

  await exec("DELETE FROM users WHERE user_id = ?", [userId]);

  return NextResponse.redirect(new URL("/admin/dashboard?deleted=1", request.url));
}
