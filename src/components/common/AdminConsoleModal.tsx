import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AIRPORT_PROFILE } from '../../data/kpiLibrary';
import { exportToCsv } from '../../utils/exportUtils';
import { 
  X, 
  Settings, 
  Building, 
  Clock, 
  Coins, 
  Download, 
  Upload, 
  Save, 
  CheckCircle2,
  Scale,
  FileCheck,
  Shield
} from 'lucide-react';

interface AdminConsoleModalProps {
  onClose: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'standards' | 'bulk'>('profile');

  // Editable Airport Profile State
  const [airportName, setAirportName] = useState(AIRPORT_PROFILE.name);
  const [timeZone, setTimeZone] = useState(AIRPORT_PROFILE.timeZone);
  const [currency, setCurrency] = useState(AIRPORT_PROFILE.currency);
  const [annualPax, setAnnualPax] = useState(AIRPORT_PROFILE.currentAnnualPax);
  const [operatingHours, setOperatingHours] = useState(AIRPORT_PROFILE.operatingHours);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Regulated Standards State
  const [standards, setStandards] = useState([
    { id: 'STD-01', name: 'Security Queue Wait Time (P90)', threshold: '10.0 min', source: 'AERA Regulated Benchmark', penalty: '₹150,000 / breach' },
    { id: 'STD-02', name: 'First Baggage on Reclaim Carousel', threshold: '12.0 min', source: 'IATA Airline SLA Standard', penalty: '₹80,000 / breach' },
    { id: 'STD-03', name: 'PRM Passenger Notification Response', threshold: '98.0%', source: 'DGCA CAR Section 3 Standard', penalty: 'Statutory Notice' },
    { id: 'STD-04', name: 'Terminal Restroom Cleanliness Index', threshold: '4.5 / 5.0', source: 'ACI ASQ Benchmark Standard', penalty: 'Concession Rebate' }
  ]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportStandards = () => {
    const headers = ['Standard ID', 'Standard Name', 'Mandated Benchmark', 'Source Authority', 'Non-Compliance Exposure'];
    const rows = standards.map(s => [s.id, s.name, s.threshold, s.source, s.penalty]);
    exportToCsv('AIONOS_ZZA_Regulated_Service_Standards', headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Airport Reference Data & Configuration Admin</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                  FR-5 Admin UI · cfg Schema
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure airport conventions, operating profiles, and service-standard SLAs without releases
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white dark:bg-cyan-600 shadow-xs'
                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Airport Profile (cfg_airport_profile)
            </button>
            <button
              onClick={() => setActiveTab('standards')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                activeTab === 'standards'
                  ? 'bg-slate-900 text-white dark:bg-cyan-600 shadow-xs'
                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Service Standards (cfg_service_standard)
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                activeTab === 'bulk'
                  ? 'bg-slate-900 text-white dark:bg-cyan-600 shadow-xs'
                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Bulk CSV Import / Export
            </button>
          </div>

          {savedSuccess && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Config Saved & Versioned</span>
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* Tab 1: Airport Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Airport Formal Name
                </label>
                <input
                  type="text"
                  value={airportName}
                  onChange={(e) => setAirportName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Operating Time Zone
                  </label>
                  <input
                    type="text"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Financial Currency Token
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Annual Handled Capacity (Pax)
                  </label>
                  <input
                    type="number"
                    value={annualPax}
                    onChange={(e) => setAnnualPax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Operating Hours Convention
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-white shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Airport Conventions</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Regulated Standards */}
          {activeTab === 'standards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Regulated and contractual benchmarks from AERA and airline ground agreements
                </span>
                <button
                  onClick={handleExportStandards}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Standards CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Standard Name</th>
                      <th className="px-3 py-2">Benchmark SLA</th>
                      <th className="px-3 py-2">Source Authority</th>
                      <th className="px-3 py-2">Penalty / Exposure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {standards.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-2 font-bold text-cyan-500">{s.id}</td>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{s.name}</td>
                        <td className="px-3 py-2 font-bold">{s.threshold}</td>
                        <td className="px-3 py-2 text-slate-400">{s.source}</td>
                        <td className="px-3 py-2 text-rose-500">{s.penalty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Bulk CSV Import / Export */}
          {activeTab === 'bulk' && (
            <div className="space-y-4 max-w-xl">
              <p className="text-slate-600 dark:text-slate-400">
                Bulk export or update reference configurations with CSV templates matching the AIONOS 54 fact and 26 dimensional models:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <button
                  onClick={() => alert('Downloading cfg_airport_profile CSV template...')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-cyan-500 text-left"
                >
                  <div className="font-bold text-slate-900 dark:text-white">cfg_airport_profile</div>
                  <div className="text-[10px] text-slate-400 mt-1">Download CSV schema</div>
                </button>

                <button
                  onClick={() => alert('Downloading cfg_delay_code_map CSV template...')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-cyan-500 text-left"
                >
                  <div className="font-bold text-slate-900 dark:text-white">cfg_delay_code_map</div>
                  <div className="text-[10px] text-slate-400 mt-1">IATA AHM delay categories</div>
                </button>

                <button
                  onClick={() => alert('Downloading cfg_asset_class CSV template...')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-cyan-500 text-left"
                >
                  <div className="font-bold text-slate-900 dark:text-white">cfg_asset_class</div>
                  <div className="text-[10px] text-slate-400 mt-1">Criticality weights table</div>
                </button>

                <button
                  onClick={() => alert('Downloading cfg_kpi_department_map CSV template...')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-cyan-500 text-left"
                >
                  <div className="font-bold text-slate-900 dark:text-white">cfg_kpi_department_map</div>
                  <div className="text-[10px] text-slate-400 mt-1">Role tile template mappings</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
