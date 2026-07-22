import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lightbulb, Droplet, Flame, Search, Plus, Bell,
  AlertCircle, Inbox
} from 'lucide-react';
import { getFormattedNetworkTime } from '../../utils/time';
import { addNotification } from '../../utils/notifications';

interface UtilityReceipt {
  id: string;
  utilityType: 'Luz' | 'Agua' | 'Gas';
  location: string; // Apto
  residentName: string;
  arrivedAt: string;
  deliveredToResident: boolean;
  securityName: string;
}

export const RecibosPublicos: React.FC = () => {
  const { user, users } = useAuth();
  const isSecurity = user?.role === 'SuperAdmin' || user?.role === 'Security';

  // States
  const [receipts, setReceipts] = useState<UtilityReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');

  // Form State
  const [utilityType, setUtilityType] = useState<'Luz' | 'Agua' | 'Gas'>('Luz');
  const [locationInput, setLocationInput] = useState('');
  const [residentName, setResidentName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_receipts');
    const initialReceipts: UtilityReceipt[] = [
      {
        id: 'rec_1',
        utilityType: 'Luz',
        location: 'Torre 3 - Apto 402',
        residentName: 'Diana Carolina Ruiz',
        arrivedAt: '2026-07-14 07:30 AM',
        deliveredToResident: false,
        securityName: 'Guarda Torres'
      },
      {
        id: 'rec_2',
        utilityType: 'Agua',
        location: 'Torre 3 - Apto 402',
        residentName: 'Diana Carolina Ruiz',
        arrivedAt: '2026-07-13 10:15 AM',
        deliveredToResident: true,
        securityName: 'Guarda Torres'
      },
      {
        id: 'rec_3',
        utilityType: 'Gas',
        location: 'Portería Principal - Admin Office',
        residentName: 'Ana María Gómez',
        arrivedAt: '2026-07-14 08:00 AM',
        deliveredToResident: false,
        securityName: 'Guarda Auxiliar'
      }
    ];

    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch {
        setReceipts(initialReceipts);
      }
    } else {
      localStorage.setItem('lobbyapp_receipts', JSON.stringify(initialReceipts));
      setReceipts(initialReceipts);
    }
  }, []);

  const filteredReceipts = receipts.filter(r => {
    // If Resident, only show their own unit receipts
    if (!isSecurity && r.location !== user?.location) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    return r.location.toLowerCase().includes(term) || r.utilityType.toLowerCase().includes(term) || r.residentName.toLowerCase().includes(term);
  });

  const handleRegisterReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!locationInput.trim() || !residentName.trim()) {
      setFormError('Por favor completa todos los campos del recibo.');
      return;
    }

    const newReceipt: UtilityReceipt = {
      id: `rec_${Date.now()}`,
      utilityType,
      location: locationInput.trim(),
      residentName: residentName.trim(),
      arrivedAt: getFormattedNetworkTime(),
      deliveredToResident: false,
      securityName: user?.name || 'Portería'
    };

    // Dispatch Resident Notification
    addNotification(
      'Factura Física en Portería 💡',
      `Ha llegado una factura física de ${newReceipt.utilityType} para tu unidad.`,
      { location: newReceipt.location }
    );

    const updated = [newReceipt, ...receipts];
    setReceipts(updated);
    localStorage.setItem('lobbyapp_receipts', JSON.stringify(updated));

    // Reset Form
    setLocationInput('');
    setResidentName('');
    setUtilityType('Luz');
    setActiveTab('list');
  };

  const handleMarkAsDelivered = (receiptId: string) => {
    const updated = receipts.map(r => {
      if (r.id === receiptId) {
        // Dispatch Resident Notification
        addNotification(
          'Factura Entregada ✅',
          `Tu recibo físico de ${r.utilityType} ha sido marcado como entregado.`,
          { location: r.location }
        );
        return { ...r, deliveredToResident: true };
      }
      return r;
    });
    setReceipts(updated);
    localStorage.setItem('lobbyapp_receipts', JSON.stringify(updated));
  };

  const getUtilityIcon = (type: 'Luz' | 'Agua' | 'Gas') => {
    switch (type) {
      case 'Luz': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'Agua': return <Droplet className="w-5 h-5 text-sky-400" />;
      case 'Gas': return <Flame className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              Servicios Públicos
            </span>
            <h1 className="text-2xl font-extrabold text-white">Recibos Públicos</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isSecurity 
                ? 'Registra la llegada de facturas físicas de servicios y notifica a los residentes.'
                : 'Consulta si han llegado facturas de servicios públicos a la portería para tu apartamento.'}
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
                Registrar Factura
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'register' && isSecurity ? (
        /* Register form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Registrar Factura en Portería</h2>
          
          <form onSubmit={handleRegisterReceipt} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Tipo de Servicio Público</label>
              <select
                value={utilityType}
                onChange={(e) => setUtilityType(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
              >
                <option value="Luz">Luz / Energía</option>
                <option value="Agua">Agua / Acueducto</option>
                <option value="Gas">Gas Natural</option>
              </select>
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
                <label className="text-xs text-slate-400 uppercase font-semibold block">Nombre del Titular / Residente</label>
                <input
                  type="text"
                  value={residentName}
                  readOnly
                  placeholder="Auto-completado"
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 text-slate-400 rounded-xl outline-none text-sm cursor-not-allowed"
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
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                Notificar Llegada
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
                placeholder={isSecurity ? "Buscar recibos por apartamento o servicio..." : "Buscar mis recibos..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map((r) => (
                <div 
                  key={r.id}
                  className={`p-5 bg-slate-950/60 border rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition ${
                    !r.deliveredToResident ? 'border-indigo-500/25 bg-indigo-500/[0.01]' : 'border-slate-850 bg-slate-950/20'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl">
                          {getUtilityIcon(r.utilityType)}
                        </div>
                        <span className="text-xs font-bold text-slate-200">Factura de {r.utilityType}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        !r.deliveredToResident ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse' : 'bg-slate-900 text-slate-500 border-slate-850'
                      }`}>
                        {!r.deliveredToResident ? 'En Portería' : 'Reclamada'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Titular:</span>
                        <span className="text-slate-300 font-medium">{r.residentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Apartamento:</span>
                        <span className="text-indigo-400 font-semibold">{r.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Llegada:</span>
                        <span className="text-slate-300 flex items-center gap-1 font-mono text-[10px]">{r.arrivedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 truncate max-w-[120px]">Registró: {r.securityName}</span>
                    {isSecurity && !r.deliveredToResident && (
                      <button
                        onClick={() => handleMarkAsDelivered(r.id)}
                        className="inline-flex items-center gap-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Entregar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay facturas de servicios registradas en portería.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default RecibosPublicos;
