import Link from "next/link";
import { getSession } from "@/lib/session";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export default async function Navbar() {
  const session = await getSession();

  const isLoggedIn = !!session.userId || !!session.driverId || !!session.adminId;
  let dashboardLink = "/";

  if (session.userId) dashboardLink = "/dashboard";
  if (session.driverId) dashboardLink = "/driver-dashboard";
  if (session.adminId) dashboardLink = "/admin-dashboard";

  return (
    <header className="glass-panel sticky top-0 z-50 text-slate-800 px-6 py-4 flex justify-between items-center transition-all">
      <div className="font-bold text-2xl flex items-center gap-2 tracking-tight">
        <span className="text-blue-600">🚕</span> 
        <Link href="/" className="hover:text-blue-600 transition-colors">Cab System</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors">Home</Link>
        
        {!isLoggedIn ? (
          <>
            <Link href="/login" className="hover:bg-black/5 px-3 py-2 rounded-lg font-medium transition-colors">User Login</Link>
            <Link href="/register" className="hover:bg-black/5 px-3 py-2 rounded-lg font-medium transition-colors">Register</Link>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <Link href="/driver-login" className="hover:text-amber-600 px-3 py-2 rounded-lg font-medium transition-colors text-sm">Driver</Link>
            <Link href="/admin-login" className="hover:text-rose-600 px-3 py-2 rounded-lg font-medium transition-colors text-sm">Admin</Link>
            <Link href="/login" className="neon-button px-6 py-2.5 ml-2 text-sm">
              Book Now
            </Link>
          </>
        ) : (
          <>
            <Link href={dashboardLink} className="hover:bg-black/5 px-3 py-2 rounded-lg font-medium transition-colors">
              Dashboard
            </Link>
            <form action={async () => {
              "use server";
              const cookieStore = await cookies();
              const session = await getIronSession(cookieStore, {
                password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
                cookieName: 'cab_management_session'
              });
              session.destroy();
              redirect('/login');
            }}>
              <button type="submit" className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 px-4 py-2 rounded-lg font-medium transition-all ml-2">
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
