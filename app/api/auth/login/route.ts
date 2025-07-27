import { NextResponse } from 'next/server';
import { getAuthUrl } from '../../../server/auth';

export async function GET() {
  try {
    const authUrl = await getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
