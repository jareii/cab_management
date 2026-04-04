export default async function UserLogin({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const registered = params?.registered;

  return (
    <main className="form-shell">
      <div className="form-card">
        <span className="pill">User Portal</span>
        <h2>User Login</h2>
        <p>Sign in to manage bookings and payments.</p>
        {registered && <p className="pill">Registration successful. Please log in.</p>}
        {error && <p className="pill">Login failed. Check your details.</p>}
        <form className="form-grid" action="/api/user/login" method="POST">
          <div>
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          <button className="btn" type="submit">Login</button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13 }}>
          New user? <a href="/user/register" style={{ color: "#0f766e" }}>Create an account</a>
        </p>
      </div>
    </main>
  );
}
