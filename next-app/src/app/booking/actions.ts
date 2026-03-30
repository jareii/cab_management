"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function bookCab(formData: FormData) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const pickup = formData.get("pickup_location") as string;
  const drop = formData.get("drop_location") as string;
  const cabId = formData.get("cab_id") as string;
  const date = formData.get("booking_date") as string;
  
  if (!pickup || !drop || !cabId || !date) {
    redirect("/booking?error=1");
  }

  // Get current time HH:MM:SS
  const now = new Date();
  const time = now.toTimeString().split(' ')[0];

  try {
    await pool.execute(
      "INSERT INTO booking (user_id, cab_id, pickup_location, drop_location, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')",
      [session.userId, cabId, pickup, drop, date, time]
    );
  } catch (err) {
    console.error("Booking error", err);
    redirect("/booking?error=1");
  }

  redirect("/booking?success=1");
}
