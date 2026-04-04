import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec, query } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.redirect(new URL("/user/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const bookingId = Number(formData.get("booking_id") || 0);

  if (!bookingId) {
    return NextResponse.redirect(new URL("/user/dashboard?error=missing", request.url));
  }

  const bookingRows = await query(
    "SELECT booking_id, status FROM booking WHERE booking_id = ? AND user_id = ?",
    [bookingId, Number(userId)]
  );
  const booking = bookingRows[0];

  if (!booking) {
    return NextResponse.redirect(new URL("/user/dashboard?error=notfound", request.url));
  }

  if (booking.status === "Dropped") {
    return NextResponse.redirect(new URL("/user/dashboard?error=completed", request.url));
  }

  await exec(
    "UPDATE booking SET status = ?, updated_at = ? WHERE booking_id = ? AND user_id = ?",
    ["Cancelled", toMySqlDateTime(), bookingId, Number(userId)]
  );

  return NextResponse.redirect(new URL("/user/dashboard?cancelled=1", request.url));
}
