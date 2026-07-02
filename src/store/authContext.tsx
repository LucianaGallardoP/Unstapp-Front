import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const clearStoredAuth = () => {
  localStorage.removeItem('unstapp_token');
  localStorage.removeItem('unstapp_token_expires_at');
  localStorage.removeItem('unstapp_user_id');
  localStorage.removeItem('unstapp_user_name');
  localStorage.removeItem('unstapp_user_roles');
  localStorage.removeItem('unstapp_user_avatar_url');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    clearStoredAuth();
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => ({ handleLogout }), [handleLogout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};