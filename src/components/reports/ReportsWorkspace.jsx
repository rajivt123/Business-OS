import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { supabase } from '../../lib/supabase';
import ReportTable from './ReportTable';
import {
  BarChart3, Building2, RefreshCw, ShieldAlert,
  TrendingUp, ShoppingCart, Package, DollarSign, Users, FolderKanban,
  Info, Layers
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

  // Fetch Report Catalogue from Supabase Reporting Engine RPC
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

  // Fetch Executive Summary from Supabase Reporting Engine RPC
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
    } finally {
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

  // Helper value renderer for KPIs (Rule 4: null/undefined/missing displays "Unavailable", 0 displays 0)
  const renderKpiValue = (val, isCurrency = true) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-400 font-normal italic text-sm">Unavailable</span>;
    }
    const num = Number(val);
    if (isNaN(num)) {
      return <span className="text-slate-400 font-normal italic text-sm">Unavailable</span>;
    }
    if (isCurrency) {
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return num.toLocaleString('en-IN');
  };

  // Report Column Definitions matching exact backend SQL response fields (Rule 2)
  const reportConfigs = {
    // Accounts Reports
    accounts_ledger: {
      title: 'General Ledger Report',
      description: 'Financial journal entries, debits, credits, and line details',
      domain: 'accounts',
      columns: [
        { label: 'Entry Date', key: 'entry_date', type: 'date' },
        { label: 'Voucher No', key: 'voucher_number' },
        { label: 'Voucher Type', key: 'voucher_type' },
        { label: 'Narration', key: 'narration' },
        { label: 'Account Code', key: 'account_code' },
        { label: 'Account Name', key: 'account_name' },
        { label: 'Account Type', key: 'account_type' },
        { label: 'Line No', key: 'line_no', type: 'number', align: 'right' },
        { label: 'Description', key: 'description' },
        { label: 'Debit', key: 'debit', type: 'currency', align: 'right' },
        { label: 'Credit', key: 'credit', type: 'currency', align: 'right' },
        { label: 'Party Type', key: 'party_type' },
        { label: 'Party ID', key: 'party_id' },
        { label: 'Project ID', key: 'project_id' }
      ]
    },
    accounts_trial_balance: {
      title: 'Trial Balance Report',
      description: 'Account balance summary across Assets, Liabilities, Equity, Income, and Expenses',
      domain: 'accounts',
      columns: [
        { label: 'Account Code', key: 'account_code' },
        { label: 'Account Name', key: 'account_name' },
        { label: 'Account Type', key: 'account_type' },
        { label: 'Opening Balance', key: 'opening_balance', type: 'currency', align: 'right' },
        { label: 'Debit', key: 'debit', type: 'currency', align: 'right' },
        { label: 'Credit', key: 'credit', type: 'currency', align: 'right' },
        { label: 'Closing Balance', key: 'closing_balance', type: 'currency', align: 'right' }
      ]
    },
    accounts_profit_loss: {
      title: 'Profit & Loss Statement (P&L)',
      description: 'Income and Expense accounts breakdown with Net Result',
      domain: 'accounts',
      columns: [
        { label: 'Account Code', key: 'account_code' },
        { label: 'Account Name', key: 'account_name' },
        { label: 'Account Type', key: 'account_type' },
        { label: 'Section', key: 'section' },
        { label: 'Net Amount', key: 'net_amount', type: 'currency', align: 'right' }
      ]
    },
    accounts_balance_sheet: {
      title: 'Balance Sheet Statement',
      description: 'Assets, Liabilities, and Equity account balances',
      domain: 'accounts',
      columns: [
        { label: 'Account Code', key: 'account_code' },
        { label: 'Account Name', key: 'account_name' },
        { label: 'Account Type', key: 'account_type' },
        { label: 'Section', key: 'section' },
        { label: 'Debit/Credit Balance', key: 'debit_credit_balance', type: 'currency', align: 'right' }
      ]
    },
    accounts_cash_flow: {
      title: 'Cash & Bank Flow Statement',
      description: 'Actual posted cash and bank account movements',
      domain: 'accounts',
      notice: 'Presents actual posted cash/bank movements.',
      columns: [
        { label: 'Flow Date', key: 'flow_date', type: 'date' },
        { label: 'Voucher No', key: 'voucher_number' },
        { label: 'Voucher Type', key: 'voucher_type' },
        { label: 'Narration', key: 'narration' },
        { label: 'Account Code', key: 'account_code' },
        { label: 'Account Name', key: 'account_name' },
        { label: 'Account Class', key: 'account_class' },
        { label: 'Net Cash Movement', key: 'net_cash_movement', type: 'currency', align: 'right' }
      ]
    },
    accounts_ar_aging: {
      title: 'Receivables Aging Report (AR)',
      description: 'Outstanding customer invoices categorized into overdue aging buckets',
      domain: 'accounts',
      columns: [
        { label: 'Invoice No', key: 'invoice_no' },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Invoice Date', key: 'invoice_date', type: 'date' },
        { label: 'Due Date', key: 'due_date', type: 'date' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Amount Paid', key: 'amount_paid', type: 'currency', align: 'right' },
        { label: 'Balance Due', key: 'balance_due', type: 'currency', align: 'right' },
        { label: 'Days Overdue', key: 'days_overdue', type: 'number', align: 'right' },
        { label: 'Aging Bucket', key: 'aging_bucket', type: 'status' },
        { label: 'Work ID', key: 'work_id' }
      ]
    },
    accounts_ap_aging: {
      title: 'Payables Aging Report (AP)',
      description: 'Outstanding vendor bills categorized into overdue aging buckets',
      domain: 'accounts',
      columns: [
        { label: 'Bill No', key: 'bill_no' },
        { label: 'Bill Date', key: 'bill_date', type: 'date' },
        { label: 'Due Date', key: 'due_date', type: 'date' },
        { label: 'Vendor ID', key: 'vendor_id' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Amount Paid', key: 'amount_paid', type: 'currency', align: 'right' },
        { label: 'Balance Due', key: 'balance_due', type: 'currency', align: 'right' },
        { label: 'Days Overdue', key: 'days_overdue', type: 'number', align: 'right' },
        { label: 'Aging Bucket', key: 'aging_bucket', type: 'status' },
        { label: 'Work ID', key: 'work_id' }
      ]
    },

    // Inventory Reports
    inventory_stock: {
      title: 'Stock Position Report',
      description: 'Current inventory stock levels, valuations, and reorder alerts',
      domain: 'inventory',
      columns: [
        { label: 'Item Code', key: 'item_code' },
        { label: 'Item Name', key: 'item_name' },
        { label: 'UOM', key: 'uom' },
        { label: 'Location', key: 'location_name' },
        { label: 'Available Qty', key: 'quantity_available', type: 'number', align: 'right' },
        { label: 'On Hand Qty', key: 'quantity_on_hand', type: 'number', align: 'right' },
        { label: 'Reserved Qty', key: 'quantity_reserved', type: 'number', align: 'right' },
        { label: 'Unit Cost', key: 'unit_cost', type: 'currency', align: 'right' },
        { label: 'Stock Value', key: 'stock_value', type: 'currency', align: 'right' },
        { label: 'Reorder Level', key: 'reorder_level', type: 'number', align: 'right' },
        { label: 'Shortfall', key: 'reorder_shortfall', type: 'number', align: 'right' },
        { label: 'Low Stock Alert', key: 'is_low_stock', type: 'status' }
      ]
    },
    inventory_movement: {
      title: 'Stock Movement Ledger Report',
      description: 'Stock receipts, project issuances, transfers, and adjustments',
      domain: 'inventory',
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
        { label: 'Project Name', key: 'project_name' }
      ]
    },
    inventory_valuation: {
      title: 'Inventory Valuation Report',
      description: 'Item stock quantities, average unit cost, total valuation, and shortfall',
      domain: 'inventory',
      columns: [
        { label: 'Item Code', key: 'item_code' },
        { label: 'Item Name', key: 'item_name' },
        { label: 'Location', key: 'location_name' },
        { label: 'Lot / Batch', key: 'lot_number' },
        { label: 'Quantity', key: 'quantity', type: 'number', align: 'right' },
        { label: 'Avg Unit Cost', key: 'unit_cost', type: 'currency', align: 'right' },
        { label: 'Stock Value', key: 'stock_value', type: 'currency', align: 'right' },
        { label: 'Reorder Level', key: 'reorder_level', type: 'number', align: 'right' },
        { label: 'Shortfall', key: 'shortfall', type: 'number', align: 'right' },
        { label: 'Low Stock', key: 'is_low_stock', type: 'status' }
      ]
    },
    inventory_aging: {
      title: 'Inventory Aging Report',
      description: 'Stock batch age analysis and inventory holding buckets',
      domain: 'inventory',
      columns: [
        { label: 'Item Code', key: 'item_code' },
        { label: 'Item Name', key: 'item_name' },
        { label: 'Location', key: 'location_name' },
        { label: 'Lot / Batch', key: 'lot_number' },
        { label: 'Quantity', key: 'quantity', type: 'number', align: 'right' },
        { label: 'Avg Unit Cost', key: 'unit_cost', type: 'currency', align: 'right' },
        { label: 'Stock Value', key: 'stock_value', type: 'currency', align: 'right' },
        { label: 'Age (Days)', key: 'age_days', type: 'number', align: 'right' },
        { label: 'Aging Bucket', key: 'aging_bucket', type: 'status' }
      ]
    },

    // Procurement Reports
    procurement_orders: {
      title: 'Purchase Orders Report',
      description: 'Vendor purchase orders, commitments, and expected delivery dates',
      domain: 'procurement',
      columns: [
        { label: 'PO No', key: 'po_number' },
        { label: 'PO Date', key: 'po_date', type: 'date' },
        { label: 'Vendor', key: 'vendor_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Expected Delivery', key: 'expected_delivery', type: 'date' },
        { label: 'Project Name', key: 'project_name' }
      ]
    },
    procurement_bills: {
      title: 'Purchase Bills & Payables Report',
      description: 'Vendor bills, supplier payments, and outstanding payables',
      domain: 'procurement',
      columns: [
        { label: 'Bill No', key: 'bill_number' },
        { label: 'Bill Date', key: 'bill_date', type: 'date' },
        { label: 'Vendor', key: 'vendor_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Amount Paid', key: 'amount_paid', type: 'currency', align: 'right' },
        { label: 'Balance Due', key: 'balance_due', type: 'currency', align: 'right' },
        { label: 'Due Date', key: 'due_date', type: 'date' },
        { label: 'Project Name', key: 'project_name' }
      ]
    },
    procurement_performance: {
      title: 'Procurement Performance Report',
      description: 'Vendor PO compliance, GRN receipt tracking, and overdue deliveries',
      domain: 'procurement',
      columns: [
        { label: 'PO No', key: 'po_no' },
        { label: 'PO Date', key: 'po_date', type: 'date' },
        { label: 'Vendor', key: 'vendor_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'PO Value', key: 'po_value', type: 'currency', align: 'right' },
        { label: 'GRN Count', key: 'grn_count', type: 'number', align: 'right' },
        { label: 'Billed Value', key: 'billed_value', type: 'currency', align: 'right' },
        { label: 'Expected Delivery', key: 'expected_delivery', type: 'date' },
        { label: 'Overdue Flag', key: 'is_overdue', type: 'status' }
      ]
    },

    // Projects Reports
    projects: {
      title: 'Projects Commercial Summary',
      description: 'Project task counts, revenue, procurement cost, material issue value, and gross contribution',
      domain: 'projects',
      notice: 'Gross contribution is based on available revenue, procurement, material issue and project-linked labour/accounting data.',
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
        { label: 'Material Issue Value', key: 'material_issue_value', type: 'currency', align: 'right' },
        { label: 'Gross Contribution', key: 'gross_contribution', type: 'currency', align: 'right' }
      ]
    },
    projects_profitability: {
      title: 'Project Profitability Report',
      description: 'Project-level revenue vs procurement cost, material issue value, and labor cost',
      domain: 'projects',
      notice: 'Gross contribution is based on available revenue, procurement, material issue and project-linked labour/accounting data.',
      columns: [
        { label: 'Project Name', key: 'project_name' },
        { label: 'Work Number', key: 'work_number' },
        { label: 'Revenue', key: 'revenue', type: 'currency', align: 'right' },
        { label: 'Procurement Cost', key: 'procurement_cost', type: 'currency', align: 'right' },
        { label: 'Material Issue Value', key: 'material_issue_value', type: 'currency', align: 'right' },
        { label: 'Labour Cost', key: 'labour_cost', type: 'currency', align: 'right' },
        { label: 'Gross Contribution', key: 'gross_contribution', type: 'currency', align: 'right' }
      ]
    },

    // Sales Reports
    sales_quotations: {
      title: 'Sales Quotations Report',
      description: 'Quotation tracking, status, and project assignments',
      domain: 'sales',
      columns: [
        { label: 'Quotation No', key: 'quotation_no' },
        { label: 'Date', key: 'quotation_date', type: 'date' },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Valid Until', key: 'valid_until', type: 'date' },
        { label: 'Project Name', key: 'project_name' }
      ]
    },
    sales_orders: {
      title: 'Sales Orders Report',
      description: 'Confirmed customer sales orders and delivery schedules',
      domain: 'sales',
      columns: [
        { label: 'Order No', key: 'order_no' },
        { label: 'Order Date', key: 'order_date', type: 'date' },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Delivery Date', key: 'delivery_date', type: 'date' },
        { label: 'Project Name', key: 'project_name' }
      ]
    },
    sales_invoices: {
      title: 'Sales Invoices & Receivables Report',
      description: 'Tax invoices, payment collections, and outstanding receivables',
      domain: 'sales',
      columns: [
        { label: 'Invoice No', key: 'invoice_number' },
        { label: 'Invoice Date', key: 'invoice_date', type: 'date' },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Total Amount', key: 'total_amount', type: 'currency', align: 'right' },
        { label: 'Amount Paid', key: 'amount_paid', type: 'currency', align: 'right' },
        { label: 'Balance Due', key: 'balance_due', type: 'currency', align: 'right' },
        { label: 'Due Date', key: 'due_date', type: 'date' },
        { label: 'Project Name', key: 'project_name' }
      ]
    },

    // HR Reports
    hr_attendance: {
      title: 'Employee Attendance Report',
      description: 'Daily attendance punches, worked hours, and status',
      domain: 'hr',
      columns: [
        { label: 'Date', key: 'attendance_date', type: 'date' },
        { label: 'Employee Code', key: 'employee_code' },
        { label: 'Employee Name', key: 'employee_name' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Worked Mins', key: 'worked_minutes', type: 'number', align: 'right' },
        { label: 'Effective Mins', key: 'effective_work_minutes', type: 'number', align: 'right' },
        { label: 'Late Mins', key: 'late_minutes', type: 'number', align: 'right' },
        { label: 'Early Departure Mins', key: 'early_departure_minutes', type: 'number', align: 'right' },
        { label: 'Full Day', key: 'is_full_day', type: 'status' },
        { label: 'Half Day', key: 'is_half_day', type: 'status' },
        { label: 'Holiday', key: 'is_holiday', type: 'status' },
        { label: 'Weekly Off', key: 'is_weekly_off', type: 'status' },
        { label: 'Leave', key: 'is_leave', type: 'status' }
      ]
    },
    hr_leave: {
      title: 'Employee Leave Report',
      description: 'Submitted leave applications and status',
      domain: 'hr',
      columns: [
        { label: 'From Date', key: 'from_date', type: 'date' },
        { label: 'To Date', key: 'to_date', type: 'date' },
        { label: 'Employee Code', key: 'employee_code' },
        { label: 'Employee Name', key: 'employee_name' },
        { label: 'Leave Type Name', key: 'leave_type_name' },
        { label: 'Leave Type Code', key: 'leave_type_code' },
        { label: 'Total Days', key: 'total_days', type: 'number', align: 'right' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Reason', key: 'reason' }
      ]
    },
    hr_payroll: {
      title: 'Payroll Summary Report',
      description: 'Pay run periods, paid days, gross earnings, deductions, and net pay',
      domain: 'hr',
      columns: [
        { label: 'Period Name', key: 'period_name' },
        { label: 'Period Start', key: 'period_start', type: 'date' },
        { label: 'Period End', key: 'period_end', type: 'date' },
        { label: 'Status', key: 'status', type: 'status' },
        { label: 'Employee Code', key: 'employee_code' },
        { label: 'Employee Name', key: 'employee_name' },
        { label: 'Working Days', key: 'working_days', type: 'number', align: 'right' },
        { label: 'Paid Days', key: 'paid_days', type: 'number', align: 'right' },
        { label: 'LOP Days', key: 'lop_days', type: 'number', align: 'right' },
        { label: 'Gross Earnings', key: 'gross_earnings', type: 'currency', align: 'right' },
        { label: 'Total Deductions', key: 'total_deductions', type: 'currency', align: 'right' },
        { label: 'Employer Contributions', key: 'employer_contributions', type: 'currency', align: 'right' },
        { label: 'Net Pay', key: 'net_pay', type: 'currency', align: 'right' }
      ]
    }
  };

  // Grouping report keys by domain for sub-tab navigation
  const domainReportsMap = useMemo(() => {
    const map = {
      accounts: ['accounts_ledger', 'accounts_trial_balance', 'accounts_profit_loss', 'accounts_balance_sheet', 'accounts_cash_flow', 'accounts_ar_aging', 'accounts_ap_aging'],
      inventory: ['inventory_stock', 'inventory_movement', 'inventory_valuation', 'inventory_aging'],
      procurement: ['procurement_orders', 'procurement_bills', 'procurement_performance'],
      projects: ['projects', 'projects_profitability'],
      sales: ['sales_quotations', 'sales_orders', 'sales_invoices'],
      hr: ['hr_attendance', 'hr_leave', 'hr_payroll']
    };

    // Integrate any additional dynamic report keys returned by catalog RPC if present
    if (catalog && Array.isArray(catalog.reports)) {
      catalog.reports.forEach(r => {
        const rKey = r.report_key || r.key;
        if (rKey && !Object.values(map).flat().includes(rKey)) {
          const dom = (r.domain || r.category || 'accounts').toLowerCase();
          if (map[dom]) map[dom].push(rKey);
          else map.accounts.push(rKey);
        }
      });
    }

    return map;
  }, [catalog]);

  // Executive summary values extracted directly from backend response JSON
  const exec = summary?.executive || {};
  const mgmtV2 = summary?.management_v2 || {};

  // Exact 12 Management KPIs mapped to backend RPC fields directly (Rule 6)
  const kpiData = [
    { title: 'Revenue', value: mgmtV2.profit_loss_income ?? exec.revenue, type: 'currency', sub: 'Total Income / Revenue', tone: 'sky' },
    { title: 'Net Result', value: mgmtV2.profit_loss_net, type: 'currency', sub: 'Net Profit / Income Result', tone: 'indigo' },
    { title: 'Collections', value: exec.collections, type: 'currency', sub: 'Sales Payment Receipts', tone: 'emerald' },
    { title: 'Receivables', value: mgmtV2.receivables_current ?? exec.receivables, type: 'currency', sub: 'Current Outstanding Invoices', tone: 'amber' },
    { title: 'Overdue Receivables', value: mgmtV2.receivables_overdue, type: 'currency', sub: 'Overdue Customer Bills', tone: 'rose' },
    { title: 'Payables', value: mgmtV2.payables_current ?? exec.payables, type: 'currency', sub: 'Current Outstanding Bills', tone: 'orange' },
    { title: 'Overdue Payables', value: mgmtV2.payables_overdue, type: 'currency', sub: 'Overdue Vendor Bills', tone: 'red' },
    { title: 'Inventory Valuation', value: exec.stock_value, type: 'currency', sub: 'On-Hand Stock Valuation', tone: 'cyan' },
    { title: 'Project Gross Contribution', value: mgmtV2.project_gross_contribution, type: 'currency', sub: 'Revenue - Direct Costs', tone: 'violet' },
    { title: 'Active Employees', value: exec.active_headcount, type: 'number', sub: 'Active Workforce Count', tone: 'teal' },
    { title: 'Open Tasks', value: exec.open_tasks, type: 'number', sub: 'Pending Execution Tasks', tone: 'blue' },
    { title: 'Overdue Tasks', value: exec.overdue_tasks, type: 'number', sub: 'Delayed Project Tasks', tone: 'amber' }
  ];

  const currentReportConfig = activeReportKey ? reportConfigs[activeReportKey] || {
    title: activeReportKey.replace(/_/g, ' ').toUpperCase(),
    description: 'Detailed report view generated from Supabase Reporting Engine',
    columns: []
  } : null;

  return (
    <div className="space-y-6">
      {/* Top Controls Header Bar */}
      <div className="os-card p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-lg font-black tracking-tight text-white">Reports & Analytics V2</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Executive overview, financial, operational, inventory, project, and HR intelligence</p>
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

      {/* Domain Navigation Tabs */}
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
          onClick={() => { setActiveTab('accounts'); setActiveReportKey('accounts_ledger'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <DollarSign size={15} /> Accounts & Finance
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
          onClick={() => { setActiveTab('projects'); setActiveReportKey('projects'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FolderKanban size={15} /> Projects
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
          onClick={() => { setActiveTab('hr'); setActiveReportKey('hr_attendance'); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'hr'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users size={15} /> HR & People
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

      {/* General Error Banner */}
      {summaryError && activeTab === 'overview' && !summaryAuthError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 font-bold">
          <ShieldAlert size={16} className="text-amber-600" /> {summaryError}
        </div>
      )}

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive 12 Management KPIs Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                12 Management Key Performance Indicators ({activeOperatingCompany?.name || 'Selected Company'})
              </h2>
              {summary?.generated_at && (
                <span className="text-[10px] text-slate-400 font-mono">
                  RPC Generated: {new Date(summary.generated_at).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {kpiData.map((kpi, i) => (
                <div key={i} className="os-card p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-sky-500">
                  <span className="text-[10px] font-black uppercase text-slate-400 block truncate">{kpi.title}</span>
                  <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                    {renderKpiValue(kpi.value, kpi.type === 'currency')}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{kpi.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 - 7: DOMAIN REPORT DETAIL VIEWS */}
      {activeTab !== 'overview' && (
        <div className="space-y-4">
          {/* Sub-tab Report Selector Bar */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
              <Layers size={13} /> Sub-Reports:
            </span>
            {(domainReportsMap[activeTab] || []).map(rKey => {
              const cfg = reportConfigs[rKey] || { title: rKey.replace(/_/g, ' ') };
              return (
                <button
                  key={rKey}
                  onClick={() => setActiveReportKey(rKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeReportKey === rKey
                      ? 'bg-slate-900 text-white dark:bg-sky-500 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cfg.title.replace(' Report', '').replace(' Statement', '')}
                </button>
              );
            })}
          </div>

          {/* Mandatory Semantic Notices */}
          {currentReportConfig?.notice && (
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-xl text-sky-800 dark:text-sky-300 text-xs flex items-center gap-2 font-medium shadow-sm">
              <Info size={16} className="text-sky-600 shrink-0" />
              <span>{currentReportConfig.notice}</span>
            </div>
          )}

          {/* Detailed Report Table */}
          {activeReportKey && (
            <ReportTable
              reportKey={activeReportKey}
              title={currentReportConfig?.title || activeReportKey}
              description={currentReportConfig?.description || 'Operational report view'}
              columns={currentReportConfig?.columns || []}
              tenantId={tenantId}
              operatingCompanyId={activeOperatingCompanyId}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}
        </div>
      )}
    </div>
  );
}
