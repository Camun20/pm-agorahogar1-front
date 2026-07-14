import React, { useState } from 'react';
import { useAuth, type User, type UserRole } from '../../context/AuthContext';
import { 
  Users, UserPlus, Edit2, Trash2, Key, Info, ShieldAlert,
  Building, UserCheck, AlertTriangle, X, Search
} from 'lucide-react';

export const Usuarios: React.FC = () => {
  const { users, createUser, updateUser, deleteUser, user: currentUser } = useAuth();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Resident');
  const [apartment, setApartment] = useState('');
  const [tower, setTower] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setName('');
    setPassword('');
    setRole('Resident');
    setApartment('');
    setTower('');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setName(user.name);
    setPassword(user.password || '');
    setRole(user.role);
    setApartment(user.apartment || '');
    setTower(user.tower || '');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validations
    if (!username.trim() || !name.trim() || !password.trim()) {
      setFormError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    const userData: User = {
      username: username.trim(),
      email: email.trim() || `${username.trim()}@lobbyapp.com`, // Auto-generated email fallback
      name: name.trim(),
      role,
      password: password,
      ...(apartment.trim() && { apartment: apartment.trim() }),
      ...(tower.trim() && { tower: tower.trim() })
    };

    try {
      if (editingUser) {
        // Edit flow
        await updateUser(editingUser.username, userData);
        setFormSuccess('Usuario actualizado con éxito.');
        setTimeout(() => setIsModalOpen(false), 800);
      } else {
        // Create flow
        await createUser(userData);
        setFormSuccess('Usuario creado con éxito.');
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error al procesar el usuario.');
    }
  };

  const handleDelete = async (usernameToDelete: string) => {
    if (usernameToDelete === currentUser?.username) {
      alert('No puedes eliminar tu propio usuario activo.');
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar el usuario "${usernameToDelete}"?`)) {
      try {
        await deleteUser(usernameToDelete);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar usuario');
      }
    }
  };

  const getRoleBadgeColor = (userRole: UserRole) => {
    switch (userRole) {
      case 'SuperAdmin': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'ResidentialAdmin': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Security': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Accounting': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Resident': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getRoleLabel = (userRole: UserRole) => {
    switch (userRole) {
      case 'SuperAdmin': return 'Super Admin';
      case 'ResidentialAdmin': return 'Admin Residencial';
      case 'Security': return 'Seguridad';
      case 'Accounting': return 'Contador';
      case 'Resident': return 'Residente';
      default: return userRole;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Users className="w-3.5 h-3.5" />
              Gestión Interna
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Control de Usuarios y Credenciales
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm max-w-xl">
              Sección administrativa para crear, modificar y dar de baja usuarios del sistema de control LobbyApp.
            </p>
          </div>
          <button 
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/15 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Usuario</span>
          </button>
        </div>
      </div>

      {/* Main Grid Filters & Users List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl p-6 space-y-6">
        
        {/* Controls: Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
            />
          </div>

          {/* Role Filter badges */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'SuperAdmin', 'ResidentialAdmin', 'Security', 'Accounting', 'Resident'].map((roleKey) => (
              <button
                key={roleKey}
                onClick={() => setRoleFilter(roleKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  roleFilter === roleKey
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {roleKey === 'All' ? 'Todos' : getRoleLabel(roleKey as UserRole)}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-slate-800/50 rounded-xl bg-slate-950/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">Nombre Completo</th>
                <th className="px-5 py-3.5">Usuario / Login</th>
                <th className="px-5 py-3.5">Rol de Acceso</th>
                <th className="px-5 py-3.5">Ubicación / Detalles</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.username} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-200">{u.name}</td>
                    <td className="px-5 py-4 font-mono text-indigo-400 text-xs">{u.username}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {u.tower || u.apartment ? (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          Torre {u.tower || '—'} / Apto {u.apartment || '—'}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Modificar Información"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.username)}
                          disabled={u.username === currentUser?.username}
                          title={u.username === currentUser?.username ? "No puedes eliminarte a ti mismo" : "Eliminar Usuario"}
                          className={`p-1.5 bg-slate-900 border rounded-lg transition cursor-pointer ${
                            u.username === currentUser?.username 
                              ? 'border-slate-800/20 text-slate-700 cursor-not-allowed'
                              : 'hover:bg-red-500/10 border-slate-800 text-slate-400 hover:text-red-400'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No se encontraron usuarios con los criterios de búsqueda actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Helper info badge */}
        <div className="flex gap-2.5 p-4 bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-400 rounded-xl">
          <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Nota de seguridad:</strong> El sistema sincroniza automáticamente estos cambios con AWS Cognito en un entorno de producción. En este ambiente interactivo, los cambios se persisten localmente en tu navegador.
          </p>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingUser ? <Edit2 className="w-5 h-5 text-indigo-400" /> : <UserPlus className="w-5 h-5 text-indigo-400" />}
                {editingUser ? 'Modificar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Field: Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Usuario (Login) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej: carlos_mendoza"
                  disabled={!!editingUser}
                  className={`w-full px-4 py-2.5 bg-slate-950 border focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition ${
                    editingUser ? 'border-slate-800 text-slate-500 cursor-not-allowed' : 'border-slate-800'
                  }`}
                  required
                />
                {!editingUser && (
                  <p className="text-[10px] text-slate-500">Este será el identificador único para iniciar sesión.</p>
                )}
              </div>

              {/* Field: Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Carlos Mendoza"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition"
                  required
                />
              </div>

              {/* Field: Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex justify-between">
                  <span>Contraseña *</span>
                  {editingUser && <span className="text-xxs text-amber-400 lowercase font-medium">Reescribe para cambiarla</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña de acceso"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition"
                    required
                  />
                </div>
              </div>

              {/* Field: Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Rol de Acceso
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition cursor-pointer"
                >
                  <option value="Resident">Residente</option>
                  <option value="Security">Seguridad / Guarda</option>
                  <option value="Accounting">Contabilidad / Contador</option>
                  <option value="ResidentialAdmin">Administrador Residencial</option>
                  <option value="SuperAdmin">Super Administrador</option>
                </select>
              </div>

              {/* Conditional Fields: Tower and Apartment (for Residents/Security/ResidentialAdmin) */}
              {(role === 'Resident' || role === 'ResidentialAdmin' || role === 'Security') && (
                <div className="grid grid-cols-2 gap-4 pt-1.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Torre / Bloque
                    </label>
                    <input
                      type="text"
                      value={tower}
                      onChange={(e) => setTower(e.target.value)}
                      placeholder="ej: 3"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Apartamento
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="ej: 402"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl outline-none text-sm transition"
                    />
                  </div>
                </div>
              )}

              {/* Success / Error Alerts */}
              {formError && (
                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="flex items-start gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs">
                  <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Modal Footer / Actions */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition cursor-pointer"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Usuarios;
