import { cookies } from "next/headers";
import { query } from "@/lib/mysql";

export default async function AdminDriversQueue({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "admin") {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Admin access required</h2>
          <p>Please log in as admin.</p>
          <a className="btn" href="/admin/login">Go to login</a>
        </div>
      </main>
    );
  }

  const pendingDrivers = await query(
    `SELECT d.driver_id, d.name, d.email, d.phone, d.status, d.created_at,
            c.cab_number, c.cab_type, c.ac_type
     FROM drivers d
     LEFT JOIN cabs c ON d.driver_id = c.driver_id
     WHERE d.status = 'Pending'
     ORDER BY d.created_at DESC`
  );

  const pendingEdits = await query(
    `SELECT e.*, d.name as old_name 
     FROM driver_edit_requests e
     JOIN drivers d ON e.driver_id = d.driver_id
     WHERE e.status = 'Pending'
     ORDER BY e.created_at DESC`
  );

  return (
    <main className="form-shell">
      <div className="portal-card" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <span className="pill">Admin Tools</span>
        <h2>Driver Applications Queue</h2>
        <p>Review and securely approve new drivers into the platform.</p>
        
        {params?.approved && <p className="pill" style={{background: 'var(--primary)', color: 'white'}}>Driver application approved successfully!</p>}
        {params?.rejected && <p className="pill" style={{background: '#ef4444', color: 'white'}}>Driver application rejected.</p>}
        {params?.error && <p className="pill" style={{background: '#ef4444', color: 'white'}}>Error updating database.</p>}

        <div style={{ marginTop: 24, overflowX: "auto" }}>
          {pendingDrivers.length === 0 ? (
            <p className="portal-meta">No pending applications at this time.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Contact Info</th>
                  <th>Cab Details</th>
                  <th>Date Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDrivers.map((driver) => (
                  <tr key={driver.driver_id}>
                    <td style={{fontWeight: 600}}>{driver.name}</td>
                    <td>{driver.email}<br/>{driver.phone}</td>
                    <td>{driver.cab_number} ({driver.cab_type} {driver.ac_type})</td>
                    <td>{new Date(driver.created_at || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <form action="/api/admin/driver/approve" method="POST">
                          <input type="hidden" name="driver_id" value={driver.driver_id} />
                          <button className="btn" type="submit" style={{padding: '6px 12px', fontSize: 13}}>Approve</button>
                        </form>
                        <form action="/api/admin/driver/reject" method="POST">
                          <input type="hidden" name="driver_id" value={driver.driver_id} />
                          <button className="btn secondary" type="submit" style={{padding: '6px 12px', fontSize: 13, borderColor: '#ef4444', color: '#ef4444'}}>Reject</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div style={{ marginTop: 40, overflowX: "auto" }}>
          <h2>Profile Edit Requests</h2>
          {pendingEdits.length === 0 ? (
            <p className="portal-meta">No pending profile edits at this time.</p>
          ) : (
            <table className="table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Driver ID</th>
                  <th>Requested Details</th>
                  <th>Requested Cab</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEdits.map((edit) => (
                  <tr key={edit.edit_id}>
                    <td style={{fontWeight: 600}}>#{edit.driver_id} ({edit.old_name})</td>
                    <td><span style={{color: '#3b82f6'}}>Change to:</span><br/>{edit.name}<br/>{edit.email}<br/>{edit.phone}</td>
                    <td><span style={{color: '#3b82f6'}}>Change to:</span><br/>{edit.cab_number} ({edit.cab_type} {edit.ac_type})</td>
                    <td>{new Date(edit.created_at || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <form action="/api/admin/driver-edit/approve" method="POST">
                          <input type="hidden" name="edit_id" value={edit.edit_id} />
                          <button className="btn" type="submit" style={{padding: '6px 12px', fontSize: 13, background: '#3b82f6'}}>Approve Changes</button>
                        </form>
                        <form action="/api/admin/driver-edit/reject" method="POST">
                          <input type="hidden" name="edit_id" value={edit.edit_id} />
                          <button className="btn secondary" type="submit" style={{padding: '6px 12px', fontSize: 13, borderColor: '#ef4444', color: '#ef4444'}}>Reject</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <p style={{ marginTop: 30, fontSize: 14 }}>
          <a href="/admin/dashboard" style={{ color: "var(--primary-dark)", fontWeight: 600 }}>
            &larr; Back to Dashboard
          </a>
        </p>
      </div>
    </main>
  );
}