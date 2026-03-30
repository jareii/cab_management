import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { cancelBooking } from "./actions";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const [bookings] = await pool.execute<RowDataPacket[]>(`
    SELECT b.booking_id, b.booking_date, b.booking_time,
           b.pickup_location, b.drop_location, b.status,
           c.cab_number, c.cab_type,
           d.name as driver_name, d.phone as driver_phone
    FROM booking b
    LEFT JOIN cabs c ON b.cab_id = c.cab_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `, [session.userId]);

  return (
    <div className="flex-1 bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Card */}
        <div className="glass-card p-10 relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900 drop-shadow-sm">
              Welcome, <span className="text-blue-600">{session.userName}</span>! 👋
            </h1>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-light">
              Manage your rides, track your drivers, and book new cabs anytime and travel comfortably.
            </p>
          </div>

        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-blue-300">
            <h2 className="text-4xl font-black text-blue-600 mb-2">{bookings.length}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Bookings</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-emerald-300">
            <h2 className="text-4xl mb-2">🚕</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Ready to Ride</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-indigo-300">
            <h2 className="text-4xl font-black text-indigo-600 mb-2">24/7</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Service Available</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Your Bookings</h3>
          <Link href="/booking" className="neon-button-green px-6 flex items-center gap-2">
            <span>+</span> Book a Cab
          </Link>
        </div>

        {/* Table / List */}
        <div className="glass-card overflow-hidden">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm">
                    <th className="py-4 px-6 font-semibold tracking-wider">#</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Date & Time</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Pickup</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Drop</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Cab details</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Driver</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Status</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {bookings.map((row, i) => (
                    <tr key={row.booking_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-slate-500">{i + 1}</td>
                      <td className="py-4 px-6 text-slate-700">
                        <div className="font-medium text-slate-900">{new Date(row.booking_date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500 mt-1">{row.booking_time || '-'}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 max-w-[150px] truncate" title={row.pickup_location}>{row.pickup_location}</td>
                      <td className="py-4 px-6 text-slate-700 max-w-[150px] truncate" title={row.drop_location}>{row.drop_location}</td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{row.cab_number || '-'}</div>
                        <div className="text-xs px-3 py-1 mt-1.5 bg-slate-100 text-slate-600 rounded-full inline-block border border-slate-200">{row.cab_type || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{row.driver_name || 'Not Assigned'}</div>
                        <div className="text-xs text-slate-500 mt-1">{row.driver_phone || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-4 py-1.5 text-xs font-semibold rounded-full border shadow-sm
                          ${row.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                          ${row.status === 'Picked' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                          ${row.status === 'Dropped' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${row.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {row.status === 'Confirmed' ? (
                          <div className="flex gap-2">
                             <form action={cancelBooking}>
                               <input type="hidden" name="booking_id" value={row.booking_id} />
                               <button 
                                 type="submit" 
                                 className="text-white bg-rose-600 hover:bg-rose-700 px-4 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
                               >
                                 Cancel
                               </button>
                             </form>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-light">You haven&apos;t booked any cabs. Click the button below to start your first journey!</p>
              <Link href="/booking" className="neon-button px-8 text-sm">
                Book a Cab Now
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
