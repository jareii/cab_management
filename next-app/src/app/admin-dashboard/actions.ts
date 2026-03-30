"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateAdminTripStatus(formData: FormData) {
  const session = await getSession();
  if (!session.adminId) return;

  const bookingId = formData.get("booking_id");
  const newStatus = formData.get("new_status");

  if (newStatus !== "Picked" && newStatus !== "Dropped") return;

  try {
    await pool.execute(
      "UPDATE booking SET status = ? WHERE booking_id = ?",
      [newStatus, bookingId]
    );
    revalidatePath("/admin-dashboard");
  } catch (err) {
    console.error("Status update failed", err);
  }
}
