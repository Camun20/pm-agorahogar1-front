import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Bell, ClipboardList, Shield, HelpCircle,
  ChevronLeft, ChevronRight, Calendar, Megaphone,
  ArrowRight, Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'Anuncio' | 'Invitación' | 'Carrusel de Imágenes';
  images?: string[];
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // State
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [pendingSurveys, setPendingSurveys] = useState<any[]>([]);
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    // 1. Load admin announcements
    const savedAnn = localStorage.getItem('lobbyapp_admin_announcements');
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

    if (savedAnn) {
      try {
        setAnnouncements(JSON.parse(savedAnn));
      } catch {
        setAnnouncements(initialAnnouncements);
      }
    } else {
      localStorage.setItem('lobbyapp_admin_announcements', JSON.stringify(initialAnnouncements));
      setAnnouncements(initialAnnouncements);
    }

    // 2. Load pending surveys
    const savedSurveys = localStorage.getItem('lobbyapp_surveys');
    const answeredSurveysData = localStorage.getItem(`lobbyapp_answered_surveys_${user?.username}`) || '[]';
    if (savedSurveys) {
      try {
        const surveysList = JSON.parse(savedSurveys);
        const answeredIds = JSON.parse(answeredSurveysData) as string[];
        // Filter out those already voted
        const pending = surveysList.filter((s: any) => !answeredIds.includes(s.id));
        setPendingSurveys(pending);
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  const handlePrevImage = (id: string, max: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + max) % max
    }));
  };

  const handleNextImage = (id: string, max: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % max
    }));
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Building2 className="w-3.5 h-3.5" />
            LobbyApp Residencial
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¡Hola, {user?.name}!
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Te damos la bienvenida al panel de control de tu copropiedad. Aquí puedes gestionar servicios,
            comunicarte con administración y revisar el estado general del conjunto.
          </p>
          {user?.location && (
            <p className="mt-3 text-xs text-indigo-300 font-mono font-medium">
              Ubicación: {user.location} | Rol: {user.role}
            </p>
          )}
        </div>
      </div>

      {/* Main Grid Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Announcements Carousel & Invitations (Col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 px-1">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            Comunicados y Avisos de la Administración
          </h2>

          <div className="space-y-4">
            {announcements.map((ann) => {
              if (ann.type === 'Carrusel de Imágenes' && ann.images && ann.images.length > 0) {
                const activeIndex = carouselIndices[ann.id] || 0;
                return (
                  <div key={ann.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
                    <div className="relative aspect-video sm:aspect-[21/9] bg-slate-950">
                      <img 
                        src={ann.images[activeIndex]} 
                        alt={ann.title} 
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      
                      {ann.images.length > 1 && (
                        <>
                          <button 
                            onClick={() => handlePrevImage(ann.id, ann.images!.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-full text-white transition cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleNextImage(ann.id, ann.images!.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-full text-white transition cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <span className="inline-flex px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-bold uppercase tracking-wider mb-2">
                          <ImageIcon className="w-2.5 h-2.5 inline mr-1" />
                          Galería Oficial
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight drop-shadow-md">{ann.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{ann.content}</p>
                    </div>
                  </div>
                );
              }

              if (ann.type === 'Invitación') {
                return (
                  <div key={ann.id} className="p-5 bg-gradient-to-br from-indigo-950/30 to-blue-950/20 border border-blue-500/20 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-4 items-start">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl shrink-0 text-blue-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <span className="inline-flex px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider">
                        Invitación Oficial
                      </span>
                      <h3 className="text-base font-extrabold text-white leading-snug">{ann.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">{ann.content}</p>
                      <span className="text-[10px] text-slate-500 block font-mono">Publicado: {ann.createdAt}</span>
                    </div>
                  </div>
                );
              }

              // Default: Text announcement
              return (
                <div key={ann.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg space-y-2.5">
                  <span className="inline-flex px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase tracking-wider">
                    Anuncio General
                  </span>
                  <h3 className="text-base font-extrabold text-white leading-snug">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 border border-slate-950 rounded-xl">
                    {ann.content}
                  </p>
                  <span className="text-[10px] text-slate-500 block font-mono">Publicado: {ann.createdAt}</span>
                </div>
              );
            })}

            {announcements.length === 0 && (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay comunicados oficiales vigentes de la administración.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shortcuts & Quick widgets */}
        <div className="space-y-6">
          
          {/* Direct Shortcuts Widget */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Accesos Directos
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link 
                to="/pqrs" 
                className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/60 border border-slate-850 hover:border-indigo-500/40 rounded-xl transition group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Canal de PQRS</span>
                    <span className="text-[10px] text-slate-500">Radica y consulta peticiones</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition group-hover:translate-x-1" />
              </Link>

              <Link 
                to="/encuestas" 
                className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/60 border border-slate-850 hover:border-indigo-500/40 rounded-xl transition group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Votaciones & Encuestas</span>
                    <span className="text-[10px] text-slate-500">Participa en decisiones</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Pending Surveys Widget */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              Encuestas Pendientes
            </h2>
            
            <div className="space-y-3">
              {pendingSurveys.length > 0 ? (
                <>
                  <p className="text-xs text-slate-400">Tienes {pendingSurveys.length} encuesta(s) pendiente(s) por votar:</p>
                  <div className="space-y-2">
                    {pendingSurveys.slice(0, 2).map((s: any) => (
                      <div key={s.id} className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full">
                          Pendiente
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{s.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{s.description}</p>
                      </div>
                    ))}
                  </div>
                  <Link 
                    to="/encuestas" 
                    className="block text-center text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl transition cursor-pointer"
                  >
                    Votar Ahora
                  </Link>
                </>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-450">¡Estás al día! No tienes encuestas pendientes por votar.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
