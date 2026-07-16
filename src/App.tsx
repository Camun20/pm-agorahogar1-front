import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { syncInternetTime } from './utils/time';

export const App: React.FC = () => {
  const [isTimeSynced, setIsTimeSynced] = useState(false);

  useEffect(() => {
    const init = async () => {
      await syncInternetTime();
      setIsTimeSynced(true);
    };
    init();
  }, []);

  if (!isTimeSynced) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium animate-pulse font-sans">
          Sincronizando reloj de seguridad con el servidor central...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
