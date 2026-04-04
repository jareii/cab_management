import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec, query } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const phone = (formData.get("phone") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  const cabNumber = (formData.get("cab_number") || "").toString().trim();
  const cabType = (formData.get("cab_type") || "").toString().trim();
  const acType = (formData.get("ac_type") || "AC").toString();

  if (!name || !email || !phone || !password || !cabNumber || !cabType) {
    return NextResponse.redirect(new URL("/admin/drivers?error=missing", request.url));
  }

  const now = toMySqlDateTime();
  const driverResult = await exec(
    "INSERT INTO drivers (name, email, phone, password, status, driver_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING driver_id",
    [name, email, phone, password, "Approved", "On Duty", now]
  );

  const driverId = driverResult.rows?.[0]?.driver_id;
  await exec(
    "INSERT INTO cabs (cab_number, cab_type, ac_type, driver_id) VALUES (?, ?, ?, ?)",
    [cabNumber, cabType, acType, driverId]
  );

  return NextResponse.redirect(new URL("/admin/drivers?created=1", request.url));
}
