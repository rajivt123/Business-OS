import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet, Download, RefreshCw, ChevronLeft, ChevronRight,
  AlertCircle, ShieldAlert, FileText
} from 'lucide-react';

export default function ReportTable({
  reportKey,
  title,
  description,
  columns = [],
  tenantId,
  operatingCompanyId,
  fromDate,
  toDate
}) {
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);

  // Fetch report rows from Supabase Reporting Engine RPC
  const fetchReportRows = useCallback(async () => {
    if (!tenantId || !operatingCompanyId) {
      setError('Operating company context is required to fetch report data.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAuthError(null);

    try {
      const { data, error: rpcErr } = await supabase.rpc('get_business_report_rows_atomic', {
        p_tenant_id: tenantId,
        p_tenant_company_id: operatingCompanyId,
        p_report_key: reportKey,
        p_from_date: fromDate,
        p_to_date: toDate,
        p_limit: limit,
        p_offset: offset
      });

      if (rpcErr) {
        if (rpcErr.code === '42501' || (rpcErr.message || '').toLowerCase().includes('authorized')) {
          setAuthError(rpcErr.message || 'Access Denied: You do not have MANAGER-level reporting permissions for this company.');
        } else {
          setError(rpcErr.message || rpcErr.details || 'Failed to fetch report rows');
        }
        setRows([]);
        return;
      }

      setRows(data?.rows || []);
      setGeneratedAt(data?.generated_at || null);
    } catch (err) {
      console.error(`Error fetching report rows for ${reportKey}:`, err);
      setError(err.message || 'An unexpected error occurred while loading the report.');
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, operatingCompanyId, reportKey, fromDate, toDate, limit, offset]);

  useEffect(() => {
    fetchReportRows();
  }, [fetchReportRows]);

  // Reset pagination offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [tenantId, operatingCompanyId, fromDate, toDate, reportKey]);

  // Dynamic fallback for columns if explicit columns array is not supplied or empty
  const effectiveColumns = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (rows && rows.length > 0) {
      return Object.keys(rows[0]).map(key => {
        const kLower = key.toLowerCase();
        let type = 'string';
        let align = 'left';
        if (
          kLower.includes('amount') || kLower.includes('cost') || kLower.includes('value') ||
          kLower.includes('revenue') || kLower.includes('price') || kLower.includes('balance') ||
          kLower.includes('debit') || kLower.includes('credit') || kLower.includes('net') ||
          kLower.includes('pay') || kLower.includes('earnings') || kLower.includes('deduction') ||
          kLower.includes('gross') || kLower.includes('contribution')
        ) {
          type = 'currency';
          align = 'right';
        } else if (kLower.includes('date') || kLower.includes('_at')) {
          type = 'date';
        } else if (kLower.includes('status') || kLower.includes('is_') || kLower.includes('flag') || kLower.includes('overdue')) {
          type = 'status';
        } else if (
          kLower.includes('count') || kLower.includes('qty') || kLower.includes('quantity') ||
          kLower.includes('days') || kLower.includes('level') || kLower.includes('tasks') ||
          kLower.includes('number') || kLower.includes('age') || kLower.includes('line_no')
        ) {
          type = 'number';
          align = 'right';
        }
        return {
          label: key.replace(/_/g, ' ').toUpperCase(),
          key: key,
          type,
          align
        };
      });
    }
    return [];
  }, [columns, rows]);

  // Strict value formatters: null/undefined/missing = "Unavailable" (Rule 4)
  const formatCellValue = (val, type) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">Unavailable</span>;
    }

    switch (type) {
      case 'currency': {
        const num = Number(val);
        if (isNaN(num)) return <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">Unavailable</span>;
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      case 'number':
      case 'integer': {
        const num = Number(val);
        if (isNaN(num)) return <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">Unavailable</span>;
        return num.toLocaleString('en-IN');
      }
      case 'percent': {
        const num = Number(val);
        if (isNaN(num)) return <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">Unavailable</span>;
        return `${num.toFixed(1)}%`;
      }
      case 'date': {
        try {
          return new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
          return String(val);
        }
      }
      case 'status': {
        const statusStr = String(val).toLowerCase();
        let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        if (['approved', 'active', 'paid', 'posted', 'completed', 'verified', 'present', 'false', 'no'].includes(statusStr)) {
          badgeStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
        } else if (['pending', 'draft', 'in_progress', 'open', 'partially_paid', 'late'].includes(statusStr)) {
          badgeStyle = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
        } else if (['rejected', 'cancelled', 'overdue', 'absent', 'revoked', 'true', 'yes'].includes(statusStr)) {
          badgeStyle = 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300';
        }
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeStyle}`}>
            {String(val).replace(/_/g, ' ')}
          </span>
        );
      }
      default:
        return String(val);
    }
  };

  // Export to XLSX / CSV consuming backend fields directly without client-side financial calculations
  const handleExport = (exportType = 'xlsx') => {
    if (rows.length === 0) return;

    const exportData = rows.map(r => {
      const rowObj = {};
      effectiveColumns.forEach(col => {
        const val = r[col.key];
        rowObj[col.label] = val !== undefined && val !== null && val !== '' ? val : 'Unavailable';
      });
      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');

    const fileName = `${reportKey}_${fromDate}_to_${toDate}.${exportType}`;
    if (exportType === 'csv') {
      XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
    } else {
      XLSX.writeFile(workbook, fileName);
    }
  };

  const pageNum = Math.floor(offset / limit) + 1;

  return (
    <div className="os-card overflow-hidden space-y-0">
      {/* Header & Controls */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText size={16} className="text-sky-500" /> {title}
          </h3>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            disabled={rows.length === 0 || isLoading}
            className="os-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            title="Export report to Excel XLSX"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Export XLSX
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={rows.length === 0 || isLoading}
            className="os-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            title="Export report to CSV"
          >
            <Download size={14} className="text-sky-600" /> Export CSV
          </button>
          <button
            onClick={fetchReportRows}
            disabled={isLoading}
            className="os-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Authorization Error Banner */}
      {authError && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-black">
            <ShieldAlert size={18} className="text-rose-600" /> Access Denied: Reporting Permissions Required
          </div>
          <p className="leading-relaxed text-[11px]">{authError}</p>
        </div>
      )}

      {/* General Error Banner */}
      {error && !authError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 font-bold">
          <AlertCircle size={16} className="text-amber-600" /> {error}
        </div>
      )}

      {/* Table Data Container */}
      <div className="overflow-x-auto min-h-[250px]">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-3">
            <RefreshCw size={24} className="animate-spin mx-auto text-sky-500" />
            <p className="font-bold">Executing Reporting Engine query...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <FileText size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-slate-600 dark:text-slate-400">No data for selected period</p>
            <p className="text-[11px] text-slate-400">No transactional rows returned for the selected date range and operating company.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900">
                <th className="px-4 py-3 text-center w-12">#</th>
                {effectiveColumns.map(col => (
                  <th key={col.key || col.label} className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-4 py-3 text-center text-[10px] font-mono text-slate-400">{offset + idx + 1}</td>
                  {effectiveColumns.map(col => {
                    const val = row[col.key];
                    const isRight = col.align === 'right' || col.type === 'currency' || col.type === 'number';
                    return (
                      <td key={col.key || col.label} className={`px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 ${isRight ? 'text-right font-mono' : ''}`}>
                        {formatCellValue(val, col.type)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer & Pagination */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>Showing {rows.length} rows</span>
          {generatedAt && <span>• Generated at {new Date(generatedAt).toLocaleTimeString()}</span>}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs font-bold"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0 || isLoading}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-bold text-xs">Page {pageNum}</span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={rows.length < limit || isLoading}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
