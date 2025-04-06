'use client';

import { useRouter } from 'next/navigation';
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';

const AuthPage: React.FC = () => {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      console.log(token)
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    }
  }, []);

  const switchModeHandler = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setIsLoading(false);
  };

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username || !password || (!isLoginMode && !confirmPassword)) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    if (!isLoginMode && password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
    if (!flaskApiUrl) {
        setError("API URL is not configured. Please check environment variables.");
        setIsLoading(false);
        return;
    }
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const body = JSON.stringify({ username, password });

    try {
      const response = await fetch(flaskApiUrl + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!response.ok) {
        let errorMsg = `Failed to ${isLoginMode ? 'login' : 'register'}. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.msg || errorMsg;
        } catch (parseError) {
          console.error("Could not parse error response:", parseError)
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        setIsAuthenticated(true);
        router.push('/');
      } else {
        throw new Error('Authentication successful, but no token received.');
      }

    } catch (err: any) {
      console.error('Authentication Error:', err);
      setError(err.message || `An unexpected error occurred. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      if (error) setError(null);
  };

  const handleSignOut = () => {
    console.log("Signing out...");
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log(localStorage.getItem("access_token"))
    console.log(localStorage.getItem("refresh_token"))
    setIsAuthenticated(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Profile
          </h2>
          <p className="text-gray-600">
            Welcome! You are currently logged in.
          </p>
          <button
            onClick={handleSignOut}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition ease-in-out duration-150"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <div className="mt-1">
              <input id="username" name="username" type="text" autoComplete="username" required value={username} onChange={handleInputChange(setUsername)} disabled={isLoading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm disabled:opacity-50 disabled:bg-gray-50"
                placeholder="Your Username" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1">
              <input id="password" name="password" type="password" autoComplete={isLoginMode ? 'current-password' : 'new-password'} required value={password} onChange={handleInputChange(setPassword)} disabled={isLoading}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm disabled:opacity-50 disabled:bg-gray-50"
                placeholder="********" />
            </div>
          </div>
          {!isLoginMode && (
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1">
                <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={handleInputChange(setConfirmPassword)} disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="********" />
              </div>
            </div>
          )}
          {error && (<div className="text-center"><p className="text-sm text-red-600">{error}</p></div>)}
          <div>
            <button type="submit" disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Processing...' : (isLoginMode ? 'Sign in' : 'Create account')}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button type="button" onClick={switchModeHandler} disabled={isLoading}
            className="font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 rounded disabled:opacity-60">
            {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;