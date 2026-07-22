import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showConfirm } from '../../utils/alerts';
import { 
  Home, Edit2, Trash2, UserPlus, AlertCircle, X, Users
} from 'lucide-react';

export interface Inhabitant {
  id: string;
  name: string;
  documentId: string;
  age: number;
  relationship: 'Hijo/a' | 'Cónyuge' | 'Adulto Mayor' | 'Familiar' | 'Otro';
  residentLocation: string; // matches user.location
  hasDisability?: boolean;
  disabilityType?: string;
}

export const MiHogar: React.FC = () => {
  const { user } = useAuth();
  
  // States
  const [inhabitants, setInhabitants] = useState<Inhabitant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Inhabitant | null>(null);

  // Form State
  const [memberName, setMemberName] = useState('');
  const [memberDoc, setMemberDoc] = useState('');
  const [memberAge, setMemberAge] = useState<number | ''>('');
  const [memberRelationship, setMemberRelationship] = useState<Inhabitant['relationship']>('Familiar');
  const [hasDisability, setHasDisability] = useState(false);
  const [disabilityType, setDisabilityType] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_inhabitants');
    const initialInhabitants: Inhabitant[] = [
      {
        id: 'inh_1',
        name: 'Sofía Ruiz Gómez',
        documentId: '1013456789',
        age: 8,
        relationship: 'Hijo/a',
        residentLocation: 'Torre 3 - Apto 402',
        hasDisability: false
      },
      {
        id: 'inh_2',
        name: 'Pedro Antonio Ruiz',
        documentId: '79123456',
        age: 71,
        relationship: 'Adulto Mayor',
        residentLocation: 'Torre 3 - Apto 402',
        hasDisability: true,
        disabilityType: 'Visual / Auditiva'
      }
    ];

    if (saved) {
      try {
        setInhabitants(JSON.parse(saved));
      } catch {
        setInhabitants(initialInhabitants);
      }
    } else {
      localStorage.setItem('lobbyapp_inhabitants', JSON.stringify(initialInhabitants));
      setInhabitants(initialInhabitants);
    }
  }, []);

  // Filter only family members of this resident's home location
  const myHousehold = inhabitants.filter(inh => inh.residentLocation === user?.location);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberDoc('');
    setMemberAge('');
    setMemberRelationship('Familiar');
    setHasDisability(false);
    setDisabilityType('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Inhabitant) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberDoc(member.documentId);
    setMemberAge(member.age);
    setMemberRelationship(member.relationship);
    setHasDisability(member.hasDisability || false);
    setDisabilityType(member.disabilityType || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!memberName.trim() || !memberDoc.trim() || memberAge === '') {
      setFormError('Por favor completa todos los campos del formulario.');
      return;
    }

    if (hasDisability && !disabilityType.trim()) {
      setFormError('Por favor especifica cuál es la discapacidad.');
      return;
    }

    const ageNum = Number(memberAge);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setFormError('Por favor ingresa una edad válida (0 - 120 años).');
      return;
    }

    let updatedList: Inhabitant[] = [];

    if (editingMember) {
      // Edit mode
      updatedList = inhabitants.map(inh => {
        if (inh.id === editingMember.id) {
          return {
            ...inh,
            name: memberName.trim(),
            documentId: memberDoc.trim(),
            age: ageNum,
            relationship: memberRelationship,
            hasDisability,
            disabilityType: hasDisability ? disabilityType.trim() : undefined
          };
        }
        return inh;
      });
      showSuccess('Modificado', 'Los datos del habitante fueron actualizados.');
    } else {
      // Add mode
      const newMember: Inhabitant = {
        id: `inh_${Date.now()}`,
        name: memberName.trim(),
        documentId: memberDoc.trim(),
        age: ageNum,
        relationship: memberRelationship,
        residentLocation: user?.location || 'Sin ubicación',
        hasDisability,
        disabilityType: hasDisability ? disabilityType.trim() : undefined
      };
      updatedList = [newMember, ...inhabitants];
      showSuccess('Registrado', 'El habitante ha sido agregado a tu vivienda con éxito.');
    }

    setInhabitants(updatedList);
    localStorage.setItem('lobbyapp_inhabitants', JSON.stringify(updatedList));
    setIsModalOpen(false);
  };

  const handleDelete = async (memberId: string) => {
    const isConfirmed = await showConfirm(
      '¿Eliminar habitante?',
      '¿Estás seguro de que deseas eliminar este co-habitante de tu vivienda? Esta acción no se puede deshacer.',
      'Sí, eliminar'
    );
    if (isConfirmed) {
      const updated = inhabitants.filter(inh => inh.id !== memberId);
      setInhabitants(updated);
      localStorage.setItem('lobbyapp_inhabitants', JSON.stringify(updated));
      showSuccess('Eliminado', 'El miembro de la vivienda fue removido.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Home className="w-3.5 h-3.5" />
              Mi Vivienda
            </span>
            <h1 className="text-2xl font-extrabold text-white">Mi Hogar y Habitantes</h1>
            <p className="text-slate-400 text-sm mt-1">
              Administra las personas adicionales que viven contigo en tu casa o apartamento ({user?.location}).
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Agregar Habitante
          </button>
        </div>
      </div>

      {/* List of household members */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Integrantes de la Residencia
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
              {myHousehold.length}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myHousehold.length > 0 ? (
            myHousehold.map((member) => (
              <div key={member.id} className="p-5 bg-slate-950/60 border border-slate-800/85 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition relative">
                
                {/* Age alerts (kids / elderly / disability) */}
                <div className="absolute top-4 right-4 flex flex-wrap gap-1 justify-end max-w-[70%]">
                  {member.age < 12 && (
                    <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-bold uppercase rounded-full">
                      Niño/a
                    </span>
                  )}
                  {member.age >= 65 && (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase rounded-full">
                      Adulto Mayor
                    </span>
                  )}
                  {member.hasDisability && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase rounded-full" title={member.disabilityType}>
                      Discapacidad
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {member.relationship}
                    </span>
                    <h4 className="font-extrabold text-slate-200 text-base">{member.name}</h4>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Documento:</span>
                      <span className="text-slate-300 font-semibold tracking-wide">{member.documentId}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Edad:</span>
                      <span className="text-slate-300 font-semibold tracking-wide">{member.age} años</span>
                    </p>
                    {member.hasDisability && (
                      <p className="flex items-center gap-1.5 text-red-400/90 font-medium">
                        <span className="text-slate-550">Discapacidad:</span>
                        <span className="underline decoration-red-500/30">{member.disabilityType || 'Sí'}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(member)}
                    className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="inline-flex items-center gap-1 py-1.5 px-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 hover:text-red-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-sm">No has agregado habitantes adicionales todavía.</p>
              <p className="text-xs text-slate-650 mt-1">Pulsa en "Agregar Habitante" para registrar a tu familia.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Add / Edit Member */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4">
              {editingMember ? 'Editar Datos de Habitante' : 'Agregar Miembro a la Vivienda'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Nombre Completo *</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="ej. Sofía Ruiz"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 placeholder-slate-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Cédula / Documento *</label>
                  <input
                    type="text"
                    value={memberDoc}
                    onChange={(e) => setMemberDoc(e.target.value)}
                    placeholder="ej. 1013456789"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 placeholder-slate-600 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Edad *</label>
                  <input
                    type="number"
                    value={memberAge}
                    onChange={(e) => setMemberAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="ej. 8"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 placeholder-slate-600"
                    required
                    min="0"
                    max="120"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Relación / Parentesco *</label>
                <select
                  value={memberRelationship}
                  onChange={(e) => setMemberRelationship(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                >
                  <option value="Hijo/a">Hijo/a</option>
                  <option value="Cónyuge">Cónyuge</option>
                  <option value="Adulto Mayor">Adulto Mayor</option>
                  <option value="Familiar">Familiar / Pariente</option>
                  <option value="Otro">Otro / Inquilino</option>
                </select>
              </div>

              {/* Disability Checkboxes */}
              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDisability}
                    onChange={(e) => {
                      setHasDisability(e.target.checked);
                      if (!e.target.checked) setDisabilityType('');
                    }}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <span>¿Tiene discapacidad?</span>
                </label>

                {hasDisability && (
                  <div className="space-y-1.5 pl-6 animate-fade-in">
                    <label className="text-xs text-slate-400 uppercase font-semibold">¿Cuál? *</label>
                    <input
                      type="text"
                      value={disabilityType}
                      onChange={(e) => setDisabilityType(e.target.value)}
                      placeholder="ej. Visual, Auditiva, Motriz..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100"
                      required={hasDisability}
                    />
                  </div>
                )}
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg cursor-pointer"
                >
                  {editingMember ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MiHogar;
