import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

interface LoginGoogleProps {
  login: () => void;
  denied: boolean;
};

export const LoginGoogle = ({
  login, denied
} : LoginGoogleProps) => {
  const handleError = () => {
    console.error('Failed to sign in with Google.');
  };

  const handleSuccess = async (creds : CredentialResponse) => {
    if (!creds.credential) {
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: creds.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('session', data.token);
          login();
        }
      } else {
        console.error('Failed to verify credential');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_GOOGLE_CLIENT_ID"');
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="text-white flex flex-1 self-center flex-col items-center gap-3">
        <h2>Please sign in to your Google account</h2>
        {denied ? (<em>Not authorised</em>) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            auto_select
          ></GoogleLogin>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};
