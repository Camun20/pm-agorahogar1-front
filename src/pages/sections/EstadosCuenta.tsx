import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileSpreadsheet, Search, Plus, Download, FileText, Calendar,
  AlertCircle, Inbox
} from 'lucide-react';

interface StatementFile {
  id: string;
  name: string; // ej. Estado de Cuentas - Junio 2026.pdf
  month: string;
  uploadedAt: string;
  fileSize: string;
  uploaderName: string;
}

export const EstadosCuenta: React.FC = () => {
  const { user } = useAuth();
  const isBillingStaff = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin' || user?.role === 'Accounting';

  // States
  const [statements, setStatements] = useState<StatementFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');

  // Upload Form State
  const [fileName, setFileName] = useState('');
  const [monthInput, setMonthInput] = useState('');
  const [fileSizeInput, setFileSizeInput] = useState('1.2 MB');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_statements');
    const initialStatements: StatementFile[] = [
      {
        id: 'st_1',
        name: 'Reporte Financiero Consolidado - Junio 2026.pdf',
        month: 'Junio 2026',
        uploadedAt: '2026-07-05 10:20 AM',
        fileSize: '2.4 MB',
        uploaderName: 'Mauricio Restrepo (Contador)'
      },
      {
        id: 'st_2',
        name: 'Estado de Cuenta Individual - Torre 3.xlsx',
        month: 'Junio 2026',
        uploadedAt: '2026-07-06 14:15 PM',
        fileSize: '890 KB',
        uploaderName: 'Mauricio Restrepo (Contador)'
      },
      {
        id: 'st_3',
        name: 'Balance de Pérdidas y Ganancias General Q2.pdf',
        month: 'Mayo 2026',
        uploadedAt: '2026-06-10 11:00 AM',
        fileSize: '4.1 MB',
        uploaderName: 'Carlos Mendoza (Admin)'
      }
    ];

    if (saved) {
      try {
        setStatements(JSON.parse(saved));
      } catch {
        setStatements(initialStatements);
      }
    } else {
      localStorage.setItem('lobbyapp_statements', JSON.stringify(initialStatements));
      setStatements(initialStatements);
    }
  }, []);

  const filteredStatements = statements.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.month.toLowerCase().includes(term);
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fileName.trim() || !monthInput.trim()) {
      setFormError('Por favor completa todos los campos del archivo.');
      return;
    }

    const newStatement: StatementFile = {
      id: `st_${Date.now()}`,
      name: fileName.trim().endsWith('.pdf') || fileName.trim().endsWith('.xlsx') ? fileName.trim() : `${fileName.trim()}.pdf`,
      month: monthInput.trim(),
      uploadedAt: new Date().toLocaleString(),
      fileSize: fileSizeInput,
      uploaderName: `${user?.name || 'Administración'} (${user?.role || 'Staff'})`
    };

    const updated = [newStatement, ...statements];
    setStatements(updated);
    localStorage.setItem('lobbyapp_statements', JSON.stringify(updated));

    // Reset Form
    setFileName('');
    setMonthInput('');
    setFileSizeInput('1.2 MB');
    setActiveTab('list');
  };

  // Mock download trigger
  const handleDownload = (statement: StatementFile) => {
    alert(`Iniciando la descarga del archivo:\n"${statement.name}" (${statement.fileSize})`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Estados Financieros
            </span>
            <h1 className="text-2xl font-extrabold text-white">Estados de Cuenta</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isBillingStaff 
                ? 'Sube archivos y balances contables detallados para descarga de los copropietarios.'
                : 'Consulta, revisa y descarga los estados de cuenta y consolidados financieros oficiales.'}
            </p>
          </div>
          {isBillingStaff && (
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
                onClick={() => setActiveTab('upload')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-slate-800/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                Cargar Archivo
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'upload' && isBillingStaff ? (
        /* Upload Form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Cargar Reporte Financiero (S3 Simulado)</h2>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Nombre del Archivo *</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="ej. Balance General Q2"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Mes de Periodo *</label>
                <input
                  type="text"
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  placeholder="ej. Junio 2026"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Tamaño de Archivo (Simulado)</label>
                <select
                  value={fileSizeInput}
                  onChange={(e) => setFileSizeInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                >
                  <option value="1.2 MB">1.2 MB</option>
                  <option value="2.4 MB">2.4 MB</option>
                  <option value="980 KB">980 KB</option>
                  <option value="4.5 MB">4.5 MB</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Seleccionar Documento (Simulado) *</label>
              <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-indigo-500/50 transition cursor-pointer">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
                <span className="text-xs text-slate-400 block">Arrastra o pulsa para adjuntar archivo (.pdf, .xlsx)</span>
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
                Subir Archivo
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
                placeholder="Buscar archivos por nombre o mes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStatements.length > 0 ? (
              filteredStatements.map((st) => (
                <div key={st.id} className="p-5 bg-slate-950/60 border border-slate-800/85 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase">
                        <Calendar className="w-3.5 h-3.5" />
                        {st.month}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{st.fileSize}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 text-sm line-clamp-2 leading-relaxed">{st.name}</h4>
                      <p className="text-[10px] text-slate-500">Cargado: {st.uploadedAt}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 truncate max-w-[120px]">{st.uploaderName}</span>
                    <button
                      onClick={() => handleDownload(st)}
                      className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay estados de cuenta disponibles.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default EstadosCuenta;
