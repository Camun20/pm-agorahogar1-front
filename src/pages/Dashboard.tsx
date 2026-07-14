import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Bell, ClipboardList, Shield 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Custom widgets based on user role
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';
  const isSecurity = user?.role === 'Security';
  
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Building2 className="w-3.5 h-3.5" />
            LobbyApp Residencial
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¡Hola, {user?.name}!
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Te damos la bienvenida al panel de control de tu copropiedad. Aquí puedes gestionar servicios,
            comunicarte con administración y revisar el estado general del conjunto.
          </p>
          {user?.location && (
            <p className="mt-3 text-xs text-indigo-300 font-mono font-medium">
              Ubicación: {user.location} | Rol: {user.role}
            </p>
          )}
        </div>
      </div>

      {/* Main Grid Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Activity Widget */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Avisos de Administración
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/60 border-l-2 border-indigo-500 rounded-r-xl">
              <h4 className="text-sm font-medium text-slate-200">Asamblea General Ordinaria</h4>
              <p className="text-xs text-slate-400 mt-1">Fecha programada: Próximo Sábado a las 8:00 AM vía Zoom.</p>
            </div>
            <div className="p-3 bg-slate-900/60 border-l-2 border-emerald-500 rounded-r-xl">
              <h4 className="text-sm font-medium text-slate-200">Corte Programado de Agua</h4>
              <p className="text-xs text-slate-400 mt-1">Mantenimiento de tanques el Miércoles de 9:00 AM a 1:00 PM.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Widget based on role */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Seguridad & Estado
          </h2>
          {isSecurity ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Guarda logueado en Turno Activo.</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/80 rounded-xl text-center">
                  <span className="text-2xl font-bold text-white">12</span>
                  <span className="block text-slate-400 text-xxs mt-0.5">Visitas Hoy</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl text-center">
                  <span className="text-2xl font-bold text-emerald-400">0</span>
                  <span className="block text-slate-400 text-xxs mt-0.5">Alertas Activas</span>
                </div>
              </div>
              <Link to="/visitantes" className="block text-center text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition">
                Registrar Visita
              </Link>
            </div>
          ) : isAdmin ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Resumen Administrativo General</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/80 rounded-xl text-center">
                  <span className="text-2xl font-bold text-white">4</span>
                  <span className="block text-slate-400 text-xxs mt-0.5">PQRS Nuevas</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl text-center">
                  <span className="text-2xl font-bold text-indigo-400">92%</span>
                  <span className="block text-slate-400 text-xxs mt-0.5">Pago Admin</span>
                </div>
              </div>
              <Link to="/pqrs" className="block text-center text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition">
                Ver PQRS Pendientes
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Estado de tu unidad</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estado de Pago:</span>
                  <span className="text-emerald-400 font-medium">Al Día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parqueadero asignado:</span>
                  <span className="text-slate-200">Torre 3 - P204</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservas Activas:</span>
                  <span className="text-slate-200">1 (Salón Social)</span>
                </div>
              </div>
              <Link to="/reservas" className="block text-center text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition">
                Nueva Reserva
              </Link>
            </div>
          )}
        </div>

        {/* Short Action / Feedback Widget */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            Encuestas Activas
          </h2>
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Hay encuestas activas que requieren tu participación.</p>
            <div className="p-3 bg-slate-900/60 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Renovación de fachada principal</span>
                <span className="text-amber-400 font-semibold">Pendiente</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <Link to="/encuestas" className="block text-center text-xs border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 font-medium py-2 rounded-lg transition">
              Votar Ahora
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
