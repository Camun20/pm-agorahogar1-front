import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarDays, Plus, CheckCircle2, XCircle, Clock,
  MapPin, AlertCircle, Calendar, Check, Inbox
} from 'lucide-react';

interface BookableSpace {
  id: string;
  name: string; // ej. Salón Social, BBQ, Cancha de Tenis
  description: string;
  cost: number;
}

interface Reservation {
  id: string;
  spaceId: string;
  spaceName: string;
  date: string;
  timeSlot: string; // ej. 14:00 - 18:00
  residentName: string;
  location: string;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada';
  createdAt: string;
}

export const Reservas: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';
  const isSecurity = user?.role === 'SuperAdmin' || user?.role === 'Security';

  // States
  const [spaces, setSpaces] = useState<BookableSpace[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'request' | 'manage'>('calendar');
  
  // New Space Form State (Admin)
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [spaceDesc, setSpaceDesc] = useState('');
  const [spaceCost, setSpaceCost] = useState(0);

  // New Reservation Request State (Resident)
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [reserveDate, setReserveDate] = useState('');
  const [reserveTimeSlot, setReserveTimeSlot] = useState('14:00 - 18:00');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Seed spaces
    const savedSpaces = localStorage.getItem('lobbyapp_reserve_spaces');
    const initialSpaces: BookableSpace[] = [
      { id: 'sp_1', name: 'Salón Social Principal', description: 'Capacidad para 80 personas, incluye cocina y baños.', cost: 80000 },
      { id: 'sp_2', name: 'Zona BBQ - Parrilla A', description: 'Capacidad para 15 personas, incluye parrilla y carbón.', cost: 30000 },
      { id: 'sp_3', name: 'Cancha de Squash 1', description: 'Uso por turnos de 1 hora max. Obligatorio calzado adecuado.', cost: 0 }
    ];

    if (savedSpaces) {
      setSpaces(JSON.parse(savedSpaces));
    } else {
      localStorage.setItem('lobbyapp_reserve_spaces', JSON.stringify(initialSpaces));
      setSpaces(initialSpaces);
    }

    // Seed reservations
    const savedRes = localStorage.getItem('lobbyapp_reservations');
    const initialReservations: Reservation[] = [
      {
        id: 'res_1',
        spaceId: 'sp_1',
        spaceName: 'Salón Social Principal',
        date: '2026-07-18',
        timeSlot: '14:00 - 22:00',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        status: 'Aprobada',
        createdAt: '2026-07-12'
      },
      {
        id: 'res_2',
        spaceId: 'sp_2',
        spaceName: 'Zona BBQ - Parrilla A',
        date: '2026-07-19',
        timeSlot: '11:00 - 15:00',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        status: 'Pendiente',
        createdAt: '2026-07-14'
      }
    ];

    if (savedRes) {
      setReservations(JSON.parse(savedRes));
    } else {
      localStorage.setItem('lobbyapp_reservations', JSON.stringify(initialReservations));
      setReservations(initialReservations);
    }
  }, []);

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName.trim() || !spaceDesc.trim()) return;

    const newSpace: BookableSpace = {
      id: `sp_${Date.now()}`,
      name: spaceName.trim(),
      description: spaceDesc.trim(),
      cost: spaceCost
    };

    const updated = [...spaces, newSpace];
    setSpaces(updated);
    localStorage.setItem('lobbyapp_reserve_spaces', JSON.stringify(updated));

    setSpaceName('');
    setSpaceDesc('');
    setSpaceCost(0);
    setShowSpaceForm(false);
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!selectedSpaceId || !reserveDate || !reserveTimeSlot) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    // Collision Check: check if there's an Approved reservation for the same space, date, and slot
    const hasCollision = reservations.some(
      r => r.spaceId === selectedSpaceId && 
           r.date === reserveDate && 
           r.timeSlot === reserveTimeSlot && 
           r.status === 'Aprobada'
    );

    if (hasCollision) {
      setFormError('Ya existe una reserva aprobada para este espacio, fecha y horario. Por favor selecciona otro.');
      return;
    }

    const spaceObj = spaces.find(s => s.id === selectedSpaceId);

    const newRes: Reservation = {
      id: `res_${Date.now()}`,
      spaceId: selectedSpaceId,
      spaceName: spaceObj?.name || 'Espacio común',
      date: reserveDate,
      timeSlot: reserveTimeSlot,
      residentName: user?.name || 'Residente',
      location: user?.location || 'Apto',
      status: 'Pendiente',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newRes, ...reservations];
    setReservations(updated);
    localStorage.setItem('lobbyapp_reservations', JSON.stringify(updated));

    setFormSuccess('Solicitud de reserva enviada con éxito. Pendiente de aprobación por administración.');
    setSelectedSpaceId('');
    setReserveDate('');
    setTimeout(() => {
      setActiveTab('calendar');
      setFormSuccess(null);
    }, 1200);
  };

  const handleApprove = (resId: string) => {
    // Check if approving this causes collision
    const target = reservations.find(r => r.id === resId);
    if (!target) return;

    const hasCollision = reservations.some(
      r => r.id !== resId && 
           r.spaceId === target.spaceId && 
           r.date === target.date && 
           r.timeSlot === target.timeSlot && 
           r.status === 'Aprobada'
    );

    if (hasCollision) {
      alert('Error: No puedes aprobar esta reserva porque ya hay otra aprobada en el mismo horario. Debes rechazarla o sugerir cambio.');
      return;
    }

    const updated = reservations.map(r => {
      if (r.id === resId) {
        return { ...r, status: 'Aprobada' as const };
      }
      return r;
    });
    setReservations(updated);
    localStorage.setItem('lobbyapp_reservations', JSON.stringify(updated));
  };

  const handleReject = (resId: string) => {
    const updated = reservations.map(r => {
      if (r.id === resId) {
        return { ...r, status: 'Rechazada' as const };
      }
      return r;
    });
    setReservations(updated);
    localStorage.setItem('lobbyapp_reservations', JSON.stringify(updated));
  };

  // Filter lists depending on tab and role
  const displayReservations = reservations.filter(r => {
    // Security or Admin can view all reservations, Residents view only theirs
    if (!isAdmin && !isSecurity && r.location !== user?.location) {
      return false;
    }

    if (activeTab === 'calendar') {
      return r.status === 'Aprobada'; // Only approved ones are on calendar
    }
    if (activeTab === 'manage') {
      return isAdmin && r.status === 'Pendiente';
    }
    
    return true; // Default show all for requests history
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              Servicios Comunes
            </span>
            <h1 className="text-2xl font-extrabold text-white">Reservas de Áreas Comunes</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isAdmin 
                ? 'Administra áreas disponibles, aprueba solicitudes de eventos y evita traslapes de horarios.'
                : isSecurity 
                ? 'Monitorea la agenda de eventos y reservas autorizadas para control de portería.'
                : 'Solicita el uso de salones comunes, asados o canchas de forma rápida y autónoma.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                activeTab === 'calendar' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Agenda Aprobada
            </button>
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('request')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  activeTab === 'request' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Solicitar Reserva / Mis Reservas
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer relative ${
                  activeTab === 'manage' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-amber-400'
                }`}
              >
                Moderar Solicitudes
                {reservations.some(r => r.status === 'Pendiente') && (
                  <span className="absolute top-[-3px] right-[-3px] w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Column: Spaces list / Admin Add Space */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Espacios Comunes</h3>
              {isAdmin && (
                <button
                  onClick={() => setShowSpaceForm(!showSpaceForm)}
                  className="text-xxs bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md transition"
                >
                  {showSpaceForm ? 'Ver Lista' : '+ Crear'}
                </button>
              )}
            </div>

            {showSpaceForm && isAdmin ? (
              /* Create Space Form */
              <form onSubmit={handleCreateSpace} className="space-y-3.5 pt-2 border-t border-slate-850">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Nombre del Espacio *</label>
                  <input
                    type="text"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    placeholder="ej. Cancha de Tenis B"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none text-xs text-slate-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Descripción corta *</label>
                  <input
                    type="text"
                    value={spaceDesc}
                    onChange={(e) => setSpaceDesc(e.target.value)}
                    placeholder="ej. Reserva max 2 horas..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none text-xs text-slate-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Costo Reserva ($ COP)</label>
                  <input
                    type="number"
                    value={spaceCost || ''}
                    onChange={(e) => setSpaceCost(parseInt(e.target.value) || 0)}
                    placeholder="0 si es gratuito"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none text-xs text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xxs rounded-lg shadow transition cursor-pointer"
                >
                  Guardar Espacio
                </button>
              </form>
            ) : (
              /* Spaces List */
              <div className="space-y-3">
                {spaces.map(s => (
                  <div key={s.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                      <span>{s.name}</span>
                      <span className="text-indigo-400 font-mono text-[10px]">
                        {s.cost > 0 ? `$${s.cost.toLocaleString()}` : 'Gratuito'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Column: Active Tab Content */}
        <div className="lg:col-span-2 space-y-4 animate-fade-in">
          {activeTab === 'request' && !isAdmin ? (
            /* Request reservation form (Residents only) */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-indigo-400" />
                Nueva Solicitud de Reserva
              </h3>

              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Selecciona el Espacio Común *</label>
                  <select
                    value={selectedSpaceId}
                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100 cursor-pointer"
                    required
                  >
                    <option value="">-- Elige un espacio --</option>
                    {spaces.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.cost > 0 ? `$${s.cost.toLocaleString()}` : 'Gratuito'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 uppercase font-semibold">Fecha Requerida *</label>
                    <input
                      type="date"
                      value={reserveDate}
                      onChange={(e) => setReserveDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100 cursor-pointer"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 uppercase font-semibold">Horario Requerido *</label>
                    <select
                      value={reserveTimeSlot}
                      onChange={(e) => setReserveTimeSlot(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100 cursor-pointer"
                      required
                    >
                      <option value="08:00 - 10:00">08:00 AM - 10:00 AM</option>
                      <option value="10:00 - 12:00">10:00 AM - 12:00 PM</option>
                      <option value="12:00 - 14:00">12:00 PM - 02:00 PM</option>
                      <option value="14:00 - 18:00">02:00 PM - 06:00 PM</option>
                      <option value="18:00 - 22:00">06:00 PM - 10:00 PM</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Enviar Solicitud
                </button>
              </form>
            </div>
          ) : (
            /* Reservations display List/Calendar */
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {activeTab === 'calendar' ? 'Calendario de Eventos Confirmados' :
                 activeTab === 'manage' ? 'Bandeja de Aprobaciones Pendientes' :
                 'Mi Historial de Solicitudes'}
              </h4>

              <div className="space-y-3">
                {displayReservations.length > 0 ? (
                  displayReservations.map(res => (
                    <div 
                      key={res.id} 
                      className="p-4 bg-slate-900/60 border border-slate-800/85 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {res.spaceName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            res.status === 'Aprobada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            res.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {res.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {res.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            Por: {res.residentName} ({res.location})
                          </span>
                        </div>
                      </div>

                      {activeTab === 'manage' && isAdmin && (
                        <div className="inline-flex gap-2 shrink-0 justify-end md:justify-start">
                          <button
                            onClick={() => handleReject(res.id)}
                            className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleApprove(res.id)}
                            className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Aprobar
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No se registran reservas en esta categoría.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Reservas;
