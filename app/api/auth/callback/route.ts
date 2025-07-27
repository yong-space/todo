import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '../../../server/auth';
import { createSession } from '../../../server/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const sessionData = await exchangeCodeForTokens(code);
    const sessionToken = await createSession(sessionData);

    // Redirect with token in URL fragment (client-side only)
    const redirectUrl = new URL('/', request.url);
    redirectUrl.hash = `token=${sessionToken}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
  }
}
