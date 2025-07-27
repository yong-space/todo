import { JWTPayload, SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession(data: JWTPayload): Promise<string> {
  const payload = {
    ...data,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  };

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  return jwt;
}

type SessionData = JWTPayload & {
    email: string;
    expiresAt: number;
}

export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    return (await jwtVerify(token, secret)).payload as SessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export function getSessionFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session');
}

export function setSessionToStorage(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('session', token);
}

export function clearSessionFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session');
}
