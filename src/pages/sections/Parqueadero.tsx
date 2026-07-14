import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, Search, Plus, Clock, ArrowRightLeft,
  ShieldAlert, Inbox, AlertCircle, LogOut
} from 'lucide-react';

interface ResidentVehicle {
  slotId: string; // ej. P-301
  plate: string;
  brandModel: string;
  residentName: string;
  location: string;
}

interface VisitorVehicle {
  id: string;
  slotId: string; // ej. V-02
  plate: string;
  brandModel: string;
  locationVisited: string; // Apto
  residentVisited: string;
  arrivalTime: string;
  departureTime?: string;
  status: 'Activo' | 'Salida';
}

export const Parqueadero: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';
  const isSecurity = user?.role === 'SuperAdmin' || user?.role === 'Security';

  // States
  const [activeTab, setActiveTab] = useState<'resident' | 'visitor'>('resident');
  const [subTab, setSubTab] = useState<'active' | 'history'>('active');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Permanent Parking Database
  const [residentCars, setResidentCars] = useState<ResidentVehicle[]>([]);
  // Visitor Parking Database
  const [visitorCars, setVisitorCars] = useState<VisitorVehicle[]>([]);

  // Forms States
  const [slotId, setSlotId] = useState('');
  const [plate, setPlate] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [resName, setResName] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Seed resident cars
    const savedRes = localStorage.getItem('lobbyapp_park_resident');
    const initialRes: ResidentVehicle[] = [
      {
        slotId: 'P-204',
        plate: 'XYZ-890',
        brandModel: 'Mazda 3 Gris',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402'
      },
      {
        slotId: 'P-101',
        plate: 'FJK-321',
        brandModel: 'Toyota Corolla Blanco',
        residentName: 'Ana María Gómez',
        location: 'Portería Principal - Admin Office'
      }
    ];

    if (savedRes) {
      setResidentCars(JSON.parse(savedRes));
    } else {
      localStorage.setItem('lobbyapp_park_resident', JSON.stringify(initialRes));
      setResidentCars(initialRes);
    }

    // Seed visitor cars
    const savedVis = localStorage.getItem('lobbyapp_park_visitor');
    const initialVis: VisitorVehicle[] = [
      {
        id: 'vv_1',
        slotId: 'V-01',
        plate: 'MJK-543',
        brandModel: 'Chevrolet Spark Azul',
        locationVisited: 'Torre 3 - Apto 402',
        residentVisited: 'Diana Carolina Ruiz',
        arrivalTime: '2026-07-14 09:20 AM',
        status: 'Activo'
      },
      {
        id: 'vv_2',
        slotId: 'V-03',
        plate: 'QWE-765',
        brandModel: 'Kia Picanto Rojo',
        locationVisited: 'Portería Principal - Admin Office',
        residentVisited: 'Ana María Gómez',
        arrivalTime: '2026-07-14 07:15 AM',
        departureTime: '2026-07-14 08:30 AM',
        status: 'Salida'
      }
    ];

    if (savedVis) {
      setVisitorCars(JSON.parse(savedVis));
    } else {
      localStorage.setItem('lobbyapp_park_visitor', JSON.stringify(initialVis));
      setVisitorCars(initialVis);
    }
  }, []);

  const handleRegisterResidentCar = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!slotId.trim() || !plate.trim() || !brandModel.trim() || !resName.trim() || !locationInput.trim()) {
      setFormError('Completa todos los campos obligatorios (*).');
      return;
    }

    const newVehicle: ResidentVehicle = {
      slotId: slotId.trim(),
      plate: plate.trim().toUpperCase(),
      brandModel: brandModel.trim(),
      residentName: resName.trim(),
      location: locationInput.trim()
    };

    const updated = [...residentCars, newVehicle];
    setResidentCars(updated);
    localStorage.setItem('lobbyapp_park_resident', JSON.stringify(updated));

    // Reset Form
    setSlotId('');
    setPlate('');
    setBrandModel('');
    setResName('');
    setLocationInput('');
    setShowAddForm(false);
  };

  const handleRegisterVisitorCar = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!slotId.trim() || !plate.trim() || !brandModel.trim() || !resName.trim() || !locationInput.trim()) {
      setFormError('Completa todos los campos obligatorios (*).');
      return;
    }

    const newVehicle: VisitorVehicle = {
      id: `vv_${Date.now()}`,
      slotId: slotId.trim(),
      plate: plate.trim().toUpperCase(),
      brandModel: brandModel.trim(),
      locationVisited: locationInput.trim(),
      residentVisited: resName.trim(),
      arrivalTime: new Date().toLocaleString(),
      status: 'Activo'
    };

    const updated = [newVehicle, ...visitorCars];
    setVisitorCars(updated);
    localStorage.setItem('lobbyapp_park_visitor', JSON.stringify(updated));

    // Reset Form
    setSlotId('');
    setPlate('');
    setBrandModel('');
    setResName('');
    setLocationInput('');
    setShowAddForm(false);
  };

  // Check-out visitor vehicle
  const handleVisitorCheckOut = (vvId: string) => {
    const updated = visitorCars.map(v => {
      if (v.id === vvId) {
        return {
          ...v,
          status: 'Salida' as const,
          departureTime: new Date().toLocaleString()
        };
      }
      return v;
    });
    setVisitorCars(updated);
    localStorage.setItem('lobbyapp_park_visitor', JSON.stringify(updated));
  };

  // Filter lists based on Search, tab, and role
  const displayResidentCars = residentCars.filter(car => {
    if (!isAdmin && !isSecurity && car.location !== user?.location) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    return car.plate.toLowerCase().includes(term) || car.residentName.toLowerCase().includes(term) || car.location.toLowerCase().includes(term);
  });

  const displayVisitorCars = visitorCars.filter(car => {
    if (!isAdmin && !isSecurity && car.locationVisited !== user?.location) {
      return false;
    }
    
    // Sub-tab validation: active vs historical
    const matchesSubTab = subTab === 'active' ? car.status === 'Activo' : car.status === 'Salida';
    if (!matchesSubTab) return false;

    const term = searchTerm.toLowerCase();
    return car.plate.toLowerCase().includes(term) || car.residentVisited.toLowerCase().includes(term) || car.locationVisited.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Car className="w-3.5 h-3.5" />
              Parqueaderos
            </span>
            <h1 className="text-2xl font-extrabold text-white">Asignación y Visitantes</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isAdmin 
                ? 'Asigna cajones permanentes a residentes y monitorea el flujo de bahías para visitantes.'
                : isSecurity 
                ? 'Monitorea ingresos de automóviles de visitantes, cajones disponibles e historial.'
                : 'Revisa tus vehículos autorizados y el estado de los automóviles visitantes en tu unidad.'}
            </p>
          </div>

          {/* Tab selectors */}
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('resident'); setShowAddForm(false); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                activeTab === 'resident'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Parqueaderos Propios
            </button>
            <button
              onClick={() => { setActiveTab('visitor'); setShowAddForm(false); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                activeTab === 'visitor'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Parqueadero Visitantes
            </button>
          </div>
        </div>
      </div>

      {showAddForm ? (
        /* Add Form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">
            {activeTab === 'resident' ? 'Asignar Parqueadero Propio' : 'Registrar Vehículo Visitante'}
          </h2>
          
          <form onSubmit={activeTab === 'resident' ? handleRegisterResidentCar : handleRegisterVisitorCar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Cajón de Parqueadero *</label>
                <input
                  type="text"
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  placeholder={activeTab === 'resident' ? 'ej. P-204' : 'ej. V-02'}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Placa del Vehículo *</label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="ej. XYZ-890"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Marca, Modelo & Color *</label>
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="ej. Mazda 3 Gris Metálico"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Nombre Residente *</label>
                <input
                  type="text"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  placeholder="ej. Diana Carolina Ruiz"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Ubicación / Apto *</label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="ej. Torre 3 - Apto 402"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
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
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                Registrar Vehículo
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Filtrar por placa o apartamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition"
              />
            </div>

            <div className="flex gap-2">
              {activeTab === 'visitor' && (
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-1 flex">
                  <button
                    onClick={() => setSubTab('active')}
                    className={`px-3 py-1.5 rounded-lg text-xxs font-semibold transition cursor-pointer ${
                      subTab === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Vehículos Activos
                  </button>
                  <button
                    onClick={() => setSubTab('history')}
                    className={`px-3 py-1.5 rounded-lg text-xxs font-semibold transition cursor-pointer ${
                      subTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Historial
                  </button>
                </div>
              )}

              {((activeTab === 'resident' && isAdmin) || (activeTab === 'visitor' && isSecurity)) && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Asignar Vehículo
                </button>
              )}
            </div>
          </div>

          {activeTab === 'resident' ? (
            /* Residents Permanent slots */
            <div className="overflow-x-auto border border-slate-800/50 rounded-xl bg-slate-950/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Cajón</th>
                    <th className="px-5 py-3.5">Placa</th>
                    <th className="px-5 py-3.5">Vehículo</th>
                    <th className="px-5 py-3.5">Propietario / Residente</th>
                    <th className="px-5 py-3.5">Ubicación / Apto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {displayResidentCars.length > 0 ? (
                    displayResidentCars.map((c) => (
                      <tr key={c.slotId} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-400">{c.slotId}</td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-200">{c.plate}</td>
                        <td className="px-5 py-4 text-slate-300">{c.brandModel}</td>
                        <td className="px-5 py-4 text-slate-300">{c.residentName}</td>
                        <td className="px-5 py-4 text-slate-400">{c.location}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        No hay vehículos de residentes registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Visitor slots */
            <div className="overflow-x-auto border border-slate-800/50 rounded-xl bg-slate-950/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Cajón Visitante</th>
                    <th className="px-5 py-3.5">Placa</th>
                    <th className="px-5 py-3.5">Vehículo</th>
                    <th className="px-5 py-3.5">Visitado / Apto</th>
                    <th className="px-5 py-3.5">Entrada / Salida</th>
                    {isSecurity && subTab === 'active' && <th className="px-5 py-3.5 text-right">Acción</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {displayVisitorCars.length > 0 ? (
                    displayVisitorCars.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-amber-500">{c.slotId}</td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-200">{c.plate}</td>
                        <td className="px-5 py-4 text-slate-300">{c.brandModel}</td>
                        <td className="px-5 py-4">
                          <div className="text-slate-300 font-medium">{c.residentVisited}</div>
                          <div className="text-xxs text-slate-500">{c.locationVisited}</div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Llegó: {c.arrivalTime}
                          </div>
                          {c.departureTime && (
                            <div className="flex items-center gap-1 mt-1">
                              <LogOut className="w-3.5 h-3.5 text-slate-500" />
                              Salió: {c.departureTime}
                            </div>
                          )}
                        </td>
                        {isSecurity && subTab === 'active' && (
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleVisitorCheckOut(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Registrar Salida
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isSecurity && subTab === 'active' ? 6 : 5} className="px-5 py-12 text-center text-slate-500">
                        <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        No hay vehículos de visitantes registrados en esta categoría.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Permanent slots limit warn */}
          <div className="flex gap-2.5 p-4 bg-indigo-500/5 border border-indigo-500/10 text-xxs text-slate-400 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Control de portería:</strong> La asignación de parqueaderos de visitantes es controlada por seguridad para garantizar la rotación justa de los cajones disponibles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Parqueadero;
