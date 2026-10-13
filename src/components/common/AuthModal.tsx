import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  UserCheck, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Users,
  Search
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { allRoles, currentUser, switchRoleById } = useAuth();
  const [search, setSearch] = useState('');

  const filteredRoles = allRoles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Airport RBAC Persona Switcher
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between any of the 24 seeded roles to test department views, RLS, and permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by persona name or department..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Roles Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRoles.map(r => {
            const isSelected = currentUser.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  switchRoleById(r.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-medium">
                      {r.department}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {r.name}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div>
                    Scope: <strong className="text-slate-700 dark:text-slate-300 font-mono">{r.scopeType} {r.scopeValue ? `(${r.scopeValue})` : ''}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    {r.canViewUnmaskedPii && <span className="text-emerald-500 font-medium">PII Visible</span>}
                    {r.canViewTenantRevenue && <span className="text-cyan-500 font-medium">Revenue Unmasked</span>}
                    {r.canEditTargets !== 'none' && <span className="text-amber-500 font-medium">Targets: {r.canEditTargets}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
