import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-transparent overflow-hidden">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">

        <div className="mx-auto max-w-2xl py-20 sm:py-32 flex flex-col items-center text-center">
          <div className="mb-8 flex justify-center">
            <span className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-600 glass-panel shadow-sm transition-all border border-slate-200">
              Announcing our new robust cab management portal.
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6 leading-tight drop-shadow-sm">
            Book Your Cab{" "}
            <span className="text-blue-600">
              Easily 🚕
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-xl mx-auto font-light">
            Fast, safe, and reliable cab booking system. Book rides anytime and
            travel comfortably with our AC and Non-AC premium options.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 w-full max-w-sm sm:max-w-none">
            {!session.userId ? (
              <>
                <Link href="/register" className="neon-button px-8 text-base">
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="neon-button-green px-8 text-base"
                >
                  Book Now
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="neon-button px-8 py-3 text-base"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 relative z-10 w-full glass-panel mt-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-bold leading-7 text-blue-600 tracking-wider uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Why Choose Us?
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: "AC and Non-AC",
                  desc: "Choose between AC and Non-AC cabs as per your comfort",
                  icon: "❄️",
                },
                {
                  name: "Multiple Cab Types",
                  desc: "Mini, Sedan, SUV and Premium cabs available",
                  icon: "🚗",
                },
                {
                  name: "Live Trip Status",
                  desc: "Track your trip status from Confirmed to Dropped",
                  icon: "📍",
                },
                {
                  name: "Easy Booking",
                  desc: "Book, edit or cancel your cab anytime easily",
                  icon: "✏️",
                },
                {
                  name: "Always Available",
                  desc: "Our cabs are available 24 hours a day, 7 days a week",
                  icon: "⏰",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center glass-card p-10 group"
                >
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-slate-900 flex-col text-center">
                    <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-3xl shadow-sm mb-6 border border-blue-100 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-100">
                      {feature.icon}
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 text-center font-light">
                    <p className="flex-auto">{feature.desc}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Login Roles Section */}
      <div className="py-24 sm:py-32 relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Login Portals
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-10 text-center flex flex-col">
              <div className="text-6xl mb-6">
                👤
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">User</h3>
              <p className="text-slate-500 mb-8 h-12 text-sm">
                Book cabs, track trips and manage your bookings
              </p>
              <Link
                href="/login"
                className="mt-auto neon-button py-3 text-sm flex justify-center items-center gap-2"
              >
                <span>Enter Portal</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="glass-card p-10 text-center flex flex-col border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-500/5">
              <div className="text-6xl mb-6">
                🚕
              </div>
              <h3 className="text-2xl font-bold mb-3 text-emerald-600">
                Driver
              </h3>
              <p className="text-slate-500 mb-8 h-12 text-sm">
                View assigned trips and update pickup and drop status
              </p>
              <Link
                href="/driver-login"
                className="mt-auto neon-button-green py-3 text-sm flex justify-center items-center gap-2"
              >
                <span>Enter Portal</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="glass-card p-10 text-center flex flex-col border-rose-100 hover:border-rose-300 hover:shadow-rose-500/5">
              <div className="text-6xl mb-6">
                🔐
              </div>
              <h3 className="text-2xl font-bold mb-3 text-rose-600">
                Admin
              </h3>
              <p className="text-slate-500 mb-8 h-12 text-sm">
                Manage all users, drivers, cabs and bookings
              </p>
              <Link
                href="/admin-login"
                className="mt-auto neon-button-red py-3 text-sm flex justify-center items-center gap-2"
              >
                <span>Enter Portal</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
