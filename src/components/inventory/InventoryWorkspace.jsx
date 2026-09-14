import React, { useState } from 'react';
import {
  Boxes, Package, MapPin, Layers, ArrowRightLeft, TrendingUp, AlertTriangle,
  Plus, RefreshCw, Search, Filter, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft,
  Building, ShieldCheck, Tag, DollarSign, Activity, FileSpreadsheet, BookmarkCheck
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import ItemMasterModal from './ItemMasterModal';
import LocationModal from './LocationModal';
import StockTransactionModal from './StockTransactionModal';
import ReservationModal from './ReservationModal';
import ReleaseReservationModal from './ReleaseReservationModal';

export default function InventoryWorkspace({ isDarkMode }) {
  const {
    items,
    locations,
    stockBalances,
    transactions,
    reservations,
    isLoading,
    metrics,
    getCurrentStock,
    getReservedStock,
    getAvailableStock,
    refreshAllInventory,
    isManagementOrAdmin
  } = useInventory();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'items' | 'locations' | 'stock' | 'transactions' | 'reservations'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterReservationStatus, setFilterReservationStatus] = useState('');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('RECEIPT');
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedReservationToRelease, setSelectedReservationToRelease] = useState(null);

  // Styling helper classes
  const tBg = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const tCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const tInput = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-sm';
  const tMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const openTransactionModal = (type = 'RECEIPT') => {
    setTxModalType(type);
    setIsTxModalOpen(true);
  };

  // Filtered items
  const filteredItems = items.filter(i => {
    const matchSearch = !searchQuery || i.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) || i.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !filterCategory || i.category === filterCategory;
    const matchType = !filterType || i.item_type === filterType;
    return matchSearch && matchCategory && matchType;
  });

  // Unique categories
  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${tBg}`}>
      {/* Top Header Bar */}
      <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Inventory Management</h1>
            <p className={`text-xs ${tMuted}`}>Authoritative stock balance tracking, item master, and material movements</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refreshAllInventory()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors text-slate-300"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => openTransactionModal('RECEIPT')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Receipt
          </button>

          <button
            onClick={() => openTransactionModal('ISSUE')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Issue
          </button>

          <button
            onClick={() => openTransactionModal('TRANSFER')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
          </button>

          <button
            onClick={() => openTransactionModal('CONSUMPTION')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" /> Consumption
          </button>

          <button
            onClick={() => setIsReservationModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-colors flex items-center gap-1.5"
          >
            <BookmarkCheck className="w-3.5 h-3.5" /> Reserve Stock
          </button>

          <button
            onClick={() => setIsItemModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Item
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`px-6 border-b flex items-center gap-6 overflow-x-auto shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'items', label: 'Item Master', icon: Package, count: items.length },
          { id: 'locations', label: 'Locations', icon: MapPin, count: locations.length },
          { id: 'stock', label: 'Stock On Hand', icon: Boxes, count: stockBalances.length },
          { id: 'reservations', label: 'Reservations & Allocation', icon: BookmarkCheck, count: reservations.length },
          { id: 'transactions', label: 'Transactions History', icon: ArrowRightLeft, count: transactions.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-xl border ${tCard} flex items-center justify-between`}>
                <div>
                  <p className={`text-xs font-medium ${tMuted}`}>Total Item Masters</p>
                  <p className="text-2xl font-bold mt-1">{metrics.totalItems}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-5 rounded-xl border ${tCard} flex items-center justify-between`}>
                <div>
                  <p className={`text-xs font-medium ${tMuted}`}>Stock Locations</p>
                  <p className="text-2xl font-bold mt-1">{metrics.totalLocations}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-5 rounded-xl border ${tCard} flex items-center justify-between`}>
                <div>
                  <p className={`text-xs font-medium ${tMuted}`}>Total Stock Valuation</p>
                  <p className="text-2xl font-bold mt-1 font-mono">
                    ₹{metrics.totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-5 rounded-xl border ${tCard} flex items-center justify-between`}>
                <div>
                  <p className={`text-xs font-medium ${tMuted}`}>Low Stock Alerts</p>
                  <p className={`text-2xl font-bold mt-1 ${metrics.lowStockCount > 0 ? 'text-rose-500' : 'text-slate-200'}`}>
                    {metrics.lowStockCount}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${metrics.lowStockCount > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-400'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Dashboard Quick Movements + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Transaction Launcher Card */}
              <div className={`p-6 rounded-xl border ${tCard} space-y-4`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" /> Quick Stock Movements
                </h3>
                <p className={`text-xs ${tMuted}`}>Select a transaction flow to record material receipt, issue, transfer, or consumption.</p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => openTransactionModal('RECEIPT')}
                    className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <ArrowDownLeft className="w-5 h-5" />
                    <span>Stock Receipt</span>
                  </button>

                  <button
                    onClick={() => openTransactionModal('ISSUE')}
                    className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    <span>Stock Issue</span>
                  </button>

                  <button
                    onClick={() => openTransactionModal('TRANSFER')}
                    className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    <span>Stock Transfer</span>
                  </button>

                  <button
                    onClick={() => openTransactionModal('CONSUMPTION')}
                    className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <Activity className="w-5 h-5" />
                    <span>Consumption</span>
                  </button>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className={`p-6 rounded-xl border lg:col-span-2 ${tCard} space-y-4`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Recent Transactions
                  </h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-amber-500 font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {metrics.recentTransactions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No transactions recorded yet. Click "Stock Receipt" or "Opening Stock" to post data.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {metrics.recentTransactions.map(tx => (
                      <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono ${
                            tx.transaction_type === 'RECEIPT' || tx.transaction_type === 'OPENING' ? 'bg-emerald-500/20 text-emerald-400' :
                            tx.transaction_type === 'ISSUE' || tx.transaction_type === 'CONSUMPTION' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {tx.transaction_type}
                          </span>
                          <div>
                            <p className="font-semibold">{tx.transaction_no || tx.reference_no || 'TX'}</p>
                            <p className={`text-[11px] ${tMuted}`}>
                              {new Date(tx.transaction_date).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-mono font-medium">
                            {tx.lines?.length || 0} Item line(s)
                          </p>
                          <p className={`text-[11px] ${tMuted}`}>
                            {(tx.from_location?.code || 'External')} → {(tx.to_location?.code || 'External')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. ITEM MASTER TAB */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by Item Code or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${tInput}`}
                  />
                </div>

                {categories.length > 0 && (
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`px-3 py-2 text-xs rounded-lg border ${tInput}`}
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>

              <button
                onClick={() => setIsItemModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New Item Master
              </button>
            </div>

            {/* Items Table */}
            <div className={`rounded-xl border overflow-hidden ${tCard}`}>
              <table className="w-full text-left text-xs">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-700 font-semibold border-b border-slate-200'}>
                  <tr>
                    <th className="p-3.5">Item Code</th>
                    <th className="p-3.5">Item Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">UOM</th>
                    <th className="p-3.5">HSN/SAC</th>
                    <th className="p-3.5 text-right">Reorder Level</th>
                    <th className="p-3.5 text-right">Reorder Qty</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                        No item master records found.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="p-3.5 font-mono font-bold text-amber-500">{item.item_code}</td>
                        <td className="p-3.5 font-semibold">
                          {item.name}
                          {item.description && (
                            <p className={`text-[11px] font-normal ${tMuted} truncate max-w-xs`}>{item.description}</p>
                          )}
                        </td>
                        <td className="p-3.5">{item.category || 'General'}</td>
                        <td className="p-3.5 capitalize">{item.item_type?.replace('_', ' ')}</td>
                        <td className="p-3.5 font-mono font-semibold">{item.base_uom_code}</td>
                        <td className="p-3.5 font-mono">{item.hsn_sac_code || '--'}</td>
                        <td className="p-3.5 text-right font-mono">{item.reorder_level || 0}</td>
                        <td className="p-3.5 text-right font-mono">{item.reorder_quantity || 0}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className={`text-xs ${tMuted}`}>Manage physical warehouses, site stores, and virtual tracking locations</p>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Location
              </button>
            </div>

            <div className={`rounded-xl border overflow-hidden ${tCard}`}>
              <table className="w-full text-left text-xs">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-700 font-semibold border-b border-slate-200'}>
                  <tr>
                    <th className="p-3.5">Location Code</th>
                    <th className="p-3.5">Location Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Parent Location</th>
                    <th className="p-3.5 text-center">Holds Stock</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        No locations configured yet.
                      </td>
                    </tr>
                  ) : (
                    locations.map(loc => {
                      const parent = locations.find(p => p.id === loc.parent_location_id);
                      return (
                        <tr key={loc.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                          <td className="p-3.5 font-mono font-bold text-amber-500">{loc.code}</td>
                          <td className="p-3.5 font-semibold">{loc.name}</td>
                          <td className="p-3.5">{loc.location_type}</td>
                          <td className="p-3.5 text-slate-400">{parent ? `${parent.code} - ${parent.name}` : '--'}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              loc.is_stock_location ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {loc.is_stock_location ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              loc.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {loc.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. STOCK ON HAND TAB */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className={`text-xs ${tMuted}`}>Authoritative stock balances calculated by atomic Supabase RPCs</p>
            </div>

            <div className={`rounded-xl border overflow-hidden ${tCard}`}>
              <table className="w-full text-left text-xs">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-700 font-semibold border-b border-slate-200'}>
                  <tr>
                    <th className="p-3.5">Item Code</th>
                    <th className="p-3.5">Item Name</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Lot / Batch</th>
                    <th className="p-3.5 text-right">Physical Stock</th>
                    <th className="p-3.5 text-right">Reserved Qty</th>
                    <th className="p-3.5 text-right">Available Stock</th>
                    <th className="p-3.5 text-right">Avg Unit Cost (₹)</th>
                    <th className="p-3.5 text-right">Total Value (₹)</th>
                    <th className="p-3.5 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {stockBalances.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500 text-xs">
                        No stock balances recorded. Perform a Stock Receipt or Opening Stock transaction.
                      </td>
                    </tr>
                  ) : (
                    stockBalances.map(bal => {
                      const item = bal.item || items.find(i => i.id === bal.item_id);
                      const loc = bal.location || locations.find(l => l.id === bal.location_id);
                      const stockVal = Number(bal.quantity_on_hand || 0) * Number(bal.average_unit_cost || 0);
                      const reserved = getReservedStock(bal.item_id, bal.location_id, bal.lot_number);
                      const available = getAvailableStock(bal.item_id, bal.location_id, bal.lot_number);

                      return (
                        <tr key={bal.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                          <td className="p-3.5 font-mono font-bold text-amber-500">{item?.item_code || 'ITEM'}</td>
                          <td className="p-3.5 font-semibold">{item?.name || 'Item'}</td>
                          <td className="p-3.5 font-mono">{loc ? `${loc.code} (${loc.name})` : 'Location'}</td>
                          <td className="p-3.5 font-mono text-slate-400">{bal.lot_number || '--'}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-100">
                            {bal.quantity_on_hand} {item?.base_uom_code || ''}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                            {reserved}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                            {available}
                          </td>
                          <td className="p-3.5 text-right font-mono">
                            ₹{Number(bal.average_unit_cost || 0).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold">
                            ₹{stockVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-right text-slate-400">
                            {new Date(bal.updated_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. RESERVATIONS & ALLOCATION TAB */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className={`text-xs ${tMuted}`}>
                Active and historical material allocations against Sales Orders (does not reduce physical stock)
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select
                  value={filterReservationStatus}
                  onChange={(e) => setFilterReservationStatus(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-lg border ${tInput}`}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="partially_released">Partially Released</option>
                  <option value="released">Released</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => setIsReservationModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-600 text-white shadow-md transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Create Reservation
                </button>
              </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${tCard}`}>
              <table className="w-full text-left text-xs">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-700 font-semibold border-b border-slate-200'}>
                  <tr>
                    <th className="p-3.5">Reservation No.</th>
                    <th className="p-3.5">Sales Order</th>
                    <th className="p-3.5">Line Allocation Details</th>
                    <th className="p-3.5 text-right">Requested Qty</th>
                    <th className="p-3.5 text-right">Reserved Qty</th>
                    <th className="p-3.5 text-right">Released Qty</th>
                    <th className="p-3.5 text-right">Remaining Reserved</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Created Date</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {reservations
                    .filter(r => !filterReservationStatus || (r.status || 'active').toLowerCase() === filterReservationStatus.toLowerCase())
                    .length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500 text-xs">
                        No inventory reservations found. Click "Create Reservation" to allocate stock.
                      </td>
                    </tr>
                  ) : (
                    reservations
                      .filter(r => !filterReservationStatus || (r.status || 'active').toLowerCase() === filterReservationStatus.toLowerCase())
                      .map(res => {
                        const statusLower = (res.status || 'active').toLowerCase();
                        let totalReq = 0;
                        let totalRes = 0;
                        let totalRel = 0;
                        let totalRem = 0;

                        (res.lines || []).forEach(l => {
                          const req = Number(l.requested_quantity || l.reserved_quantity || l.quantity) || 0;
                          const rsv = Number(l.reserved_quantity || l.quantity) || 0;
                          const rel = Number(l.released_quantity) || 0;
                          const rem = Math.max(0, rsv - rel);
                          totalReq += req;
                          totalRes += rsv;
                          totalRel += rel;
                          totalRem += rem;
                        });

                        return (
                          <tr key={res.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                            <td className="p-3.5 font-mono font-bold text-sky-400">
                              {res.reservation_number || res.code || `RES-${res.id.slice(0, 6)}`}
                            </td>

                            <td className="p-3.5">
                              <p className="font-semibold">{res.sales_order?.sales_order_number || res.sales_order?.order_number || 'Sales Order'}</p>
                              <p className={`text-[11px] ${tMuted}`}>{res.sales_order?.customer_name || 'Customer'}</p>
                            </td>

                            <td className="p-3.5">
                              {(res.lines || []).map((l, idx) => (
                                <div key={l.id || idx} className="text-[11px] mb-1">
                                  <span className="font-semibold text-slate-200">{l.item?.name || l.sales_order_item?.item_description || 'Item'}</span>
                                  <span className={`text-[10px] block ${tMuted} font-mono`}>
                                    Loc: {l.location?.code || 'Warehouse'} {l.lot_number ? `• Lot: ${l.lot_number}` : ''}
                                  </span>
                                </div>
                              ))}
                            </td>

                            <td className="p-3.5 text-right font-mono font-bold text-slate-300">{totalReq}</td>
                            <td className="p-3.5 text-right font-mono font-bold text-blue-400">{totalRes}</td>
                            <td className="p-3.5 text-right font-mono text-slate-400">{totalRel}</td>
                            <td className="p-3.5 text-right font-mono font-bold text-amber-400">{totalRem}</td>

                            <td className="p-3.5 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                statusLower === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                statusLower === 'partially_released' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                statusLower === 'released' ? 'bg-slate-800 text-slate-400' :
                                statusLower === 'fulfilled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                {statusLower.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="p-3.5 text-right text-slate-400 text-[11px]">
                              {new Date(res.created_at).toLocaleDateString()}
                            </td>

                            <td className="p-3.5 text-center">
                              {totalRem > 0 && statusLower !== 'released' && statusLower !== 'cancelled' ? (
                                <button
                                  onClick={() => {
                                    setSelectedReservationToRelease(res);
                                    setIsReleaseModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                                >
                                  Release
                                </button>
                              ) : (
                                <span className="text-slate-600 text-[11px]">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. TRANSACTIONS HISTORY TAB */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className={`text-xs ${tMuted}`}>Audited transactional log of all material movements</p>
              <button
                onClick={() => openTransactionModal('RECEIPT')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Transaction
              </button>
            </div>

            <div className={`rounded-xl border overflow-hidden ${tCard}`}>
              <table className="w-full text-left text-xs">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-700 font-semibold border-b border-slate-200'}>
                  <tr>
                    <th className="p-3.5">Tx No. / Ref</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">Items & Quantities</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="p-3.5 font-mono font-bold text-amber-500">
                          {tx.transaction_no || 'TX'}
                          {tx.reference_no && <p className="text-[10px] text-slate-400 font-normal">Ref: {tx.reference_no}</p>}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            tx.transaction_type === 'RECEIPT' || tx.transaction_type === 'OPENING' ? 'bg-emerald-500/20 text-emerald-400' :
                            tx.transaction_type === 'ISSUE' || tx.transaction_type === 'CONSUMPTION' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="p-3.5">{new Date(tx.transaction_date).toLocaleString()}</td>
                        <td className="p-3.5 font-mono text-slate-400">{tx.from_location?.code || '--'}</td>
                        <td className="p-3.5 font-mono text-slate-400">{tx.to_location?.code || '--'}</td>
                        <td className="p-3.5">
                          {(tx.lines || []).map((l, idx) => (
                            <div key={idx} className="font-mono text-[11px]">
                              {l.item?.item_code || 'Item'}: <span className="font-bold text-amber-400">{l.quantity}</span> {l.item?.base_uom_code || ''}
                            </div>
                          ))}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            POSTED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <ItemMasterModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      <StockTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        isDarkMode={isDarkMode}
        initialType={txModalType}
      />

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      <ReleaseReservationModal
        isOpen={isReleaseModalOpen}
        onClose={() => {
          setIsReleaseModalOpen(false);
          setSelectedReservationToRelease(null);
        }}
        reservation={selectedReservationToRelease}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
