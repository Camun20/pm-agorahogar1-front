import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFormattedNetworkTime, getFormattedNetworkDateOnly, ensureTimeSynced } from '../../utils/time';
import { addNotification } from '../../utils/notifications';
import { 
  Users, UserPlus, Calendar, Search, CheckCircle2,
  Clock, LogOut, ArrowRightLeft, Info, AlertCircle
} from 'lucide-react';

interface Visit {
  id: string;
  visitorName: string;
  documentId: string;
  plate?: string;
  residentName: string;
  location: string; // House/Apto unit
  status: 'Pre-autorizado' | 'En Sitio' | 'Completado';
  arrivalTime?: string;
  departureTime?: string;
  scheduledDate: string;
}

export const Visitantes: React.FC = () => {
  const { user, users } = useAuth();
  const isSecurity = user?.role === 'SuperAdmin' || user?.role === 'Security';
  
  // States
  const [visits, setVisits] = useState<Visit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');
  
  // Register Form State
  const [visitorName, setVisitorName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [plate, setPlate] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [parkingSlot, setParkingSlot] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Security Form addition: resident name and unit
  const [residentNameInput, setResidentNameInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_visits');
    const initialVisits: Visit[] = [
      {
        id: 'v1',
        visitorName: 'Juan Carlos Pérez',
        documentId: '10293847',
        plate: 'XYZ-890',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        status: 'Pre-autorizado',
        scheduledDate: '2026-07-15'
      },
      {
        id: 'v2',
        visitorName: 'Martha Lucía Gómez',
        documentId: '43920192',
        residentName: 'Ana María Gómez',
        location: 'Portería Principal - Admin Office',
        status: 'En Sitio',
        arrivalTime: '2026-07-14 08:30 AM',
        scheduledDate: '2026-07-14'
      },
      {
        id: 'v3',
        visitorName: 'Carlos Mario Restrepo',
        documentId: '80921023',
        plate: 'MJK-543',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        status: 'Completado',
        arrivalTime: '2026-07-13 14:15 PM',
        departureTime: '2026-07-13 16:30 PM',
        scheduledDate: '2026-07-13'
      }
    ];

    if (saved) {
      try {
        setVisits(JSON.parse(saved));
      } catch {
        setVisits(initialVisits);
      }
    } else {
      localStorage.setItem('lobbyapp_visits', JSON.stringify(initialVisits));
      setVisits(initialVisits);
    }
  }, []);

  // Filtered list depending on role
  const filteredVisits = visits.filter(visit => {
    // If Resident, only show their own visits
    if (!isSecurity && visit.location !== user?.location) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      visit.visitorName.toLowerCase().includes(term) ||
      visit.documentId.includes(term) ||
      visit.location.toLowerCase().includes(term) ||
      visit.residentName.toLowerCase().includes(term);

    return matchesSearch;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    await ensureTimeSynced();

    if (!visitorName.trim() || !documentId.trim() || (isSecurity && !locationInput)) {
      setFormError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    // Require vehicle description and parking slot if plate is entered
    if (plate.trim() !== '') {
      if (!vehicleDescription.trim()) {
        setFormError('Por favor ingresa la descripción del vehículo (ej: Kia Rojo).');
        return;
      }
      if (!parkingSlot.trim()) {
        setFormError('Por favor ingresa el espacio de parqueo (ej: V-04).');
        return;
      }
    }

    const newVisit: Visit = {
      id: `visit_${Date.now()}`,
      visitorName: visitorName.trim(),
      documentId: documentId.trim(),
      plate: plate.trim() || undefined,
      scheduledDate: isSecurity ? getFormattedNetworkDateOnly() : scheduledDate,
      residentName: isSecurity ? residentNameInput.trim() || 'No especificado' : user?.name || '',
      location: isSecurity ? locationInput.trim() || 'No especificado' : user?.location || '',
      status: isSecurity ? 'En Sitio' : 'Pre-autorizado',
      ...(isSecurity && { arrivalTime: getFormattedNetworkTime() })
    };

    const updated = [newVisit, ...visits];
    setVisits(updated);
    localStorage.setItem('lobbyapp_visits', JSON.stringify(updated));

    // Sync with visitor parking if security logs a vehicle
    if (plate.trim() !== '' && isSecurity) {
      try {
        const savedVis = localStorage.getItem('lobbyapp_park_visitor');
        const visitorCars = savedVis ? JSON.parse(savedVis) : [];

        const newVehicle = {
          id: `vv_${Date.now()}`,
          slotId: parkingSlot.trim().toUpperCase(),
          plate: plate.trim().toUpperCase(),
          brandModel: vehicleDescription.trim(),
          visitorName: visitorName.trim(),
          locationVisited: locationInput.trim(),
          residentVisited: residentNameInput.trim() || 'No especificado',
          arrivalTime: getFormattedNetworkTime(),
          status: 'Activo'
        };

        const updatedCars = [newVehicle, ...visitorCars];
        localStorage.setItem('lobbyapp_park_visitor', JSON.stringify(updatedCars));
      } catch (err) {
        console.warn('Error syncing parking space', err);
      }
    }

    // Reset fields
    setVisitorName('');
    setDocumentId('');
    setPlate('');
    setVehicleDescription('');
    setParkingSlot('');
    setScheduledDate('');
    setResidentNameInput('');
    setLocationInput('');
    setActiveTab('list');
  };

  // Check-in (Security)
  const handleCheckIn = async (visitId: string) => {
    await ensureTimeSynced();
    const updated = visits.map(v => {
      if (v.id === visitId) {
        // Dispatch Resident Notification
        addNotification(
          'Visitante en Sitio 🚪',
          `${v.visitorName} ha ingresado al conjunto residencial.`,
          { location: v.location }
        );
        return {
          ...v,
          status: 'En Sitio' as const,
          arrivalTime: getFormattedNetworkTime()
        };
      }
      return v;
    });
    setVisits(updated);
    localStorage.setItem('lobbyapp_visits', JSON.stringify(updated));
  };

  // Check-out (Security)
  const handleCheckOut = async (visitId: string) => {
    await ensureTimeSynced();
    let visitPlate: string | undefined = undefined;
    const updated = visits.map(v => {
      if (v.id === visitId) {
        visitPlate = v.plate;
        return {
          ...v,
          status: 'Completado' as const,
          departureTime: getFormattedNetworkTime()
        };
      }
      return v;
    });
    setVisits(updated);
    localStorage.setItem('lobbyapp_visits', JSON.stringify(updated));

    // Auto check-out vehicle in parking if plate exists
    if (visitPlate) {
      try {
        const savedVis = localStorage.getItem('lobbyapp_park_visitor');
        if (savedVis) {
          const visitorCars = JSON.parse(savedVis) as any[];
          const updatedCars = visitorCars.map(c => {
            if (c.plate.toUpperCase() === visitPlate!.toUpperCase() && c.status === 'Activo') {
              return {
                ...c,
                status: 'Salida',
                departureTime: getFormattedNetworkTime()
              };
            }
            return c;
          });
          localStorage.setItem('lobbyapp_park_visitor', JSON.stringify(updatedCars));
        }
      } catch (e) {
        console.warn('Could not auto-checkout vehicle', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Users className="w-3.5 h-3.5" />
              Portería & Control
            </span>
            <h1 className="text-2xl font-extrabold text-white">Registro de Visitantes</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isSecurity 
                ? 'Monitorea el acceso de invitados, consulta el historial general y registra nuevos ingresos.'
                : 'Consulta el historial de las visitas registradas a tu vivienda.'}
            </p>
          </div>
          {isSecurity && (
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
                onClick={() => setActiveTab('register')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-slate-800/50'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Registrar Entrada
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'register' && isSecurity ? (
        /* Register form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">
            Registrar Entrada Directa
          </h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Nombre Completo del Visitante *</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="ej. Carlos Alberto Rincón"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Cédula / ID Documento *</label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="ej. 10452390"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Placa del Vehículo (Opcional)</label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="ej. GHM-543"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                />
              </div>
            </div>

            {/* Conditionally show Vehicle description and space if plate is entered */}
            {plate.trim() !== '' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Descripción del Vehículo *</label>
                  <input
                    type="text"
                    value={vehicleDescription}
                    onChange={(e) => setVehicleDescription(e.target.value)}
                    placeholder="ej. Kia Rojo"
                    className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Espacio de Parqueo *</label>
                  <input
                    type="text"
                    value={parkingSlot}
                    onChange={(e) => setParkingSlot(e.target.value)}
                    placeholder="ej. V-04"
                    className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {isSecurity && (
              /* Security extra inputs: Resident unit and name */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1.5 border-t border-slate-800/80">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Ubicación / Apto *</label>
                  <select
                    value={locationInput}
                    onChange={(e) => {
                      const selectedLoc = e.target.value;
                      setLocationInput(selectedLoc);
                      const matchingRes = users.find(u => u.role === 'Resident' && u.location === selectedLoc);
                      setResidentNameInput(matchingRes ? matchingRes.name : '');
                    }}
                    className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                    required={isSecurity}
                  >
                    <option value="">-- Selecciona Apartamento --</option>
                    {users.filter(u => u.role === 'Resident' && u.location).map(r => (
                      <option key={r.username} value={r.location}>{r.location}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold block">Residente Visitado</label>
                  <input
                    type="text"
                    value={residentNameInput}
                    readOnly
                    placeholder="Auto-completado al elegir apto"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl outline-none text-sm cursor-not-allowed"
                  />
                </div>
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
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                Registrar Entrada
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
                placeholder={isSecurity ? "Buscar por visitante, cédula o apartamento..." : "Buscar en mi historial..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-800/50 rounded-xl bg-slate-955/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Visitante</th>
                  <th className="px-5 py-3.5">Cédula</th>
                  <th className="px-5 py-3.5">Placa</th>
                  {isSecurity && <th className="px-5 py-3.5">Residente / Apto</th>}
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Horarios (Llegada/Salida)</th>
                  {isSecurity && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {filteredVisits.length > 0 ? (
                  filteredVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-200">{visit.visitorName}</td>
                      <td className="px-5 py-4 font-mono text-xs text-indigo-400">{visit.documentId}</td>
                      <td className="px-5 py-4 text-slate-300 font-mono text-xs">{visit.plate || '—'}</td>
                      {isSecurity && (
                        <td className="px-5 py-4">
                          <div className="text-slate-350">{visit.residentName}</div>
                          <div className="text-xxs text-slate-500">{visit.location}</div>
                        </td>
                      )}
                      <td className="px-5 py-4">
                        {visit.status === 'Pre-autorizado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-xxs font-semibold bg-indigo-500/10 text-indigo-455 border border-indigo-500/20">
                            Pre-autorizado
                          </span>
                        )}
                        {visit.status === 'En Sitio' && (
                          <span className="px-2.5 py-0.5 rounded-full text-xxs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            En Sitio
                          </span>
                        )}
                        {visit.status === 'Completado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-xxs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Completado
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {visit.arrivalTime ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ingreso: {visit.arrivalTime}</span>
                          </div>
                        ) : (
                          <span className="text-slate-650 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            <span>Prog: {visit.scheduledDate}</span>
                          </span>
                        )}
                        {visit.departureTime && (
                          <div className="flex items-center gap-1 mt-1">
                            <LogOut className="w-3.5 h-3.5 text-slate-500" />
                            <span>Salida: {visit.departureTime}</span>
                          </div>
                        )}
                      </td>
                      {isSecurity && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {visit.status === 'Pre-autorizado' && (
                              <button
                                onClick={() => handleCheckIn(visit.id)}
                                className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xxs rounded-lg transition cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Registrar Ingreso
                              </button>
                            )}
                            {visit.status === 'En Sitio' && (
                              <button
                                onClick={() => handleCheckOut(visit.id)}
                                className="inline-flex items-center gap-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xxs rounded-lg transition cursor-pointer"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                Registrar Salida
                              </button>
                            )}
                            {visit.status === 'Completado' && (
                              <span className="text-xxs text-slate-600 italic">Historial</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isSecurity ? 7 : 5} className="px-5 py-12 text-center text-slate-500">
                      <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      No hay registros de visitas en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Visitantes;
