import React from 'react';
import SectionPlaceholder from './SectionPlaceholder';
import { 
  ClipboardList, Users, Truck, DollarSign, FileSpreadsheet, 
  HelpCircle, Presentation, FolderGit, Ban, 
  Lightbulb, Car, CalendarDays, Archive 
} from 'lucide-react';

export const Encuestas: React.FC = () => (
  <SectionPlaceholder 
    title="Encuestas de Copropietarios" 
    description="Participa en las decisiones del conjunto. Vota en encuestas activas y consulta resultados históricos."
    icon={<ClipboardList className="w-8 h-8" />}
  />
);

export const Visitantes: React.FC = () => (
  <SectionPlaceholder 
    title="Registro de Visitantes" 
    description="Monitorea y pre-autoriza el ingreso de visitas, familiares y contratistas a tu unidad."
    icon={<Users className="w-8 h-8" />}
  />
);

export const Domicilios: React.FC = () => (
  <SectionPlaceholder 
    title="Control de Domicilios" 
    description="Registra entregas de correspondencia, domiciliarios autorizados y paquetes recibidos en portería."
    icon={<Truck className="w-8 h-8" />}
  />
);

export const Saldos: React.FC = () => (
  <SectionPlaceholder 
    title="Mis Saldos" 
    description="Consulta saldos de administración pendientes, pagos realizados e historial de transacciones."
    icon={<DollarSign className="w-8 h-8" />}
  />
);

export const EstadosCuenta: React.FC = () => (
  <SectionPlaceholder 
    title="Estados de Cuenta" 
    description="Descarga estados de cuenta mensuales generados directamente desde el sistema de contabilidad."
    icon={<FileSpreadsheet className="w-8 h-8" />}
  />
);

export const PQRS: React.FC = () => (
  <SectionPlaceholder 
    title="PQRS (Peticiones, Quejas, Reclamos y Sugerencias)" 
    description="Crea peticiones o reporta incidencias y haz seguimiento en tiempo real al estado de respuesta."
    icon={<HelpCircle className="w-8 h-8" />}
  />
);

export const Cartelera: React.FC = () => (
  <SectionPlaceholder 
    title="Cartelera Informativa" 
    description="Mantente informado con los comunicados oficiales de la administración, circulares y eventos."
    icon={<Presentation className="w-8 h-8" />}
  />
);

export const Documentos: React.FC = () => (
  <SectionPlaceholder 
    title="Documentos y Reglamento" 
    description="Descarga reglamentos internos, manuales de convivencia, actas de asamblea y documentos de S3."
    icon={<FolderGit className="w-8 h-8" />}
  />
);

export const Sanciones: React.FC = () => (
  <SectionPlaceholder 
    title="Sanciones y Multas" 
    description="Historial de sanciones asociadas a la unidad de vivienda por incumplimiento de convivencia."
    icon={<Ban className="w-8 h-8" />}
  />
);

export const RecibosPublicos: React.FC = () => (
  <SectionPlaceholder 
    title="Servicios Públicos y Comprobantes" 
    description="Gestión y registro de lecturas de agua, luz de áreas comunes y comprobantes de servicios del edificio."
    icon={<Lightbulb className="w-8 h-8" />}
  />
);

export const Parqueadero: React.FC = () => (
  <SectionPlaceholder 
    title="Asignación de Parqueaderos" 
    description="Consulta el estado de parqueaderos asignados a residentes y reservas de parqueaderos de visitantes."
    icon={<Car className="w-8 h-8" />}
  />
);

export const Reservas: React.FC = () => (
  <SectionPlaceholder 
    title="Reservas de Áreas Comunes" 
    description="Reserva salones sociales, BBQ, canchas y gimnasio con agenda interactiva integrada."
    icon={<CalendarDays className="w-8 h-8" />}
  />
);

export const Mudanzas: React.FC = () => (
  <SectionPlaceholder 
    title="Programación de Mudanzas" 
    description="Solicita y programa fechas y horarios de mudanza para mantener el orden y seguridad en las torres."
    icon={<Archive className="w-8 h-8" />}
  />
);
