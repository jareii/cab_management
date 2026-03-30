import { loginAdmin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const hasError = resolvedParams?.error === "InvalidCredentials";

  return (
    <div className="flex justify-center items-center py-20 px-4 min-h-[calc(100vh-80px)]">
      <div className="glass-card p-10 w-full max-w-sm border-rose-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
          <p className="text-slate-600 text-sm mt-1">System administration</p>
        </div>
        
        {hasError && (
          <div className="bg-rose-50 text-rose-600 text-sm py-3 px-4 rounded-xl border border-rose-200 mb-6 flex items-center gap-2 shadow-sm">
            <span>⚠️</span> Invalid username or password.
          </div>
        )}
        
        <form action={loginAdmin} className="space-y-5">
          <div>
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              required 
              className="glass-input focus:border-rose-500 focus:ring-rose-500"
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required 
              className="glass-input focus:border-rose-500 focus:ring-rose-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full neon-button-red mt-4"
          >
            <span className="group-hover:tracking-wide transition-all">Login as Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
}
