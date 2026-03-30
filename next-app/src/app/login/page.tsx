import Link from "next/link";
import { loginUser } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const hasError = resolvedParams?.error === "InvalidCredentials";

  return (
    <div className="flex justify-center items-center py-20 px-4 min-h-[calc(100vh-80px)]">
      <div className="glass-card p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚕</div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-600 text-sm mt-1">Login to your user account</p>
        </div>
        
        {hasError && (
          <div className="bg-rose-50 text-rose-600 text-sm py-3 px-4 rounded-xl border border-rose-200 mb-6 flex items-center gap-2 shadow-sm">
            <span>⚠️</span> Invalid email or password.
          </div>
        )}
        
        <form action={loginUser} className="space-y-5">
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              required 
              className="glass-input"
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required 
              className="glass-input"
            />
          </div>
          <button 
            type="submit" 
            className="w-full neon-button mt-4"
          >
            <span className="group-hover:tracking-wide transition-all">Login</span>
          </button>
        </form>
        
        <div className="text-center mt-6 text-sm text-slate-600">
          Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Register here</Link>
        </div>
      </div>
    </div>
  );
}
