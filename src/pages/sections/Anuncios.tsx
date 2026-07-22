import React, { useState, useEffect } from 'react';
import { showSuccess, showConfirm } from '../../utils/alerts';
import { 
  Megaphone, Plus, Trash2, Calendar, Image as ImageIcon, 
  AlertCircle, Inbox
} from 'lucide-react';

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'Anuncio' | 'Invitación' | 'Carrusel de Imágenes';
  images?: string[]; // list of image URLs
  createdAt: string;
}

export const Anuncios: React.FC = () => {
  
  // States
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AdminAnnouncement['type']>('Anuncio');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_admin_announcements');
    const initialAnnouncements: AdminAnnouncement[] = [
      {
        id: 'ann_1',
        title: '¡Bienvenidos a LobbyApp!',
        content: 'Estimados residentes, les damos la bienvenida oficial a LobbyApp, la nueva plataforma de administración y comunicación de la copropiedad.',
        type: 'Anuncio',
        createdAt: '2026-07-20'
      },
      {
        id: 'ann_2',
        title: 'Galería de Nuestras Zonas Comunes',
        content: 'Explora y disfruta de las instalaciones de nuestro conjunto residencial. Contamos con piscina climatizada, salón social equipado y gimnasio de última generación.',
        type: 'Carrusel de Imágenes',
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'
        ],
        createdAt: '2026-07-21'
      },
      {
        id: 'ann_3',
        title: 'Invitación: Asamblea General Extraordinaria',
        content: 'Se convoca a todos los copropietarios a la Asamblea Extraordinaria para discutir el presupuesto de seguridad. Fecha: Domingo 27 de Julio a las 9:00 AM en el salón social.',
        type: 'Invitación',
        createdAt: '2026-07-22'
      }
    ];

    if (saved) {
      try {
        setAnnouncements(JSON.parse(saved));
      } catch {
        setAnnouncements(initialAnnouncements);
      }
    } else {
      localStorage.setItem('lobbyapp_admin_announcements', JSON.stringify(initialAnnouncements));
      setAnnouncements(initialAnnouncements);
    }
  }, []);

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImagesList([...imagesList, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !content.trim()) {
      setFormError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (type === 'Carrusel de Imágenes' && imagesList.length === 0) {
      setFormError('Para el carrusel de imágenes, debes ingresar al menos una URL de imagen.');
      return;
    }

    const newAnn: AdminAnnouncement = {
      id: `ann_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      type,
      ...(type === 'Carrusel de Imágenes' && { images: imagesList }),
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('lobbyapp_admin_announcements', JSON.stringify(updated));

    // Reset Form
    setTitle('');
    setContent('');
    setType('Anuncio');
    setImagesList([]);
    setImageUrlInput('');
    setActiveTab('list');
    showSuccess('Publicado', 'El anuncio administrativo ha sido publicado con éxito.');
  };

  const handleDelete = async (annId: string) => {
    const isConfirmed = await showConfirm(
      '¿Eliminar anuncio?',
      '¿Estás seguro de que deseas eliminar este anuncio oficial de la administración? Todos los usuarios dejarán de verlo en la página de inicio.',
      'Sí, eliminar'
    );
    if (isConfirmed) {
      const updated = announcements.filter(a => a.id !== annId);
      setAnnouncements(updated);
      localStorage.setItem('lobbyapp_admin_announcements', JSON.stringify(updated));
      showSuccess('Eliminado', 'Anuncio oficial eliminado.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Megaphone className="w-3.5 h-3.5" />
              Comunicación Oficial
            </span>
            <h1 className="text-2xl font-extrabold text-white">Anuncios de Administración</h1>
            <p className="text-slate-400 text-sm mt-1">
              Publica carruseles de fotos, avisos generales o invitaciones formales en la pantalla de bienvenida.
            </p>
          </div>
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
              Crear Anuncio
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* Form creation */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Nuevo Anuncio Oficial</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Título del Anuncio *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Asamblea General Ordinaria 2026"
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 placeholder-slate-600"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Tipo de Comunicación *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                required
              >
                <option value="Anuncio">Anuncio Informativo General</option>
                <option value="Invitación">Invitación / Convocatoria</option>
                <option value="Carrusel de Imágenes">Carrusel de Imágenes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase font-semibold">Contenido / Descripción *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Redacta el mensaje oficial para los copropietarios..."
                rows={5}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 resize-none"
                required
              />
            </div>

            {/* Images section for Carousel */}
            {type === 'Carrusel de Imágenes' && (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-xs text-indigo-400 uppercase font-bold">Imágenes del Carrusel</h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Pega la URL de una imagen (Unsplash, etc.)"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>

                <div className="space-y-2">
                  {imagesList.map((url, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-950 p-2.5 border border-slate-800 rounded-xl text-xxs">
                      <span className="truncate text-slate-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="text-red-400 hover:text-red-300 font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg cursor-pointer"
              >
                Publicar Anuncio
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* List view */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Historial de Comunicados</h2>

          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((a) => (
                <div key={a.id} className="p-5 bg-slate-955/60 border border-slate-800/90 rounded-2xl flex flex-col justify-between hover:border-indigo-500/30 transition">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase mb-2 ${
                          a.type === 'Carrusel de Imágenes' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          a.type === 'Invitación' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {a.type}
                        </span>
                        <h4 className="font-extrabold text-white text-base leading-snug">{a.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {a.createdAt}
                      </span>
                    </div>

                    <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/30 p-3.5 border border-slate-900 rounded-xl">
                      {a.content}
                    </p>

                    {a.type === 'Carrusel de Imágenes' && a.images && a.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {a.images.map((img, i) => (
                          <div key={i} className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                            <img src={img} alt={`carrusel-${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-900 mt-4 flex justify-end">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                      title="Eliminar Anuncio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay comunicados oficiales registrados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Anuncios;
