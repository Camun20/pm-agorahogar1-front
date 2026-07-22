import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full scale-125"></div>
        <div className="relative bg-slate-900 border border-red-500/30 p-5 rounded-2xl">
          <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
        Acceso Denegado
      </h1>
      <p className="mt-3 text-slate-400 max-w-md mx-auto text-base">
        Tu rol actual no posee los privilegios necesarios para ver esta sección. Si crees que esto es un error, por favor contacta al administrador del sistema.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-slate-300 font-medium transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver atrás
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer"
        >
          Ir al Inicio
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
