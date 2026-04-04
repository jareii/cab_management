export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { query } from "@/lib/mysql";
import { getDb } from "@/lib/db";

export default async function DriverDashboard({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const driverId = cookieStore.get("driver_id")?.value;
  const driverName = cookieStore.get("driver_name")?.value || "";

  if (!driverId) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Driver dashboard</h2>
          <p>Please log in to continue.</p>
          <a className="btn" href="/driver/login">Go to login</a>
        </div>
      </main>
    );
  }

  const cabIds = await query("SELECT cab_id FROM cabs WHERE driver_id = ?", [Number(driverId)]);
  const ids = cabIds.map((c) => c.cab_id);
  const earningsRows = await query("SELECT * FROM sp_driver_earnings(?)", [Number(driverId)]);
  const earnings = earningsRows[0];
  const bookings = ids.length
    ? await query(
        `SELECT b.booking_id, b.user_id, b.user_phone, b.pickup_location, b.drop_location, b.status,
                b.distance_km, b.payment_status, b.booking_date, b.booking_time,
                u.name AS user_name, u.phone AS user_phone_master
         FROM booking b
         LEFT JOIN users u ON b.user_id = u.user_id
         WHERE b.cab_id IN (${ids.map(() => "?").join(", ")})
         ORDER BY b.booking_date DESC, b.booking_time DESC`,
        ids
      )
    : [];

  const requests = bookings.filter((b) => b.status === "Requested");
  const activeBookings = bookings.filter((b) => b.status !== "Requested");

  const bookingIds = bookings.map((b) => b.booking_id);
  const payments = bookingIds.length
    ? await (await getDb())
        .collection("payments")
        .find({ booking_id: { $in: bookingIds } })
        .toArray()
    : [];
  const paymentMap = new Map(payments.map((p) => [p.booking_id, p.status]));

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="pill">Driver Portal</span>
          <h1 className="hero-title">Welcome {driverName || "Driver"}</h1>
          <p className="hero-subtitle">Update pickup and drop status for assigned rides.</p>
          <div className="hero-actions">
            <form action="/api/user/logout" method="POST">
              <button className="btn secondary" type="submit">Logout</button>
            </form>
          </div>
        </div>
        <div className="hero-content">
          <div className="portal-card">
            <h3 className="portal-title">Trips assigned</h3>
            <p className="portal-meta">{bookings.length} bookings</p>
            {earnings && (
              <p className="portal-meta">
                Earnings: INR {Number(earnings.total_earned || 0).toFixed(2)} ({earnings.total_trips || 0} trips)
              </p>
            )}
            {params?.updated && <p className="pill">Status updated.</p>}
            {params?.accepted && <p className="pill">Booking accepted.</p>}
            {params?.rejected && <p className="pill">Booking rejected.</p>}
            {params?.error === "busy" && <p className="pill">You already have 2 active trips.</p>}
            {params?.error === "notfound" && <p className="pill">Booking not found.</p>}
            {params?.error === "distance" && <p className="pill">Enter distance before dropping a trip.</p>}
          </div>
        </div>
      </section>

      <h2 className="section-title">New ride requests</h2>
      <section className="portal-grid">
        <div className="portal-card" style={{ gridColumn: "1 / -1" }}>
          <p className="portal-meta">Latest requests are shown first.</p>
          {requests.length === 0 ? (
            <p className="portal-meta">No new requests.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Route</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td>#{booking.booking_id}</td>
                    <td>{booking.user_name || "User"}</td>
                    <td>{booking.user_phone || "-"}</td>
                    <td>{booking.pickup_location} {"->"} {booking.drop_location}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <form action="/api/driver/accept" method="POST">
                        <input type="hidden" name="booking_id" value={booking.booking_id} />
                        <button className="btn" type="submit">Accept</button>
                      </form>
                      <form action="/api/driver/reject" method="POST">
                        <input type="hidden" name="booking_id" value={booking.booking_id} />
                        <button className="btn secondary" type="submit">Reject</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <h2 className="section-title">Assigned bookings</h2>
      <section className="portal-grid">
        <div className="portal-card" style={{ gridColumn: "1 / -1" }}>
          <p className="portal-meta">Latest bookings are shown first.</p>
          {activeBookings.length === 0 ? (
            <p className="portal-meta">No bookings assigned yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Distance (km)</th>
                  <th>Payment</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td>#{booking.booking_id}</td>
                    <td>{booking.user_name || "User"}</td>
                    <td>{booking.user_phone || booking.user_phone_master || "-"}</td>
                    <td>{booking.pickup_location} {"->"} {booking.drop_location}</td>
                    <td><span className="chip">{booking.status}</span></td>
                    <td>{booking.distance_km ? `${booking.distance_km} km` : "-"}</td>
                    <td>{paymentMap.get(booking.booking_id) || booking.payment_status || "Not Paid"}</td>
                    <td>
                      <form action="/api/driver/status" method="POST" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input type="hidden" name="booking_id" value={booking.booking_id} />
                        <input
                          type="number"
                          name="distance_km"
                          min="1"
                          step="0.1"
                          defaultValue={booking.distance_km || ""}
                          placeholder="Km"
                          style={{ maxWidth: 90 }}
                        />
                        <select name="status" defaultValue={booking.status}>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Picked">Picked</option>
                          <option value="Dropped">Dropped</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button className="btn" type="submit">Update</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
