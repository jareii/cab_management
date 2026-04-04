import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { query } from "@/lib/mysql";
import { computeFare } from "@/lib/fare";

export default async function PaymentPage({ params, searchParams }) {
  const search = await searchParams;
  const routeParams = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Payment</h2>
          <p>Please log in to continue.</p>
          <a className="btn" href="/user/login">Go to login</a>
        </div>
      </main>
    );
  }

  const bookingIdRaw = routeParams?.id ? String(routeParams.id) : "";
  const bookingIdNumber = Number(bookingIdRaw);
  const idForQuery =
    Number.isFinite(bookingIdNumber) && bookingIdNumber > 0
      ? bookingIdNumber
      : bookingIdRaw || null;

  if (!idForQuery) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Payment</h2>
          <p>Booking not found.</p>
          <a className="btn" href="/user/dashboard">Back to dashboard</a>
        </div>
      </main>
    );
  }

  let booking = null;

  const rows = await query(
    `SELECT b.booking_id, b.booking_date, b.booking_time, b.pickup_location, b.drop_location, b.status,
            b.distance_km, b.fare_amount, b.payment_status, b.user_id,
            u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
            d.name AS driver_name, d.phone AS driver_phone
     FROM booking b
     LEFT JOIN users u ON b.user_id = u.user_id
     LEFT JOIN drivers d ON b.driver_id = d.driver_id
     WHERE b.booking_id = ?`,
    [idForQuery]
  );

  if (rows.length > 0) {
    booking = rows[0];
  }

  if (!booking) {
    const latest = await query(
      `SELECT b.booking_id, b.booking_date, b.booking_time, b.pickup_location, b.drop_location, b.status,
              b.distance_km, b.fare_amount, b.payment_status, b.user_id,
              u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
              d.name AS driver_name, d.phone AS driver_phone
       FROM booking b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN drivers d ON b.driver_id = d.driver_id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC, b.booking_time DESC
       LIMIT 1`,
      [Number(userId)]
    );
    booking = latest[0];
  }

  if (!booking) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Payment</h2>
          <p>Booking not found.</p>
          <a className="btn" href="/user/dashboard">Back to dashboard</a>
        </div>
      </main>
    );
  }

  const bookingOwner = booking.user_id;
  const isOwner =
    bookingOwner === undefined ||
    Number(bookingOwner) === Number(userId);

  if (!isOwner) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Payment</h2>
          <p>This booking belongs to another user.</p>
          <a className="btn" href="/user/dashboard">Back to dashboard</a>
        </div>
      </main>
    );
  }

  const db = await getDb();
  const payment = await db.collection("payments").findOne({
    booking_id: booking.booking_id,
    user_id: Number(userId),
  });

  const isDropped = booking.status === "Dropped"; 