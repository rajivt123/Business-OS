import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { supabase } from '../../lib/supabase';
import ReportTable from './ReportTable';
import {
  BarChart3, FileText, Building2, Calendar, RefreshCw, AlertCircle, ShieldAlert,
  TrendingUp, Wallet, ShoppingCart, Package, DollarSign, Users, FolderKanban,
  FileCheck2, ChevronRight, Layers, ArrowUpRight, ArrowDownRight, CheckCircle2
} from 'lucide-react';

export default function ReportsWorkspace() {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    activeOperatingCompany,
    operatingCompanies = [],
    setActiveOperatingCompanyId
  } = crmContext;

  // Date Range State (Defaults: First day of current month -> Today)
  const defaultFromDate = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  }, []);

  const defaultToDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);

  // Active View Tab: 'overview' | 'sales' | 'procurement' | 'inventory' | 'accounts' | 'hr' | 'projects'
  const [activeTab, setActiveTab] = useState('overview');
  const [activeReportKey, setActiveReportKey] = useState(null);

  // Catalog & Executive Summary States
  const [catalog, setCatalog] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [summaryAuthError, setSummaryAuthError] = useState(null);

  // Fetch Report Catalogue
  const fetchCatalog = useCallback(async () => {
    if (!tenantId || !activeOperatingCompanyId) return;
    try {
      const { data, error } = await supabase.rpc('get_business_report_catalog_atomic', {
        p_tenant_id: tenantId,
        p_tenant_company_id: activeOperatingCompanyId
      });
      if (!error && data) {
        setCatalog(data);
      }
    } catch (err) {
      console.error('Error fetching report catalog:', err);
    }
  }, [tenantId, activeOperatingCompanyId]);

  // Fetch Executive Summary
  const fetchSummary = useCallback(async () => {
    if (!tenantId || !activeOperatingCompanyId) return;
    setIsLoadingSummary(true);
    setSummaryError(null);
    setSummaryAuthError(null);

    try {
      const { data, error: rpcErr } = await supabase.rpc('get_business_report_summary_atomic', {
        p_tenant_id: tenantId,
        p_tenant_company_id: activeOperatingCompanyId,
        p_from_date: fromDate,
        p_to_date: toDate
      });

      if (rpcErr) {
        if (rpcErr.code === '42501' || (rpcErr.message || '').toLowerCase().includes('authorized')) {
          setSummaryAuthError(rpcErr.message || 'Access Denied: You do not have MANAGER-level reporting permissions.');
        } else {
          setSummaryError(rpcErr.message || rpcErr.details || 'Failed to load executive summary');
        }
        setSummary(null);
        return;
      }

      setSummary(data || null);
    } catch (err) {
      console.error('Error fetching business report summary:', err);
      setSummaryError(err.message || 'An unexpected error occurred while fetching summary.');
      setSummary(null);
    } fontFinally: {
      setIsLoadingSummary(false);
    }
  }, [tenantId, activeOperatingCompanyId, fromDate, toDate]);

  useEffect(() => {
    fetchCatalog();
    fetchSummary();
  }, [fetchCatalog, fetchSummary]);

  const handleRefreshAll = () => {
    fetchCatalog();
    fetchSummary();
  };

  // Helper currency formatter
  const formatCurr = (val) => {
    const n = Number(val || 0);
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper count formatter
  const formatCount = (val) => {
    const n = Number(val || 0);
    return n.toLocaleString('en-IN');
  };

  // Available Report Columns Definitions by Report Key
  const reportConfigs = {
    sales_quotations: {
      title: 'Sales Quotations Report',
      description: 'Quotation tracking, status, and project assignments',
      columns: [
        { label: 'Quotation No', key: 'quotation_no' },
        { label: 'Date', key: 'quotation_date', type: 'date' },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Valid Until', key: 'valid_until', type: 'date' },
        { label: 'Project / Work', key: 'project_name' }
      ]
    },
    sales_orders: {
      title: 'Sales Orders Report',
      description: 'Confirmed customer sales orders and delivery schedules',
      columns: [
        { label: 'Order No', key: 'order_no' },
        { label: 'Order Date', key: 'order_date', type: 'date' },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Delivery Date', key: 'delivery_date', type: 'date' },
        { label: 'Project / Work', key: 'project_name' }
      ]
    },
    sales_invoices: {
      title: 'Sales Invoices & Receivables Report',
      description: 'Tax invoices, payment collections, and outstanding receivables',
      columns: [
        { label: 'Invoice No', key: 'invoice_number' },
        { label: 'Invoice Date', key: 'invoice_date', type: 'date' },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Amount Paid', key: 'amount_paid', type: 'currency', align: 'right' },
        { label: 'Balance Due', key: 'balance_due', type: 'currency', align: 'right' },
        { label: 'Due Date', key: 'due_date', type: 'date' },
        { label: 'Project / Work', key: 'project_name' }
      ]
    },
    procurement_orders: {
      title: 'Purchase Orders Report',
      description: 'Vendor purchase orders, commitments, and expected deliveries',
      columns: [
        { label: 'PO No', key: 'po_number' },
        { label: 'PO Date', key: 'po_date', type: 'date' },
        { label: 'Vendor', key: 'vendor_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Expected Delivery', key: 'expected_delivery', type: 'date' },
        { label: 'Project / Work', key: 'project_name' }
      ]
    },
    procurement_bills: {
      title: 'Purchase Bills & Payables Report',
      description: 'Vendor bills, supplier payments, and outstanding payables',
      columns: [
        { label: 'Bill No', key: 'bill_number' },
        { label: 'Bill Date', key: 'bill_date', type: 'date' },
        { label: 'Vendor', key: 'vendor_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Amount Paid', key: 'amount_paid', type: 'currency', align: 'right' },
        { label: 'Balance Due', key: 'balance_due', type: 'currency', align: 'right' },
        { label: 'Due Date', key: 'due_date', type: 'date' },
        { label: 'Project / Work', key: 'project_name' }
      ]
    },
    inventory_stock: {
      title: 'Stock Position Report',
      description: 'Current inventory stock levels, valuations, and reorder alerts',
      columns: [
        { label: 'Item Code', key: 'item_code' },
        { label: 'Item Name', key: 'item_name' },
        { label: 'UOM', key: 'uom' },
        { label: 'Category', key: 'category' },
        { label: 'Location', key: 'location_name' },
        { label: 'Lot', key: 'lot_number' },
        { label: 'On Hand', key: 'quantity_on_hand', type: 'number', align: 'right' },
        { label: 'Reserved', key: 'quantity_reserved', type: 'number', align: 'right' },
        { label: 'Available', key: 'quantity_available', type: 'number', align: 'right' },
        { label: 'Avg Unit Cost', key: 'unit_cost', type: 'currency', align: 'right' },
        { label: 'Stock Value', key: 'stock_value', type: 'currency', align: 'right' },
        { label: 'Reorder Level', key: 'reorder_level', type: 'number', align: 'right' },
        { label: 'Shortfall', key: 'reorder_shortfall', type: 'number', align: 'right' },
        { label: 'Low Stock', key: 'is_low_stock', type: 'status' }
      ]
    },
    inventory_movement: {
      title: 'Stock Movement Ledger Report',
      description: 'Stock receipts, project issuances, transfers, and adjustments',
      columns: [
        { label: 'Transaction No', key: 'transaction_no' },
        { label: 'Date', key: 'created_at', type: 'date' },
        { label: 'Type', key: 'transaction_type', type: 'status' },
        { label: 'Item Code', key: 'item_code' },
        { label: 'Item Name', key: 'item_name' },
        { label: 'Location', key: 'location_name' },
        { label: 'Quantity', key: 'quantity', type: 'number', align: 'right' },
        { label: 'Qty In', key: 'quantity_in', type: 'number', align: 'right' },
        { label: 'Qty Out', key: 'quantity_out', type: 'number', align: 'right' },
        { label: 'Unit Cost', key: 'unit_cost', type: 'currency', align: 'right' },
        { label: 'Line Value', key: 'line_value', type: 'currency', align: 'right' },
        { label: 'Reference', key: 'reference_no' },
        { label: 'Source', key: 'source' },
        { label: 'Project / Work', key: 'project_name' }
      ]
    },
    accounts_ledger: {
      title: 'General Ledger Report',
      description: 'Financial journal entries, account debits, credits, and vouchers',
      columns: [
        { label: 'Date', key: 'posting_date', type: 'date' },
        { label: 'Voucher', key: 'voucher_number' },
        { label: 'Voucher Type', key: 'voucher_type' },
        { label: 'Narration', key: 'narration' },
        { label: 'Account Code', key: 'account_code' },
        { label: 'Account Name', key: 'account_name' },
        { label: 'Account Type', key: 'account_type' },
        { label: 'Line', key: 'line_number' },
        { label: 'Description', key: 'line_description' },
        { label: 'Debit', key: 'debit_amount', type: 'currency', align: 'right' },
        { label: 'Credit', key: 'credit_amount', type: 'currency', align: 'right' },
        { label: 'Party', key: 'party_name' },
        { label: 'Project', key: 'project_name' }
      ]
    },
    accounts_trial_balance: {
      title: 'Trial Balance Report',
      description: 'Account balance summary across asset, liability, equity, income & expense accounts',
      columns: [
        { label: 'Account Code', key: 'account_code' },
        { label: 'Account Name', key: 'account_name' },
        { label: 'Account Type', key: 'account_type' },
        { label: 'Debit', key: 'debit_amount', type: 'currency', align: 'right' },
        { label: 'Credit', key: 'credit_amount', type: 'currency', align: 'right' },
        { label: 'Closing Balance', key: 'closing_balance', type: 'currency', align: 'right' }
      ]
    },
    hr_attendance: {
      title: 'Employee Attendance Report',
      description: 'Daily attendance punches, worked hours, late minutes, and leave days',
      columns: [
        { label: 'Date', key: 'attendance_date', type: 'date' },
        { label: 'Employee Code', key: 'employee_code' },
        { label: 'Employee Name', key: 'employee_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Full Day', key: 'is_full_day' },
        { label: 'Half Day', key: 'is_half_day' },
        { label: 'Worked Mins', key: 'worked_minutes', type: 'number', align: 'right' },
        { label: 'Effective Mins', key: 'effective_work_minutes', type: 'number', align: 'right' },
        { label: 'Late Mins', key: 'late_minutes', type: 'number', align: 'right' },
        { label: 'Early Mins', key: 'early_departure_minutes', type: 'number', align: 'right' },
        { label: 'Holiday', key: 'is_holiday' },
        { label: 'Weekly Off', key: 'is_weekly_off' },
        { label: 'Leave', key: 'is_leave' },
        { label: 'Comp Off', key: 'is_comp_off' }
      ]
    },
    hr_leave: {
      title: 'Employee Leave Report',
      description: 'Submitted leave applications, type breakdown, days, and approval status',
      columns: [
        { label: 'From Date', key: 'from_date', type: 'date' },
        { label: 'To Date', key: 'to_date', type: 'date' },
        { label: 'Employee Code', key: 'employee_code' },
        { label: 'Employee Name', key: 'employee_name' },
        { label: 'Leave Type', key: 'leave_type_name' },
        { label: 'Leave Code', key: 'leave_type_code' },
        { label: 'Total Days', key: 'total_days', type: 'number', align: 'right' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Reason', key: 'reason' }
      ]
    },
    hr_payroll: {
      title: 'Payroll Summary Report',
      description: 'Pay run periods, paid days, gross earnings, statutory deductions, and net pay',
      columns: [
        { label: 'Period', key: 'period_name' },
        { label: 'Period Start', key: 'period_start', type: 'date' },
        { label: 'Period End', key: 'period_end', type: 'date' },
        { label: 'Run Status', key: 'status', type: 'status' },
        { label: 'Employee Code', key: 'employee_code' },
        { label: 'Employee Name', key: 'employee_name' },
        { label: 'Working Days', key: 'working_days', type: 'number', align: 'right' },
        { label: 'Paid Days', key: 'paid_days', type: 'number', align: 'right' },
        { label: 'LOP Days', key: 'lop_days', type: 'number', align: 'right' },
        { label: 'Gross Earnings', key: 'gross_earnings', type: 'currency', align: 'right' },
        { label: 'Deductions', key: 'total_deductions', type: 'currency', align: 'right' },
        { label: 'Employer Contrib', key: 'employer_contributions', type: 'currency', align: 'right' },
        { label: 'Net Pay', key: 'net_pay', type: 'currency', align: 'right' }
      ]
    },
    projects: {
      title: 'Projects Status & Commercial Contribution',
      description: 'Project status, open issues, revenue, procurement cost, material cost, and contribution indicator',
      columns: [
        { label: 'Work / Project No', key: 'work_number' },
        { label: 'PO Number', key: 'po_number' },
        { label: 'Project Title', key: 'title' },
        { label: 'Created Date', key: 'created_at', type: 'date' },
        { label: 'Open Tasks', key: 'open_tasks', type: 'number', align: 'right' },
        { label: 'Overdue Tasks', key: 'overdue_tasks', type: 'number', align: 'right' },
        { label: 'Open Issues', key: 'open_issues', type: 'number', align: 'right' },
        { label: 'Revenue', key: 'revenue', type: 'currency', align: 'right' },
        { label: 'Procurement Cost', key: 'procurement_cost', type: 'currency', align: 'right' },
        { label: 'Material Cost', key: 'material_issue_value', type: 'currency', align: 'right' },
        { label: 'Gross Contribution *', key: 'gross_contribution', type: 'calculated_contribution', align: 'right' }
      ]
    }
  };

  const exec = summary?.executive || {};
  const sSales = summary?.sales || {};
  const sProc = summary?.procurement || {};
  const sInv = summary?.inventory || {};
  const sAcc = summary?.accounts || {};
  const sHr = summary?.hr || {};
  const sProj = summary?.projects || {};

  return (
    <div className="space-y-6">
      {/* Top Controls Header Bar */}
      <div className="os-card p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-lg font-black tracking-tight text-white">Reports & Analytics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Executive overview, operational, financial, project, and people intelligence</p>
        </div>

        {/* Global Filters: Company & Date Range */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Operating Company Selector */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <Building2 size={14} className="text-sky-400" />
            <select
              value={activeOperatingCompanyId || ''}
              onChange={e => setActiveOperatingCompanyId?.(e.target.value)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            >
              {operatingCompanies.map(co => (
                <option key={co.id} value={co.id} className="bg-slate-900 text-white">
                  {co.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400">To</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefreshAll}
            disabled={isLoadingSummary}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <RefreshCw size={14} className={isLoadingSummary ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('overview'); setActiveReportKey(null); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 size={15} /> Executive Overview
        </button>

        <button
          onClick={() => { setActiveTab('sales'); setActiveReportKey('sales_quotations'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingUp size={15} /> Sales
        </button>

        <button
          onClick={() => { setActiveTab('procurement'); setActiveReportKey('procurement_orders'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'procurement'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ShoppingCart size={15} /> Procurement
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setActiveReportKey('inventory_stock'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Package size={15} /> Inventory
        </button>

        <button
          onClick={() => { setActiveTab('accounts'); setActiveReportKey('accounts_ledger'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <DollarSign size={15} /> Accounts
        </button>

        <button
          onClick={() => { setActiveTab('hr'); setActiveReportKey('hr_attendance'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'hr'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users size={15} /> HR & People
        </button>

        <button
          onClick={() => { setActiveTab('projects'); setActiveReportKey('projects'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FolderKanban size={15} /> Projects
        </button>
      </div>

      {/* Auth Error Banner for Executive Overview */}
      {summaryAuthError && activeTab === 'overview' && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-800 dark:text-rose-300 text-xs space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-black">
            <ShieldAlert size={18} className="text-rose-600" /> Access Denied: Reporting Permissions Required
          </div>
          <p className="leading-relaxed text-[11px]">{summaryAuthError}</p>
        </div>
      )}

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Executive Key Performance Indicators ({activeOperatingCompany?.name || 'Selected Company'})
              </h2>
              {summary?.generated_at && (
                <span className="text-[10px] text-slate-400 font-mono">
                  RPC Generated: {new Date(summary.generated_at).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              {/* 1. Revenue */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-sky-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Revenue</span>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatCurr(exec.revenue)}
                </div>
                <div className="text-[10px] text-slate-400">Total Billed Invoices</div>
              </div>

              {/* 2. Collections */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Collections</span>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurr(exec.collections)}
                </div>
                <div className="text-[10px] text-slate-400">Sales Payment Receipts</div>
              </div>

              {/* 3. Receivables */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Receivables</span>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                  {formatCurr(exec.receivables)}
                </div>
                <div className="text-[10px] text-slate-400">Outstanding Invoices</div>
              </div>

              {/* 4. Purchase Commitment */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-violet-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">PO Commitment</span>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatCurr(exec.purchase_commitment)}
                </div>
                <div className="text-[10px] text-slate-400">Open Vendor POs</div>
              </div>

              {/* 5. Payables */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-rose-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Payables</span>
                <div className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                  {formatCurr(exec.payables)}
                </div>
                <div className="text-[10px] text-slate-400">Outstanding Purchase Bills</div>
              </div>

              {/* 6. Stock Value */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-cyan-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Stock Value</span>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatCurr(exec.stock_value)}
                </div>
                <div className="text-[10px] text-slate-400">Inventory Valuation</div>
              </div>

              {/* 7. Active Headcount */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-indigo-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Active Headcount</span>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatCount(exec.active_headcount)}
                </div>
                <div className="text-[10px] text-slate-400">Employees Active</div>
              </div>

              {/* 8. Open Tasks */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-teal-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Open Tasks</span>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatCount(exec.open_tasks)}
                </div>
                <div className="text-[10px] text-slate-400">Pending Execution</div>
              </div>

              {/* 9. Overdue Tasks */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-orange-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Overdue Tasks</span>
                <div className="text-lg font-black text-orange-600 dark:text-orange-400 font-mono">
                  {formatCount(exec.overdue_tasks)}
                </div>
                <div className="text-[10px] text-slate-400">Delayed Milestones</div>
              </div>

              {/* 10. Open Issues */}
              <div className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-red-500">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Open Issues</span>
                <div className="text-lg font-black text-red-600 dark:text-red-400 font-mono">
                  {formatCount(exec.open_issues)}
                </div>
                <div className="text-[10px] text-slate-400">Site/Project Blockers</div>
              </div>
            </div>
          </div>

          {/* Domain Summary Cards Grid */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Domain Summaries (From Reporting Summary RPC)
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sales Domain Summary Card */}
              <div className="os-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-sky-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Sales Domain</h3>
                  </div>
                  <button
                    onClick={() => { setActiveTab('sales'); setActiveReportKey('sales_quotations'); }}
                    className="text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Quotations:</span>
                    <span>{formatCount(sSales.quotations_count)} ({formatCurr(sSales.quotations_value)})</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Sales Orders:</span>
                    <span>{formatCount(sSales.orders_count)} ({formatCurr(sSales.orders_value)})</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Invoices Billed:</span>
                    <span>{formatCount(sSales.invoices_count)} ({formatCurr(sSales.invoices_value)})</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="text-slate-400">Collections:</span>
                    <span className="font-bold">{formatCurr(sSales.collections)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-amber-600 dark:text-amber-400">
                    <span className="text-slate-400">Receivables Due:</span>
                    <span className="font-bold">{formatCurr(sSales.receivables)}</span>
                  </div>
                </div>
              </div>

              {/* Procurement Domain Summary Card */}
              <div className="os-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-violet-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Procurement Domain</h3>
                  </div>
                  <button
                    onClick={() => { setActiveTab('procurement'); setActiveReportKey('procurement_orders'); }}
                    className="text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Purchase Requests:</span>
                    <span>{formatCount(sProc.requests_count)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Purchase Orders:</span>
                    <span>{formatCount(sProc.orders_count)} ({formatCurr(sProc.orders_value)})</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">GRNs Received:</span>
                    <span>{formatCount(sProc.grn_count)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Purchase Bills:</span>
                    <span>{formatCount(sProc.bills_count)} ({formatCurr(sProc.bills_value)})</span>
                  </div>
                  <div className="flex justify-between font-semibold text-rose-600 dark:text-rose-400">
                    <span className="text-slate-400">Payables Outstanding:</span>
                    <span className="font-bold">{formatCurr(sProc.payables)}</span>
                  </div>
                </div>
              </div>

              {/* Inventory Domain Summary Card */}
              <div className="os-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-cyan-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Inventory Domain</h3>
                  </div>
                  <button
                    onClick={() => { setActiveTab('inventory'); setActiveReportKey('inventory_stock'); }}
                    className="text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Stock Valuation:</span>
                    <span className="font-bold">{formatCurr(sInv.stock_value)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-amber-600 dark:text-amber-400">
                    <span className="text-slate-400">Low Stock Items:</span>
                    <span className="font-bold">{formatCount(sInv.low_stock_count)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Available Value:</span>
                    <span>{formatCurr(sInv.available_stock_value || sInv.stock_value)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Movement Transactions:</span>
                    <span>{formatCount(sInv.movement_count)} ({formatCurr(sInv.movement_value)})</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Reconciled Variances:</span>
                    <span>{formatCount(sInv.reconciliation_variance_count || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Accounts Domain Summary Card */}
              <div className="os-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Accounts Domain</h3>
                  </div>
                  <button
                    onClick={() => { setActiveTab('accounts'); setActiveReportKey('accounts_ledger'); }}
                    className="text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Posted Debit:</span>
                    <span>{formatCurr(sAcc.posted_debit)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Posted Credit:</span>
                    <span>{formatCurr(sAcc.posted_credit)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Trial Balance Diff:</span>
                    <span className="font-mono">{formatCurr(sAcc.trial_balance_difference)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="text-slate-400">Income / Revenue:</span>
                    <span className="font-bold">{formatCurr(sAcc.income || sSales.invoices_value)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Expenses:</span>
                    <span>{formatCurr(sAcc.expenses || sProc.bills_value)}</span>
                  </div>
                </div>
              </div>

              {/* HR Domain Summary Card */}
              <div className="os-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-indigo-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">HR & People Domain</h3>
                  </div>
                  <button
                    onClick={() => { setActiveTab('hr'); setActiveReportKey('hr_attendance'); }}
                    className="text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Active Employees:</span>
                    <span className="font-bold">{formatCount(sHr.active_employees || exec.active_headcount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">New Joined / Exited:</span>
                    <span>+{formatCount(sHr.joined_count || 0)} / -{formatCount(sHr.exited_count || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Attendance Present:</span>
                    <span>{formatCount(sHr.attendance_present_days)} days</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Leave Days Taken:</span>
                    <span>{formatCount(sHr.leave_days)} days</span>
                  </div>
                  <div className="flex justify-between font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="text-slate-400">Payroll Net Distributed:</span>
                    <span className="font-bold">{formatCurr(sHr.payroll_net)}</span>
                  </div>
                </div>
              </div>

              {/* Projects Domain Summary Card */}
              <div className="os-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FolderKanban size={16} className="text-teal-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Projects Domain</h3>
                  </div>
                  <button
                    onClick={() => { setActiveTab('projects'); setActiveReportKey('projects'); }}
                    className="text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Active Works / Projects:</span>
                    <span className="font-bold">{formatCount(sProj.projects_count)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Open / Overdue Tasks:</span>
                    <span>{formatCount(sProj.open_tasks)} / {formatCount(sProj.overdue_tasks)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Project Revenue:</span>
                    <span>{formatCurr(sProj.revenue)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Procurement Cost:</span>
                    <span>{formatCurr(sProj.procurement_cost)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-teal-600 dark:text-teal-400">
                    <span className="text-slate-400">Material Cost Value:</span>
                    <span className="font-bold">{formatCurr(sProj.material_issue_value)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES DOMAIN */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveReportKey('sales_quotations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'sales_quotations' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Sales Quotations
            </button>
            <button
              onClick={() => setActiveReportKey('sales_orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'sales_orders' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Sales Orders
            </button>
            <button
              onClick={() => setActiveReportKey('sales_invoices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'sales_invoices' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Invoices & Receivables
            </button>
          </div>

          {activeReportKey && reportConfigs[activeReportKey] && (
            <ReportTable
              reportKey={activeReportKey}
              title={reportConfigs[activeReportKey].title}
              description={reportConfigs[activeReportKey].description}
              columns={reportConfigs[activeReportKey].columns}
              tenantId={tenantId}
              operatingCompanyId={activeOperatingCompanyId}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}
        </div>
      )}

      {/* TAB 3: PROCUREMENT DOMAIN */}
      {activeTab === 'procurement' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveReportKey('procurement_orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'procurement_orders' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveReportKey('procurement_bills')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'procurement_bills' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Purchase Bills & Payables
            </button>
          </div>

          {activeReportKey && reportConfigs[activeReportKey] && (
            <ReportTable
              reportKey={activeReportKey}
              title={reportConfigs[activeReportKey].title}
              description={reportConfigs[activeReportKey].description}
              columns={reportConfigs[activeReportKey].columns}
              tenantId={tenantId}
              operatingCompanyId={activeOperatingCompanyId}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}
        </div>
      )}

      {/* TAB 4: INVENTORY DOMAIN */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveReportKey('inventory_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'inventory_stock' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Stock Position
            </button>
            <button
              onClick={() => setActiveReportKey('inventory_movement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'inventory_movement' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Stock Movement Ledger
            </button>
          </div>

          {activeReportKey && reportConfigs[activeReportKey] && (
            <ReportTable
              reportKey={activeReportKey}
              title={reportConfigs[activeReportKey].title}
              description={reportConfigs[activeReportKey].description}
              columns={reportConfigs[activeReportKey].columns}
              tenantId={tenantId}
              operatingCompanyId={activeOperatingCompanyId}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}
        </div>
      )}

      {/* TAB 5: ACCOUNTS DOMAIN */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveReportKey('accounts_ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'accounts_ledger' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              General Ledger
            </button>
            <button
              onClick={() => setActiveReportKey('accounts_trial_balance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'accounts_trial_balance' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Trial Balance
            </button>
          </div>

          {activeReportKey && reportConfigs[activeReportKey] && (
            <ReportTable
              reportKey={activeReportKey}
              title={reportConfigs[activeReportKey].title}
              description={reportConfigs[activeReportKey].description}
              columns={reportConfigs[activeReportKey].columns}
              tenantId={tenantId}
              operatingCompanyId={activeOperatingCompanyId}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}
        </div>
      )}

      {/* TAB 6: HR DOMAIN */}
      {activeTab === 'hr' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveReportKey('hr_attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'hr_attendance' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Attendance Report
            </button>
            <button
              onClick={() => setActiveReportKey('hr_leave')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'hr_leave' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Leave Report
            </button>
            <button
              onClick={() => setActiveReportKey('hr_payroll')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeReportKey === 'hr_payroll' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Payroll Summary
            </button>
          </div>

          {activeReportKey && reportConfigs[activeReportKey] && (
            <ReportTable
              reportKey={activeReportKey}
              title={reportConfigs[activeReportKey].title}
              description={reportConfigs[activeReportKey].description}
              columns={reportConfigs[activeReportKey].columns}
              tenantId={tenantId}
              operatingCompanyId={activeOperatingCompanyId}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}
        </div>
      )}

      {/* TAB 7: PROJECTS DOMAIN */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {activeReportKey && reportConfigs[activeReportKey] && (
            <>
              <ReportTable
                reportKey={activeReportKey}
                title={reportConfigs[activeReportKey].title}
                description={reportConfigs[activeReportKey].description}
                columns={reportConfigs[activeReportKey].columns}
                tenantId={tenantId}
                operatingCompanyId={activeOperatingCompanyId}
                fromDate={fromDate}
                toDate={toDate}
              />
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  * Note on Commercial Gross Contribution Metric:
                </p>
                <p className="leading-relaxed">
                  Gross Contribution is calculated as <code>Revenue - Procurement Cost - Material Issue Value</code>. This indicator reflects partial direct material contribution and does not represent total project net profitability, as complete direct labor, site overhead, subcontract, and plant machinery costs are calculated separately in the HR/Payroll and Site Cost modules.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
