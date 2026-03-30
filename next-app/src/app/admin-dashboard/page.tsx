import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { updateAdminTripStatus } from "./actions";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin-login");

  // Get stats
  const [userCnt] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM users");
  const [bkgCnt] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM booking");
  const [cabCnt] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM cabs");
  const [drvCnt] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM drivers");

  // Get all bookings
  const [bookings] = await pool.execute<RowDataPacket[]>(`
    SELECT b.booking_id, b.booking_date, b.booking_time,
           b.pickup_location, b.drop_location, b.status,
           u.name as user_name, u.phone as user_phone, u.email,
           c.cab_number, c.cab_type,
           d.name as driver_name, d.phone as driver_phone, d.license_no
    FROM booking b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN cabs c ON b.cab_id = c.cab_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `);

  return (
    <div className="flex-1 bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Welcome Card */}
        <div className="glass-card p-10 relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900 drop-shadow-sm">
              <span className="text-rose-600">Admin</span> Control Panel ⚙️
            </h1>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-light">
              View and manage all system data including bookings, users, drivers, and cabs across the organization.
            </p>
          </div>

        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-blue-300">
            <h2 className="text-4xl font-black text-slate-800 mb-2">{userCnt[0]?.cnt || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Users</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-indigo-300">
            <h2 className="text-4xl font-black text-indigo-600 mb-2">{bkgCnt[0]?.cnt || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Bookings</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-violet-300">
            <h2 className="text-4xl font-black text-violet-600 mb-2">{cabCnt[0]?.cnt || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Cabs</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-rose-300">
            <h2 className="text-4xl font-black text-rose-600 mb-2">{drvCnt[0]?.cnt || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Drivers</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">System Bookings Record</h3>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-4 font-semibold">#</th>
                    <th className="py-4 px-4 font-semibold">User Details</th>
                    <th className="py-4 px-4 font-semibold">Trip Route</th>
                    <th className="py-4 px-4 font-semibold">Schedule</th>
                    <th className="py-4 px-4 font-semibold">Cab details</th>
                    <th className="py-4 px-4 font-semibold">Driver Details</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {bookings.map((row, i) => (
                    <tr key={row.booking_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-500 font-medium">{i + 1}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 tracking-wide">{row.user_name || '-'}</div>
                        <div className="text-xs text-slate-600 mt-1 flex flex-col gap-0.5">
                          <span>{row.user_phone || '-'}</span>
                          <span className="text-slate-500">{row.email || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-700 max-w-[200px] truncate" title={row.pickup_location}>
                          <span className="text-xs text-slate-500 inline-block w-10">Origin:</span> <span className="font-medium text-slate-800">{row.pickup_location}</span>
                        </div>
                        <div className="text-slate-700 max-w-[200px] truncate mt-1.5" title={row.drop_location}>
                          <span className="text-xs text-slate-500 inline-block w-10">Dest:</span> <span className="font-medium text-slate-800">{row.drop_location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        <div className="font-medium">{new Date(row.booking_date).toLocaleDateString()}</div>
                        <div className="text-xs px-2 py-0.5 mt-1 bg-slate-100 rounded-md inline-block text-slate-600 border border-slate-200">{row.booking_time || '-'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold tracking-wide text-slate-900">{row.cab_number || '-'}</div>
                        <div className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-1">{row.cab_type || '-'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">{row.driver_name || 'Unassigned'}</div>
                        <div className="text-xs text-slate-600 mt-1">{row.driver_phone || '-'}</div>
                        <div className="text-[10px] text-slate-500 tracking-widest mt-0.5">{row.license_no || ''}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-sm border
                          ${row.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${row.status === 'Picked' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                          ${row.status === 'Dropped' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                          ${row.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {row.status === 'Confirmed' && (
                          <form action={updateAdminTripStatus} className="inline-block w-full">
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Picked" />
                            <button type="submit" className="text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 hover:border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center">
                              Override: Picked
                            </button>
                          </form>
                        )}
                        {row.status === 'Picked' && (
                          <form action={updateAdminTripStatus} className="inline-block w-full">
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Dropped" />
                            <button type="submit" className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center mt-1">
                              Override: Dropped
                            </button>
                          </form>
                        )}
                        {(row.status === 'Dropped' || row.status === 'Cancelled') && (
                          <span className="text-slate-500 text-xs italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24 px-6">
              <div className="text-6xl mb-6 opacity-40">📭</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings in the system</h3>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
