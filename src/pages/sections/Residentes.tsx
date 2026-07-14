import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Building, Mail, Info } from 'lucide-react';

export const Residentes: React.FC = () => {
  const { users } = useAuth();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'location-asc'>('name-asc');

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
            Directorio de Residentes
          </h1>
          <p className="mt-1.5 text-slate-400 text-sm max-w-xl">
            Sección de consulta para buscar y ordenar de forma rápida los residentes activos del conjunto.
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
                <th className="px-5 py-3.5">Nombre Completo</th>
                <th className="px-5 py-3.5">Usuario</th>
                <th className="px-5 py-3.5">Ubicación</th>
                <th className="px-5 py-3.5">Correo Electrónico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {sortedResidents.length > 0 ? (
                sortedResidents.map((r) => (
                  <tr key={r.username} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-200">{r.name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-indigo-400">{r.username}</td>
                    <td className="px-5 py-4 text-slate-300">
                      {r.location ? (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-slate-500" />
                          {r.location}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-600" />
                        {r.email}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No se encontraron residentes en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Residentes;
