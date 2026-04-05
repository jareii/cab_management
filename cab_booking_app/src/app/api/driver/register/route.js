import { NextResponse } from "next/server";
import { exec } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const phone = (formData.get("phone") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  const cabNumber = (formData.get("cab_number") || "").toString().trim();
  const cabType = (formData.get("cab_type") || "").toString().trim();
  const acType = (formData.get("ac_type") || "AC").toString();

  if (!name || !email || !phone || !password || !cabNumber || !cabType) {
    return NextResponse.redirect(new URL("/driver/register?error=missing", request.url));
  }

  const now = toMySqlDateTime();
  try {
    const result = await exec(
      "INSERT INTO drivers (name, email, phone, password, status, driver_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone, password, "Pending", "Offline", now]
    );
    const driverId = result.insertId;

    await exec(
      "INSERT INTO cabs (cab_number, cab_type, ac_type, driver_id) VALUES (?, ?, ?, ?)",
      [cabNumber, cabType, acType, driverId]
    );

    return NextResponse.redirect(new URL("/driver/login?error=pending", request.url));
  } catch (e) {
    return NextResponse.redirect(new URL("/driver/register?error=exists", request.url));
  }
}
