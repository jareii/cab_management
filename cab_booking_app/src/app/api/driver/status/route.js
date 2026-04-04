import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec, query } from "@/lib/mysql";
import { computeFare } from "@/lib/fare";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const driverId = cookieStore.get("driver_id")?.value;

  if (!driverId) {
    return NextResponse.redirect(new URL("/driver/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const bookingId = Number(formData.get("booking_id") || 0);
  const status = (formData.get("status") || "").toString();
  const distanceKm = Number(formData.get("distance_km") || 0);

  if (!bookingId || !status) {
    return NextResponse.redirect(new URL("/driver/dashboard?error=missing", request.url));
  }
  if (status === "Dropped" && (!distanceKm || distanceKm <= 0)) {
    return NextResponse.redirect(new URL("/driver/dashboard?error=distance", request.url));
  }

  const updates = { status, updated_at: toMySqlDateTime() };
  if (distanceKm && distanceKm > 0) {
    updates.distance_km = distanceKm;
    updates.fare_amount = computeFare(distanceKm);
  }

  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
  const values = [...Object.values(updates), bookingId, Number(driverId)];
  await exec(`UPDATE booking SET ${fields} WHERE booking_id = ? AND driver_id = ?`, values);

  return NextResponse.redirect(new URL("/driver/dashboard?updated=1", request.url));
}
