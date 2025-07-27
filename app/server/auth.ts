import { OAuth2Client } from 'google-auth-library';
import { JWTPayload } from 'jose';

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? process.env.CALLBACK_URI
    : 'http://localhost:3000/api/auth/callback'
);

export async function verifyGoogleToken(token: string): Promise<JWTPayload | null> {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      return null;
    }

    return {
      email: payload.email,
      googleId: payload.sub,
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    return null;
  }
}

export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.id_token) {
      throw new Error('No ID token received');
    }

    const sessionData = await verifyGoogleToken(tokens.id_token);
    if (!sessionData) {
      throw new Error('Failed to verify Google token');
    }

    // Store refresh token if available
    if (tokens.refresh_token) {
      sessionData.refreshToken = tokens.refresh_token;
    }
    if (tokens.access_token) {
      sessionData.accessToken = tokens.access_token;
    }

    return sessionData;
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw error;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

export async function getAuthUrl(): Promise<string> {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'openid',
      'email',
      'profile',
    ],
  });

  return authUrl;
}
