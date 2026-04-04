export default async function UserRegister({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="form-shell">
      <div className="form-card">
        <span className="pill">User Portal</span>
        <h2>Create Account</h2>
        <p>Register to book your first ride.</p>
        {error === "exists" && <p className="pill">Email already registered.</p>}
        {error === "missing" && <p className="pill">Please fill all fields.</p>}
        <form className="form-grid" action="/api/user/register" method="POST">
          <div>
            <label>Name</label>
            <input name="name" type="text" placeholder="Your name" required />
          </div>
          <div>
            <label>Phone</label>
            <input name="phone" type="text" placeholder="Phone number" required />
          </div>
          <div>
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" placeholder="Create a password" required />
          </div>
          <button className="btn" type="submit">Register</button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13 }}>
          Already have an account? <a href="/user/login" style={{ color: "#0f766e" }}>Login</a>
        </p>
      </div>
    </main>
  );
}
