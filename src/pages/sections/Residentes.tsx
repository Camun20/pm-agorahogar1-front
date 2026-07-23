import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Building, Info, X, FileSpreadsheet } from 'lucide-react';

interface User {
  username: string;
  email: string;
  name: string;
  role: string;
  location?: string;
  phone?: string;
  residentType?: string;
  tower?: string;
  apartment?: string;
}

interface Inhabitant {
  id: string;
  name: string;
  documentId: string;
  age: number;
  relationship: string;
  residentLocation: string;
  hasDisability?: boolean;
  disabilityType?: string;
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

  const exportToExcel = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Nombre Propietario;Usuario Propietario;Correo Propietario;Teléfono Propietario;Tipo Residente;Torre;Apartamento;Ubicación Completa;Nombre Habitante;Cédula Habitante;Edad Habitante;Parentesco Habitante;¿Tiene Discapacidad?;Tipo Discapacidad\n';

    sortedResidents.forEach((res) => {
      const coInhabitants = getInhabitantsForLocation(res.location);
      const resType = res.residentType || 'No especificado';
      const tower = res.tower || '';
      const apt = res.apartment || '';
      const loc = res.location || '';
      const phone = res.phone || 'No registrado';

      if (coInhabitants.length > 0) {
        coInhabitants.forEach((inh) => {
          const hasDisc = inh.hasDisability ? 'Sí' : 'No';
          const discType = inh.hasDisability ? (inh.disabilityType || 'No especificada') : 'N/A';
          csvContent += `"${res.name}";"${res.username}";"${res.email}";"${phone}";"${resType}";"${tower}";"${apt}";"${loc}";"${inh.name}";"${inh.documentId}";"${inh.age}";"${inh.relationship}";"${hasDisc}";"${discType}"\n`;
        });
      } else {
        csvContent += `"${res.name}";"${res.username}";"${res.email}";"${phone}";"${resType}";"${tower}";"${apt}";"${loc}";"N/A";"N/A";"N/A";"N/A";"N/A";"N/A"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Listado_Residentes_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              className="w-full pl-9 pr-4 py-2 bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
            />
          </div>

          {/* Sort selector & Export button */}
          <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
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
            
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </button>
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
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {sortedResidents.length > 0 ? (
                sortedResidents.map((res) => (
                  <tr key={res.username} className="hover:bg-slate-900/35 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-100">{res.name}</div>
                      <div className="text-slate-500 text-xs">{res.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-lg inline-block">
                        {res.location || 'Sin ubicación'}
                      </div>
                      {res.residentType && (
                        <div className="text-slate-500 text-xxs mt-1 block italic">
                          Tipo: {res.residentType}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">
                      {res.phone || 'No registrado'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-0.5 bg-slate-800 text-slate-350 border border-slate-700 text-xs font-extrabold rounded-full">
                        {getInhabitantsForLocation(res.location).length} registrados
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleOpenDetails(res)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No se encontraron residentes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">Vivienda: {selectedResident.location}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Consulta de habitantes y propietario titular</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Propietario / Titular card */}
              <div className="p-4 bg-slate-955 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Propietario / Titular de Cuenta</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold rounded-full uppercase">
                    Titular
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-200 text-sm">{selectedResident.name}</p>
                  {selectedResident.phone && <p className="text-xs text-slate-400">Tel: {selectedResident.phone}</p>}
                  {selectedResident.residentType && <p className="text-xs text-slate-500 italic">Relación Vivienda: {selectedResident.residentType}</p>}
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
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-semibold tracking-wide">
                            <span>CC: {inh.documentId}</span>
                            <span>•</span>
                            <span>{inh.age} años</span>
                            {inh.hasDisability && (
                              <>
                                <span>•</span>
                                <span className="text-red-400 font-bold">Discapacidad: {inh.disabilityType || 'Sí'}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase rounded-full">
                            {inh.relationship}
                          </span>
                          
                          {/* Warnings for safety staff */}
                          <div className="flex gap-1 flex-wrap justify-end">
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
                            {inh.hasDisability && (
                              <span className="px-1.5 py-0.2 bg-red-500/10 text-red-400 border border-red-500/10 text-[8px] font-extrabold rounded-full uppercase" title={inh.disabilityType}>
                                Discapacidad
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
