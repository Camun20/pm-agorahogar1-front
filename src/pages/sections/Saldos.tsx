import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, Search, Plus, Receipt, ArrowRight,
  TrendingUp, CreditCard, Info, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { addNotification } from '../../utils/notifications';
import { showConfirm, showSuccess } from '../../utils/alerts';

interface BalanceCharge {
  concept: string; // ej. Administración Julio 2026, Parqueadero
  amount: number;
}

interface UserBalance {
  id: string;
  username: string; // link to resident
  residentName: string;
  location: string;
  charges: BalanceCharge[];
  totalBalance: number;
  status: 'Al Día' | 'Pendiente';
  dueDate: string;
}

export const Saldos: React.FC = () => {
  const { user, users } = useAuth();
  const isBillingStaff = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin' || user?.role === 'Accounting';
  
  // States
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');
  const [selectedBalance, setSelectedBalance] = useState<UserBalance | null>(null);

  // Form State
  const [residentUsername, setResidentUsername] = useState('');
  const [residentName, setResidentName] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [pendingAmount, setPendingAmount] = useState<number | ''>('');
  const [month, setMonth] = useState('Enero');
  const [year, setYear] = useState('2026');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_balances');
    const initialBalances: UserBalance[] = [
      {
        id: 'bal_1',
        username: 'resident_usr',
        residentName: 'Diana Carolina Ruiz',
        location: 'Torre 3 - Apto 402',
        charges: [
          { concept: 'Administración Julio 2026', amount: 220000 },
          { concept: 'Intereses de mora', amount: 15000 },
          { concept: 'Reserva Salón Social', amount: 50000 }
        ],
        totalBalance: 285000,
        status: 'Pendiente',
        dueDate: '2026-07-30'
      },
      {
        id: 'bal_2',
        username: 'superadmin_usr',
        residentName: 'Carlos Mendoza',
        location: 'Torre 1 - Apto 101',
        charges: [
          { concept: 'Administración Julio 2026', amount: 220000 }
        ],
        totalBalance: 0,
        status: 'Al Día',
        dueDate: '2026-07-30'
      }
    ];

    if (saved) {
      try {
        setBalances(JSON.parse(saved));
      } catch {
        setBalances(initialBalances);
      }
    } else {
      localStorage.setItem('lobbyapp_balances', JSON.stringify(initialBalances));
      setBalances(initialBalances);
    }
  }, []);

  // Filtered list depending on role
  const filteredBalances = balances.filter(b => {
    // If Resident, only show their own balances
    if (!isBillingStaff && b.username !== user?.username) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      b.residentName.toLowerCase().includes(term) ||
      b.location.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term);

    return matchesSearch;
  });

  const handleRegisterBalance = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!residentUsername.trim() || !residentName.trim() || !locationInput.trim() || !dueDate || !pendingAmount || !attachedFileName.trim()) {
      setFormError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    const amountNum = Number(pendingAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Por favor ingresa un valor de saldo válido mayor a 0.');
      return;
    }

    const conceptStr = `Administración ${month} ${year}`;
    const newBalance: UserBalance = {
      id: `bal_${Date.now()}`,
      username: residentUsername.trim().toLowerCase(),
      residentName: residentName.trim(),
      location: locationInput.trim(),
      charges: [{ concept: conceptStr, amount: amountNum }],
      totalBalance: amountNum,
      status: 'Pendiente',
      dueDate
    };

    // Save statement file in lobbyapp_statements (same document model)
    const statementFileObj = {
      id: `st_${Date.now()}`,
      name: attachedFileName.trim().endsWith('.pdf') || attachedFileName.trim().endsWith('.xlsx') ? attachedFileName.trim() : `${attachedFileName.trim()}.pdf`,
      month: `${month} ${year}`,
      uploadedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileSize: '1.2 MB',
      uploaderName: `${user?.name || 'Administración'} (${user?.role || 'Staff'})`,
      residentLocation: locationInput.trim()
    };

    // Load existing statements
    let statementsList = [];
    const savedStatements = localStorage.getItem('lobbyapp_statements');
    if (savedStatements) {
      try {
        statementsList = JSON.parse(savedStatements);
      } catch (err) {
        statementsList = [];
      }
    }
    statementsList = [statementFileObj, ...statementsList];
    localStorage.setItem('lobbyapp_statements', JSON.stringify(statementsList));

    // Dispatch Resident Notification
    addNotification(
      'Estado de Cuenta Actualizado 💵',
      `Se ha cargado un nuevo cobro de administración por valor de $${newBalance.totalBalance.toLocaleString()} COP. Límite de pago: ${newBalance.dueDate}. Documento adjunto: ${statementFileObj.name}`,
      { location: newBalance.location }
    );

    const updated = [newBalance, ...balances];
    setBalances(updated);
    localStorage.setItem('lobbyapp_balances', JSON.stringify(updated));

    // Reset Form
    setResidentUsername('');
    setResidentName('');
    setLocationInput('');
    setDueDate('');
    setPendingAmount('');
    setMonth('Enero');
    setYear('2026');
    setAttachedFileName('');
    setActiveTab('list');
  };

  // Resident simulator pay balance
  const handlePayBalance = async (balanceId: string) => {
    const isConfirmed = await showConfirm(
      'Simulador PSE 💳',
      '¿Deseas simular la pasarela de pagos PSE para saldar esta cuenta?',
      'Simular Pago'
    );
    if (isConfirmed) {
      const updated = balances.map(b => {
        if (b.id === balanceId) {
          return {
            ...b,
            status: 'Al Día' as const,
            totalBalance: 0
          };
        }
        return b;
      });
      setBalances(updated);
      localStorage.setItem('lobbyapp_balances', JSON.stringify(updated));
      showSuccess('Pago Exitoso', 'Pago procesado con éxito por pasarela PSE.');
      if (selectedBalance?.id === balanceId) {
        setSelectedBalance(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              Contabilidad & Cobros
            </span>
            <h1 className="text-2xl font-extrabold text-white">Estado de Saldos</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isBillingStaff 
                ? 'Monitorea las cuentas de administración pendientes de cobro y carga nuevos saldos.'
                : 'Consulta tus cuotas de administración vigentes y realiza el pago seguro en línea.'}
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
                onClick={() => setActiveTab('register')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-slate-800/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                Registrar Saldo
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'register' && isBillingStaff ? (
        /* Create survey */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-4">Cargar Saldo Residente</h2>
          
          <form onSubmit={handleRegisterBalance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Ubicación / Apto *</label>
                <select
                  value={locationInput}
                  onChange={(e) => {
                    const selectedLoc = e.target.value;
                    setLocationInput(selectedLoc);
                    const matchingRes = users.find(u => u.role === 'Resident' && u.location === selectedLoc);
                    setResidentName(matchingRes ? matchingRes.name : '');
                    setResidentUsername(matchingRes ? matchingRes.username : '');
                  }}
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                >
                  <option value="">-- Selecciona Apartamento --</option>
                  {users.filter(u => u.role === 'Resident' && u.location).map(r => (
                    <option key={r.username} value={r.location}>{r.location}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold block">Nombre del Residente</label>
                <input
                  type="text"
                  value={residentName}
                  readOnly
                  placeholder="Auto-completado"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl outline-none text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Mes and Año selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Mes de Cobro *</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                >
                  {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Año *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                >
                  {['2026', '2027', '2028', '2029', '2030'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valor and Due date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Valor del Saldo ($ COP) *</label>
                <input
                  type="number"
                  placeholder="ej. 250000"
                  value={pendingAmount}
                  onChange={(e) => setPendingAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Fecha Límite Pago *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100 cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Document attachment */}
            <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
              <label className="text-xs text-slate-400 uppercase font-semibold block">Adjuntar Documento de Estado de Cuenta *</label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-between px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-xl cursor-pointer text-slate-400 hover:text-slate-350 text-sm transition">
                  <span className="truncate">{attachedFileName || "Seleccionar archivo del equipo (.pdf, .xlsx)..."}</span>
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400 shrink-0 ml-2" />
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAttachedFileName(file.name);
                      }
                    }}
                    className="hidden"
                    required={!attachedFileName}
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-505">El documento se cargará desde tu equipo y se sincronizará automáticamente con Estados de Cuenta.</p>
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
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                Cargar Cuenta
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cuentas Registradas</h2>
            
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={isBillingStaff ? "Buscar por residente o apartamento..." : "Buscar..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-905 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl placeholder-slate-600 outline-none text-sm transition"
              />
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredBalances.length > 0 ? (
                filteredBalances.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => setSelectedBalance(b)}
                    className={`p-4 bg-slate-900/60 border rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      selectedBalance?.id === b.id ? 'border-indigo-500 bg-slate-900' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
                        b.status === 'Al Día' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-200 text-xs sm:text-sm truncate">{b.residentName}</h4>
                        <p className="text-xxs text-slate-500 truncate">{b.location} — Vence: {b.dueDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-end pl-11 sm:pl-0 shrink-0">
                      <div className="font-bold text-white text-xs sm:text-sm">${b.totalBalance.toLocaleString()}</div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-bold border whitespace-nowrap ${
                        b.status === 'Al Día' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Ningún balance registrado.
                </div>
              )}
            </div>
          </div>

          {/* Details view */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Conceptos de Facturación</h2>
            
            {selectedBalance ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Receipt className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold uppercase">Recibo Detallado</span>
                  </div>
                  <span className="text-xxs font-mono text-slate-500">REF: {selectedBalance.id}</span>
                </div>

                <div className="space-y-2.5">
                  {selectedBalance.charges.map((charge, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-400">{charge.concept}</span>
                      <span className="text-slate-200 font-semibold">${charge.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between text-sm font-bold pt-3 border-t border-slate-800/80">
                    <span className="text-white">TOTAL VENCIDO:</span>
                    <span className="text-indigo-400">${selectedBalance.totalBalance.toLocaleString()}</span>
                  </div>
                </div>

                {selectedBalance.status === 'Pendiente' && !isBillingStaff && (
                  <button
                    onClick={() => handlePayBalance(selectedBalance.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pagar Saldo Seguro (PSE)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/20 border border-slate-850 rounded-2xl text-slate-600 text-xs">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                Selecciona una cuenta de la lista para ver el desglose del cobro y realizar el pago simulado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Saldos;
