import { NextRequest, NextResponse } from 'next/server';
import { verifyGoogleToken } from '../../../server/auth';
import { createSession, verifySession } from '../../../server/session';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await verifySession(token);
    if (session?.expiresAt && session.expiresAt > Date.now()) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
    }

    const sessionData = await verifyGoogleToken(credential);
    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid credential' }, { status: 401 });
    }

    const sessionToken = await createSession(sessionData);

    return NextResponse.json({
      success: true,
      token: sessionToken
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
