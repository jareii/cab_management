import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { query, exec } from "@/lib/mysql";
import { computeFare } from "@/lib/fare";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.redirect(new URL("/user/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const bookingId = Number(formData.get("booking_id") || 0);
  const amount = Number(formData.get("amount") || 0);
  const status = "Paid";
  const method = (formData.get("method") || "Mock").toString();

  if (!bookingId || !amount) {
    return NextResponse.redirect(new URL(`/user/payment/${bookingId}?error=missing`, request.url));
  }

  const bookingRows = await query(
    "SELECT booking_id, user_id, status, distance_km, fare_amount FROM booking WHERE booking_id = ? AND user_id = ?",
    [bookingId, Number(userId)]
  );
  const booking = bookingRows[0];
  if (!booking) {
    return NextResponse.redirect(new URL(`/user/payment/${bookingId}?error=notfound`, request.url));
  }
  if (booking.status !== "Dropped") {
    return NextResponse.redirect(new URL(`/user/payment/${bookingId}?error=notdropped`, request.url));
  }
  const fareAmount =
    typeof booking.fare_amount === "number" && booking.fare_amount > 0
      ? booking.fare_amount
      : booking.distance_km
      ? computeFare(booking.distance_km || 0)
      : 0;
  if (!fareAmount) {
    return NextResponse.redirect(new URL(`/user/payment/${bookingId}?error=nodistance`, request.url));
  }

  const db = await getDb();
  await db.collection("payments").updateOne(
    { user_id: Number(userId), booking_id: bookingId },
    {
      $set: {
        amount: fareAmount || amount,
        status,
        method,
        transaction_id: `TXN${Date.now()}`,
        updated_at: new Date().toISOString(),
      },
      $setOnInsert: {
        created_at: new Date().toISOString(),
      },
    },
    { upsert: true }
  );

  const now = toMySqlDateTime();
  await exec(
    "UPDATE booking SET payment_status = ?, paid_at = ?, updated_at = ? WHERE booking_id = ? AND user_id = ?",
    ["Paid", now, now, bookingId, Number(userId)]
  );

  return NextResponse.redirect(new URL(`/user/payment/${bookingId}?saved=1`, request.url));
}
