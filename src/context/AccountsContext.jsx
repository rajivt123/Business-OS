import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';

const AccountsContext = createContext(null);

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
}

export function AccountsProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole
  } = crmContext;

  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowed = ['owner', 'admin', 'manager'];
    return allowed.includes(r) || allowed.includes(tr);
  }, [userRole, tenantRole]);

  // Accounts State
  const [accounts, setAccounts] = useState([]);
  const [fiscalPeriods, setFiscalPeriods] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- FETCHERS ---
  const fetchAccounts = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('chart_of_accounts').select('*').order('account_code', { ascending: true });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setAccounts(data || []);
    } catch (err) {
      console.error('[AccountsContext] Error fetching accounts:', err);
      setAccounts([]);
    }
  }, [tenantId]);

  const fetchFiscalPeriods = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('accounting_fiscal_periods').select('*').order('period_start', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setFiscalPeriods(data || []);
    } catch (err) {
      console.error('[AccountsContext] Error fetching fiscal periods:', err);
      setFiscalPeriods([]);
    }
  }, [tenantId]);

  const fetchJournalEntries = useCallback(async (opCoId) => {
    try {
      let q = supabase
        .from('accounting_journal_entries')
        .select(`
          *,
          lines:accounting_journal_lines(
            id, account_id, debit_amount, credit_amount, narration,
            account:chart_of_accounts(id, account_code, account_name)
          )
        `)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setJournalEntries(data || []);
    } catch (err) {
      console.error('[AccountsContext] Error fetching journal entries:', err);
      setJournalEntries([]);
    }
  }, [tenantId]);

  const fetchBankAccounts = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('accounting_bank_accounts').select(`
        *,
        ledger_account:chart_of_accounts(id, account_code, account_name)
      `).order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setBankAccounts(data || []);
    } catch (err) {
      console.error('[AccountsContext] Error fetching bank accounts:', err);
      setBankAccounts([]);
    }
  }, [tenantId]);

  const fetchBankTransactions = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('accounting_bank_transactions').select(`
        *,
        bank_account:accounting_bank_accounts(id, account_name, bank_name)
      `).order('transaction_date', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setBankTransactions(data || []);
    } catch (err) {
      console.error('[AccountsContext] Error fetching bank transactions:', err);
      setBankTransactions([]);
    }
  }, [tenantId]);

  const refreshAllAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchAccounts(activeOperatingCompanyId),
        fetchFiscalPeriods(activeOperatingCompanyId),
        fetchJournalEntries(activeOperatingCompanyId),
        fetchBankAccounts(activeOperatingCompanyId),
        fetchBankTransactions(activeOperatingCompanyId)
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load accounting data');
    } finally {
      setIsLoading(false);
    }
  }, [activeOperatingCompanyId, fetchAccounts, fetchFiscalPeriods, fetchJournalEntries, fetchBankAccounts, fetchBankTransactions]);

  useEffect(() => {
    refreshAllAccounts();
  }, [refreshAllAccounts]);

  // --- AUTHORITATIVE RPC WRAPPERS ---

  // 1. Create Fiscal Period
  const createFiscalPeriod = useCallback(async (periodPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        period_name: periodPayload.period_name?.trim(),
        period_start: periodPayload.period_start,
        period_end: periodPayload.period_end,
        is_closed: periodPayload.is_closed === true,
        idempotency_key: periodPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: rpcErr } = await supabase.rpc('create_fiscal_period_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] createFiscalPeriod Error:', err);
      const msg = err.message || 'Failed to create fiscal period';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 2. Close Fiscal Period
  const closeFiscalPeriod = useCallback(async (fiscalPeriodId) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        fiscal_period_id: fiscalPeriodId
      };
      const { data, error: rpcErr } = await supabase.rpc('close_fiscal_period_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] closeFiscalPeriod Error:', err);
      const msg = err.message || 'Failed to close fiscal period';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 3. Lock Fiscal Period
  const lockFiscalPeriod = useCallback(async (fiscalPeriodId) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        fiscal_period_id: fiscalPeriodId
      };
      const { data, error: rpcErr } = await supabase.rpc('lock_fiscal_period_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] lockFiscalPeriod Error:', err);
      const msg = err.message || 'Failed to lock fiscal period';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 4. Create Account
  const createAccount = useCallback(async (accPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        account_code: accPayload.account_code?.trim(),
        account_name: accPayload.account_name?.trim(),
        account_type: accPayload.account_type,
        account_subtype: accPayload.account_subtype?.trim() || '',
        parent_account_id: accPayload.parent_account_id || null,
        is_control_account: accPayload.is_control_account === true,
        is_system_account: accPayload.is_system_account === true,
        is_active: accPayload.is_active !== false,
        idempotency_key: accPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: rpcErr } = await supabase.rpc('create_account_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] createAccount Error:', err);
      const msg = err.message || 'Failed to create account';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 5. Update Account
  const updateAccount = useCallback(async (accPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        account_id: accPayload.account_id,
        account_name: accPayload.account_name?.trim(),
        account_subtype: accPayload.account_subtype?.trim(),
        is_active: accPayload.is_active
      };
      const { data, error: rpcErr } = await supabase.rpc('update_account_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] updateAccount Error:', err);
      const msg = err.message || 'Failed to update account';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 6. Deactivate Account
  const deactivateAccount = useCallback(async (accountId) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        account_id: accountId
      };
      const { data, error: rpcErr } = await supabase.rpc('deactivate_account_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] deactivateAccount Error:', err);
      const msg = err.message || 'Failed to deactivate account';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 7. Post Journal Entry
  const postJournalEntry = useCallback(async (jePayload, customIdempotencyKey = null) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const totalDebit = (jePayload.lines || []).reduce((sum, l) => sum + (Number(l.debit_amount) || 0), 0);
      const totalCredit = (jePayload.lines || []).reduce((sum, l) => sum + (Number(l.credit_amount) || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        throw new Error(`Unbalanced Journal Entry: Total Debit (₹${totalDebit.toFixed(2)}) does not equal Total Credit (₹${totalCredit.toFixed(2)})`);
      }

      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        voucher_no: jePayload.voucher_no?.trim() || '',
        voucher_type: jePayload.voucher_type || 'JOURNAL',
        entry_date: jePayload.entry_date || new Date().toISOString().slice(0, 10),
        narration: jePayload.narration?.trim() || '',
        reference_no: jePayload.reference_no?.trim() || '',
        idempotency_key: customIdempotencyKey || jePayload.idempotency_key || crypto.randomUUID(),
        lines: (jePayload.lines || []).map(l => ({
          account_id: l.account_id,
          debit_amount: Number(l.debit_amount) || 0,
          credit_amount: Number(l.credit_amount) || 0,
          narration: l.narration?.trim() || ''
        }))
      };

      const { data, error: rpcErr } = await supabase.rpc('post_journal_entry_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;

      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] postJournalEntry Error:', err);
      const msg = err.message || 'Failed to post journal entry';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 8. Reverse Journal Entry
  const reverseJournalEntry = useCallback(async (journalEntryId, reversalReason = 'Journal Reversal') => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        journal_entry_id: journalEntryId,
        reversal_reason: reversalReason,
        idempotency_key: crypto.randomUUID()
      };
      const { data, error: rpcErr } = await supabase.rpc('reverse_journal_entry_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] reverseJournalEntry Error:', err);
      const msg = err.message || 'Failed to reverse journal entry';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 9. Create Bank Account
  const createBankAccount = useCallback(async (bankPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        account_name: bankPayload.account_name?.trim(),
        bank_name: bankPayload.bank_name?.trim(),
        account_number: bankPayload.account_number?.trim(),
        ifsc_code: bankPayload.ifsc_code?.trim(),
        branch_name: bankPayload.branch_name?.trim(),
        ledger_account_id: bankPayload.ledger_account_id,
        account_type: bankPayload.account_type || 'BANK',
        currency: bankPayload.currency || 'INR',
        initial_balance: Number(bankPayload.initial_balance) || 0,
        idempotency_key: bankPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: rpcErr } = await supabase.rpc('create_bank_account_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] createBankAccount Error:', err);
      const msg = err.message || 'Failed to create bank account';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 10. Update Bank Account
  const updateBankAccount = useCallback(async (bankPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        bank_account_id: bankPayload.bank_account_id,
        account_name: bankPayload.account_name?.trim(),
        bank_name: bankPayload.bank_name?.trim(),
        ifsc_code: bankPayload.ifsc_code?.trim(),
        branch_name: bankPayload.branch_name?.trim(),
        is_active: bankPayload.is_active !== false
      };
      const { data, error: rpcErr } = await supabase.rpc('update_bank_account_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] updateBankAccount Error:', err);
      const msg = err.message || 'Failed to update bank account';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 11. Post Bank Transaction (Receipt/Payment/Charge/Interest)
  const postBankTransaction = useCallback(async (txPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        bank_account_id: txPayload.bank_account_id,
        transaction_type: txPayload.transaction_type, // 'RECEIPT', 'PAYMENT', 'BANK_CHARGE', 'INTEREST'
        transaction_date: txPayload.transaction_date || new Date().toISOString().slice(0, 10),
        amount: Number(txPayload.amount) || 0,
        reference_number: txPayload.reference_number?.trim() || '',
        description: txPayload.description?.trim() || '',
        contra_account_id: txPayload.contra_account_id,
        idempotency_key: txPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: rpcErr } = await supabase.rpc('post_bank_transaction_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] postBankTransaction Error:', err);
      const msg = err.message || 'Failed to post bank transaction';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 12. Reconcile Bank Transaction
  const reconcileBankTransaction = useCallback(async (bankTransactionId, isReconciled = true, notes = '') => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        bank_transaction_id: bankTransactionId,
        is_reconciled: isReconciled,
        reconciled_notes: notes
      };
      const { data, error: rpcErr } = await supabase.rpc('reconcile_bank_transaction_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] reconcileBankTransaction Error:', err);
      const msg = err.message || 'Failed to update reconciliation';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // 13. Bank Transfer (Bank A -> Bank B)
  const bankTransfer = useCallback(async (transferPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        source_bank_account_id: transferPayload.source_bank_account_id,
        destination_bank_account_id: transferPayload.destination_bank_account_id,
        amount: Number(transferPayload.amount) || 0,
        transfer_date: transferPayload.transfer_date || new Date().toISOString().slice(0, 10),
        reference_number: transferPayload.reference_number?.trim() || '',
        description: transferPayload.description?.trim() || 'Bank Transfer',
        bank_charge_amount: Number(transferPayload.bank_charge_amount) || 0,
        bank_charge_account_id: transferPayload.bank_charge_account_id || null,
        idempotency_key: transferPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: rpcErr } = await supabase.rpc('bank_transfer_atomic', { p_payload: payload });
      if (rpcErr) throw rpcErr;
      await refreshAllAccounts();
      return { success: true, data };
    } catch (err) {
      console.error('[AccountsContext] bankTransfer Error:', err);
      const msg = err.message || 'Failed to complete bank transfer';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllAccounts]);

  // Derived Dashboard Metrics
  const metrics = useMemo(() => {
    let totalCashBank = 0;
    let totalReceivables = 0;
    let totalPayables = 0;

    bankAccounts.forEach(b => {
      totalCashBank += Number(b.current_balance || 0);
    });

    const activePeriod = fiscalPeriods.find(fp => !fp.is_closed) || fiscalPeriods[0] || null;
    const recentJournals = journalEntries.slice(0, 5);

    return {
      totalCashBank,
      totalReceivables,
      totalPayables,
      activePeriod,
      recentJournals,
      totalAccounts: accounts.length,
      totalJournals: journalEntries.length
    };
  }, [accounts, fiscalPeriods, journalEntries, bankAccounts]);

  const value = {
    accounts,
    fiscalPeriods,
    journalEntries,
    bankAccounts,
    bankTransactions,
    isLoading,
    submitting,
    error,
    setError,
    metrics,
    refreshAllAccounts,
    createFiscalPeriod,
    closeFiscalPeriod,
    lockFiscalPeriod,
    createAccount,
    updateAccount,
    deactivateAccount,
    postJournalEntry,
    reverseJournalEntry,
    createBankAccount,
    updateBankAccount,
    postBankTransaction,
    reconcileBankTransaction,
    bankTransfer,
    isManagementOrAdmin
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}
