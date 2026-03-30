import { loginDriver } from "./actions";

export default async function DriverLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const hasError = resolvedParams?.error === "InvalidCredentials";

  return (
    <div className="flex justify-center items-center py-20 px-4 min-h-[calc(100vh-80px)]">
      <div className="glass-card p-10 w-full max-w-sm border-emerald-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚕</div>
          <h2 className="text-2xl font-bold text-slate-900">Driver Portal</h2>
          <p className="text-slate-600 text-sm mt-1">Access your assigned trips</p>
        </div>
        
        {hasError && (
          <div className="bg-rose-50 text-rose-600 text-sm py-3 px-4 rounded-xl border border-rose-200 mb-6 flex items-center gap-2 shadow-sm">
            <span>⚠️</span> Invalid email or password.
          </div>
        )}
        
        <form action={loginDriver} className="space-y-5">
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              required 
              className="glass-input focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required 
              className="glass-input focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full neon-button-green mt-4"
          >
            <span className="group-hover:tracking-wide transition-all">Login as Driver</span>
          </button>
        </form>
      </div>
    </div>
  );
}
