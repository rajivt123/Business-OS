import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import {
  BookOpen, Plus, Filter, Download, ArrowUpRight, ArrowDownLeft,
  Search, Calendar, FileText, CheckCircle2, ChevronDown, Landmark,
  RefreshCw
} from 'lucide-react';

export default function AccountsLedger() {
  const navigate = useNavigate();
  const {
    accounts = [], journalEntries = [], bankAccounts = [],
    metrics = {}, fromDate, toDate, setFromDate, setToDate,
    refreshAllAccounts, isLoading
  } = useAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('ALL');

  // Filtered transactions / ledger rows
  const ledgerRows = useMemo(() => {
    let runningBalance = 0;
    const entries = [];

    // Parse journal entries into ledger lines
    journalEntries.forEach(entry => {
      const lines = entry.lines || entry.journal_entry_lines || [];
      if (lines.length > 0) {
        lines.forEach(line => {
          if (selectedAccountId !== 'ALL' && line.account_id !== selectedAccountId) return;
          const debit = Number(line.debit_amount || line.debit || 0);
          const credit = Number(line.credit_amount || line.credit || 0);
          runningBalance += (debit - credit);

          const acc = accounts.find(a => a.id === line.account_id);

          entries.push({
            id: line.id || `${entry.id}-${line.account_id}`,
            date: entry.entry_date || entry.created_at,
            voucherNo: entry.entry_number || entry.voucher_number || 'JV-000',
            description: line.description || entry.narration || 'Journal line',
            accountName: acc ? `${acc.account_code || ''} ${acc.account_name}` : 'General Account',
            accountType: acc?.account_type || 'GENERAL',
            debit,
            credit,
            runningBalance,
            status: entry.status || 'posted',
          });
        });
      } else {
        // Flat entry fallback
        if (selectedAccountId !== 'ALL' && entry.account_id !== selectedAccountId) return;
        const debit = Number(entry.debit || 0);
        const credit = Number(entry.credit || 0);
        runningBalance += (debit - credit);
        const acc = accounts.find(a => a.id === entry.account_id);

        entries.push({
          id: entry.id,
          date: entry.entry_date || entry.created_at,
          voucherNo: entry.entry_number || 'JV-000',
          description: entry.narration || entry.description || 'Journal entry',
          accountName: acc ? `${acc.account_code || ''} ${acc.account_name}` : 'General Account',
          accountType: acc?.account_type || 'GENERAL',
          debit,
          credit,
          runningBalance,
          status: entry.status || 'posted',
        });
      }
    });

    // Filter by search query
    return entries.filter(row => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.voucherNo.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.accountName.toLowerCase().includes(q)
      );
    });
  }, [journalEntries, accounts, selectedAccountId, searchQuery]);

  // Aggregate totals
  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    ledgerRows.forEach(r => {
      totalDebit += r.debit;
      totalCredit += r.credit;
    });
    return {
      totalDebit,
      totalCredit,
      netBalance: totalDebit - totalCredit,
      count: ledgerRows.length,
    };
  }, [ledgerRows]);

  return (
    <div className="bos-density-finance" style={{
      padding: 'var(--bos-space-6)',
      maxWidth: 1380,
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--bos-space-4)',
        marginBottom: 'var(--bos-space-5)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--bos-text-primary)' }}>
              General Ledger & Accounts
            </h1>
            <span className="bos-badge bos-badge-accent" style={{ fontSize: 11 }}>
              {selectedAccountId === 'ALL' ? 'All Accounts' : accounts.find(a => a.id === selectedAccountId)?.account_name || 'Account'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--bos-text-secondary)', marginTop: 2 }}>
            Real-time financial transactions, vouchers, and audit ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)' }}>
          <button
            type="button"
            className="bos-btn bos-btn-ghost bos-btn-sm"
            onClick={() => refreshAllAccounts && refreshAllAccounts()}
            title="Refresh accounts"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="bos-btn bos-btn-secondary bos-btn-sm"
            onClick={() => window.print()}
          >
            <Download size={14} />
            <span>Export</span>
          </button>
          <button
            type="button"
            className="bos-btn bos-btn-primary bos-btn-sm"
            onClick={() => navigate('/accounts')}
          >
            <Plus size={14} />
            <span>Post Journal</span>
          </button>
        </div>
      </div>

      {/* Metric Strip (Finance density) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--bos-space-3)',
        marginBottom: 'var(--bos-space-5)'
      }}>
        <div className="bos-card" style={{ padding: 'var(--bos-space-3) var(--bos-space-4)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--bos-text-tertiary)', textTransform: 'uppercase' }}>
            Total Debit
          </span>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bos-text-primary)', marginTop: 2 }}>
            ₹{totals.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bos-card" style={{ padding: 'var(--bos-space-3) var(--bos-space-4)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--bos-text-tertiary)', textTransform: 'uppercase' }}>
            Total Credit
          </span>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bos-text-primary)', marginTop: 2 }}>
            ₹{totals.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bos-card" style={{ padding: 'var(--bos-space-3) var(--bos-space-4)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--bos-text-tertiary)', textTransform: 'uppercase' }}>
            Net Ledger Position
          </span>
          <div style={{
            fontSize: 18, fontWeight: 700, marginTop: 2,
            color: totals.netBalance >= 0 ? 'var(--bos-success)' : 'var(--bos-error)'
          }}>
            ₹{Math.abs(totals.netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span style={{ fontSize: 12, marginLeft: 4, fontWeight: 500 }}>{totals.netBalance >= 0 ? 'Dr' : 'Cr'}</span>
          </div>
        </div>
        <div className="bos-card" style={{ padding: 'var(--bos-space-3) var(--bos-space-4)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--bos-text-tertiary)', textTransform: 'uppercase' }}>
            Active Ledger Entries
          </span>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bos-text-primary)', marginTop: 2 }}>
            {totals.count}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bos-card" style={{
        padding: 'var(--bos-space-3) var(--bos-space-4)',
        marginBottom: 'var(--bos-space-4)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--bos-space-3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-3)', flexWrap: 'wrap', flex: 1 }}>
          {/* Account selector */}
          <div style={{ minWidth: 220 }}>
            <select
              className="bos-select"
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              style={{ fontSize: 13 }}
            >
              <option value="ALL">All Chart of Accounts ({accounts.length})</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_code ? `${a.account_code} - ` : ''}{a.account_name} ({a.account_type})
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: 200, flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--bos-text-tertiary)' }} />
            <input
              type="text"
              className="bos-input"
              placeholder="Search voucher, narration, account..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 30, fontSize: 13 }}
            />
          </div>
        </div>

        {/* Date Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)' }}>
          <Calendar size={14} style={{ color: 'var(--bos-text-tertiary)' }} />
          <input
            type="date"
            className="bos-input"
            value={fromDate || ''}
            onChange={e => setFromDate && setFromDate(e.target.value)}
            style={{ fontSize: 12, padding: '4px 8px' }}
          />
          <span style={{ fontSize: 12, color: 'var(--bos-text-disabled)' }}>to</span>
          <input
            type="date"
            className="bos-input"
            value={toDate || ''}
            onChange={e => setToDate && setToDate(e.target.value)}
            style={{ fontSize: 12, padding: '4px 8px' }}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bos-section" style={{ marginBottom: 0 }}>
        <div className="bos-table-container" style={{ overflowX: 'auto' }}>
          {ledgerRows.length === 0 ? (
            <div className="bos-empty" style={{ padding: 'var(--bos-space-12) 0' }}>
              <BookOpen size={32} className="bos-empty-icon" />
              <p className="bos-empty-text">No ledger entries match your filter criteria.</p>
              <button
                className="bos-btn bos-btn-ghost bos-btn-sm"
                onClick={() => {
                  setSelectedAccountId('ALL');
                  setSearchQuery('');
                }}
                style={{ marginTop: 8 }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <table className="bos-table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Date</th>
                  <th style={{ width: 120 }}>Voucher #</th>
                  <th style={{ minWidth: 200 }}>Account & Type</th>
                  <th style={{ minWidth: 240 }}>Narration / Description</th>
                  <th style={{ width: 130, textAlign: 'right' }}>Debit (₹)</th>
                  <th style={{ width: 130, textAlign: 'right' }}>Credit (₹)</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td style={{ fontSize: 12, color: 'var(--bos-text-secondary)', whiteSpace: 'nowrap' }}>
                      {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--bos-text-primary)', fontSize: 12 }}>
                      {row.voucherNo}
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bos-text-primary)' }}>
                        {row.accountName}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--bos-text-tertiary)', textTransform: 'capitalize' }}>
                        {row.accountType.toLowerCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--bos-text-secondary)', lineHeight: 1.4 }}>
                      {row.description}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: row.debit > 0 ? 600 : 400, color: row.debit > 0 ? 'var(--bos-text-primary)' : 'var(--bos-text-disabled)' }}>
                      {row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: row.credit > 0 ? 600 : 400, color: row.credit > 0 ? 'var(--bos-text-primary)' : 'var(--bos-text-disabled)' }}>
                      {row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 600,
                      color: row.runningBalance >= 0 ? 'var(--bos-text-primary)' : 'var(--bos-error)'
                    }}>
                      ₹{Math.abs(row.runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.runningBalance >= 0 ? 'Dr' : 'Cr'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
