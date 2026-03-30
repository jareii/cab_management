import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: number;
  userName?: string;
  role?: 'user' | 'driver' | 'admin';
  driverId?: number;
  adminId?: number;
}

const sessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'cab_management_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
