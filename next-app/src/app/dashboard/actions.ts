"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function cancelBooking(formData: FormData) {
  const session = await getSession();
  if (!session.userId) return;

  const bookingId = formData.get("booking_id");

  try {
    await pool.execute(
      "UPDATE booking SET status = 'Cancelled' WHERE booking_id = ? AND user_id = ?",
      [bookingId, session.userId]
    );
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Cancel failed", err);
  }
}
