import { cookies } from "next/headers";
import { query } from "@/lib/mysql";
import { getDb } from "@/lib/db";

export default async function AdminDashboard() {
  const formatDate = (value) => {
    if (!value) return "-";
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value);
  };

  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_id")?.value;
  const adminName = cookieStore.get("admin_name")?.value || "";

  if (!adminId) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Admin dashboard</h2>
          <p>Please log in to continue.</p>
          <a className="btn" href="/admin/login">Go to login</a>
        </div>
      </main>
    );
  }


  const [
    userCountRows,
    driverCountRows,
    cabCountRows,
    bookingCountRows,
    recentBookings,
    driverEarnings,
    users,
    drivers,
    allBookings
  ] = await Promise.all([
    query("SELECT COUNT(*) as count FROM users"),
    query("SELECT COUNT(*) as count FROM drivers"),
    query("SELECT COUNT(*) as count FROM cabs"),
    query("SELECT COUNT(*) as count FROM booking"),
    query(
      `SELECT *
       FROM view_recent_bookings
       LIMIT 8`
    ),
    query("SELECT * FROM view_driver_earnings"),
    query("SELECT user_id, name, email FROM users ORDER BY user_id DESC"),
    query("SELECT driver_id, name, email, phone, password, status FROM drivers ORDER BY driver_id DESC"),
    query(
      `SELECT b.booking_id, b.booking_date, b.booking_time, b.pickup_location, b.drop_location, b.status,
              b.user_id, b.driver_id, b.payment_status, b.distance_km, b.fare_amount,
              c.cab_number, c.cab_type, d.name as driver_name,
              u.name as user_name, u.phone as user_phone
       FROM booking b
       LEFT JOIN cabs c ON b.cab_id = c.cab_id
       LEFT JOIN drivers d ON c.driver_id = d.driver_id
       LEFT JOIN users u ON b.user_id = u.user_id`
    )
  ]);

  const payments = await getDb().then(db => db.collection("payments").find().toArray()).catch(() => []);
  const pendingCountRows = await query("SELECT COUNT(*) as count FROM drivers WHERE status = 'Pending'");
  const pendingEditsCountRows = await query("SELECT COUNT(*) as count FROM driver_edit_requests WHERE status = 'Pending'");
  
  // Safe Fallback: If MongoDB is blocked by ISP/WiFi, use synchronized MySQL data
  const activePayments = payments.length > 0 ? payments : allBookings.filter(b => b.payment_status === 'Paid').map(b => ({
    booking_id: b.booking_id,
    user_id: b.user_id,
    amount: b.fare_amount,
    status: b.payment_status,
    created_at: b.booking_date,
    updated_at: b.booking_date
  }));

  const userCount = userCountRows[0]?.count || 0;
  const driverCount = driverCountRows[0]?.count || 0;
  const cabCount = cabCountRows[0]?.count || 0;
  const bookingCount = bookingCountRows[0]?.count || 0;
  const pendingCount = pendingCountRows[0]?.count || 0;
  const pendingEditsCount = pendingEditsCountRows[0]?.count || 0;
  const paymentCount = activePayments.length;

  const recentPaid = activePayments.filter((p) => {
    if (!p.updated_at && !p.created_at) return false;
    const updated = new Date(p.updated_at || p.created_at).getTime();
    return Number.isFinite(updated) && Date.now() - updated < 24 * 60 * 60 * 1000;
  });

  const userMap = new Map(users.map((u) => [u.user_id, u]));
  const paymentsByBooking = new Map(activePayments.map((p) => [p.booking_id, p]));

  const driverStats = new Map();
  const earningsMap = new Map(driverEarnings.map((row) => [row.driver_id, row]));
  const driverPayments = [];

  for (const driver of drivers) {
    const earnings = earningsMap.get(driver.driver_id);
    driverStats.set(driver.driver_id, {
      driver,
      totalBookings: earnings?.total_trips || 0,
      onDuty: false,
      inRide: false,
      collected: Number(earnings?.total_earned || 0),
      paidCount: 0,
    });
  }

  for (const booking of allBookings) {
    if (!booking.driver_id) continue;
    const stats = driverStats.get(booking.driver_id);
    if (!stats) continue;

    const status = booking.status;
    if (status === "Picked") {
      stats.inRide = true;
      stats.onDuty = true;
    } else if (status === "Confirmed") {
      stats.onDuty = true;
    }

    const payment = paymentsByBooking.get(booking.booking_id);
    if (payment) {
      if (payment.status === "Paid") {
        stats.paidCount += 1;
      }
      if (payment.status === "Paid" || payment.status === "Pending") {
        driverPayments.push({
          booking_id: booking.booking_id,
          driver_id: booking.driver_id,
          driver_name: booking.driver_name || stats.driver.name,
          user_name: booking.user_name || userMap.get(booking.user_id)?.name || "User",
          amount: Number(payment.amount || 0),
          status: payment.status,
        });
      }
    }
  }

  const sumAmount = (list) =>
    list.reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const paidPayments = activePayments.filter((p) => p.status === "Paid");
  const totalEarnings = sumAmount(paidPayments);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const paymentDate = (payment) => {
    const value = payment.updated_at || payment.created_at;
    if (!value) return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  };

  const totalToday = sumAmount(
    paidPayments.filter((p) => {
      const date = paymentDate(p);
      return date && date >= startOfDay;
    })
  );
  const totalMonth = sumAmount(
    paidPayments.filter((p) => {
      const date = paymentDate(p);
      return date && date >= startOfMonth;
    })
  );
  const totalYear = sumAmount(
    paidPayments.filter((p) => {
      const date = paymentDate(p);
      return date && date >= startOfYear;
    })
  );

  const bookingsWithPeople = allBookings
    .map((booking) => ({
      ...booking,
      user_name: booking.user_name || userMap.get(booking.user_id)?.name || "User",
      driver_name: booking.driver_name || "Driver",
    }))
    .sort((a, b) => {
      const aDate = new Date(a.booking_date || 0).getTime();
      const bDate = new Date(b.booking_date || 0).getTime();
      return bDate - aDate;
    })
    .slice(0, 20);

  const usersWithCounts = users.map((user) => {
    const userBookings = allBookings.filter((b) => b.user_id === user.user_id);
    return {
      ...user,
      bookingCount: userBookings.length,
      lastBooking: formatDate(userBookings[0]?.booking_date || "-"),
    };
  });

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="pill">Admin Portal</span>
          <h1 className="hero-title">Welcome {adminName || "Admin"}</h1>
          <p className="hero-subtitle">Overview of users, drivers, cabs, and payments.</p>
          {recentPaid.length > 0 && (
            <p className="pill">Payment received: {recentPaid.length} in the last 24 hours.</p>
          )}
          {pendingCount > 0 && (
            <div style={{marginTop: 10}}>
              <p className="pill" style={{background: '#f5a623', color: '#111'}}>
                ⚠️ Action Required: {pendingCount} new driver application(s) awaiting approval!
              </p>
            </div>
          )}
          {pendingEditsCount > 0 && (
            <div style={{marginTop: 10}}>
              <p className="pill" style={{background: '#3b82f6', color: 'white'}}>
                📝 Heads up: {pendingEditsCount} driver profile edit request(s) awaiting approval!
              </p>
            </div>
          )}
          <div className="hero-actions">
            <a className="btn" href="/admin/drivers">Review Driver Applications</a>
            <form action="/api/user/logout" method="POST">
              <button className="btn secondary" type="submit">Logout</button>
            </form>
          </div>
        </div>
      </section>

      {/* Premium Analytics Metric Cards */}
      <section style={{ padding: '0 64px', marginTop: '-40px', position: 'relative', zIndex: 5, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Revenue Cards */}
        <div style={{ background: 'linear-gradient(135deg, #0f766e, #0f172a)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(15, 118, 110, 0.3)' }}>
          <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>₹{totalEarnings.toFixed(2)}</div>
          <div style={{ marginTop: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Today: ₹{totalToday.toFixed(0)}</span>
            <span>Month: ₹{totalMonth.toFixed(0)}</span>
          </div>
        </div>

        {/* Bookings Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Bookings</div>
            <div style={{ background: '#e0f2fe', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#0369a1' }}>📱</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>{bookingCount}</div>
          <div style={{ fontSize: '13px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>{paymentCount} Completed Payments</div>
        </div>

        {/* Users Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Passengers</div>
            <div style={{ background: '#fef3c7', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#b45309' }}>👥</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>{userCount}</div>
        </div>

        {/* Drivers / Cabs Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Fleet Size</div>
            <div style={{ background: '#fce7f3', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#be185d' }}>🚕</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>{driverCount}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>Piloting {cabCount} Cabs</div>
        </div>
      </section>

      <h2 className="section-title">Latest bookings & trip details</h2>
      <section className="portal-grid">
        <div className="portal-card" style={{ gridColumn: "1 / -1" }}>
          <p className="portal-meta">Latest bookings are shown first.</p>
          {bookingsWithPeople.length === 0 ? (
            <p className="portal-meta">No trips yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Cab</th>
                </tr>
              </thead>
              <tbody>
                {bookingsWithPeople.map((booking) => {
                  const payment = paymentsByBooking.get(booking.booking_id);
                  return (
                    <tr key={`trip-${booking.booking_id}`}>
                      <td>#{booking.booking_id}</td>
                      <td>{booking.user_name}</td>
                      <td>{booking.user_phone || "-"}</td>
                      <td>{booking.driver_name}</td>
                      <td>{booking.pickup_location} {"->"} {booking.drop_location}</td>
                      <td><span className="chip" style={
                        booking.status === 'Rejected' || booking.status === 'Cancelled' ? {color: 'white', backgroundColor: '#ef4444'} :
                        booking.status === 'Confirmed' || booking.status === 'Picked' ? {color: 'white', backgroundColor: 'var(--primary)'} :
                        booking.status === 'Requested' ? {color: 'white', backgroundColor: '#f5a623'} : {}
                      }>{booking.status}</span></td>
                      <td>{payment?.status || booking.payment_status || "Not Paid"}</td>
                      <td>INR {payment?.amount ? Number(payment.amount).toFixed(2) : Number(booking.fare_amount || 0).toFixed(2)}</td>
                      <td>{booking.cab_number || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <h2 className="section-title">Driver status & payments</h2>
      <section className="portal-grid">
        <div className="portal-card" style={{ gridColumn: "1 / -1" }}>
          {drivers.length === 0 ? (
            <p className="portal-meta">No drivers found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Phone</th>
                  <th>Total bookings</th>
                  <th>On duty</th>
                  <th>Currently in ride</th>
                  <th>Paid trips</th>
                  <th>Total collected</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const stats = driverStats.get(driver.driver_id);
                  return (
                    <tr key={driver.driver_id}>
                      <td>{driver.name}</td>
                      <td>{driver.email || "-"}</td>
                      <td><code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{driver.password || "-"}</code></td>
                      <td>{driver.phone}</td>
                      <td>{stats?.totalBookings || 0}</td>
                      <td><span className="chip" style={stats?.onDuty ? {backgroundColor: 'var(--primary)', color: 'white'} : {}}>{stats?.onDuty ? "On duty" : "Off duty"}</span></td>
                      <td><span className="chip" style={stats?.inRide ? {backgroundColor: '#f5a623', color: 'white'} : {}}>{stats?.inRide ? "In ride" : "Idle"}</span></td>
                      <td>{stats?.paidCount || 0}</td>
                      <td>INR {stats?.collected?.toFixed(2) || "0.00"}</td>
                      <td>
                        {driver.status !== "Removed" ? (
                        <form action="/api/admin/driver/reject" method="POST">
                          <input type="hidden" name="driver_id" value={driver.driver_id} />
                          <button className="btn secondary" style={{padding: '4px 8px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444'}} type="submit">Remove</button>
                        </form>
                        ) : (
                          <span style={{fontSize: 12, color: '#ef4444', fontWeight: 600}}>Removed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="portal-card" style={{ gridColumn: "1 / -1" }}>
          {driverPayments.length === 0 ? (
            <p className="portal-meta">No paid or pending trips recorded yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Driver</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {driverPayments.map((payment) => (
                  <tr key={`${payment.driver_id}-${payment.booking_id}`}>
                    <td>#{payment.booking_id}</td>
                    <td>{payment.driver_name}</td>
                    <td>{payment.user_name}</td>
                    <td><span className="chip">{payment.status}</span></td>
                    <td>INR {payment.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <h2 className="section-title">User details</h2>
      <section className="portal-grid">
        <div className="portal-card" style={{ gridColumn: "1 / -1" }}>
          {usersWithCounts.length === 0 ? (
            <p className="portal-meta">No users registered yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Total bookings</th>
                  <th>Last booking date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersWithCounts.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.bookingCount}</td>
                    <td>{user.lastBooking}</td>
                    <td>
                        <form action="/api/admin/user/remove" method="POST">
                          <input type="hidden" name="user_id" value={user.user_id} />
                          <button className="btn secondary" style={{padding: '4px 8px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444'}} type="submit">Delete</button>
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
