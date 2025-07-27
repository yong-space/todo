"use client"

import { useEffect, useState } from 'react';
import App from './client/app';
import { LoginGoogle } from './client/google-login';

const Loading = () => (
  <div className="flex flex-1 self-center flex-col items-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-e-transparent text-white">
    </div>
  </div>
);

export default () => {
  const [ loading, setLoading ] = useState(true);
  const [ darkMode, setDarkMode ] = useState<boolean | null>(null);
  const [ isAuthenticated, setIsAuthenticated ] = useState(false);
  const [ sessionToken, setSessionToken ] = useState<string | null>(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
    window.location.reload();
  };

  useEffect(() => {

    const hash = window.location.hash;
    if (hash.includes('token=')) {
      const token = hash.split('token=')[1];
      localStorage.setItem('session', token);
      window.location.hash = '';
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('session');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setSessionToken(token);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('session');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('session');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (darkMode === null) {
      let preDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedDark = window.localStorage.getItem('darkMode');
      if (storedDark) {
        preDark = eval(storedDark);
      }
      setDarkMode(preDark);
      return;
    }
    window.localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [ darkMode ]);

  if (loading) {
    return <Loading />;
  } else if (isAuthenticated && sessionToken) {
    return <App darkMode={darkMode} setDarkMode={setDarkMode} token={sessionToken} />;
  } else {
    return <LoginGoogle login={handleLogin} denied={false} />;
  }
};
