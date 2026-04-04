import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export async function POST(request) {
  const formData = await request.formData();
  const login = (formData.get("login") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();

  const rows = await query(
    "SELECT driver_id, name, email, phone, password, status FROM drivers WHERE email = ? OR phone = ?",
    [login, login]
  );
  const driver = rows[0];
  if (!driver || driver.password !== password) {
    return NextResponse.redirect(new URL("/driver/login?error=invalid", request.url));
  }
  if (driver.status && driver.status.toLowerCase() === "pending") {
    return NextResponse.redirect(new URL("/driver/login?error=pending", request.url));
  }
  if (driver.status && driver.status.toLowerCase() === "removed") {
    return NextResponse.redirect(new URL("/driver/login?error=removed", request.url));
  }

  const res = NextResponse.redirect(new URL("/driver/dashboard", request.url));
  res.cookies.set("role", "driver", { path: "/" });
  res.cookies.set("driver_id", String(driver.driver_id), { path: "/" });
  res.cookies.set("driver_name", driver.name, { path: "/" });
  return res;
}
