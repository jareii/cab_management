import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { bookCab } from "./actions";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const resolvedParams = await searchParams;
  const acFilter = typeof resolvedParams?.ac === "string" ? resolvedParams.ac : "All";
  const typeFilter = typeof resolvedParams?.type === "string" ? resolvedParams.type : "All";
  const error = typeof resolvedParams?.error === "string" ? "Booking failed. Please try again." : null;
  const success = typeof resolvedParams?.success === "string" ? "Cab booked successfully!" : null;

  let query = `
    SELECT c.cab_id, c.cab_number, c.cab_type, c.ac_type, d.name as driver_name, d.phone as driver_phone
    FROM cabs c
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
  `;
  const whereClauses = [];
  const values = [];

  if (acFilter !== "All") {
    whereClauses.push("c.ac_type = ?");
    values.push(acFilter);
  }
  if (typeFilter !== "All") {
    whereClauses.push("c.cab_type = ?");
    values.push(typeFilter);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }
  query += " ORDER BY c.cab_type, c.ac_type";

  const [cabs] = await pool.execute<RowDataPacket[]>(query, values);

  const filterBtnClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition ${
      active
        ? "bg-blue-600 border border-blue-700 text-white shadow-sm"
        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
    }`;

  // Group cabs for select dropdown
  const groupedCabs = cabs.reduce((acc, cab) => {
    if (!acc[cab.cab_type]) acc[cab.cab_type] = [];
    acc[cab.cab_type].push(cab);
    return acc;
  }, {} as Record<string, typeof cabs>);

  return (
    <div className="flex-1 bg-transparent py-10 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 block">
          <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4 inline-flex items-center gap-1 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1 drop-shadow-sm">Book a <span className="text-blue-600">Cab</span></h1>
          <p className="text-slate-600 mt-2 font-light">Filter by type and AC preference, then fill your trip details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Booking Form */}
          <div className="lg:col-span-5 glass-card p-8 border-slate-200 h-fit">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-blue-500">📍</span> Trip Details
            </h3>

            {success && (
              <div className="bg-emerald-50 text-emerald-700 text-sm py-3 px-4 rounded-xl border border-emerald-200 mb-6 flex flex-col gap-1 shadow-sm">
                <div className="flex justify-between items-center"><span className="flex items-center gap-2">✅ {success}</span><Link href="/dashboard" className="underline font-medium hover:text-emerald-900">View Bookings</Link></div>
              </div>
            )}
            {error && (
              <div className="bg-rose-50 text-rose-700 text-sm py-3 px-4 rounded-xl border border-rose-200 mb-6 flex items-center gap-2 shadow-sm">
                <span>❌</span> {error}
              </div>
            )}

            <form action={bookCab} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-wide">Pickup Location</label>
                <input type="text" name="pickup_location" required placeholder="Where from?" 
                  className="glass-input" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-wide">Drop Location</label>
                <input type="text" name="drop_location" required placeholder="Where to?" 
                  className="glass-input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-wide">Booking Date</label>
                <input type="date" name="booking_date" required min={new Date().toISOString().split('T')[0]} title="Booking Date"
                  className="glass-input [color-scheme:light]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 tracking-wide">Select Cab</label>
                <select name="cab_id" required title="Select Cab" className="glass-input appearance-none bg-slate-50 text-slate-900 [&>option]:bg-white [&>optgroup]:bg-slate-100">
                  <option value="">-- Choose a Cab --</option>
                  {Object.entries(groupedCabs).map(([type, groupCabs]) => (
                    <optgroup label={type} key={type}>
                      {groupCabs.map(cab => (
                        <option key={cab.cab_id} value={cab.cab_id}>
                          {cab.cab_number} ({cab.ac_type}) - Driver: {cab.driver_name || 'Unassigned'}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full neon-button-green mt-6 flex justify-center items-center gap-2 h-12">
                🚕 Book Now
              </button>
            </form>
          </div>

          {/* Cabs List */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              Available Cabs
              <span className="bg-blue-100 border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-full">{cabs.length}</span>
            </h3>

            {/* Filters */}
            <div className="glass-card p-5 mb-6 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 px-1">Filter by AC</span>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/booking?ac=All&type=${typeFilter}`} className={filterBtnClass(acFilter === "All")}>All</Link>
                  <Link href={`/booking?ac=AC&type=${typeFilter}`} className={filterBtnClass(acFilter === "AC")}>❄️ AC</Link>
                  <Link href={`/booking?ac=Non-AC&type=${typeFilter}`} className={filterBtnClass(acFilter === "Non-AC")}>🌀 Non-AC</Link>
                </div>
              </div>
              <div className="h-px bg-slate-200 w-full"></div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 px-1">Filter by Type</span>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/booking?ac=${acFilter}&type=All`} className={filterBtnClass(typeFilter === "All")}>All</Link>
                  <Link href={`/booking?ac=${acFilter}&type=Mini`} className={filterBtnClass(typeFilter === "Mini")}>🚗 Mini</Link>
                  <Link href={`/booking?ac=${acFilter}&type=Sedan`} className={filterBtnClass(typeFilter === "Sedan")}>🚙 Sedan</Link>
                  <Link href={`/booking?ac=${acFilter}&type=SUV`} className={filterBtnClass(typeFilter === "SUV")}>🚐 SUV</Link>
                  <Link href={`/booking?ac=${acFilter}&type=Premium`} className={filterBtnClass(typeFilter === "Premium")}>⭐ Premium</Link>
                </div>
              </div>
            </div>

            {/* Cab Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cabs.map(cab => (
                <div key={cab.cab_id} className="glass-card p-5 flex flex-col justify-between border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        <span>🚕</span> {cab.cab_number}
                      </h4>
                      <div className="flex gap-1.5 mt-0.5">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border border-indigo-200">{cab.cab_type}</span>
                        {cab.ac_type === 'AC' ? (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase py-1 px-2 rounded-md border border-blue-200">❄️ AC</span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold uppercase py-1 px-2 rounded-md border border-amber-200">🌀 Non-AC</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Driver:</span>
                        <span className="font-medium text-slate-800">{cab.driver_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Phone:</span>
                        <span className="font-medium text-slate-800">{cab.driver_phone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {cabs.length === 0 && (
                <div className="col-span-full glass-card p-10 border-dashed border-slate-300 text-center text-slate-500">
                  No cabs found matching these filters. Try adjusting your preferences.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
