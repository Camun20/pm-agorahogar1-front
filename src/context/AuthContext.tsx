import React, { createContext, useContext, useState, useEffect } from 'react';
import { awsConfig } from '../config/aws-config';

// Tipos de roles soportados en el sistema
export type UserRole = 'SuperAdmin' | 'ResidentialAdmin' | 'Security' | 'Accounting' | 'Resident';

export interface User {
  username: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  location?: string;
  phone?: string;
  residentType?: 'Propietario' | 'Propietario y Residente';
  tower?: string;
  apartment?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  users: User[];
  createUser: (newUser: User) => Promise<void>;
  updateUser: (username: string, updatedFields: Partial<User>) => Promise<void>;
  deleteUser: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios iniciales de prueba para fácil testeo de roles en desarrollo
const DEFAULT_USERS: User[] = [
  {
    username: 'admin',
    email: 'admin@lobbyapp.com',
    name: 'Super Administrador (LobbyApp)',
    role: 'SuperAdmin',
    password: 'admin',
    phone: '300 123 4567',
  },
  {
    username: 'superadmin_usr',
    email: 'superadmin@lobbyapp.com',
    name: 'Carlos Mendoza',
    role: 'SuperAdmin',
    password: '123456',
    phone: '310 987 6543',
  },
  {
    username: 'resadmin_usr',
    email: 'admin@lobbyapp.com',
    name: 'Ana María Gómez',
    role: 'ResidentialAdmin',
    password: '123456',
    location: 'Portería Principal - Admin Office',
    phone: '315 222 3344',
  },
  {
    username: 'security_usr',
    email: 'seguridad@lobbyapp.com',
    name: 'Guarda Torres',
    role: 'Security',
    password: '123456',
    phone: '320 555 6677',
  },
  {
    username: 'accounting_usr',
    email: 'contabilidad@lobbyapp.com',
    name: 'Mauricio Restrepo',
    role: 'Accounting',
    password: '123456',
    phone: '318 444 8899',
  },
  {
    username: 'resident_usr',
    email: 'residente@lobbyapp.com',
    name: 'Diana Carolina Ruiz',
    role: 'Resident',
    password: '123456',
    location: 'Torre 3 - Apto 402',
    phone: '312 999 0011',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Verificar que las variables de AWS Cognito están inicializadas
    if (import.meta.env.DEV) {
      console.log(`[Cognito Auth] Inicializado en región: ${awsConfig.cognito.region}`);
    }

    // Inicializar o cargar usuarios desde localStorage
    const savedUsersList = localStorage.getItem('lobbyapp_users');
    if (savedUsersList) {
      try {
        setUsers(JSON.parse(savedUsersList));
      } catch (e) {
        localStorage.setItem('lobbyapp_users', JSON.stringify(DEFAULT_USERS));
        setUsers(DEFAULT_USERS);
      }
    } else {
      localStorage.setItem('lobbyapp_users', JSON.stringify(DEFAULT_USERS));
      setUsers(DEFAULT_USERS);
    }

    // Al cargar el componente, verificar sesión previa en localStorage
    const savedUser = localStorage.getItem('lobbyapp_user');
    const savedToken = localStorage.getItem('lobbyapp_token');

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
        setToken(savedToken);
        setRole(parsedUser.role);
      } catch (e) {
        localStorage.removeItem('lobbyapp_user');
        localStorage.removeItem('lobbyapp_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulación de delay de red (AWS Cognito API Call)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const inputUsername = username.toLowerCase().trim();

      // Cargar lista actualizada de localStorage por si acaso
      const currentUsersList = JSON.parse(localStorage.getItem('lobbyapp_users') || JSON.stringify(DEFAULT_USERS)) as User[];

      // Buscar usuario por username (o email por compatibilidad si es necesario)
      const foundUser = currentUsersList.find(
        (u) =>
          u.username.toLowerCase() === inputUsername ||
          u.email.toLowerCase() === inputUsername
      );

      const isValidPassword = foundUser && (foundUser.password === password);

      if (foundUser && isValidPassword) {
        // Generamos un token JWT simulado
        const mockToken = `mock-jwt-token-header.${btoa(JSON.stringify({ ...foundUser, 'cognito:groups': [foundUser.role] }))}.signature`;
        
        setUser(foundUser);
        setToken(mockToken);
        setRole(foundUser.role);
        
        localStorage.setItem('lobbyapp_user', JSON.stringify(foundUser));
        localStorage.setItem('lobbyapp_token', mockToken);
      } else {
        throw new Error('Credenciales inválidas. (Tip: Usa el usuario "admin" y contraseña "admin" para SuperAdmin)');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Cognito');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('lobbyapp_user');
    localStorage.removeItem('lobbyapp_token');
  };

  // --- MÉTODOS DE ADMINISTRACIÓN DE USUARIOS (CRUD) ---

  const createUser = async (newUser: User) => {
    // Validar unicidad de username
    const exists = users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase());
    if (exists) {
      throw new Error(`El nombre de usuario "${newUser.username}" ya está registrado.`);
    }

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('lobbyapp_users', JSON.stringify(updatedUsers));
  };

  const updateUser = async (username: string, updatedFields: Partial<User>) => {
    const updatedUsers = users.map(u => {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return { ...u, ...updatedFields };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('lobbyapp_users', JSON.stringify(updatedUsers));

    // Si el usuario editado es el actual, actualizamos su sesión activa
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      const updatedCurrentUser = { ...user, ...updatedFields };
      setUser(updatedCurrentUser);
      localStorage.setItem('lobbyapp_user', JSON.stringify(updatedCurrentUser));
    }
  };

  const deleteUser = async (username: string) => {
    const updatedUsers = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    setUsers(updatedUsers);
    localStorage.setItem('lobbyapp_users', JSON.stringify(updatedUsers));

    // Si el usuario eliminado es el actual, cerramos sesión
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        users,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
