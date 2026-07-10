import React, { createContext, useContext, useState, useEffect } from 'react';
import { awsConfig } from '../config/aws-config';

// Tipos de roles soportados en el sistema
export type UserRole = 'SuperAdmin' | 'ResidentialAdmin' | 'Security' | 'Accounting' | 'Resident';

export interface User {
  username: string;
  email: string;
  name: string;
  role: UserRole;
  apartment?: string;
  tower?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios de prueba para fácil testeo de roles en desarrollo
const MOCK_USERS: Record<string, User> = {
  'superadmin@lobbyapp.com': {
    username: 'superadmin_usr',
    email: 'superadmin@lobbyapp.com',
    name: 'Carlos Mendoza',
    role: 'SuperAdmin',
  },
  'admin@lobbyapp.com': {
    username: 'resadmin_usr',
    email: 'admin@lobbyapp.com',
    name: 'Ana María Gómez',
    role: 'ResidentialAdmin',
    apartment: 'Admin Office',
    tower: 'Portería Principal',
  },
  'seguridad@lobbyapp.com': {
    username: 'security_usr',
    email: 'seguridad@lobbyapp.com',
    name: 'Guarda Torres',
    role: 'Security',
    tower: 'Torre de Control A',
  },
  'contabilidad@lobbyapp.com': {
    username: 'accounting_usr',
    email: 'contabilidad@lobbyapp.com',
    name: 'Mauricio Restrepo',
    role: 'Accounting',
  },
  'residente@lobbyapp.com': {
    username: 'resident_usr',
    email: 'residente@lobbyapp.com',
    name: 'Diana Carolina Ruiz',
    role: 'Resident',
    apartment: '402',
    tower: 'Torre 3',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que las variables de AWS Cognito están inicializadas
    if (import.meta.env.DEV) {
      console.log(`[Cognito Auth] Inicializado en región: ${awsConfig.cognito.region}`);
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulación de delay de red (AWS Cognito API Call)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      /**
       * NOTA DE INTEGRACIÓN CON AWS COGNITO:
       * 
       * En un entorno real integrado con AWS Amplify, el flujo sería:
       * import { signIn } from 'aws-amplify/auth';
       * const { isSignedIn, nextStep } = await signIn({ username: email, password });
       * 
       * Y para extraer el rol del token JWT:
       * import { fetchAuthSession } from 'aws-amplify/auth';
       * const session = await fetchAuthSession();
       * const idToken = session.tokens?.idToken;
       * const groups = idToken?.payload['cognito:groups'] as string[];
       * const userRole = groups && groups.length > 0 ? (groups[0] as UserRole) : 'Resident';
       */

      // Para propósitos de demostración y testing, validamos con MOCK_USERS
      const mockUser = MOCK_USERS[email.toLowerCase().trim()];
      
      if (mockUser && password === '123456') {
        // Generamos un token JWT simulado
        const mockToken = `mock-jwt-token-header.${btoa(JSON.stringify({ ...mockUser, 'cognito:groups': [mockUser.role] }))}.signature`;
        
        setUser(mockUser);
        setToken(mockToken);
        setRole(mockUser.role);
        
        localStorage.setItem('lobbyapp_user', JSON.stringify(mockUser));
        localStorage.setItem('lobbyapp_token', mockToken);
      } else {
        throw new Error('Credenciales inválidas. (Tip: Usa correos mock como admin@lobbyapp.com y contraseña "123456")');
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
    
    /**
     * NOTA DE INTEGRACIÓN CON AWS COGNITO:
     * En producción con Amplify:
     * import { signOut } from 'aws-amplify/auth';
     * await signOut();
     */
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
