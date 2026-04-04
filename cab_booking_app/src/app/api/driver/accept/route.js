import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec, query } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const driverId = cookieStore.get("driver_id")?.value;

  if (!driverId) {
    return NextResponse.redirect(new URL("/driver/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const bookingId = Number(formData.get("booking_id") || 0);

  const bookingRows = await query("SELECT booking_id, driver_id, status FROM booking WHERE booking_id = ?", [bookingId]);
  const booking = bookingRows[0];
  if (!booking || Number(booking.driver_id) !== Number(driverId)) {
    return NextResponse.redirect(new URL("/driver/dashboard?error=notfound", request.url));
  }

  // Allow up to 2 active trips per driver.
  const active = await query(
    "SELECT booking_id FROM booking WHERE driver_id = ? AND status IN ('Confirmed','Picked') LIMIT 2",
    [Number(driverId)]
  );
  if (active.length >= 2) {
    return NextResponse.redirect(new URL("/driver/dashboard?error=busy", request.url));
  }

  const now = toMySqlDateTime();
  await exec(
    "UPDATE booking SET status = ?, accepted_at = ?, updated_at = ? WHERE booking_id = ?",
    ["Confirmed", now, now, bookingId]
  );

  await exec(
    "UPDATE drivers SET driver_status = ?, updated_at = ? WHERE driver_id = ?",
    ["On Duty", now, Number(driverId)]
  );

  return NextResponse.redirect(new URL("/driver/dashboard?accepted=1", request.url));
}
