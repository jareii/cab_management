import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec, query } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const userName = cookieStore.get("user_name")?.value || "";

  if (!userId) {
    return NextResponse.redirect(new URL("/user/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const pickup = (formData.get("pickup_location") || "").toString().trim();
  const drop = (formData.get("drop_location") || "").toString().trim();
  const bookingDate = (formData.get("booking_date") || "").toString();
  const cabId = Number(formData.get("cab_id") || 0);

  if (!pickup || !drop || !bookingDate || !cabId) {
    return NextResponse.redirect(new URL("/user/booking?error=missing", request.url));
  }

  const cabRows = await query(
    "SELECT c.cab_id, c.cab_number, c.cab_type, d.driver_id, d.name as driver_name, d.phone as driver_phone FROM cabs c LEFT JOIN drivers d ON c.driver_id = d.driver_id WHERE c.cab_id = ?",
    [cabId]
  );
  const cab = cabRows[0];

  if (!cab) {
    return NextResponse.redirect(new URL("/user/booking?error=cab", request.url));
  }

  const userRows = await query("SELECT phone FROM users WHERE user_id = ?", [Number(userId)]);
  const userPhone = userRows[0]?.phone || "";

  const duplicate = await query(
    `SELECT booking_id FROM booking
     WHERE user_id = ? AND cab_id = ? AND pickup_location = ? AND drop_location = ? AND booking_date = ?
       AND created_at >= (NOW() - INTERVAL '2 minutes')
     LIMIT 1`,
    [Number(userId), cab.cab_id, pickup, drop, bookingDate]
  );
  if (duplicate.length > 0) {
    return NextResponse.redirect(new URL("/user/dashboard?booked=1", request.url));
  }

  const now = toMySqlDateTime();
  await exec(
    "INSERT INTO booking (user_id, cab_id, pickup_location, drop_location, booking_date, booking_time, status, distance_km, fare_amount, payment_status, created_at, updated_at, user_phone, driver_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      Number(userId),
      cab.cab_id,
      pickup,
      drop,
      bookingDate,
      new Date().toTimeString().slice(0, 8),
      "Requested",
      null,
      null,
      "Not Paid",
      now,
      now,
      userPhone,
      cab.driver_id,
    ]
  );

  return NextResponse.redirect(new URL("/user/dashboard?booked=1", request.url));
}
