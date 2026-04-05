import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec } from "@/lib/mysql";

export async function POST(request) {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("user_id")?.value;
  if (!userIdStr) {
    return NextResponse.redirect(new URL("/user/login?error=auth", request.url));
  }
  const userId = Number(userIdStr);

  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const phone = (formData.get("phone") || "").toString().trim();

  if (!name || !email || !phone) {
    return NextResponse.redirect(new URL("/user/profile?error=missing", request.url));
  }

  // Update immediately for Users (No Admin Shadowing Required for Riders)
  await exec(
    "UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ?",
    [name, email, phone, userId]
  );

  return NextResponse.redirect(new URL("/user/profile?success=1", request.url));
}
