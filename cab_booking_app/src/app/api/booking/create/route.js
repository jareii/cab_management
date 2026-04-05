import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, query } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function POST(request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const userName = cookieStore.get("user_name")?.value || "";

  if (!userId) {
    return NextResponse.redirect(new URL("/user/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const pickup = (formData.get("pickup_location") || "").toString().trim();
  const drop = (formData.get("drop_location") || "").toString().trim();
  const bookingDate = (formData.get("booking_date") || "").toString();
  const cabId = Number(formData.get("cab_id") || 0);

  if (!pickup || !drop || !bookingDate || !cabId) {
    return NextResponse.redirect(new URL("/user/booking?error=missing", request.url));
  }

  const cabRows = await query(
    "SELECT c.cab_id, c.cab_number, c.cab_type, d.driver_id, d.name as driver_name, d.phone as driver_phone FROM cabs c LEFT JOIN drivers d ON c.driver_id = d.driver_id WHERE c.cab_id = ?",
    [cabId]
  );
  const cab = cabRows[0];

  if (!cab) {
    return NextResponse.redirect(new URL("/user/booking?error=cab", request.url));
  }

  const userRows = await query("SELECT phone FROM users WHERE user_id = ?", [Number(userId)]);
  const userPhone = userRows[0]?.phone || "";

  const now = toMySqlDateTime();
  const timeStr = new Date().toTimeString().slice(0, 8);
  const connection = await pool.getConnection();
  
  try {
    // 1. Begin atomic transaction
    await connection.beginTransaction();

    // 2. Grasp a Pessimistic Padlock (FOR UPDATE) exclusively on the requested cab row.
    // If another zero-millisecond request tries to lock this exact cab, MySQL forces them to queue up and wait!
    await connection.query("SELECT cab_id FROM cabs WHERE cab_id = ? FOR UPDATE", [cab.cab_id]);

    // 3. Perform the collision scan while holding the padlock securely
    const [conflictRows] = await connection.query(
      `SELECT booking_id FROM booking
       WHERE cab_id = ? AND booking_date = ? AND status IN ('Requested', 'Confirmed', 'Picked')
       LIMIT 1`,
      [cab.cab_id, bookingDate]
    );

    if (conflictRows.length > 0) {
      await connection.rollback(); // Drop padlock and abort
      return NextResponse.redirect(new URL("/user/booking?error=unavailable_cab", request.url));
    }

    // 4. Guaranteed safe: Insert the booking into the ledger
    await connection.query(
      "INSERT INTO booking (user_id, cab_id, pickup_location, drop_location, booking_date, booking_time, status, distance_km, fare_amount, payment_status, created_at, updated_at, user_phone, driver_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [Number(userId), cab.cab_id, pickup, drop, bookingDate, timeStr, "Requested", null, null, "Not Paid", now, now, userPhone, cab.driver_id]
    );

    // 5. Commit changes to physical disk and permanently drop the padlock
    await connection.commit();
  } catch (err) {
    if (connection) await connection.rollback();
    return NextResponse.redirect(new URL("/user/booking?error=system", request.url));
  } finally {
    if (connection) connection.release(); // Return physical connection back to the MySQL connection pool
  }

  return NextResponse.redirect(new URL("/user/dashboard?booked=1", request.url));
}
