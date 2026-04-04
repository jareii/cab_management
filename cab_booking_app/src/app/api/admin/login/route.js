import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export async function POST(request) {
  const formData = await request.formData();
  const username = (formData.get("username") || "").toString().trim();
  const password = (formData.get("password") || "").toString();

  const rows = await query("SELECT admin_id, username, password FROM admin WHERE username = ? AND password = ?", [
    username,
    password,
  ]);
  const admin = rows[0];
  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  const res = NextResponse.redirect(new URL("/admin/dashboard", request.url));
  res.cookies.set("role", "admin", { path: "/" });
  res.cookies.set("admin_id", String(admin.admin_id), { path: "/" });
  res.cookies.set("admin_name", admin.username, { path: "/" });
  return res;
}
