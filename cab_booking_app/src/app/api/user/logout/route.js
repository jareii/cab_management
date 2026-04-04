import { NextResponse } from "next/server";

export async function POST(request) {
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set("role", "", { path: "/", maxAge: 0 });
  res.cookies.set("user_id", "", { path: "/", maxAge: 0 });
  res.cookies.set("user_name", "", { path: "/", maxAge: 0 });
  res.cookies.set("driver_id", "", { path: "/", maxAge: 0 });
  res.cookies.set("driver_name", "", { path: "/", maxAge: 0 });
  res.cookies.set("admin_id", "", { path: "/", maxAge: 0 });
  res.cookies.set("admin_name", "", { path: "/", maxAge: 0 });
  return res;
}