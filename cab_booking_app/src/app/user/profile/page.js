import { cookies } from "next/headers";
import { query } from "@/lib/mysql";

export default async function UserProfile({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Access Denied</h2>
          <p>Please log in to manage your profile.</p>
          <a className="btn" href="/user/login">Go to login</a>
        </div>
      </main>
    );
  }

  const userData = await query(
    `SELECT name, email, phone FROM users WHERE user_id = ?`,
    [Number(userId)]
  );
  
  if (userData.length === 0) {
    return <main className="form-shell"><p>User not found.</p></main>;
  }
  const currentProfile = userData[0];

  return (
    <main className="form-shell">
      <div className="form-card" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="pill">My Profile</span>
            <h2>{currentProfile.name}</h2>
            <p>Manage your account details.</p>
          </div>
          <a href="/user/dashboard" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "underline", marginTop: 4 }}>&larr; Dashboard</a>
        </div>
        
        {/* Large Profile Icon Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ width: 90, height: 90, background: 'linear-gradient(135deg, var(--primary), #0891b2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(15, 118, 110, 0.2)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>

        {params?.success && <p className="pill" style={{background: 'var(--primary)', color: 'white'}}>Profile explicitly updated!</p>}
        {params?.error && <p className="pill" style={{background: '#ef4444', color: 'white'}}>Please fill all fields.</p>}
        
        {!params?.edit ? (
          <div>
            <h3 style={{ marginTop: 12, marginBottom: 8, fontSize: 18, borderBottom: '1px solid #eee', paddingBottom: 6 }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
              <div><strong>Name:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.name}</span></div>
              <div><strong>Email:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.email}</span></div>
              <div><strong>Phone Number:</strong> <br/><span style={{color: 'var(--muted)'}}>{currentProfile.phone}</span></div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
              <a href="?edit=1" className="btn" style={{ width: '100%', textAlign: 'center' }}>
                <span style={{marginRight: 8}}>✎</span> Edit details directly
              </a>
            </div>
          </div>
        ) : (
          <form className="form-grid" action="/api/user/profile/edit" method="POST">
            <h3 style={{ marginTop: 12, marginBottom: -4, fontSize: 18 }}>Edit Personal Info</h3>
            <div>
              <label>Full Name</label>
              <input name="name" type="text" defaultValue={currentProfile.name} required />
            </div>
            <div>
              <label>Email Address</label>
              <input name="email" type="email" defaultValue={currentProfile.email} required />
            </div>
            <div>
              <label>Phone Number</label>
              <input name="phone" type="text" defaultValue={currentProfile.phone} required />
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button className="btn" type="submit">Save Changes</button>
              <a href="/user/profile" className="btn secondary">Cancel</a>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
