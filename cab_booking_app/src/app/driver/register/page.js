export default async function DriverRegister({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="form-shell">
      <div className="form-card" style={{ maxWidth: 640 }}>
        <span className="pill">Driver Partner</span>
        <h2>Become a Driver</h2>
        <p>Register yourself and your cab to start driving with us.</p>
        
        {params?.success && <p className="pill" style={{background: 'var(--primary)', color: 'white'}}>Application submitted! Please wait for Admin approval.</p>}
        {params?.error === "missing" && <p className="pill">Please fill all fields.</p>}
        {params?.error === "exists" && <p className="pill" style={{background: '#ef4444', color: 'white'}}>Email or phone already registered.</p>}
        
        <form className="form-grid" action="/api/driver/register" method="POST">
          <div>
            <label>Your Full Name</label>
            <input name="name" type="text" placeholder="John Doe" required />
          </div>
          <div>
            <label>Email Address</label>
            <input name="email" type="email" placeholder="john@example.com" required />
          </div>
          <div>
            <label>Phone Number</label>
            <input name="phone" type="text" placeholder="10-digit number" required />
          </div>
          <div>
            <label>Create Password</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          
          <h3 style={{ marginTop: 12, marginBottom: -4, fontSize: 18 }}>Cab Details</h3>
          <div>
            <label>Cab License Plate</label>
            <input name="cab_number" type="text" placeholder="KL-11-AB-1234" required />
          </div>
          <div>
            <label>Cab Model / Type</label>
            <input name="cab_type" type="text" placeholder="Mini / Sedan / SUV" required />
          </div>
          <div>
            <label>AC / Non-AC</label>
            <select name="ac_type" defaultValue="AC">
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
          </div>
          <button className="btn" type="submit" style={{marginTop: 10}}>Submit Application</button>
        </form>
        <p style={{ marginTop: 24, fontSize: 14 }}>
          Already approved?{" "}
          <a href="/driver/login" style={{ color: "var(--primary-dark)", fontWeight: 600 }}>
            Login here
          </a>
        </p>
      </div>
    </main>
  );
}
