import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { refreshSession } from './auth.api';

interface User {
  userId: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshSession().then((result) => {
      setUser(result);
      setIsLoading(false);
    });
  }, []);

  function login(u: User) {
    setUser(u);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
