import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import {
  Menu, X, Bell, MessageSquare, LogOut, User as UserIcon, Building, ChevronLeft, ChevronRight,
  ClipboardList, Users, Truck, DollarSign, FileSpreadsheet, HelpCircle,
  Presentation, FolderGit, Ban, Lightbulb, Car, CalendarDays, Archive, Send, Key
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
}

export const MainLayout: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Estados de interfaz interactiva
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Estados para el modal "Ver Perfil"
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  // Mensajes de prueba del chat rápido
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'admin', text: 'Hola, ¿en qué podemos ayudarte hoy?', time: '10:30 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Definición de las 13 secciones y su control de acceso (RBAC)
  // Nota: El frontend lee el grupo de Cognito del token JWT mapeado en user.role
  const sidebarItems: SidebarItem[] = [
    {
      name: 'Encuestas',
      path: '/encuestas',
      icon: <ClipboardList className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Resident'],
    },
    {
      name: 'Visitantes',
      path: '/visitantes',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'Security', 'Resident'],
    },
    {
      name: 'Domicilios',
      path: '/domicilios',
      icon: <Truck className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'Security', 'Resident'],
    },
    {
      name: 'Saldos',
      path: '/saldos',
      icon: <DollarSign className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Accounting', 'Resident'],
    },
    {
      name: 'Estados de Cuenta',
      path: '/estados-cuenta',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Accounting', 'Resident'],
    },
    {
      name: 'PQRS',
      path: '/pqrs',
      icon: <HelpCircle className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Resident'],
    },
    {
      name: 'Cartelera',
      path: '/cartelera',
      icon: <Presentation className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Resident'],
    },
    {
      name: 'Documentos',
      path: '/documentos',
      icon: <FolderGit className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Resident'],
    },
    {
      name: 'Sanciones',
      path: '/sanciones',
      icon: <Ban className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident'],
    },
    {
      name: 'Recibos Públicos',
      path: '/recibos-publicos',
      icon: <Lightbulb className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'Security', 'Resident'],
    },
    {
      name: 'Parqueadero',
      path: '/parqueadero',
      icon: <Car className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident'],
    },
    {
      name: 'Reservas',
      path: '/reservas',
      icon: <CalendarDays className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident'],
    },
    {
      name: 'Mudanzas',
      path: '/mudanzas',
      icon: <Archive className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Security', 'Resident'],
    },
    {
      name: 'Gestión Usuarios',
      path: '/usuarios',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin'],
    },
    {
      name: 'Residentes',
      path: '/residentes',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['SuperAdmin', 'ResidentialAdmin', 'Security', 'Accounting'],
    },
  ];

  // Filtrar items según el rol del usuario autenticado
  const filteredSidebarItems = sidebarItems.filter(
    (item) => user && item.allowedRoles.includes(user.role)
  );

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: 'user', text: newMessage, time: 'Ahora' },
    ]);
    setNewMessage('');
    
    // Auto responder simulado
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: 'admin', text: 'Entendido. Procesaremos tu solicitud a la brevedad.', time: 'Ahora' },
      ]);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* -------------------- SIDEBAR (DESKTOP) -------------------- */}
      <aside 
        className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 relative ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <Building className="w-6 h-6 text-indigo-500 shrink-0" />
            {!isSidebarCollapsed && (
              <span className="font-bold text-white text-lg tracking-tight select-none whitespace-nowrap">
                Lobby<span className="text-indigo-400">App</span>
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Dynamic Navigation list */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredSidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/15' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="shrink-0">{item.icon}</div>
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                
                {/* Tooltip on collapsed mode */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Logout Button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group relative cursor-pointer ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
            
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Cerrar Sesión
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* -------------------- SIDEBAR (MOBILE OVERLAY) -------------------- */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full animate-slide-in">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
              <Link to="/" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-2">
                <Building className="w-6 h-6 text-indigo-500" />
                <span className="font-bold text-white text-lg">LobbyApp</span>
              </Link>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {filteredSidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/15' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Logout Button */}
            <div className="p-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MAIN WORKSPACE CONTAINER -------------------- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* -------------------- TOP NAVIGATION BAR -------------------- */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-4 z-40 shrink-0 select-none">
          {/* Left: Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Center: Brand App Name (Typography elegante) */}
          <div className="flex-1 text-center md:text-left md:pl-2">
            <Link to="/" className="inline-block">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                LobbyApp — Gestión Residencial
              </h2>
            </Link>
          </div>

          {/* Right: Interaction Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* 1. NOTIFICATIONS DROP-DOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                  setIsChatOpen(false);
                }}
                className={`p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition relative cursor-pointer ${
                  isNotificationsOpen ? 'bg-slate-800 text-white' : ''
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 rounded-full text-xxs font-extrabold flex items-center justify-center text-white border border-slate-900 animate-pulse">
                  3
                </span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-200 text-sm">Notificaciones</span>
                    <button className="text-xxs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      Marcar leídas
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="p-2.5 hover:bg-slate-800/50 rounded-xl transition text-xs space-y-1">
                      <div className="flex justify-between font-medium text-slate-200">
                        <span>Nueva PQRS Creada</span>
                        <span className="text-slate-500 text-xxs">10 min</span>
                      </div>
                      <p className="text-slate-400">Se registró la queja #293 sobre humedades.</p>
                    </div>
                    <div className="p-2.5 hover:bg-slate-800/50 rounded-xl transition text-xs space-y-1">
                      <div className="flex justify-between font-medium text-slate-200">
                        <span>Documento Cargado</span>
                        <span className="text-slate-500 text-xxs">1 hora</span>
                      </div>
                      <p className="text-slate-400">Acta de Asamblea en PDF subida a S3.</p>
                    </div>
                    <div className="p-2.5 hover:bg-slate-800/50 rounded-xl transition text-xs space-y-1">
                      <div className="flex justify-between font-medium text-slate-200">
                        <span>Reserva Confirmada</span>
                        <span className="text-slate-500 text-xxs">Ayer</span>
                      </div>
                      <p className="text-slate-400">Tu reserva del Salón BBQ fue pre-aprobada.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. CHAT / MESSAGES FLYOUT */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsChatOpen(!isChatOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className={`p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition relative cursor-pointer ${
                  isChatOpen ? 'bg-slate-800 text-white' : ''
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {isChatOpen && (
                <div className="absolute right-[-60px] sm:right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden h-96 animate-fade-in">
                  <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                      <span className="font-semibold text-slate-200 text-sm">Administración en línea</span>
                    </div>
                    <button 
                      onClick={() => setIsChatOpen(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Messages log */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-950/40">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`px-3 py-2 rounded-xl text-xs ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-slate-800 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                  {/* Sender inputs */}
                  <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-900/90 flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-slate-950/80 border border-slate-800 text-xs px-3 py-2 rounded-lg outline-none text-slate-100 placeholder-slate-600 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* 3. USER PROFILE AVATAR WITH DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                  setIsChatOpen(false);
                }}
                className={`flex items-center gap-1.5 p-1 rounded-full border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition cursor-pointer ${
                  isProfileOpen ? 'border-indigo-500 bg-slate-800' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs select-none">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US'}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 z-50 animate-fade-in">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-200 text-sm truncate">{user?.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rol Cognito:</span>
                      <span className="text-indigo-400 font-medium font-mono">{user?.role}</span>
                    </div>
                    {user?.location && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ubicación:</span>
                        <span className="text-slate-300 font-medium truncate max-w-[120px]">{user.location}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer mb-2"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                    Ver Perfil
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* -------------------- WORKSPACE CONTENT AREA -------------------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* -------------------- PROFILE MODAL -------------------- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-400" />
                Mi Perfil
              </h2>
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setNewPassword('');
                  setProfileError(null);
                  setProfileSuccess(null);
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* User Info Details */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Nombre:</span>
                  <span className="text-slate-200 font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Usuario:</span>
                  <span className="text-indigo-400 font-mono font-medium">{user?.username}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Correo:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[180px]">{user?.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Rol:</span>
                  <span className="text-indigo-400 font-medium">{user?.role}</span>
                </div>
                {user?.location && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ubicación:</span>
                    <span className="text-slate-200 font-medium">{user.location}</span>
                  </div>
                )}
              </div>

              {/* Password Change Section */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setProfileError(null);
                  setProfileSuccess(null);
                  if (!newPassword.trim()) {
                    setProfileError('La contraseña no puede estar vacía.');
                    return;
                  }
                  try {
                    if (user) {
                      await updateUser(user.username, { password: newPassword });
                      setProfileSuccess('Contraseña actualizada con éxito.');
                      setNewPassword('');
                      setTimeout(() => {
                        setIsProfileModalOpen(false);
                        setProfileSuccess(null);
                      }, 1200);
                    }
                  } catch (err: any) {
                    setProfileError(err.message || 'Error al actualizar contraseña.');
                  }
                }}
                className="space-y-3 pt-2"
              >
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Cambiar Contraseña
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition"
                    required
                  />
                </div>

                {/* Alerts */}
                {profileError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs">
                    {profileSuccess}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setNewPassword('');
                      setProfileError(null);
                      setProfileSuccess(null);
                    }}
                    className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
