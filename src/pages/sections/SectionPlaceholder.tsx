import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, HelpCircle, FileText } from 'lucide-react';

interface SectionPlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
  title,
  description,
  icon,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            {icon || <FileText className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Mock Content area representing actual operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-300 font-semibold">Resumen General</h3>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
              Activo
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Usuario Logueado:</span>
              <span className="text-slate-200 font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Rol:</span>
              <span className="text-slate-200 font-medium">{user?.role}</span>
            </div>
            {user?.location && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ubicación:</span>
                <span className="text-slate-200 font-medium">{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Integration details with S3/DynamoDB */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3 md:col-span-2">
          <h3 className="text-slate-300 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Integración AWS Backend (DynamoDB & S3)
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Esta sección está mapeada para consultar registros en DynamoDB usando la API Gateway configurada y cargar archivos correspondientes (ej: comprobantes, actas, autorizaciones) en el bucket S3 centralizado de la copropiedad.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md font-mono">
              DynamoDB: Table_LobbyApp_{title.replace(/\s+/g, '')}
            </span>
            <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-1 rounded-md font-mono">
              S3: s3://lobbyapp-residents-documents-bucket/{title.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Action / Grid Mock */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-slate-300 font-semibold">Registros y Movimientos Recientes</h3>
          <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
            + Nuevo Registro
          </button>
        </div>
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-800 border border-slate-700/60 flex items-center justify-center rounded-xl mx-auto text-slate-400">
            <HelpCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-slate-200 font-medium">No se encontraron registros activos</h4>
            <p className="text-slate-400 text-xs mt-1">Los datos se cargarán dinámicamente desde DynamoDB una vez iniciada la conexión.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SectionPlaceholder;
