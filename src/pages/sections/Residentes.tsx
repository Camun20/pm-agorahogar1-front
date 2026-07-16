import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Building, Mail, Info, Phone, X } from 'lucide-react';

interface User {
  username: string;
  email: string;
  name: string;
  role: string;
  location?: string;
  phone?: string;
}

interface Inhabitant {
  id: string;
  name: string;
  documentId: string;
  age: number;
  relationship: string;
  residentLocation: string;
}

export const Residentes: React.FC = () => {
  const { users } = useAuth();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'location-asc'>('name-asc');
  const [allInhabitants, setAllInhabitants] = useState<Inhabitant[]>([]);
  
  // Modal State
  const [selectedResident, setSelectedResident] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_inhabitants');
    if (saved) {
      try {
        setAllInhabitants(JSON.parse(saved));
      } catch (e) {
        console.warn('Error loading inhabitants list', e);
      }
    }
  }, [isModalOpen]); // reload from storage when modal opens/closes or lists update

  // Filter only users with Resident role
  const residents = users.filter(u => u.role === 'Resident');

  // Filter by search term
  const searchedResidents = residents.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    return (
      r.name.toLowerCase().includes(term) ||
      r.username.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      (r.location && r.location.toLowerCase().includes(term))
    );
  });

  // Sort list
  const sortedResidents = [...searchedResidents].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === 'location-asc') {
      const locA = a.location || '';
      const locB = b.location || '';
      return locA.localeCompare(locB);
    }
    return 0;
  });

  const getInhabitantsForLocation = (location?: string) => {
    if (!location) return [];
    return allInhabitants.filter(inh => inh.residentLocation === location);
  };

  const handleOpenDetails = (resident: User) => {
    setSelectedResident(resident);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Users className="w-3.5 h-3.5" />
            Consulta
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Directorio de Residentes Propietarios
          </h1>
          <p className="mt-1.5 text-slate-400 text-sm max-w-xl">
            Consulta los propietarios registrados por casa/apto y conoce los habitantes asociados a cada vivienda.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl p-6 space-y-6">
        
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, usuario, correo o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-955 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl outline-none cursor-pointer transition"
            >
              <option value="name-asc">Nombre (A-Z)</option>
              <option value="name-desc">Nombre (Z-A)</option>
              <option value="location-asc">Ubicación</option>
            </select>
          </div>

        </div>

        {/* Directory List Table */}
        <div className="overflow-x-auto border border-slate-800/50 rounded-xl bg-slate-955/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">Nombre Propietario</th>
                <th className="px-5 py-3.5">Ubicación</th>
                <th className="px-5 py-3.5">Contacto</th>
                <th className="px-5 py-3.5">Habitantes</th>
                <th className="px-5 py-3.5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {sortedResidents.length > 0 ? (
                sortedResidents.map((r) => {
                  const unitInhabitants = getInhabitantsForLocation(r.location);
                  return (
                    <tr key={r.username} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-200">{r.name}</div>
                        <div className="font-mono text-[10px] text-indigo-400">{r.username}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {r.location ? (
                          <span className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-slate-500" />
                            {r.location}
                          </span>
                        ) : (
                          <span className="text-slate-650">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-600" />
                            {r.email}
                          </span>
                          {r.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-600" />
                              {r.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                          {unitInhabitants.length + 1} persona{unitInhabitants.length + 1 !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleOpenDetails(r)}
                          className="inline-flex items-center gap-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No se encontraron residentes en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal - Admin & Security query */}
      {isModalOpen && selectedResident && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
              <Building className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="font-extrabold text-white text-lg">Vivienda: {selectedResident.location}</h3>
                <p className="text-slate-400 text-xs mt-0.5">Consulta de habitantes y propietario titular</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Propietario / Titular card */}
              <div className="p-4 bg-slate-950/85 border border-slate-850 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Propietario / Titular de Cuenta</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold rounded-full uppercase">
                    Titular
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-200 text-sm">{selectedResident.name}</p>
                  <p className="text-xs text-slate-500 font-mono">Usuario: {selectedResident.username}</p>
                  {selectedResident.phone && <p className="text-xs text-slate-400">Tel: {selectedResident.phone}</p>}
                </div>
              </div>

              {/* Co-habitantes list */}
              <div className="space-y-3">
                <h4 className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Otros Habitantes Registrados
                </h4>
                
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {getInhabitantsForLocation(selectedResident.location).length > 0 ? (
                    getInhabitantsForLocation(selectedResident.location).map((inh) => (
                      <div key={inh.id} className="p-3 bg-slate-955 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200 text-xs">{inh.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                            <span>CC: {inh.documentId}</span>
                            <span>•</span>
                            <span>{inh.age} años</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase rounded-full">
                            {inh.relationship}
                          </span>
                          
                          {/* Warnings for safety staff */}
                          <div className="flex gap-1">
                            {inh.age < 12 && (
                              <span className="px-1.5 py-0.2 bg-sky-500/10 text-sky-400 border border-sky-500/10 text-[8px] font-extrabold rounded-full uppercase">
                                Menor
                              </span>
                            )}
                            {inh.age >= 65 && (
                              <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/10 text-[8px] font-extrabold rounded-full uppercase">
                                3ra Edad
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                      No hay otros habitantes registrados para esta ubicación. Solo reside el propietario.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Residentes;
