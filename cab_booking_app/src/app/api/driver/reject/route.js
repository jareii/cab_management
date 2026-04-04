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

  const bookingRows = await query("SELECT booking_id, driver_id FROM booking WHERE booking_id = ?", [bookingId]);
  const booking = bookingRows[0];
  if (!booking || Number(booking.driver_id) !== Number(driverId)) {
    return NextResponse.redirect(new URL("/driver/dashboard?error=notfound", request.url));
  }

  await exec(
    "UPDATE booking SET status = ?, updated_at = ? WHERE booking_id = ?",
    ["Rejected", toMySqlDateTime(), bookingId]
  );

  return NextResponse.redirect(new URL("/driver/dashboard?rejected=1", request.url));
}
