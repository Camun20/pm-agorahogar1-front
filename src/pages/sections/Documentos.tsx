import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showConfirm } from '../../utils/alerts';
import { 
  FolderGit, Search, Plus, Download, FileText,
  AlertCircle, Inbox, Trash2
} from 'lucide-react';

interface GeneralDocument {
  id: string;
  title: string; // ej. Manual de Convivencia v2
  category: string;
  uploadedAt: string;
  fileSize: string;
  uploaderName: string;
}

export const Documentos: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';

  // States
  const [docs, setDocs] = useState<GeneralDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Reglamentos');
  const [fileSizeInput, setFileSizeInput] = useState('2.4 MB');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_documents');
    const initialDocs: GeneralDocument[] = [
      {
        id: 'doc_1',
        title: 'Manual de Convivencia y Reglamento Interno LobbyApp v2.pdf',
        category: 'Reglamentos',
        uploadedAt: '2026-07-01 09:00 AM',
        fileSize: '3.8 MB',
        uploaderName: 'Ana María Gómez (Admin)'
      },
      {
        id: 'doc_2',
        title: 'Circular de Seguridad y Modificaciones de Portería.pdf',
        category: 'Circulares',
        uploadedAt: '2026-07-08 14:15 PM',
        fileSize: '1.2 MB',
        uploaderName: 'Ana María Gómez (Admin)'
      },
      {
        id: 'doc_3',
        title: 'Protocolo de Emergencias y Plan de Evacuación.pdf',
        category: 'Protocolos',
        uploadedAt: '2026-06-15 11:00 AM',
        fileSize: '5.4 MB',
        uploaderName: 'Carlos Mendoza (SuperAdmin)'
      }
    ];

    if (saved) {
      try {
        setDocs(JSON.parse(saved));
      } catch {
        setDocs(initialDocs);
      }
    } else {
      localStorage.setItem('lobbyapp_documents', JSON.stringify(initialDocs));
      setDocs(initialDocs);
    }
  }, []);

  const filteredDocs = docs.filter(doc => {
    const term = searchTerm.toLowerCase();
    return doc.title.toLowerCase().includes(term) || doc.category.toLowerCase().includes(term);
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Por favor completa todos los campos del documento.');
      return;
    }

    const newDoc: GeneralDocument = {
      id: `doc_${Date.now()}`,
      title: title.trim().endsWith('.pdf') ? title.trim() : `${title.trim()}.pdf`,
      category,
      uploadedAt: new Date().toLocaleString(),
      fileSize: fileSizeInput,
      uploaderName: `${user?.name || 'Administración'} (${user?.role || 'Staff'})`
    };

    const updated = [newDoc, ...docs];
    setDocs(updated);
    localStorage.setItem('lobbyapp_documents', JSON.stringify(updated));

    // Reset Form
    setTitle('');
    setCategory('Reglamentos');
    setFileSizeInput('2.4 MB');
    setActiveTab('list');
  };

  const handleDelete = async (docId: string) => {
    const isConfirmed = await showConfirm(
      '¿Eliminar documento?',
      '¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.',
      'Sí, eliminar'
    );
    if (isConfirmed) {
      const updated = docs.filter(doc => doc.id !== docId);
      setDocs(updated);
      localStorage.setItem('lobbyapp_documents', JSON.stringify(updated));
      showSuccess('Eliminado', 'El documento ha sido eliminado con éxito.');
    }
  };

  // Mock download trigger
  const handleDownload = (doc: GeneralDocument) => {
    showSuccess('Descarga Iniciada', `Descargando documento de la copropiedad:\n"${doc.title}" (${doc.fileSize})`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <FolderGit className="w-3.5 h-3.5" />
              Gestión Documental
            </span>
            <h1 className="text-2xl font-extrabold text-white">Documentos y Circulares</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isAdmin 
                ? 'Sube manuales, circulares informativas y protocolos para conocimiento de toda la copropiedad.'
                : 'Descarga reglamentos de convivencia, circulares generales y formatos de la copropiedad.'}
            </p>
          </div>
          {isAdmin && (
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
                Cargar Documento
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'upload' && isAdmin ? (
        /* Upload Form */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Cargar Documento General (S3 Simulado)</h2>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Nombre del Documento *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Manual de Convivencia v2"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Categoría *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                >
                  <option value="Reglamentos">Reglamentos</option>
                  <option value="Circulares">Circulares</option>
                  <option value="Protocolos">Protocolos</option>
                  <option value="Formatos">Formatos</option>
                </select>
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
                  <option value="3.8 MB">3.8 MB</option>
                  <option value="5.4 MB">5.4 MB</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Seleccionar Documento (Simulado) *</label>
              <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-indigo-500/50 transition cursor-pointer">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
                <span className="text-xs text-slate-400 block">Adjunta archivo pdf general de convivencia</span>
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
                Subir Documento
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
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <div key={doc.id} className="p-5 bg-slate-950/60 border border-slate-800/85 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                        {doc.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{doc.fileSize}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 text-sm line-clamp-2 leading-relaxed">{doc.title}</h4>
                      <p className="text-[10px] text-slate-500">Cargado: {doc.uploadedAt}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-600 truncate max-w-[90px]">{doc.uploaderName}</span>
                    <div className="flex gap-1.5 shrink-0">
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="inline-flex items-center gap-1 py-1.5 px-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 hover:text-red-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                          title="Eliminar Documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(doc)}
                        className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay documentos publicados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Documentos;
