import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  HelpCircle, Search, Plus, MessageSquare, CheckCircle, Clock,
  ArrowUpRight, AlertCircle, Info, Inbox
} from 'lucide-react';

interface PqrsMessage {
  id: string;
  type: 'Petición' | 'Queja' | 'Reclamo' | 'Sugerencia';
  subject: string;
  description: string;
  residentName: string;
  location: string;
  status: 'Abierto' | 'Respondido';
  registeredAt: string;
  response?: string;
  respondedAt?: string;
}

export const PQRS: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';

  // States
  const [pqrsList, setPqrsList] = useState<PqrsMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedPqrs, setSelectedPqrs] = useState<PqrsMessage | null>(null);

  // Form State
  const [type, setType] = useState<'Petición' | 'Queja' | 'Reclamo' | 'Sugerencia'>('Petición');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Response Form State
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_pqrs');
    const initialPqrs: PqrsMessage[] = [
      {
        id: 'pqrs_1',
        type: 'Queja',
        subject: 'Filtración de agua en parqueadero húmedo',
        description: 'Se presenta una gotera constante proveniente del techo del sótano 2, justo encima del puesto 204.',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        status: 'Abierto',
        registeredAt: '2026-07-14 09:10 AM'
      },
      {
        id: 'pqrs_2',
        type: 'Petición',
        subject: 'Duplicado de chip de acceso peatonal',
        description: 'Solicito autorización para adquirir un chip de ingreso adicional para mi madre.',
        residentName: 'Ana María Gómez',
        location: 'Portería Principal - Admin Office',
        status: 'Respondido',
        registeredAt: '2026-07-10 14:15 PM',
        response: 'Solicitud aprobada. Favor pasar por la oficina de administración a reclamar el chip y cancelar el valor del duplicado.',
        respondedAt: '2026-07-11 10:30 AM'
      }
    ];

    if (saved) {
      try {
        setPqrsList(JSON.parse(saved));
      } catch {
        setPqrsList(initialPqrs);
      }
    } else {
      localStorage.setItem('lobbyapp_pqrs', JSON.stringify(initialPqrs));
      setPqrsList(initialPqrs);
    }
  }, []);

  const filteredPqrs = pqrsList.filter(p => {
    // If Resident, only show their own PQRS
    if (!isAdmin && p.location !== user?.location) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    return p.subject.toLowerCase().includes(term) || p.type.toLowerCase().includes(term);
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subject.trim() || !description.trim()) {
      setFormError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    const newPqrs: PqrsMessage = {
      id: `pqrs_${Date.now()}`,
      type,
      subject: subject.trim(),
      description: description.trim(),
      residentName: user?.name || 'Residente',
      location: user?.location || 'No especificado',
      status: 'Abierto',
      registeredAt: new Date().toLocaleString()
    };

    const updated = [newPqrs, ...pqrsList];
    setPqrsList(updated);
    localStorage.setItem('lobbyapp_pqrs', JSON.stringify(updated));

    // Reset fields
    setSubject('');
    setDescription('');
    setType('Petición');
    setActiveTab('list');
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPqrs || !responseText.trim()) return;

    const updated = pqrsList.map(p => {
      if (p.id === selectedPqrs.id) {
        return {
          ...p,
          status: 'Respondido' as const,
          response: responseText.trim(),
          respondedAt: new Date().toLocaleString()
        };
      }
      return p;
    });

    setPqrsList(updated);
    localStorage.setItem('lobbyapp_pqrs', JSON.stringify(updated));
    
    // Update local selected view
    const current = updated.find(p => p.id === selectedPqrs.id);
    if (current) setSelectedPqrs(current);

    setResponseText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              Soporte & Atención
            </span>
            <h1 className="text-2xl font-extrabold text-white">PQRS y Peticiones</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isAdmin 
                ? 'Monitorea las solicitudes de copropietarios, quejas y reclamos, y dales respuesta oportuna.'
                : 'Radica peticiones, quejas, reclamos o sugerencias y haz seguimiento en tiempo real.'}
            </p>
          </div>
          {!isAdmin && (
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
                onClick={() => setActiveTab('create')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-slate-800/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                Radicar PQRS
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'create' && !isAdmin ? (
        /* Create PQRS Form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Radicar Nueva Solicitud (PQRS)</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Tipo de Solicitud</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
              >
                <option value="Petición">Petición</option>
                <option value="Queja">Queja</option>
                <option value="Reclamo">Reclamo</option>
                <option value="Sugerencia">Sugerencia</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Asunto Principal *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="ej. Fallas de alumbrado en escaleras de emergencia"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Detalles de la Solicitud *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe con claridad y de forma detallada los hechos..."
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 resize-none"
                required
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
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                Radicar Solicitud
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Historial de Solicitudes</h2>
            
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por asunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-95 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>

            {/* List items */}
            <div className="space-y-3">
              {filteredPqrs.length > 0 ? (
                filteredPqrs.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPqrs(p)}
                    className={`p-4 bg-slate-900/60 border rounded-2xl cursor-pointer hover:border-indigo-500/50 transition flex items-center justify-between gap-4 ${
                      selectedPqrs?.id === p.id ? 'border-indigo-500 bg-slate-900' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border bg-slate-950 text-slate-400`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xxs font-bold text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {p.type}
                          </span>
                          <h4 className="font-bold text-slate-200 text-sm line-clamp-1">{p.subject}</h4>
                        </div>
                        <p className="text-xxs text-slate-500 mt-1">{p.location} — {p.registeredAt}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-bold border ${
                        p.status === 'Abierto' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  No hay solicitudes radicadas en esta sección.
                </div>
              )}
            </div>
          </div>

          {/* Details view */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Detalles de Solicitud</h2>
            
            {selectedPqrs ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xxs">
                    <span className="text-indigo-400 font-bold uppercase">{selectedPqrs.type}</span>
                    <span className="text-slate-500 font-mono">{selectedPqrs.id}</span>
                  </div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{selectedPqrs.subject}</h3>
                  <div className="text-xxs text-slate-500">
                    Radicado por: <span className="text-slate-300">{selectedPqrs.residentName}</span> ({selectedPqrs.location})
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl text-xs text-slate-300 leading-relaxed">
                  {selectedPqrs.description}
                </div>

                {selectedPqrs.status === 'Respondido' ? (
                  <div className="space-y-2.5 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Respuesta de Administración</span>
                    </div>
                    <div className="p-3 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl text-xs text-slate-300 leading-relaxed">
                      {selectedPqrs.response}
                    </div>
                    <span className="text-[10px] text-slate-500 block">Respondido el: {selectedPqrs.respondedAt}</span>
                  </div>
                ) : isAdmin ? (
                  /* Admin Answer form */
                  <form onSubmit={handleSendResponse} className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 uppercase font-semibold">Redactar Respuesta *</label>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Escribe la respuesta oficial de administración..."
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none text-xs text-slate-100 resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Enviar Respuesta Oficial
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5 p-3 bg-amber-500/5 border border-amber-500/10 text-xxs text-slate-400 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Esta solicitud está pendiente de revisión por parte de la administración de tu conjunto.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/20 border border-slate-850 rounded-2xl text-slate-600 text-xs">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                Selecciona una solicitud del listado para ver su historial completo o redactar una respuesta oficial.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PQRS;
