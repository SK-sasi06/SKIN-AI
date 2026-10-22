import React, { useState, useEffect } from 'react';
import {
  Database,
  Users,
  ShieldCheck,
  RefreshCw,
  Search,
  Download,
  Layers,
  Sparkles,
  ExternalLink,
  Terminal,
  Activity,
  ArrowLeft,
  Clock,
  Code,
  Shield,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { fetchDbOverview, fetchTableData, deleteAdminUser, resetAdminUserPassword } from '../services/api';

export default function DatabaseAdminPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'tables' | 'guide'
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Table browser state
  const [selectedTable, setSelectedTable] = useState('users');
  const [tableData, setTableData] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Password visibility & management states
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [submittingReset, setSubmittingReset] = useState(false);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDbOverview();
      setOverview(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  const loadTable = async (tableName) => {
    try {
      setTableLoading(true);
      setSelectedTable(tableName);
      const data = await fetchTableData(tableName, 100, 0);
      setTableData(data);
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    loadTable('users');
  }, []);

  const togglePasswordReveal = (userId) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopyHash = (userId, hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete User Handler
  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to permanently delete User #${user.id} (${user.full_name || user.email})?\n\nThis will cascade and remove all their facial scans, routine logs, and personal data from skincare.db.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await deleteAdminUser(user.id);
      setActionNotice({ type: 'success', message: res.message || `User #${user.id} deleted successfully.` });
      await loadOverview();
      await loadTable(selectedTable);
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to delete user' });
    } finally {
      setLoading(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Reset Password Handler
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPasswordInput.trim()) return;

    if (newPasswordInput.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }

    try {
      setSubmittingReset(true);
      const res = await resetAdminUserPassword(resetModalUser.id, newPasswordInput.trim());
      setActionNotice({ type: 'success', message: res.message || `Password updated for ${resetModalUser.email}` });
      setResetModalUser(null);
      setNewPasswordInput('');
      await loadOverview();
      await loadTable(selectedTable);
    } catch (err) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setSubmittingReset(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Filter rows in table browser
  const filteredRows = (tableData?.rows || []).filter(row => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return Object.values(row).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  // Export current table to CSV
  const handleExportCSV = () => {
    if (!tableData || !tableData.rows || tableData.rows.length === 0) return;
    const headers = tableData.columns.join(',');
    const rows = tableData.rows.map(r => 
      tableData.columns.map(c => {
        let val = r[c];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        const strVal = String(val ?? '').replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedTable}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-dermo-tealDark via-dermo-teal to-teal-800 text-white shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 text-xs font-semibold"
            title="Return to main application"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to App</span>
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-white">Database Administration & Users</h1>
              <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                Private Route: /db
              </span>
            </div>
            <p className="text-xs text-white/80 font-mono mt-1">
              {overview?.db_path || 'backend/database/skincare.db'} &bull; {overview?.db_size_formatted || '2.44 MB'} &bull; SQLite {overview?.sqlite_version || '3.x'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadOverview();
              loadTable(selectedTable);
            }}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all flex items-center gap-2 border border-white/20 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Success / Error Notification Toast */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in ${
          actionNotice.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <span>{actionNotice.message}</span>
          <button onClick={() => setActionNotice(null)} className="p-1 text-stone-400 hover:text-stone-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-dermo-teal shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-dermo-charcoal leading-none">
              {overview?.total_users || 0}
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">Total Users Registered</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-dermo-charcoal leading-none">
              {overview?.users?.length || 0}
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">Active Accounts</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-dermo-charcoal leading-none">
              {overview?.table_stats?.analysis_reports || 0}
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">Facial Scans Stored</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-600 shrink-0">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-dermo-charcoal leading-none">
              {overview?.table_stats?.products || 1472}
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">Sephora Products</div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-dermo-warm pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-dermo-teal text-dermo-teal bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-stone-500 hover:text-dermo-charcoal'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users & Logins ({overview?.total_users || 0})
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'tables'
              ? 'border-dermo-teal text-dermo-teal bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-stone-500 hover:text-dermo-charcoal'
          }`}
        >
          <Database className="w-4 h-4" />
          All Database Tables Explorer
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'guide'
              ? 'border-dermo-teal text-dermo-teal bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-stone-500 hover:text-dermo-charcoal'
          }`}
        >
          <Terminal className="w-4 h-4" />
          External DB UI & Tools Guide
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* =========================================================================
          TAB 1: USERS & LOGIN ACTIVITY (With View Password & Delete User)
      ========================================================================= */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif font-bold text-lg text-dermo-charcoal">
                Registered Users & Live Login Status
              </h2>
              <p className="text-xs text-stone-500">
                Manage accounts registered in SQLite. View passwords/hashes, reset user passwords, or delete accounts permanently.
              </p>
            </div>
            <div className="text-xs font-semibold text-dermo-teal bg-dermo-sand px-3 py-1 rounded-full border border-dermo-warm self-start">
              {overview?.total_users || 0} Registered User Accounts
            </div>
          </div>

          <div className="rounded-2xl border border-dermo-warm overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-dermo-cream border-b border-dermo-warm text-dermo-charcoal font-bold">
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">User Profile</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Password / Hash</th>
                    <th className="p-3.5">Registered On</th>
                    <th className="p-3.5">Last Login Time</th>
                    <th className="p-3.5 text-center">Scans</th>
                    <th className="p-3.5 text-center">Routines</th>
                    <th className="p-3.5 text-center">Shelf Items</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dermo-warm/70">
                  {(overview?.users || []).map((u) => {
                    const isRevealed = revealedPasswords[u.id];
                    const isCopied = copiedId === u.id;
                    const isDemo = u.email === 'demo@alskincare.ai';

                    return (
                      <tr key={u.id} className="hover:bg-dermo-sand/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-stone-400">#{u.id}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-dermo-teal text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                              {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-dermo-charcoal block">{u.full_name || 'Anonymous User'}</span>
                              <span className="text-[10px] text-stone-400 font-mono">ID: {u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-stone-600">{u.email}</td>

                        {/* Password / Hash Column with Toggle View */}
                        <td className="p-3.5 max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                              <span className="font-mono text-[11px] text-stone-700 truncate max-w-[140px]">
                                {isRevealed ? (u.hashed_password || 'No hash recorded') : '••••••••••••••••'}
                              </span>

                              <button
                                onClick={() => togglePasswordReveal(u.id)}
                                className="p-0.5 text-stone-500 hover:text-dermo-teal transition-colors"
                                title={isRevealed ? "Hide Password Hash" : "View Password Hash"}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>

                              {isRevealed && u.hashed_password && (
                                <button
                                  onClick={() => handleCopyHash(u.id, u.hashed_password)}
                                  className="p-0.5 text-stone-500 hover:text-dermo-teal transition-colors ml-0.5"
                                  title="Copy Bcrypt Hash"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>

                            {isDemo && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                                Default: demo123
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 text-stone-500 whitespace-nowrap">{u.created_at}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            {u.last_login || u.created_at}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-dermo-teal">{u.scan_count}</td>
                        <td className="p-3.5 text-center font-bold text-purple-700">{u.routine_count}</td>
                        <td className="p-3.5 text-center font-bold text-amber-700">{u.shelf_count}</td>

                        {/* Actions: Reset Password & Delete User */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setNewPasswordInput('');
                              }}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-dermo-teal border border-stone-200 transition-all"
                              title="Set new password for this user"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 transition-all"
                              title="Permanently delete user and cascade records"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TABLES EXPLORER
      ========================================================================= */}
      {activeTab === 'tables' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'users', label: 'users' },
                { id: 'analysis_reports', label: 'analysis_reports' },
                { id: 'daily_routines', label: 'daily_routines' },
                { id: 'user_products', label: 'user_products' },
                { id: 'skin_reactions', label: 'skin_reactions' },
                { id: 'products', label: 'products' }
              ].map((tbl) => (
                <button
                  key={tbl.id}
                  onClick={() => loadTable(tbl.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTable === tbl.id
                      ? 'bg-dermo-teal text-white shadow-xs'
                      : 'bg-dermo-sand/60 border border-dermo-warm text-stone-600 hover:bg-dermo-sand'
                  }`}
                >
                  {tbl.label} ({overview?.table_stats?.[tbl.id] ?? '...'})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Search ${selectedTable}...`}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-dermo-warm bg-white text-xs focus:outline-none focus:ring-1 focus:ring-dermo-teal"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-dermo-sand hover:bg-dermo-warm text-xs font-semibold text-dermo-charcoal flex items-center gap-1.5 border border-dermo-warm shadow-2xs"
                title="Export current table to CSV file"
              >
                <Download className="w-3.5 h-3.5 text-dermo-teal" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-dermo-warm overflow-hidden shadow-2xs">
            {tableLoading ? (
              <div className="p-16 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-dermo-teal" />
                Loading {selectedTable} table rows...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="p-16 text-center text-xs text-stone-400">
                No records found in {selectedTable} table.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-dermo-cream border-b border-dermo-warm z-10">
                    <tr>
                      {(tableData?.columns || []).map((col) => (
                        <th key={col} className="p-3 font-bold text-dermo-charcoal uppercase tracking-wider text-[11px] whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dermo-warm/70">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-dermo-sand/30 transition-colors">
                        {(tableData?.columns || []).map((col) => {
                          const val = row[col];
                          const isJson = typeof val === 'string' && (val.startsWith('{') || val.startsWith('['));
                          return (
                            <td key={col} className="p-3 font-mono text-[11px] text-stone-700 max-w-xs truncate">
                              {isJson ? (
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px]">
                                  JSON ({val.length} chars)
                                </span>
                              ) : (
                                String(val ?? 'NULL')
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-dermo-warm/60">
            <span>Showing {filteredRows.length} of {tableData?.total_count || 0} rows in <span className="font-bold text-dermo-teal">"{selectedTable}"</span></span>
            <span>Raw SQLite table data with full column schema</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: EXTERNAL TOOLS GUIDE
      ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-6">
          <div>
            <h2 className="font-serif font-bold text-lg text-dermo-charcoal">
              External Database GUI Tools & Terminal Access
            </h2>
            <p className="text-xs text-stone-500">
              In addition to this web route (<span className="font-mono text-dermo-teal font-semibold">/db</span>), you can inspect and query the SQLite database directly using any of these 3 developer tools:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-dermo-cream border border-dermo-warm space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-dermo-charcoal">1. VS Code SQLite Viewer Extension</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Install the extension <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-dermo-warm text-dermo-teal">SQLite Viewer</span>. Then click directly on:
              </p>
              <div className="p-2.5 rounded-xl bg-white font-mono text-[11px] text-dermo-charcoal break-all border border-dermo-warm">
                backend/database/skincare.db
              </div>
              <p className="text-[11px] text-stone-500">
                It opens a visual spreadsheet tab right inside your code editor with zero configuration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dermo-cream border border-dermo-warm space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-dermo-charcoal">2. DB Browser for SQLite (Desktop App)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Free open-source desktop app for Windows to run raw SQL queries, browse data, and edit records visually.
              </p>
              <a
                href="https://sqlitebrowser.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-dermo-teal hover:underline"
              >
                Download sqlitebrowser.org <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[11px] text-stone-500">
                Click File &gt; Open Database &gt; select <span className="font-mono">skincare.db</span>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dermo-cream border border-dermo-warm space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-dermo-charcoal">3. Terminal Command Line</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Run this command in your PowerShell terminal to print registered users and counts:
              </p>
              <div className="p-2.5 rounded-xl bg-stone-900 text-stone-200 font-mono text-[10px] break-all">
                .\.venv\Scripts\python.exe backend/scratch_check_db.py
              </div>
              <p className="text-[11px] text-stone-500">
                Instantly prints user list, emails, and table row counts to stdout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RESET USER PASSWORD
      ========================================================================= */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-dermo-warm shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-dermo-teal">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-dermo-charcoal">Change User Password</h3>
                  <p className="text-xs text-stone-500">Setting new bcrypt hash in database</p>
                </div>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-dermo-sand/60 border border-dermo-warm text-xs space-y-1">
                <div className="text-stone-500">User Account:</div>
                <div className="font-bold text-dermo-charcoal">{resetModalUser.full_name || 'Anonymous User'}</div>
                <div className="font-mono text-stone-600">{resetModalUser.email}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dermo-charcoal block">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter new plain-text password..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm text-xs font-mono focus:outline-none focus:ring-2 focus:ring-dermo-teal bg-white"
                />
                <p className="text-[10px] text-stone-400">
                  Password will be securely hashed with bcrypt salt rounds before writing to <span className="font-mono">skincare.db</span>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReset || !newPasswordInput.trim()}
                  className="px-5 py-2 rounded-xl bg-dermo-teal text-white text-xs font-bold hover:bg-dermo-tealDark transition-all disabled:opacity-50 shadow-xs"
                >
                  {submittingReset ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
