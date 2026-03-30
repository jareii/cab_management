import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { updateTripStatus } from "./actions";

export default async function DriverDashboardPage() {
  const session = await getSession();
  if (!session.driverId) redirect("/driver-login");

  // Get driver's cab
  const [cabRows] = await pool.execute<RowDataPacket[]>(
    "SELECT cab_id FROM cabs WHERE driver_id = ?",
    [session.driverId]
  );
  const cabId = cabRows[0]?.cab_id || 0;

  // Get bookings
  const [bookings] = await pool.execute<RowDataPacket[]>(`
    SELECT b.booking_id, b.booking_date, b.booking_time,
           b.pickup_location, b.drop_location, b.status,
           u.name as user_name, u.phone as user_phone,
           c.cab_number, c.cab_type, c.ac_type
    FROM booking b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN cabs c ON b.cab_id = c.cab_id
    WHERE b.cab_id = ? AND b.status != 'Cancelled'
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `, [cabId]);

  const total = bookings.length;
  const picked = bookings.filter(b => b.status === "Picked").length;
  const dropped = bookings.filter(b => b.status === "Dropped").length;
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;

  return (
    <div className="flex-1 bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Card */}
        <div className="glass-card p-10 relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900 drop-shadow-sm">
              Welcome, <span className="text-emerald-600">{session.userName}</span>! 🚗
            </h1>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-light">
              Manage your assigned trips. Mark when you pick up and drop off users to keep them updated.
            </p>
          </div>

        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-emerald-300">
            <h2 className="text-4xl font-black text-slate-800 mb-2">{total}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Trips</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-blue-300">
            <h2 className="text-4xl font-black text-blue-600 mb-2">{confirmed}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Pending Pickup</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-amber-300">
            <h2 className="text-4xl font-black text-amber-600 mb-2">{picked}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Currently On Trip</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-emerald-300">
            <h2 className="text-4xl font-black text-emerald-600 mb-2">{dropped}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Completed Trips</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Your Assigned Bookings</h3>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm">
                    <th className="py-4 px-6 font-semibold tracking-wider">#</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">User Details</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Route</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Date & Time</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Cab</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Status</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {bookings.map((row, i) => (
                    <tr key={row.booking_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-slate-500">{i + 1}</td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{row.user_name || '-'}</div>
                        <div className="text-xs text-slate-500 mt-1">{row.user_phone || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-700 max-w-[150px] truncate" title={row.pickup_location}>
                          <span className="text-xs text-slate-500 inline-block w-8">From:</span> {row.pickup_location}
                        </div>
                        <div className="text-slate-700 max-w-[150px] truncate mt-1" title={row.drop_location}>
                          <span className="text-xs text-slate-500 inline-block w-8">To:</span> {row.drop_location}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        <div className="font-medium text-slate-900">{new Date(row.booking_date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500 mt-1">{row.booking_time || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{row.cab_number}</div>
                        <div className="text-xs text-slate-500 mt-1">({row.ac_type})</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-4 py-1.5 text-xs font-semibold rounded-full border shadow-sm
                          ${row.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${row.status === 'Picked' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                          ${row.status === 'Dropped' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                          ${row.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {row.status === 'Confirmed' && (
                          <form action={updateTripStatus}>
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Picked" />
                            <button type="submit" className="text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 hover:border-amber-300 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center">
                              🚗 Mark Picked
                            </button>
                          </form>
                        )}
                        {row.status === 'Picked' && (
                          <form action={updateTripStatus}>
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Dropped" />
                            <button type="submit" className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 hover:border-emerald-300 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center">
                              📍 Mark Dropped
                            </button>
                          </form>
                        )}
                        {row.status === 'Dropped' && (
                          <span className="text-emerald-600 text-xs font-bold flex items-center justify-center py-1.5">
                            ✅ Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24 px-6">
              <div className="text-6xl mb-6 opacity-40">📂</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No trips assigned</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-light">You currently have no bookings assigned to your cab. Check back later.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
