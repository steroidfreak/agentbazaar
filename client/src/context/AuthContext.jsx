import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'agentbazaar_auth';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { token: null, user: null };
    } catch (error) {
      console.warn('Failed to parse auth storage');
      return { token: null, user: null };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const value = useMemo(() => ({
    token: authState.token,
    user: authState.user,
    isAuthenticated: Boolean(authState.token),
    login: (token, user) => setAuthState({ token, user }),
    logout: () => setAuthState({ token: null, user: null })
  }), [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}