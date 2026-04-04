export default async function DriverLogin({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="form-shell">
      <div className="form-card">
        <span className="pill">Driver Portal</span>
        <h2>Driver Login</h2>
        <p>Access assigned rides and update status.</p>
        {error === "invalid" && <p className="pill">Login failed. Check your details.</p>}
        {error === "pending" && <p className="pill">Your account is pending admin approval.</p>}
        {error === "removed" && <p className="pill">Your account was removed by admin.</p>}
        <form className="form-grid" action="/api/driver/login" method="POST">
          <div>
            <label>Email or Phone</label>
            <input name="login" type="text" placeholder="driver@example.com or 9990001111" required />
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
