import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Rol } from '../types';

interface AuthContextType {
  user: { id: string; nombre: string; email: string; rol: Rol } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Credenciales mock (después se conectarán a Supabase Auth)
const USERS = [
  { id: '1', nombre: 'Administrador', email: 'admin@norba.com', password: 'admin123', rol: 'admin' as Rol },
  { id: '2', nombre: 'Mecánico', email: 'mecanico@norba.com', password: 'mec123', rol: 'mecanico' as Rol },
  { id: '3', nombre: 'Recepcionista', email: 'recepcion@norba.com', password: 'rec123', rol: 'recepcion' as Rol },
];

// Función para cargar el usuario desde localStorage (evita el efecto)
const loadUserFromStorage = (): AuthContextType['user'] => {
  try {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    localStorage.removeItem('auth_user');
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 🔥 Inicializar con el usuario de localStorage si existe (sin useEffect)
  const [user, setUser] = useState<AuthContextType['user']>(loadUserFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const found = USERS.find(u => u.email === email && u.password === password);
      if (found) {
        // 🔥 Crear objeto sin la contraseña (evita variable no usada)
        const userWithoutPassword = {
          id: found.id,
          nombre: found.nombre,
          email: found.email,
          rol: found.rol,
        };
        setUser(userWithoutPassword);
        localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('rol', userWithoutPassword.rol);
        return true;
      } else {
        setError('Credenciales incorrectas');
        return false;
      }
    } catch {
      setError('Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('rol');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};