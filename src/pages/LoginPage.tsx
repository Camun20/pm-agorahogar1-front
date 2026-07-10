import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, KeyRound, Mail, AlertTriangle, Info } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error: authError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir de vuelta a la página a la que quería ingresar o a Dashboard
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email) {
      setValidationError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setValidationError('Por favor ingresa tu contraseña.');
      return;
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // El error ya lo maneja el contexto global
    }
  };

  const handleQuickLogin = (mockEmail: string) => {
    setEmail(mockEmail);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden select-none">
      {/* Decorative premium gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-600/20 mb-2">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Lobby<span className="text-indigo-400">App</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Sistema Integrado de Administración y Gestión Residencial
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Inicia sesión en tu cuenta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@lobbyapp.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Contraseña
                </label>
                <a href="#reset" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Alerts & Errors */}
            {(validationError || authError) && (
              <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm animate-shake">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="leading-snug">{validationError || authError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-800 disabled:to-purple-800 disabled:text-slate-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/15 focus:outline-none transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Conectando con AWS Cognito...</span>
                </>
              ) : (
                <span>Ingresar</span>
              )}
            </button>
          </form>

          {/* Quick Mock Login Area (For convenience during testing & reviews) */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 justify-center">
              <Info className="w-4 h-4 text-indigo-400" />
              Accesos Rápidos de Simulación (Clave: 123456 / admin)
            </h3>
            <div className="flex flex-wrap gap-2 justify-center col-span-2">
              <button
                type="button"
                onClick={() => { setEmail('admin'); setPassword('admin'); }}
                className="text-xxs bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-200 font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                SuperAdmin (admin/admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@lobbyapp.com')}
                className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Admin Res.
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('residente@lobbyapp.com')}
                className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Residente
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('seguridad@lobbyapp.com')}
                className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Guarda
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('contabilidad@lobbyapp.com')}
                className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-sky-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Contador
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600">
          LobbyApp v1.0.0 — Protegido mediante AWS Cognito & cifrado de tokens JWT
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
