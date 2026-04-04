import { NextResponse } from "next/server";
import { exec, query } from "@/lib/mysql";

export async function POST(request) {
  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();
  const phone = (formData.get("phone") || "").toString().trim();

  if (!name || !email || !password || !phone) {
    return NextResponse.redirect(new URL("/user/register?error=missing", request.url));
  }

  const existing = await query("SELECT user_id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    return NextResponse.redirect(new URL("/user/register?error=exists", request.url));
  }
  await exec(
    "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
    [name, email, password, phone]
  );

  return NextResponse.redirect(new URL("/user/login?registered=1", request.url));
}
