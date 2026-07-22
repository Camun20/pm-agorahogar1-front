import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFormattedNetworkDateOnly } from '../../utils/time';
import { addNotification } from '../../utils/notifications';
import { showPrompt } from '../../utils/alerts';
import { 
  Ban, Search, Plus, CheckCircle, XCircle,
  Clock, Inbox, AlertCircle
} from 'lucide-react';

interface Sancion {
  id: string;
  residentName: string;
  location: string;
  infraction: string; // Detalle de la sanción
  reportedBy: string; // ej. Guarda Torres
  status: 'Pendiente Aprobación' | 'Aprobada' | 'Rechazada';
  createdAt: string;
  approvedBy?: string;
  cost?: number; // multa en dinero si aplica
}

export const Sanciones: React.FC = () => {
  const { user, users } = useAuth();
  const isSecurity = user?.role === 'SuperAdmin' || user?.role === 'Security';
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';

  // States
  const [sanciones, setSanciones] = useState<Sancion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'report'>('list');

  // Form State
  const [residentName, setResidentName] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [infraction, setInfraction] = useState('');
  const [costInput, setCostInput] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_sanciones');
    const initialSanciones: Sancion[] = [
      {
        id: 'sanc_1',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        infraction: 'Ruidos molestos y música a alto volumen pasadas las 2:00 AM en fin de semana.',
        reportedBy: 'Guarda Torres',
        status: 'Aprobada',
        createdAt: '2026-07-12',
        approvedBy: 'Ana María Gómez (Admin)',
        cost: 110000
      },
      {
        id: 'sanc_2',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        infraction: 'Obstrucción de pasillo común con cajas de mudanza y residuos por más de 24 horas.',
        reportedBy: 'Guarda Auxiliar',
        status: 'Pendiente Aprobación',
        createdAt: '2026-07-14'
      }
    ];

    if (saved) {
      try {
        setSanciones(JSON.parse(saved));
      } catch {
        setSanciones(initialSanciones);
      }
    } else {
      localStorage.setItem('lobbyapp_sanciones', JSON.stringify(initialSanciones));
      setSanciones(initialSanciones);
    }
  }, []);

  const filteredSanciones = sanciones.filter(s => {
    // If Resident, only show approved ones for their unit
    if (!isAdmin && !isSecurity) {
      return s.status === 'Aprobada' && s.location === user?.location;
    }

    const term = searchTerm.toLowerCase();
    return s.residentName.toLowerCase().includes(term) || s.location.toLowerCase().includes(term) || s.infraction.toLowerCase().includes(term);
  });

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!residentName.trim() || !locationInput.trim() || !infraction.trim()) {
      setFormError('Por favor completa todos los campos obligatorio (*).');
      return;
    }

    const newSancion: Sancion = {
      id: `sanc_${Date.now()}`,
      residentName: residentName.trim(),
      location: locationInput.trim(),
      infraction: infraction.trim(),
      reportedBy: `${user?.name || 'Seguridad'} (${user?.role || 'Guarda'})`,
      // Admin reports are APPROVED directly, security reports need approval
      status: isAdmin ? 'Aprobada' : 'Pendiente Aprobación',
      createdAt: getFormattedNetworkDateOnly(),
      ...(isAdmin && { approvedBy: user?.name, cost: costInput > 0 ? costInput : undefined })
    };

    // Dispatch Notifications depending on role and status
    if (newSancion.status === 'Aprobada') {
      addNotification(
        'Novedad de Convivencia / Multa ⚠️',
        `Se ha registrado un reporte de convivencia para tu unidad: "${newSancion.infraction}".`,
        { location: newSancion.location }
      );
    } else {
      addNotification(
        'Nueva Novedad Reportada ⚠️',
        `Seguridad reportó novedad en la unidad ${newSancion.location}: "${newSancion.infraction}".`,
        { role: 'ResidentialAdmin' }
      );
      addNotification(
        'Nueva Novedad Reportada ⚠️',
        `Seguridad reportó novedad en la unidad ${newSancion.location}: "${newSancion.infraction}".`,
        { role: 'SuperAdmin' }
      );
    }

    const updated = [newSancion, ...sanciones];
    setSanciones(updated);
    localStorage.setItem('lobbyapp_sanciones', JSON.stringify(updated));

    // Reset Form
    setResidentName('');
    setLocationInput('');
    setInfraction('');
    setCostInput(0);
    setActiveTab('list');
  };

  const handleApprove = (sancId: string, costAmount: number) => {
    const target = sanciones.find(s => s.id === sancId);
    if (target) {
      addNotification(
        'Reporte de Convivencia Aprobado ⚠️',
        `Se aprobó novedad para tu unidad: "${target.infraction}".${costAmount > 0 ? ` Multa asignada: $${costAmount.toLocaleString()} COP.` : ''}`,
        { location: target.location }
      );
    }

    const updated = sanciones.map(s => {
      if (s.id === sancId) {
        return { 
          ...s, 
          status: 'Aprobada' as const,
          approvedBy: user?.name || 'Administración',
          cost: costAmount > 0 ? costAmount : undefined
        };
      }
      return s;
    });
    setSanciones(updated);
    localStorage.setItem('lobbyapp_sanciones', JSON.stringify(updated));
  };

  const handleReject = (sancId: string) => {
    const updated = sanciones.map(s => {
      if (s.id === sancId) {
        return { ...s, status: 'Rechazada' as const };
      }
      return s;
    });
    setSanciones(updated);
    localStorage.setItem('lobbyapp_sanciones', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Ban className="w-3.5 h-3.5" />
              Convivencia & Multas
            </span>
            <h1 className="text-2xl font-extrabold text-white">Sanciones y Multas</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isAdmin 
                ? 'Monitorea reportes de convivencia hechos por los guardas y aprueba sanciones o multas.'
                : isSecurity 
                ? 'Reporta novedades o infracciones de convivencia cometidas por los residentes.'
                : 'Revisa el historial de llamados de atención y sanciones vigentes asociadas a tu apartamento.'}
            </p>
          </div>
          {(isAdmin || isSecurity) && (
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
                onClick={() => setActiveTab('report')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-slate-800/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                {isAdmin ? 'Crear Sanción' : 'Reportar Novedad'}
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'report' && (isAdmin || isSecurity) ? (
        /* Create/Report Form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">
            {isAdmin ? 'Registrar Sanción Directa' : 'Reportar Novedad de Convivencia'}
          </h2>
          
          <form onSubmit={handleReport} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Ubicación / Apto *</label>
                <select
                  value={locationInput}
                  onChange={(e) => {
                    const selectedLoc = e.target.value;
                    setLocationInput(selectedLoc);
                    const matchingRes = users.find(u => u.role === 'Resident' && u.location === selectedLoc);
                    setResidentName(matchingRes ? matchingRes.name : '');
                  }}
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                >
                  <option value="">-- Selecciona Apartamento --</option>
                  {users.filter(u => u.role === 'Resident' && u.location).map(r => (
                    <option key={r.username} value={r.location}>{r.location}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold block">Nombre Residente</label>
                <input
                  type="text"
                  value={residentName}
                  readOnly
                  placeholder="Auto-completado"
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 text-slate-400 rounded-xl outline-none text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Detalles de la Infracción *</label>
              <textarea
                value={infraction}
                onChange={(e) => setInfraction(e.target.value)}
                placeholder="Describe los hechos y la norma del reglamento interno infringida..."
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 resize-none"
                required
              />
            </div>

            {isAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Valor Multa Económica ($ COP - Opcional)</label>
                <input
                  type="number"
                  value={costInput || ''}
                  onChange={(e) => setCostInput(parseInt(e.target.value) || 0)}
                  placeholder="ej. 110000"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                />
              </div>
            )}

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
                {isAdmin ? 'Emitir Sanción' : 'Reportar Novedad'}
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
                placeholder="Buscar sanciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* List layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSanciones.length > 0 ? (
              filteredSanciones.map((s) => (
                <div 
                  key={s.id}
                  className={`p-5 bg-slate-950/60 border rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition ${
                    s.status === 'Pendiente Aprobación' ? 'border-amber-500/25 bg-amber-500/[0.01]' : 'border-slate-800/85'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Reportado: {s.createdAt}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-xxs font-bold border uppercase whitespace-nowrap shrink-0 ${
                        s.status === 'Aprobada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        s.status === 'Pendiente Aprobación' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 text-sm leading-snug">{s.residentName}</h4>
                      <p className="text-xxs text-indigo-400 font-semibold">{s.location}</p>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-3 border border-slate-900 rounded-xl">
                      {s.infraction}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between text-xxs text-slate-500">
                    <div className="space-y-0.5">
                      <div>Reporta: <span className="text-slate-400">{s.reportedBy}</span></div>
                      {s.approvedBy && <div>Aprueba: <span className="text-slate-400">{s.approvedBy}</span></div>}
                    </div>

                    {s.cost && (
                      <span className="text-xs font-bold text-red-400 bg-red-500/5 border border-red-500/20 px-2 py-1 rounded-lg">
                        Multa: ${s.cost.toLocaleString()} COP
                      </span>
                    )}

                    {s.status === 'Pendiente Aprobación' && isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(s.id)}
                          className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          Rechazar
                        </button>
                        <button
                          onClick={async () => {
                            const val = await showPrompt('Monto de la Multa', 'Ingresa el monto de la multa en COP si aplica (0 si es solo amonestación escrita):', '110000');
                            if (val !== null) {
                              handleApprove(s.id, parseInt(val) || 0);
                            }
                          }}
                          className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Aprobar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay registros de novedades o amonestaciones de convivencia.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Sanciones;
