import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAPI, registerAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('chatUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('chatUser');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginAPI({ email, password });
    localStorage.setItem('chatUser', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { data } = await registerAPI({ username, email, password });
    localStorage.setItem('chatUser', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chatUser');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
