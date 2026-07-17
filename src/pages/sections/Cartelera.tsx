import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Presentation, Search, Plus, CheckCircle, XCircle, Eye,
  Contact, MapPin, AlertCircle, Info, Inbox
} from 'lucide-react';

interface CarteleraAd {
  id: string;
  title: string;
  description: string;
  contact: string;
  location: string;
  residentName: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  createdAt: string;
}

export const Cartelera: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';

  // States
  const [ads, setAds] = useState<CarteleraAd[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'board' | 'my-ads' | 'moderate'>('board');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_cartelera');
    const initialAds: CarteleraAd[] = [
      {
        id: 'ad_1',
        title: 'Servicio de Estilista & Peluquería a Domicilio',
        description: 'Cortes de cabello para damas, caballeros y niños. Tinturas, manicure y pedicure sin salir del conjunto.',
        contact: 'WhatsApp: 310 908 4321',
        location: 'Torre 3 - Apto 402',
        residentName: 'Diana Carolina Ruiz',
        status: 'Aprobado',
        createdAt: '2026-07-13'
      },
      {
        id: 'ad_2',
        title: 'Venta de Postres y Repostería Artesanal',
        description: 'Deliciosos tres leches, tortas de chocolate y muffins sobre pedido para eventos y cumpleaños.',
        contact: 'Contacto: Ana Gómez (Apto Admin Office)',
        location: 'Portería Principal - Admin Office',
        residentName: 'Ana María Gómez',
        status: 'Aprobado',
        createdAt: '2026-07-12'
      },
      {
        id: 'ad_3',
        title: 'Clases particulares de Inglés y Matemáticas',
        description: 'Nivelación escolar para niños y jóvenes de primaria y bachillerato. Clases virtuales o presenciales en áreas comunes.',
        contact: 'Cel: 315 765 0987',
        location: 'Torre 3 - Apto 402',
        residentName: 'Diana Carolina Ruiz',
        status: 'Pendiente',
        createdAt: '2026-07-14'
      }
    ];

    if (saved) {
      try {
        setAds(JSON.parse(saved));
      } catch {
        setAds(initialAds);
      }
    } else {
      localStorage.setItem('lobbyapp_cartelera', JSON.stringify(initialAds));
      setAds(initialAds);
    }
  }, []);

  const handleRegisterAd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !contact.trim()) {
      setFormError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    const newAd: CarteleraAd = {
      id: `ad_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      contact: contact.trim(),
      location: user?.location || 'No especificada',
      residentName: user?.name || 'Residente',
      status: 'Pendiente',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newAd, ...ads];
    setAds(updated);
    localStorage.setItem('lobbyapp_cartelera', JSON.stringify(updated));

    // Reset Form
    setTitle('');
    setDescription('');
    setContact('');
    setActiveTab('my-ads');
  };

  const handleApprove = (adId: string) => {
    const updated = ads.map(ad => {
      if (ad.id === adId) {
        return { ...ad, status: 'Aprobado' as const };
      }
      return ad;
    });
    setAds(updated);
    localStorage.setItem('lobbyapp_cartelera', JSON.stringify(updated));
  };

  const handleReject = (adId: string) => {
    const updated = ads.map(ad => {
      if (ad.id === adId) {
        return { ...ad, status: 'Rechazado' as const };
      }
      return ad;
    });
    setAds(updated);
    localStorage.setItem('lobbyapp_cartelera', JSON.stringify(updated));
  };

  // Lists filtered by search and tab
  const displayAds = ads.filter(ad => {
    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch = ad.title.toLowerCase().includes(term) || ad.description.toLowerCase().includes(term);
    if (!matchesSearch) return false;

    if (activeTab === 'board') {
      return ad.status === 'Aprobado';
    }
    if (activeTab === 'my-ads') {
      return ad.location === user?.location;
    }
    if (activeTab === 'moderate') {
      return isAdmin && ad.status === 'Pendiente';
    }

    return false;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Presentation className="w-3.5 h-3.5" />
              Emprendimientos & Servicios
            </span>
            <h1 className="text-2xl font-extrabold text-white">Cartelera de Residentes</h1>
            <p className="text-slate-400 text-sm mt-1">
              Encuentra servicios locales de tus vecinos o promociona tu propio negocio.
            </p>
          </div>

          {/* Navigation tags */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${activeTab === 'board'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
            >
              Cartelera Pública
            </button>
            <button
              onClick={() => setActiveTab('my-ads')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${activeTab === 'my-ads'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
            >
              Mis Anuncios
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('moderate')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer relative ${activeTab === 'moderate'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800/50'
                  }`}
              >
                Moderar
                {ads.some(ad => ad.status === 'Pendiente') && (
                  <span className="absolute top-[-4px] right-[-4px] w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Create / Moderate form / Information */}
        <div className="lg:col-span-1 space-y-6">
          {activeTab === 'my-ads' ? (
            /* Create ad form */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md animate-fade-in space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-indigo-400" />
                Publicar Anuncio
              </h3>

              <form onSubmit={handleRegisterAd} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Servicio / Producto *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ej. Venta de Tortas Caseras"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Descripción del Servicio *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe los costos, horarios y alcances de tu oferta..."
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100 resize-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Datos de Contacto *</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="ej. WhatsApp 315 000 0000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100"
                    required
                  />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xxs">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Enviar a Aprobación
                </button>
              </form>
            </div>
          ) : (
            /* Instructions block */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-xs text-slate-400">
              <h3 className="font-bold text-white text-sm">¿Cómo funciona?</h3>
              <p className="leading-relaxed">
                1. Los residentes registran sus anuncios especificando sus servicios, detalles de contacto y ubicación.
              </p>
              <p className="leading-relaxed">
                2. Los administradores revisan y aprueban las solicitudes para evitar contenidos no deseados.
              </p>
              <p className="leading-relaxed">
                3. Una vez aprobadas, se publican automáticamente y quedan visibles en la <strong>Cartelera Pública</strong> para toda la copropiedad.
              </p>
              <div className="flex gap-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p>Las aprobaciones suelen completarse en un plazo menor a 24 horas por parte de administración.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: List of Advertisements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Filtrar anuncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-905 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
            />
          </div>

          <div className="space-y-4">
            {displayAds.length > 0 ? (
              displayAds.map((ad) => (
                <div key={ad.id} className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-white text-base leading-snug">{ad.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xxs text-slate-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-600" />
                          Ubicación: {ad.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3 text-slate-600" />
                          Por: {ad.residentName}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-xxs font-bold border uppercase ${ad.status === 'Aprobado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      ad.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      {ad.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 border border-slate-900 rounded-xl">
                    {ad.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Contact className="w-3.5 h-3.5" />
                      {ad.contact}
                    </span>

                    {activeTab === 'moderate' && isAdmin && (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleReject(ad.id)}
                          className="inline-flex items-center gap-0.5 px-3 py-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleApprove(ad.id)}
                          className="inline-flex items-center gap-0.5 px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-xxs rounded-lg transition cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Aprobar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay publicaciones registradas en esta pestaña.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cartelera;
