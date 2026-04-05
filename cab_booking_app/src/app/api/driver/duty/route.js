import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec } from "@/lib/mysql";

export async function POST(request) {
  const cookieStore = await cookies();
  const driverId = cookieStore.get("driver_id")?.value;

  if (!driverId) {
    return NextResponse.redirect(new URL("/driver/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const action = formData.get("action"); // 'start' or 'stop'

  const newStatus = action === 'start' ? 'On Duty' : 'Offline';

  await exec(
    "UPDATE drivers SET driver_status = ? WHERE driver_id = ?",
    [newStatus, Number(driverId)]
  );

  return NextResponse.redirect(new URL("/driver/dashboard?duty=" + action, request.url));
}
