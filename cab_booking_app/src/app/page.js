export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Book rides, manage trips, and run the cab fleet from one place.</h1>
          <p className="hero-subtitle">
            Choose your portal to log in as a user, driver, or admin.
          </p>
          <div className="hero-actions">
            <a className="btn" href="/user/login">User Portal</a>
            <a className="btn accent" href="/driver/login">Driver Portal</a>
            <a className="btn secondary" href="/admin/login">Admin Portal</a>
          </div>
        </div>
        <div className="hero-content">
          <div className="portal-card" />
        </div>
      </section>

      <h2 className="section-title">Choose a portal</h2>
      <section className="portal-grid">
        <div className="portal-card">
          <h3 className="portal-title">User</h3>
          <p className="portal-meta">Book rides, view trips, and pay securely.</p>
          <div className="portal-actions">
            <a className="btn" href="/user/login">User Login</a>
          </div>
        </div>
        <div className="portal-card">
          <h3 className="portal-title">Driver</h3>
          <p className="portal-meta">Accept bookings and update trip status.</p>
          <div className="portal-actions">
            <a className="btn accent" href="/driver/login">Driver Login</a>
          </div>
        </div>
        <div className="portal-card">
          <h3 className="portal-title">Admin</h3>
          <p className="portal-meta">Manage cabs, drivers, and analytics.</p>
          <div className="portal-actions">
            <a className="btn secondary" href="/admin/login">Admin Login</a>
          </div>
        </div>
      </section>
    </main>
  );
}
