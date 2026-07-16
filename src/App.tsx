import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { syncInternetTime } from './utils/time';

export const App: React.FC = () => {
  useEffect(() => {
    // Sincronizar la hora de red en segundo plano sin interrumpir la experiencia de usuario
    syncInternetTime();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
