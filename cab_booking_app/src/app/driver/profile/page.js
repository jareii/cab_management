import { cookies } from "next/headers";
import { query, exec } from "@/lib/mysql";

export default async function DriverProfile({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const driverId = cookieStore.get("driver_id")?.value;

  if (!driverId) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Access Denied</h2>
          <p>Please log in to manage your profile.</p>
          <a className="btn" href="/driver/login">Go to login</a>
        </div>
      </main>
    );
  }

  // Make sure table exists
  await exec(`
    CREATE TABLE IF NOT EXISTS driver_edit_requests (
      edit_id INT PRIMARY KEY AUTO_INCREMENT,
      driver_id INT NOT NULL,
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      cab_number VARCHAR(50),
      cab_type VARCHAR(50),
      ac_type VARCHAR(10),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
    )
  `);

  const driverData = await query(
    `SELECT d.name, d.email, d.phone, c.cab_number, c.cab_type, c.ac_type
     FROM drivers d
     LEFT JOIN cabs c ON d.driver_id = c.driver_id
     WHERE d.driver_id = ?`,
    [Number(driverId)]
  );
  
  if (driverData.length === 0) {
    return <main className="form-shell"><p>Driver not found.</p></main>;
  }
  const currentProfile = driverData[0];

  const pendingEdits = await query(
    "SELECT * FROM driver_edit_requests WHERE driver_id = ? AND status = 'Pending' ORDER BY created_at DESC LIMIT 1",
    [Number(driverId)]
  );
  const hasPending = pendingEdits.length > 0;
  const pd = hasPending ? pendingEdits[0] : null;

  return (
    <main className="form-shell">
      <div className="form-card" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="pill">My Profile</span>
            <h2>{currentProfile.name}</h2>
            <p>View your active details below.</p>
          </div>
          <a href="/driver/dashboard" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "underline", marginTop: 4 }}>&larr; Dashboard</a>
        </div>
        
        {/* Large Profile Icon Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ width: 90, height: 90, background: 'linear-gradient(135deg, var(--primary), #0891b2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(15, 118, 110, 0.2)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>

        {params?.success && <p className="pill" style={{background: 'var(--primary)', color: 'white'}}>Update request submitted to Admin!</p>}
        {params?.error && <p className="pill" style={{background: '#ef4444', color: 'white'}}>Please fill all fields.</p>}
        
        {hasPending && (
          <div style={{ padding: 14, background: '#fff7ed', borderRadius: 8, marginBottom: 20, border: '1px solid #f97316' }}>
            <p style={{ margin: 0, color: '#9a3412', fontWeight: 600, fontSize: 13 }}>⚠️ Your previous profile update is currently pending Admin approval. Editing again will replace the pending request.</p>
          </div>
        )}

        {!params?.edit ? (
          <div>
            <h3 style={{ marginTop: 12, marginBottom: 8, fontSize: 18, borderBottom: '1px solid #eee', paddingBottom: 6 }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div><strong>Name:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.name}</span></div>
              <div><strong>Email:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.email}</span></div>
              <div><strong>Phone:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.phone}</span></div>
            </div>
            
            <h3 style={{ marginTop: 12, marginBottom: 8, fontSize: 18, borderBottom: '1px solid #eee', paddingBottom: 6 }}>Cab Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><strong>License Plate:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.cab_number}</span></div>
              <div><strong>Model / Type:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.cab_type}</span></div>
              <div><strong>AC:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.ac_type}</span></div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
              <a href="?edit=1" className="btn" style={{ width: '100%', textAlign: 'center' }}>
                <span style={{marginRight: 8}}>✎</span> Edit Details
              </a>
            </div>
          </div>
        ) : (
          <form className="form-grid" action="/api/driver/profile/edit" method="POST">
            <h3 style={{ marginTop: 12, marginBottom: -4, fontSize: 18 }}>Edit Personal Info</h3>
            <div>
              <label>Full Name</label>
              <input name="name" type="text" defaultValue={hasPending ? pd.name : currentProfile.name} required />
            </div>
            <div>
              <label>Email Address</label>
              <input name="email" type="email" defaultValue={hasPending ? pd.email : currentProfile.email} required />
            </div>
            <div>
              <label>Phone Number</label>
              <input name="phone" type="text" defaultValue={hasPending ? pd.phone : currentProfile.phone} required />
            </div>
            
            <h3 style={{ marginTop: 12, marginBottom: -4, fontSize: 18 }}>Edit Cab Details</h3>
            <div>
              <label>Cab License Plate</label>
              <input name="cab_number" type="text" defaultValue={hasPending ? pd.cab_number : currentProfile.cab_number} required />
            </div>
            <div>
              <label>Cab Model / Type</label>
              <input name="cab_type" type="text" defaultValue={hasPending ? pd.cab_type : currentProfile.cab_type} required />
            </div>
            <div>
              <label>AC / Non-AC</label>
              <select name="ac_type" defaultValue={hasPending ? pd.ac_type : currentProfile.ac_type}>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              {hasPending ? (
                <button className="btn" type="submit" style={{background: '#f5a623'}}>Overwrite Request</button>
              ) : (
                <button className="btn" type="submit">Submit Request</button>
              )}
              <a href="/driver/profile" className="btn secondary">Cancel</a>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
