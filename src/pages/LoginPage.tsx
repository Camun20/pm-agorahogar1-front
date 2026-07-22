import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showSuccess } from '../utils/alerts';
import { 
  Building2, KeyRound, User as UserIcon, AlertTriangle, Info,
  Sun, Moon, Mail, ShieldCheck, Lock, ArrowLeft
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error: authError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect back to original route or dashboard
  const from = (location.state as any)?.from?.pathname || '/';

  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('lobbyapp_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Forgot Password Flow States
  // 'login' | 'reset-step1' | 'reset-step2' | 'reset-step3'
  const [flow, setFlow] = useState<'login' | 'reset-step1' | 'reset-step2' | 'reset-step3'>('login');
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('lobbyapp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username) {
      setValidationError('Por favor ingresa tu usuario.');
      return;
    }
    if (!password) {
      setValidationError('Por favor ingresa tu contraseña.');
      return;
    }

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Auth error is captured in context
    }
  };

  const handleQuickLogin = (mockUsername: string) => {
    setUsername(mockUsername);
    setPassword('123456');
  };

  // Step 1: Submit Username & Email
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetUsername.trim() || !resetEmail.trim()) {
      setResetError('Por favor completa todos los campos.');
      return;
    }

    const currentUsersList = JSON.parse(localStorage.getItem('lobbyapp_users') || '[]') as any[];
    const foundUser = currentUsersList.find(u => 
      u.username.toLowerCase() === resetUsername.toLowerCase().trim() &&
      u.email.toLowerCase() === resetEmail.toLowerCase().trim()
    );

    if (!foundUser) {
      setResetError('Usuario o correo electrónico incorrectos o no registrados.');
      return;
    }

    // Generate a mock 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    showSuccess(
      'Código Enviado',
      `Se simuló un correo enviado a ${resetEmail}.\nTu código de verificación es: ${code}`
    );
    setFlow('reset-step2');
  };

  // Step 2: Submit Verification Code
  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetCode.trim()) {
      setResetError('Por favor ingresa el código.');
      return;
    }

    if (resetCode.trim() !== generatedCode) {
      setResetError('Código de verificación incorrecto.');
      return;
    }

    showSuccess('Código Correcto', 'Código validado con éxito. Por favor define tu nueva contraseña.');
    setFlow('reset-step3');
  };

  // Step 3: Change Password
  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!newPassword) {
      setResetError('Por favor ingresa la nueva contraseña.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden.');
      return;
    }

    // Update users store in local storage
    const currentUsersList = JSON.parse(localStorage.getItem('lobbyapp_users') || '[]') as any[];
    const updated = currentUsersList.map(u => {
      if (u.username.toLowerCase() === resetUsername.toLowerCase().trim()) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    localStorage.setItem('lobbyapp_users', JSON.stringify(updated));

    showSuccess('Contraseña Reestablecida', 'Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tu nueva clave.');
    
    // Clear state & return
    setFlow('login');
    setUsername(resetUsername);
    setPassword('');
    setResetUsername('');
    setResetEmail('');
    setResetCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden select-none">
      {/* Theme Toggler Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer shadow-lg backdrop-blur"
          title={theme === 'dark' ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </button>
      </div>

      {/* Decorative premium gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl shadow-xl shadow-indigo-600/20 mb-2">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Lobby<span className="text-indigo-400">App</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Sistema Integrado de Administración y Gestión Residencial
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          
          {flow === 'login' && (
            /* STANDARD LOGIN VIEW */
            <>
              <h2 className="text-xl font-bold text-white mb-6 text-center">Inicia sesión en tu cuenta</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Introduce tu usuario"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none transition"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Contraseña
                  </label>
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
                  {/* Forgot Password link positioned right underneath */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => { setFlow('reset-step1'); setResetError(null); }}
                      className="text-xs text-indigo-455 hover:text-indigo-400 font-bold transition cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
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
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-indigo-800 disabled:to-blue-800 disabled:text-slate-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/15 focus:outline-none transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
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

              {/* Quick Mock Login Area */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 justify-center">
                  <Info className="w-4 h-4 text-indigo-400" />
                  Accesos Rápidos de Simulación (Claves en paréntesis)
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => { setUsername('admin'); setPassword('admin'); }}
                    className="text-xxs bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-255 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    SuperAdmin (admin/admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('resadmin_usr')}
                    className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Admin Res. (123456)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('resident_usr')}
                    className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Residente (123456)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('security_usr')}
                    className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Guarda (123456)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('accounting_usr')}
                    className="text-xxs bg-slate-900 border border-slate-800 hover:border-slate-700 text-sky-300 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Contador (123456)
                  </button>
                </div>
              </div>
            </>
          )}

          {flow === 'reset-step1' && (
            /* STEP 1: REQUEST USERNAME & EMAIL */
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
                <button
                  type="button"
                  onClick={() => setFlow('login')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-white">Recuperar Contraseña</h2>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Ingresa tu nombre de usuario y tu correo electrónico institucional o registrado. Te enviaremos un código de verificación.
              </p>

              <form onSubmit={handleStep1} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      placeholder="ej. resident_usr"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none transition"
                      required
                    />
                  </div>
                </div>

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
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="ej. residente@lobbyapp.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none transition"
                      required
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="leading-snug">{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Enviar Código de Verificación
                </button>
              </form>
            </div>
          )}

          {flow === 'reset-step2' && (
            /* STEP 2: VERIFY CODE */
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
                <button
                  type="button"
                  onClick={() => setFlow('reset-step1')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-white">Ingresar Código</h2>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Ingresa el código de 6 dígitos que enviamos a tu bandeja de correo registrado.
              </p>

              <form onSubmit={handleStep2} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Código de 6 dígitos
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="######"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-center font-bold tracking-widest text-lg transition"
                      required
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="leading-snug">{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Validar Código
                </button>
              </form>
            </div>
          )}

          {flow === 'reset-step3' && (
            /* STEP 3: RESET PASSWORD */
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
                <h2 className="text-lg font-bold text-white">Nueva Contraseña</h2>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Código validado con éxito. Escribe tu nueva contraseña de acceso a continuación.
              </p>

              <form onSubmit={handleStep3} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none transition"
                      required
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="leading-snug">{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Guardar Nueva Contraseña
                </button>
              </form>
            </div>
          )}

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
