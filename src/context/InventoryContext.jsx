import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';

const InventoryContext = createContext(null);

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

export function InventoryProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole,
    currentUser,
    session,
    works = []
  } = crmContext;

  const authUserId = session?.user?.id || currentUser?.id;

  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowed = ['owner', 'admin', 'manager'];
    return allowed.includes(r) || allowed.includes(tr);
  }, [userRole, tenantRole]);

  // Inventory State
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stockBalances, setStockBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- FETCHERS ---
  const fetchItems = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('inventory_items').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setItems(data || []);
    } catch (err) {
      console.error('[InventoryContext] Error fetching items:', err);
      setItems([]);
    }
  }, [tenantId]);

  const fetchLocations = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('inventory_locations').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setLocations(data || []);
    } catch (err) {
      console.error('[InventoryContext] Error fetching locations:', err);
      setLocations([]);
    }
  }, [tenantId]);

  const fetchStockBalances = useCallback(async (opCoId) => {
    try {
      let q = supabase
        .from('inventory_stock_balances')
        .select(`
          *,
          item:inventory_items(id, item_code, name, base_uom_code, reorder_level),
          location:inventory_locations(id, code, name, location_type)
        `)
        .order('updated_at', { ascending: false });

      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setStockBalances(data || []);
    } catch (err) {
      console.error('[InventoryContext] Error fetching stock balances:', err);
      setStockBalances([]);
    }
  }, [tenantId]);

  const fetchTransactions = useCallback(async (opCoId) => {
    try {
      let q = supabase
        .from('inventory_transactions')
        .select(`
          *,
          from_location:inventory_locations!from_location_id(id, code, name),
          to_location:inventory_locations!to_location_id(id, code, name),
          lines:inventory_transaction_lines(
            id, item_id, quantity, unit_cost, line_value, lot_number, notes,
            item:inventory_items(id, item_code, name, base_uom_code)
          )
        `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) throw err;
      setTransactions(data || []);
    } catch (err) {
      console.error('[InventoryContext] Error fetching transactions:', err);
      setTransactions([]);
    }
  }, [tenantId]);

  const refreshAllInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchItems(activeOperatingCompanyId),
        fetchLocations(activeOperatingCompanyId),
        fetchStockBalances(activeOperatingCompanyId),
        fetchTransactions(activeOperatingCompanyId)
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  }, [activeOperatingCompanyId, fetchItems, fetchLocations, fetchStockBalances, fetchTransactions]);

  useEffect(() => {
    refreshAllInventory();
  }, [refreshAllInventory]);

  // --- AUTHORITATIVE STOCK QUERY HELPER ---
  const getCurrentStock = useCallback((itemId, locationId, lotNumber = '') => {
    if (!itemId || !locationId) return 0;
    const balance = stockBalances.find(b => {
      const matchItem = b.item_id === itemId;
      const matchLoc = b.location_id === locationId;
      const matchLot = lotNumber ? b.lot_number === lotNumber : true;
      return matchItem && matchLoc && matchLot;
    });
    return balance ? Number(balance.quantity_on_hand) : 0;
  }, [stockBalances]);

  // --- RPC ACTIONS ---

  // 1. Create Inventory Item Atomic
  const createItem = useCallback(async (itemPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);

    try {
      if (!activeOperatingCompanyId && !tenantId) {
        throw new Error('Tenant or Operating Company context is required');
      }

      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        item_code: itemPayload.item_code?.trim(),
        name: itemPayload.name?.trim(),
        description: itemPayload.description?.trim() || '',
        category: itemPayload.category?.trim() || 'General',
        item_type: itemPayload.item_type || 'raw_material',
        base_uom_code: itemPayload.base_uom_code?.trim() || 'NOS',
        hsn_sac_code: itemPayload.hsn_sac_code?.trim() || '',
        reorder_level: Number(itemPayload.reorder_level) || 0,
        reorder_quantity: Number(itemPayload.reorder_quantity) || 0,
        is_active: itemPayload.is_active !== false,
        idempotency_key: crypto.randomUUID()
      };

      const { data, error: rpcErr } = await supabase.rpc('create_inventory_item_atomic', {
        p_payload: payload
      });

      if (rpcErr) throw rpcErr;

      await refreshAllInventory();
      return { success: true, data };
    } catch (err) {
      console.error('[InventoryContext] createItem Error:', err);
      const msg = err.message || 'Failed to create item';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllInventory]);

  // 2. Create Inventory Location Atomic
  const createLocation = useCallback(async (locPayload) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);

    try {
      if (!activeOperatingCompanyId && !tenantId) {
        throw new Error('Tenant or Operating Company context is required');
      }

      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        code: locPayload.code?.trim(),
        name: locPayload.name?.trim(),
        location_type: locPayload.location_type || 'Warehouse',
        parent_location_id: locPayload.parent_location_id || null,
        is_stock_location: locPayload.is_stock_location !== false,
        is_active: locPayload.is_active !== false,
        idempotency_key: crypto.randomUUID()
      };

      const { data, error: rpcErr } = await supabase.rpc('create_inventory_location_atomic', {
        p_payload: payload
      });

      if (rpcErr) throw rpcErr;

      await refreshAllInventory();
      return { success: true, data };
    } catch (err) {
      console.error('[InventoryContext] createLocation Error:', err);
      const msg = err.message || 'Failed to create location';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllInventory]);

  // 3. Post Inventory Transaction Atomic
  const postTransaction = useCallback(async (txPayload, customIdempotencyKey = null) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);

    try {
      if (!activeOperatingCompanyId && !tenantId) {
        throw new Error('Tenant or Operating Company context is required');
      }

      const fromLocId = txPayload.from_location_id || null;
      const toLocId = txPayload.to_location_id || null;

      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        transaction_type: txPayload.transaction_type,
        transaction_date: txPayload.transaction_date || new Date().toISOString(),
        from_location_id: fromLocId,
        to_location_id: toLocId,
        reference_no: txPayload.reference_no?.trim() || '',
        work_id: txPayload.work_id || null,
        notes: txPayload.notes?.trim() || '',
        idempotency_key: customIdempotencyKey || txPayload.idempotency_key || crypto.randomUUID(),
        lines: (txPayload.lines || []).map(l => ({
          item_id: l.item_id,
          quantity: Number(l.quantity) || 0,
          unit_cost: Number(l.unit_cost) || 0,
          lot_number: l.lot_number?.trim() || '',
          notes: l.notes?.trim() || ''
        }))
      };

      const { data, error: rpcErr } = await supabase.rpc('post_inventory_transaction_atomic', {
        p_payload: payload
      });

      if (rpcErr) throw rpcErr;

      await refreshAllInventory();
      return { success: true, data };
    } catch (err) {
      console.error('[InventoryContext] postTransaction Error:', err);
      const msg = err.message || 'Transaction failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllInventory]);

  // Derived Dashboard Metrics
  const metrics = useMemo(() => {
    const totalItems = items.length;
    const totalLocations = locations.length;
    
    let totalStockValue = 0;
    let lowStockCount = 0;

    stockBalances.forEach(bal => {
      const qty = Number(bal.quantity_on_hand) || 0;
      const avgCost = Number(bal.average_unit_cost) || 0;
      const val = qty * avgCost;
      totalStockValue += val;
      const item = items.find(i => i.id === bal.item_id);
      if (item && item.reorder_level > 0 && qty <= item.reorder_level) {
        lowStockCount += 1;
      }
    });

    const recentTransactions = transactions.slice(0, 5);

    return {
      totalItems,
      totalLocations,
      totalStockValue,
      lowStockCount,
      recentTransactions
    };
  }, [items, locations, stockBalances, transactions]);

  const value = {
    items,
    locations,
    stockBalances,
    transactions,
    isLoading,
    submitting,
    error,
    setError,
    metrics,
    getCurrentStock,
    refreshAllInventory,
    createItem,
    createLocation,
    postTransaction,
    isManagementOrAdmin,
    works
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
