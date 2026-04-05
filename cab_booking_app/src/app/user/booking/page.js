import { cookies } from "next/headers";
import { query } from "@/lib/mysql";

export default async function UserBooking({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return (
      <main className="form-shell">
        <div className="form-card">
          <h2>Booking</h2>
          <p>Please log in to create a booking.</p>
          <a className="btn" href="/user/login">Go to login</a>
        </div>
      </main>
    );
  }

  const cabs = await query(
    `SELECT c.cab_id, c.cab_number, c.cab_type, c.ac_type, d.name as driver_name
     FROM cabs c
     JOIN drivers d ON c.driver_id = d.driver_id
     WHERE d.driver_status = 'On Duty'
     ORDER BY c.cab_type, c.ac_type`
  );
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <main className="form-shell">
      <div className="form-card">
        <span className="pill">Create booking</span>
        <h2>Book a Cab</h2>
        <p>Choose an available cab, pickup, and drop location.</p>
        {params?.error === "unavailable_cab" && <p className="pill" style={{background: 'var(--danger-color)', color: 'white'}}>That cab just became unavailable! Please select another.</p>}
        {params?.error === "missing" && <p className="pill">Please fill all fields.</p>}
        <form className="form-grid" action="/api/booking/create" method="POST">
          <div>
            <label>Pickup location</label>
            <input name="pickup_location" type="text" placeholder="Enter pickup location" required />
          </div>
          <div>
            <label>Drop location</label>
            <input name="drop_location" type="text" placeholder="Enter drop location" required />
          </div>
          <div>
            <label>Booking date</label>
            <input name="booking_date" type="date" min={minDate} required />
          </div>
          <div>
            <label>Select available cab</label>
            <select name="cab_id" required>
              <option value="">Select a cab</option>
              {cabs.map((cab) => (
                <option key={cab.cab_id} value={cab.cab_id}>
                  {cab.driver_name} - {cab.cab_number} ({cab.cab_type} {cab.ac_type})
                </option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit">Book Now</button>
        </form>
      </div>
    </main>
  );
}
