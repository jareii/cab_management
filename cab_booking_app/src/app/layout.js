import { Space_Grotesk, Fraunces } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cab Booking Portal",
  description: "User, Driver, and Admin portals for the Cab Booking system.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body>
        <header className="site-header">
          <div className="brand">
            <span className="brand-mark">CB</span>
            <div>
              <p className="brand-title">Cab Booking</p>
              <p className="brand-subtitle">Unified Portal</p>
            </div>
          </div>
          <nav className="site-nav">
            <a href="/">Home</a>
            <a href="/user/login">User</a>
            <a href="/driver/login">Driver</a>
            <a href="/admin/login">Admin</a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <p>Cab Booking System Â· MongoDB Powered Â· Built for college project use.</p>
        </footer>
      </body>
    </html>
  );
}
