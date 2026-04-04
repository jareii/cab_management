import { cookies } from "next/headers";

export default async function AdminDrivers({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "admin") {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Admin access required</h2>
          <p>Please log in as admin.</p>
          <a className="btn" href="/admin/login">Go to admin login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="form-shell">
      <div className="form-card" style={{ maxWidth: 640 }}>
        <span className="pill">Admin</span>
        <h2>Create Driver + Cab</h2>
        <p>Only admin can add new drivers and assign a cab.</p>
        {params?.created && <p className="pill">Driver created successfully.</p>}
        {params?.error && <p className="pill">Please fill all fields.</p>}
        <form className="form-grid" action="/api/admin/driver/create" method="POST">
          <div>
            <label>Driver Name</label>
            <input name="name" type="text" required />
          </div>
          <div>
            <label>Driver Email</label>
            <input name="email" type="email" required />
          </div>
          <div>
            <label>Driver Phone</label>
            <input name="phone" type="text" required />
          </div>
          <div>
            <label>Driver Password</label>
            <input name="password" type="text" required />
          </div>
          <div>
            <label>Cab Number</label>
            <input name="cab_number" type="text" required />
          </div>
          <div>
            <label>Cab Type</label>
            <input name="cab_type" type="text" placeholder="Mini / Sedan / SUV" required />
          </div>
          <div>
            <label>AC Type</label>
            <select name="ac_type" defaultValue="AC">
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
          </div>
          <button className="btn" type="submit">Create Driver</button>
        </form>
      </div>
    </main>
  );
}