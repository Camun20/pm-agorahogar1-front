import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Truck, Search, Plus, CheckCircle, PackageOpen, Inbox,
  Calendar, AlertCircle
} from 'lucide-react';

interface Delivery {
  id: string;
  company: string; // ej. Amazon, Rappi, Servientrega
  recipient: string; // Residente
  location: string; // Apto
  registeredAt: string;
  deliveredAt?: string;
  status: 'En Portería' | 'Entregado';
  securityName: string;
}

export const Domicilios: React.FC = () => {
  const { user, users } = useAuth();
  const isSecurity = user?.role === 'SuperAdmin' || user?.role === 'Security';
  
  // States
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');
  
  // Form State
  const [company, setCompany] = useState('');
  const [recipient, setRecipient] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_deliveries');
    const initialDeliveries: Delivery[] = [
      {
        id: 'd1',
        company: 'Amazon',
        recipient: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        registeredAt: '2026-07-14 09:10 AM',
        status: 'En Portería',
        securityName: 'Guarda Torres'
      },
      {
        id: 'd2',
        company: 'Rappi (Comida)',
        recipient: 'Ana María Gómez',
        location: 'Portería Principal - Admin Office',
        registeredAt: '2026-07-14 08:05 AM',
        deliveredAt: '2026-07-14 08:15 AM',
        status: 'Entregado',
        securityName: 'Guarda Torres'
      },
      {
        id: 'd3',
        company: 'Mercado Libre',
        recipient: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        registeredAt: '2026-07-13 11:30 AM',
        deliveredAt: '2026-07-13 13:40 PM',
        status: 'Entregado',
        securityName: 'Guarda Auxiliar'
      }
    ];

    if (saved) {
      try {
        setDeliveries(JSON.parse(saved));
      } catch {
        setDeliveries(initialDeliveries);
      }
    } else {
      localStorage.setItem('lobbyapp_deliveries', JSON.stringify(initialDeliveries));
      setDeliveries(initialDeliveries);
    }
  }, []);

  // Filtered deliveries list depending on role
  const filteredDeliveries = deliveries.filter(d => {
    // If Resident, only show their own deliveries
    if (!isSecurity && d.location !== user?.location) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      d.company.toLowerCase().includes(term) ||
      d.recipient.toLowerCase().includes(term) ||
      d.location.toLowerCase().includes(term) ||
      d.status.toLowerCase().includes(term);

    return matchesSearch;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!company.trim() || !recipient.trim() || !locationInput.trim()) {
      setFormError('Por favor completa todos los campos obligatorio (*).');
      return;
    }

    const newDelivery: Delivery = {
      id: `del_${Date.now()}`,
      company: company.trim(),
      recipient: recipient.trim(),
      location: locationInput.trim(),
      registeredAt: new Date().toLocaleString(),
      status: 'En Portería',
      securityName: user?.name || 'Seguridad'
    };

    const updated = [newDelivery, ...deliveries];
    setDeliveries(updated);
    localStorage.setItem('lobbyapp_deliveries', JSON.stringify(updated));

    // Reset fields
    setCompany('');
    setRecipient('');
    setLocationInput('');
    setActiveTab('list');
  };

  const handleMarkAsDelivered = (deliveryId: string) => {
    const updated = deliveries.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: 'Entregado' as const,
          deliveredAt: new Date().toLocaleString()
        };
      }
      return d;
    });
    setDeliveries(updated);
    localStorage.setItem('lobbyapp_deliveries', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Truck className="w-3.5 h-3.5" />
              Paquetería & Encomiendas
            </span>
            <h1 className="text-2xl font-extrabold text-white">Control de Domicilios</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isSecurity 
                ? 'Registra los paquetes recibidos en portería y marca su entrega al residente.'
                : 'Consulta los paquetes que han llegado a portería para tu apartamento.'}
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
                <Plus className="w-4 h-4" />
                Registrar Paquete
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'register' && isSecurity ? (
        /* Register form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Registrar Paquete Entrante</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Empresa / Origen *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ej. Servientrega, Rappi, Amazon, MercadoLibre"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Ubicación / Apto *</label>
                <select
                  value={locationInput}
                  onChange={(e) => {
                    const selectedLoc = e.target.value;
                    setLocationInput(selectedLoc);
                    const matchingRes = users.find(u => u.role === 'Resident' && u.location === selectedLoc);
                    setRecipient(matchingRes ? matchingRes.name : '');
                  }}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                >
                  <option value="">-- Selecciona Apartamento --</option>
                  {users.filter(u => u.role === 'Resident' && u.location).map(r => (
                    <option key={r.username} value={r.location}>{r.location}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Destinatario / Residente</label>
                <input
                  type="text"
                  value={recipient}
                  readOnly
                  placeholder="Auto-completado al elegir apto"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl outline-none text-sm cursor-not-allowed"
                />
              </div>
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
                Registrar Ingreso
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
                placeholder={isSecurity ? "Buscar por remitente, residente o apartamento..." : "Buscar mis entregas..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Grid list of packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((d) => (
                <div 
                  key={d.id} 
                  className={`p-5 bg-slate-950/60 border rounded-2xl space-y-4 transition ${
                    d.status === 'En Portería' ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${
                        d.status === 'En Portería' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{d.company}</h4>
                        <p className="text-xxs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          Llegó: {d.registeredAt}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xxs font-bold border ${
                      d.status === 'En Portería' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse' 
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destinatario:</span>
                      <span className="text-slate-300 font-medium">{d.recipient}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Unidad:</span>
                      <span className="text-indigo-400 font-semibold">{d.location}</span>
                    </div>
                    {d.deliveredAt && (
                      <div className="flex justify-between pt-1.5 border-t border-slate-900 text-xxs">
                        <span className="text-slate-500">Entregado:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {d.deliveredAt}
                        </span>
                      </div>
                    )}
                  </div>

                  {isSecurity && d.status === 'En Portería' && (
                    <button
                      onClick={() => handleMarkAsDelivered(d.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      <PackageOpen className="w-4 h-4" />
                      Marcar como Entregado
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No se registraron encomiendas en esta categoría.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Domicilios;
