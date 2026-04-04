import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export async function POST(request) {
  const formData = await request.formData();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();

  const rows = await query("SELECT user_id, name, password FROM users WHERE email = ?", [email]);
  const user = rows[0];
  if (!user || user.password !== password) {
    return NextResponse.redirect(new URL("/user/login?error=invalid", request.url));
  }

  const res = NextResponse.redirect(new URL("/user/dashboard", request.url));
  res.cookies.set("role", "user", { path: "/" });
  res.cookies.set("user_id", String(user.user_id), { path: "/" });
  res.cookies.set("user_name", user.name, { path: "/" });
  return res;
}
