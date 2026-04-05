export default function Home() {
  return (
    <main>
      <section style={{ 
        padding: '100px 64px 140px', 
        background: 'linear-gradient(to right bottom, #0f172a, #1e293b)', 
        color: 'white', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '60px', 
        alignItems: 'center', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* Animated Background Orbs */}
        <div style={{ position: 'absolute', top: '-150px', left: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(15,118,110,0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#14b8a6' }}>
            Next Generation Platform
          </span>
          <h1 style={{ fontSize: 'clamp(42px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginTop: '24px', letterSpacing: '-1px' }}>
            Move flawlessly. <br/><span style={{ background: 'linear-gradient(to right, #14b8a6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Manage effortlessly.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', marginTop: '24px', maxWidth: '480px', lineHeight: 1.6 }}>
            The all-in-one cab architecture. Whether you're booking a luxury ride or managing a 500-vehicle fleet, everything happens here.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <a href="/user/login" style={{ background: '#14b8a6', color: 'white', padding: '16px 28px', borderRadius: '99px', fontWeight: 600, fontSize: '16px', textDecoration: 'none', boxShadow: '0 10px 25px rgba(20, 184, 166, 0.4)', transition: 'all 0.2s' }}>Book a Ride</a>
            <a href="/driver/register" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '16px 28px', borderRadius: '99px', fontWeight: 600, fontSize: '16px', textDecoration: 'none', backdropFilter: 'blur(10px)' }}>Become a Driver</a>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '20px', flexDirection: 'column' }}>
          {/* Glass Card 1 */}
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', transform: 'translateX(-40px)' }}>
            <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '14px', display: 'grid', placeItems: 'center', color: 'white' }}>💳</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>Secure Payments</div>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Bank-grade encryption for all rides.</div>
            </div>
          </div>
          {/* Glass Card 2 */}
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', transform: 'translateX(20px)' }}>
            <div style={{ width: '48px', height: '48px', background: '#10b981', borderRadius: '14px', display: 'grid', placeItems: 'center', color: 'white' }}>⚡</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>Real-time Shifts</div>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Drivers can instantly toggle shift status.</div>
            </div>
          </div>
          {/* Glass Card 3 */}
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', transform: 'translateX(-20px)' }}>
            <div style={{ width: '48px', height: '48px', background: '#f5a623', borderRadius: '14px', display: 'grid', placeItems: 'center', color: 'white' }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>Enterprise Subagent</div>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Admins shadow-manage the entire grid.</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 64px', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>Select your portal</h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '12px' }}>Access your personalized dashboard environment.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <a href="/user/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.3s', cursor: 'pointer' }}>
              <div style={{ background: '#e0f2fe', width: '60px', height: '60px', borderRadius: '16px', display: 'grid', placeItems: 'center', fontSize: '24px', marginBottom: '24px', color: '#0369a1' }}>📱</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>User Portal</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '30px' }}>Book rides, track unassigned drivers, and manage secure payments.</p>
              <span style={{ color: '#0369a1', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>Login as User &rarr;</span>
            </div>
          </a>

          <a href="/driver/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.3s', cursor: 'pointer' }}>
              <div style={{ background: '#fef3c7', width: '60px', height: '60px', borderRadius: '16px', display: 'grid', placeItems: 'center', fontSize: '24px', marginBottom: '24px', color: '#b45309' }}>🚕</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Driver Portal</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '30px' }}>Go on-duty, accept incoming hail requests, and track your daily earnings.</p>
              <span style={{ color: '#b45309', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>Login as Driver &rarr;</span>
            </div>
          </a>

          <a href="/admin/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#0f172a', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.3s', cursor: 'pointer', color: 'white' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'grid', placeItems: 'center', fontSize: '24px', marginBottom: '24px' }}>🛡️</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Admin Protocol</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '30px' }}>Oversight control. Appove applications, view system shadows, and manage grids.</p>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>Initialize Admin &rarr;</span>
            </div>
          </a>

        </div>
      </section>
    </main>
  );
}
