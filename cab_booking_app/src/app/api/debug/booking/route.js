import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const bookingIdRaw = url.searchParams.get("id") || "";
  const bookingIdNumber = Number(bookingIdRaw);

  const client = await clientPromise;
  const db = client.db();

  const bookings = await db.collection("bookings").find({
    $or: [
      { booking_id: bookingIdRaw },
      { booking_id: bookingIdNumber },
      { booking_id: { $in: [bookingIdRaw, bookingIdNumber] } },
    ],
  }).toArray();

  return NextResponse.json({
    bookingIdRaw,
    bookingIdNumber,
    count: bookings.length,
    bookings,
  });
}