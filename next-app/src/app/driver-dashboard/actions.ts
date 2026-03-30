"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateTripStatus(formData: FormData) {
  const session = await getSession();
  if (!session.driverId) return;

  const bookingId = formData.get("booking_id");
  const newStatus = formData.get("new_status");

  // Basic validation to ensure they only set valid statuses
  if (newStatus !== "Picked" && newStatus !== "Dropped") return;

  try {
    // Ideally we should also verify that the booking belongs to this driver's cab, 
    // but following PHP logic exactly: UPDATE booking SET status=? WHERE booking_id=?
    await pool.execute(
      "UPDATE booking SET status = ? WHERE booking_id = ?",
      [newStatus, bookingId]
    );
    revalidatePath("/driver-dashboard");
  } catch (err) {
    console.error("Status update failed", err);
  }
}
