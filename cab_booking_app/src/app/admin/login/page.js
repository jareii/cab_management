export default async function AdminLogin({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="form-shell">
      <div className="form-card">
        <span className="pill">Admin Portal</span>
        <h2>Admin Login</h2>
        <p>Manage drivers, cabs, and bookings.</p>
        {error && <p className="pill">Login failed. Check your details.</p>}
        <form className="form-grid" action="/api/admin/login" method="POST">
          <div>
            <label>Username</label>
            <input name="username" type="text" placeholder="admin" required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          <button className="btn" type="submit">Login</button>
        </form>
      </div>
    </main>
  );
}
