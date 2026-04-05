export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { query } from "@/lib/mysql";
import { getDb } from "@/lib/db";

export default async function UserDashboard({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const userName = cookieStore.get("user_name")?.value || "";

  const formatDate = (value) => {
    if (!value) return "";
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value);
  };

  if (!userId) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>User dashboard</h2>
          <p>Please log in to view your bookings.</p>
          <a className="btn" href="/user/login">Go to login</a>
        </div>
      </main>
    );
  }

  const bookingsRaw = await query(
    `SELECT b.booking_id, b.booking_date, b.booking_time, b.pickup_location, b.drop_location, b.status,
            b.distance_km, b.fare_amount, b.payment_status, b.created_at, b.updated_at,
            c.cab_number, c.cab_type, d.name as driver_name, d.phone as driver_phone
     FROM booking b
     LEFT JOIN cabs c ON b.cab_id = c.cab_id
     LEFT JOIN drivers d ON c.driver_id = d.driver_id
     WHERE b.user_id = ?
     ORDER BY b.booking_date DESC, b.booking_time DESC`,
    [Number(userId)]
  );
  const bookings = bookingsRaw.map((b) => ({
    ...b,
    booking_date: formatDate(b.booking_date),
    booking_time: b.booking_time ? String(b.booking_time).slice(0, 8) : "",
    created_at: formatDate(b.created_at),
    updated_at: formatDate(b.updated_at),
  }));

  const latestUpdate = bookings
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
      return bTime - aTime;
    })[0];

  const bookingIds = bookings.map((b) => b.booking_id);
  const payments = bookingIds.length
    ? await (await getDb())
        .collection("payments")
        .find({ user_id: Number(userId), booking_id: { $in: bookingIds } })
        .toArray()
    : [];

  const paymentMap = new Map(payments.map((p) => [p.booking_id, p.status]));
  const statusClass = (status) =>
    status === "Paid" ? "chip chip-paid" : "chip";

  return (
    <main>
      <section className="hero user-theme">
        <div className="hero-content">
          <span className="pill">Welcome back</span>
          <h1 className="hero-title">Hello {userName || "User"}</h1>
          <p className="hero-subtitle">Your latest bookings and payment status live here.</p>
          <div className="hero-actions">
            <a href="/user/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, background: 'var(--primary)', borderRadius: '50%', color: 'white', textDecoration: 'none' }} title="My Profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </a>
            <a className="btn" href="/user/booking">Book a Cab</a>
            <form action="/api/user/logout" method="POST">
              <button className="btn secondary" type="submit">Logout</button>
            </form>
          </div>
        </div>
        <div className="hero-content">
          <div className="portal-card">
            <h3 className="portal-title">Total bookings</h3>
            <p className="portal-meta">{bookings.length} trips in your account</p>
            {params?.booked && <p className="pill">Booking created successfully.</p>}
            {params?.cancelled && <p className="pill">Booking cancelled.</p>}
            {latestUpdate && (
              <p className="pill">
                Latest update: Booking #{latestUpdate.booking_id} is {latestUpdate.status}
                {latestUpdate.driver_name ? ` (Driver: ${latestUpdate.driver_name})` : ""}.
              </p>
            )}
          </div>
        </div>
      </section>

      <h2 className="section-title">Your bookings</h2>
      <section className="portal-grid">
        <div className="portal-card" style={{ gridColumn: "1 / -1" }}>
          {bookings.length === 0 ? (
            <p className="portal-meta">No bookings yet. Create your first ride.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Date</th>
                  <th>Pickup</th>
                  <th>Drop</th>
                  <th>Cab</th>
                  <th>Driver</th>
                  <th>Distance</th>
                  <th>Fare</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const isPaid = paymentMap.get(booking.booking_id) === "Paid" || booking.payment_status === "Paid";
                  const displayPayment = paymentMap.get(booking.booking_id) || booking.payment_status || "Not Paid";
                  const canCancel = booking.status !== "Dropped" && booking.status !== "Cancelled" && booking.status !== "Rejected";
                  const canPay =
                    booking.status === "Dropped" &&
                    (booking.distance_km || booking.fare_amount) &&
                    !isPaid;
                  
                  let stateColor = 'var(--ink)';
                  let stateBg = '#f0f0f0';
                  if (booking.status === 'Rejected') { stateColor = 'white'; stateBg = '#ef4444'; }
                  if (booking.status === 'Confirmed') { stateColor = 'white'; stateBg = 'var(--primary)'; }
                  if (booking.status === 'Requested') { stateColor = 'white'; stateBg = '#f5a623'; }

                  return (
                  <tr key={booking.booking_id}>
                    <td>#{booking.booking_id}</td>
                    <td>{booking.booking_date}</td>
                    <td>{booking.pickup_location}</td>
                    <td>{booking.drop_location}</td>
                    <td>{booking.cab_number} ({booking.cab_type})</td>
                    <td>{booking.driver_name ? `${booking.driver_name} (${booking.driver_phone})` : "Unassigned"}</td>
                    <td>{booking.distance_km ? `${booking.distance_km} km` : "-"}</td>
                    <td>{booking.fare_amount ? `INR ${Number(booking.fare_amount).toFixed(2)}` : "-"}</td>
                    <td><span className="chip" style={{color: stateColor, backgroundColor: stateBg}}>{booking.status}</span></td>
                    <td>
                      <span className={statusClass(displayPayment)}>
                        {displayPayment}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <a className="btn secondary" href={`/user/payment/${booking.booking_id}`} aria-disabled={!canPay} style={!canPay ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
                          Pay
                        </a>
                        {canCancel && (
                          <form action="/api/user/cancel" method="POST">
                            <input type="hidden" name="booking_id" value={booking.booking_id} />
                            <button className="btn secondary" type="submit">Cancel</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
