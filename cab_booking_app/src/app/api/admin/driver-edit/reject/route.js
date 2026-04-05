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
  const editId = Number(formData.get("edit_id") || 0);

  if (!editId) {
    return NextResponse.redirect(new URL("/admin/drivers?error=missing", request.url));
  }

  // 1. Mark the request as Rejected
  await exec("UPDATE driver_edit_requests SET status = 'Rejected' WHERE edit_id = ?", [editId]);

  return NextResponse.redirect(new URL("/admin/drivers?edit_rejected=1", request.url));
}
