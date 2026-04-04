import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function POST(request) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const bookingId = Number(formData.get("booking_id") || 0);
  const status = (formData.get("status") || "Pending").toString();

  const db = await getDb();
  await db.collection("payments").updateOne(
    { booking_id: bookingId },
    { $set: { status, updated_at: new Date().toISOString() } }
  );

  return NextResponse.redirect(new URL("/admin/dashboard?updated=1", request.url));
}