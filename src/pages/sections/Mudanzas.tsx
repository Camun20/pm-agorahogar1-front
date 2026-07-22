import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Archive, Search, Plus, CheckCircle, XCircle,
  Calendar, AlertCircle, Inbox, Sunrise, Sunset
} from 'lucide-react';

interface MovingRequest {
  id: string;
  residentName: string;
  location: string;
  movingDate: string;
  movingTime: string; // ej. 08:00 AM - 12:00 PM
  status: 'Pendiente' | 'Aprobada' | 'Rechazada';
  createdAt: string;
  notes?: string;
  adminComment?: string;
}

export const Mudanzas: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';
  const isSecurity = user?.role === 'SuperAdmin' || user?.role === 'Security';

  // States
  const [requests, setRequests] = useState<MovingRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'request'>('list');
  const [adminComments, setAdminComments] = useState<Record<string, string>>({});

  // Form State
  const [movingDate, setMovingDate] = useState('');
  const [movingTime, setMovingTime] = useState('08:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_moving_requests');
    const initialRequests: MovingRequest[] = [
      {
        id: 'mud_1',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        movingDate: '2026-07-20',
        movingTime: '08:00 AM - 12:00 PM',
        status: 'Aprobada',
        createdAt: '2026-07-14'
      },
      {
        id: 'mud_2',
        residentName: 'Carlos Mendoza',
        location: 'Torre 1 - Apto 101',
        movingDate: '2026-07-22',
        movingTime: '13:00 PM - 17:00 PM',
        status: 'Pendiente',
        createdAt: '2026-07-14',
        notes: 'Requiere acceso de camión de mudanzas grande al sótano.'
      }
    ];

    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch {
        setRequests(initialRequests);
      }
    } else {
      localStorage.setItem('lobbyapp_moving_requests', JSON.stringify(initialRequests));
      setRequests(initialRequests);
    }
  }, []);

  const filteredRequests = requests.filter(r => {
    // If Security, only show approved ones
    if (isSecurity && !isAdmin) {
      return r.status === 'Aprobada';
    }
    // If Resident, only show their own
    if (!isAdmin && !isSecurity && r.location !== user?.location) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    return r.residentName.toLowerCase().includes(term) || r.location.toLowerCase().includes(term);
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!movingDate || !movingTime) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    const newRequest: MovingRequest = {
      id: `mud_${Date.now()}`,
      residentName: user?.name || 'Residente',
      location: user?.location || 'No especificado',
      movingDate,
      movingTime,
      status: 'Pendiente',
      createdAt: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem('lobbyapp_moving_requests', JSON.stringify(updated));

    // Reset Form
    setMovingDate('');
    setMovingTime('08:00 AM - 12:00 PM');
    setNotes('');
    setActiveTab('list');
  };

  const handleApprove = (reqId: string) => {
    const comment = adminComments[reqId]?.trim() || '';
    const updated = requests.map(r => {
      if (r.id === reqId) {
        return { 
          ...r, 
          status: 'Aprobada' as const,
          adminComment: comment || undefined
        };
      }
      return r;
    });
    setRequests(updated);
    localStorage.setItem('lobbyapp_moving_requests', JSON.stringify(updated));
  };

  const handleReject = (reqId: string) => {
    const comment = adminComments[reqId]?.trim() || '';
    const updated = requests.map(r => {
      if (r.id === reqId) {
        return { 
          ...r, 
          status: 'Rechazada' as const,
          adminComment: comment || undefined
        };
      }
      return r;
    });
    setRequests(updated);
    localStorage.setItem('lobbyapp_moving_requests', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Archive className="w-3.5 h-3.5" />
              Gestión Logística
            </span>
            <h1 className="text-2xl font-extrabold text-white">Programación de Mudanzas</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isAdmin 
                ? 'Aprueba o rechaza solicitudes de mudanza de entrada y salida del conjunto.'
                : isSecurity 
                ? 'Monitorea las mudanzas programadas autorizadas del día para coordinar accesos.'
                : 'Registra y solicita autorización para realizar mudanzas en el conjunto.'}
            </p>
          </div>
          {!isAdmin && !isSecurity && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Listado
              </button>
              <button
                onClick={() => setActiveTab('request')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'request'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-slate-800/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                Registrar Mudanza
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'request' && !isAdmin && !isSecurity ? (
        /* Request Form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Programar Solicitud de Mudanza</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Fecha Requerida *</label>
                <input
                  type="date"
                  value={movingDate}
                  onChange={(e) => setMovingDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-semibold block">Horario Requerido *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: '08:00 AM - 12:00 PM', label: 'Mañana', hours: '08:00 AM - 12:00 PM', icon: <Sunrise className="w-5 h-5 text-amber-400" /> },
                    { value: '13:00 PM - 17:00 PM', label: 'Tarde', hours: '01:00 PM - 05:00 PM', icon: <Sunset className="w-5 h-5 text-indigo-400" /> }
                  ].map((slot) => {
                    const isSelected = movingTime === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setMovingTime(slot.value)}
                        className={`p-4 border rounded-2xl text-left transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500 text-white ring-1 ring-indigo-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="shrink-0 p-2 bg-slate-900 border border-slate-800 rounded-xl">
                          {slot.icon}
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-200">{slot.label}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{slot.hours}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Comentarios / Notas Especiales (Opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej. Especificar si es mudanza de entrada o salida, y el tamaño del camión..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 resize-none"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                Solicitar Registro
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-6 space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por residente o apartamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((r) => (
                <div key={r.id} className="p-5 bg-slate-950/60 border border-slate-800/85 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Solicitado: {r.createdAt}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-xxs font-bold border uppercase whitespace-nowrap shrink-0 ${
                        r.status === 'Aprobada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        r.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 text-sm leading-snug">{r.residentName}</h4>
                      <p className="text-xxs text-indigo-400 font-semibold">{r.location}</p>
                    </div>

                    <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1.5 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Fecha Mudanza:</span>
                        <span className="text-slate-200 font-semibold">{r.movingDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horario:</span>
                        <span className="text-slate-200 font-semibold">{r.movingTime}</span>
                      </div>
                      {r.notes && (
                        <div className="pt-1.5 border-t border-slate-900 mt-1.5 text-xxs text-slate-500">
                          {r.notes}
                        </div>
                      )}
                      {r.adminComment && (
                        <div className="pt-1.5 border-t border-slate-900 mt-1.5 text-xxs text-amber-450 font-medium">
                          <strong>Comentario Admin:</strong> {r.adminComment}
                        </div>
                      )}
                    </div>
                  </div>

                  {isAdmin && r.status === 'Pendiente' && (
                    <div className="pt-4 border-t border-slate-900 mt-4 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Comentario de la decisión (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Motivo de aprobación o rechazo..."
                          value={adminComments[r.id] || ''}
                          onChange={(e) => setAdminComments({ ...adminComments, [r.id]: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-lg outline-none text-xs transition"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleReject(r.id)}
                          className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay solicitudes de mudanza registradas.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Mudanzas;
