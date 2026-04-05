import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const driverId = Number(formData.get("driver_id") || 0);

  if (!driverId) {
    return NextResponse.redirect(new URL("/admin/drivers?error=missing", request.url));
  }

  await exec(
    "UPDATE drivers SET status = ?, driver_status = ?, updated_at = ? WHERE driver_id = ?",
    ["Removed", "Offline", toMySqlDateTime(), driverId]
  );

  return NextResponse.redirect(new URL("/admin/drivers?rejected=1", request.url));
}
