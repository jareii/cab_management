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
  const fareAmount =
    typeof booking.fare_amount === "number" && booking.fare_amount > 0
      ? booking.fare_amount
      : booking.distance_km
      ? computeFare(booking.distance_km || 0)
      : 0;
  const hasDistance = Boolean(booking.distance_km) || Boolean(booking.fare_amount);

  return (
    <main className="form-shell">
      <div className="form-card">
        <span className="pill">Payment</span>
        <h2>Booking #{booking.booking_id}</h2>

        <p className="portal-meta">👤 User: {booking.user_name || "N/A"}</p>
        <p className="portal-meta">📧 Email: {booking.user_email || "N/A"}</p>
        <p className="portal-meta">📞 Phone: {booking.user_phone || "N/A"}</p>

        <hr />

        <p className="portal-meta">🚗 Driver: {booking.driver_name || "Not assigned"}</p>
        <p className="portal-meta">📞 Driver Phone: {booking.driver_phone || "N/A"}</p>

        <hr />

        <p>{booking.pickup_location} → {booking.drop_location}</p>
        <p className="portal-meta">Trip status: {booking.status}</p>
        <p className="portal-meta">Payment status: {payment?.status || booking.payment_status || "Not Paid"}</p>
        <p className="portal-meta">Fare: {fareAmount ? `INR ${Number(fareAmount).toFixed(2)}` : "Waiting for driver distance"}</p>

        {!isDropped && <p className="pill">Payment is allowed only after the trip is dropped.</p>}
        {!hasDistance && <p className="pill">Driver must enter distance before payment.</p>}
        {search?.error === "notdropped" && <p className="pill">Trip not dropped yet. Please pay after drop.</p>}
        {search?.error === "nodistance" && <p className="pill">Distance not set yet. Please wait.</p>}
        {search?.error === "notfound" && <p className="pill">Booking not found.</p>}
        {search?.saved && <p className="pill">Payment saved.</p>}
        {search?.error && <p className="pill">Please fill all fields.</p>}

        <form className="form-grid" action="/api/payment/save" method="POST">
          <input type="hidden" name="booking_id" value={booking.booking_id} />
          <input type="hidden" name="amount" value={fareAmount || 0} />
          <div>
            <label>Method</label>
            <select name="method" defaultValue="Mock">
              <option value="Mock">Mock</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <button className="btn" type="submit" disabled={!isDropped || !hasDistance}>
            Save Payment
          </button>
        </form>
      </div>
    </main>
  );
}