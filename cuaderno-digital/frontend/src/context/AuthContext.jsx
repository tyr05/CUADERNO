import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiPost } from '../lib/api.js';

const AuthContext = createContext();

const storageKey = 'cuaderno-auth';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.token || null;
    } catch (error) {
      console.error('Error leyendo auth storage', error);
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.user || null;
    } catch (error) {
      console.error('Error leyendo auth storage', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const data = JSON.stringify({ token, user });
    localStorage.setItem(storageKey, data);
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost('/auth/login', { email, password });
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message || 'Error de autenticación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nombre, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost('/auth/register', { nombre, email, password });
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message || 'Error al registrar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(storageKey);
  };

  const value = useMemo(
    () => ({ token, user, login, register, logout, loading, error, setError }),
    [token, user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
