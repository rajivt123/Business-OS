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
  const [reservations, setReservations] = useState([]);
  const [fulfilments, setFulfilments] = useState([]);
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

  const fetchReservations = useCallback(async (opCoId) => {
    try {
      let q = supabase
        .from('inventory_reservations')
        .select(`
          *,
          sales_order:sales_orders(id, customer_name, total_amount, status),
          lines:inventory_reservation_lines(
            *,
            sales_order_item:sales_order_items(id, item_description, quantity, unit_price),
            item:inventory_items(id, item_code, name, base_uom_code),
            location:inventory_locations(id, code, name, location_type)
          )
        `)
        .order('created_at', { ascending: false });

      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) {
        let q2 = supabase
          .from('inventory_reservations')
          .select(`
            *,
            lines:inventory_reservation_lines(*)
          `)
          .order('created_at', { ascending: false });
        if (opCoId) q2 = q2.eq('tenant_company_id', opCoId);
        else if (tenantId) q2 = q2.eq('tenant_id', tenantId);
        const { data: data2, error: err2 } = await q2;
        if (err2) throw err2;
        setReservations(data2 || []);
      } else {
        setReservations(data || []);
      }
    } catch (err) {
      console.error('[InventoryContext] Error fetching reservations:', err);
      setReservations([]);
    }
  }, [tenantId]);

  const fetchFulfilments = useCallback(async (opCoId) => {
    try {
      let q = supabase
        .from('inventory_fulfilment_lines')
        .select(`
          *,
          sales_order_item:sales_order_items(id, item_description, quantity, unit_price),
          item:inventory_items(id, item_code, name, base_uom_code),
          location:inventory_locations(id, code, name, location_type),
          transaction:inventory_transactions!inventory_fulfilment_lines_inventory_transaction_id_fkey(id, reference_no, transaction_type, transaction_date)
        `)
        .order('created_at', { ascending: false });

      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      else if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: err } = await q;
      if (err) {
        let q2 = supabase
          .from('inventory_fulfilment_lines')
          .select('*')
          .order('created_at', { ascending: false });
        if (opCoId) q2 = q2.eq('tenant_company_id', opCoId);
        else if (tenantId) q2 = q2.eq('tenant_id', tenantId);
        const { data: data2, error: err2 } = await q2;
        if (err2) throw err2;
        setFulfilments(data2 || []);
      } else {
        setFulfilments(data || []);
      }
    } catch (err) {
      console.error('[InventoryContext] Error fetching fulfilments:', err);
      setFulfilments([]);
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
        fetchTransactions(activeOperatingCompanyId),
        fetchReservations(activeOperatingCompanyId),
        fetchFulfilments(activeOperatingCompanyId)
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  }, [activeOperatingCompanyId, fetchItems, fetchLocations, fetchStockBalances, fetchTransactions, fetchReservations, fetchFulfilments]);

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

  const getReservedStock = useCallback((itemId, locationId, lotNumber = '') => {
    if (!itemId || !locationId) return 0;
    let totalReserved = 0;
    reservations.forEach(r => {
      const status = (r.status || '').toLowerCase();
      if (status === 'released' || status === 'cancelled') return;
      (r.lines || []).forEach(l => {
        const matchItem = l.item_id === itemId;
        const matchLoc = l.location_id === locationId;
        const matchLot = lotNumber ? (l.lot_number === lotNumber) : true;
        const lineStatus = (l.status || '').toLowerCase();
        if (matchItem && matchLoc && matchLot && lineStatus !== 'released' && lineStatus !== 'cancelled') {
          const reqQty = Number(l.reserved_quantity) || Number(l.quantity) || 0;
          const relQty = Number(l.released_quantity) || 0;
          const remQty = Math.max(0, reqQty - relQty);
          totalReserved += remQty;
        }
      });
    });
    return totalReserved;
  }, [reservations]);

  const getAvailableStock = useCallback((itemId, locationId, lotNumber = '') => {
    const physicalStock = getCurrentStock(itemId, locationId, lotNumber);
    const reservedStock = getReservedStock(itemId, locationId, lotNumber);
    return Math.max(0, physicalStock - reservedStock);
  }, [getCurrentStock, getReservedStock]);

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

  // 4. Create Inventory Reservation Atomic
  const createReservation = useCallback(async (resPayload, customIdempotencyKey = null) => {
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
        sales_order_id: resPayload.sales_order_id,
        notes: resPayload.notes?.trim() || '',
        idempotency_key: customIdempotencyKey || resPayload.idempotency_key || crypto.randomUUID(),
        lines: (resPayload.lines || []).map(l => ({
          sales_order_item_id: l.sales_order_item_id,
          inventory_item_id: l.inventory_item_id || l.item_id,
          location_id: l.location_id,
          lot_number: l.lot_number?.trim() || '',
          quantity: Number(l.quantity) || 0
        }))
      };

      const { data, error: rpcErr } = await supabase.rpc('create_inventory_reservation_atomic', {
        p_payload: payload
      });

      if (rpcErr) throw rpcErr;

      await refreshAllInventory();
      return { success: true, data };
    } catch (err) {
      console.error('[InventoryContext] createReservation Error:', err);
      const msg = err.message || err.details || 'Failed to create reservation';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllInventory]);

  // 5. Release Inventory Reservation Atomic
  const releaseReservation = useCallback(async (relPayload, customIdempotencyKey = null) => {
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
        reservation_id: relPayload.reservation_id,
        release_reason: relPayload.release_reason?.trim() || relPayload.notes?.trim() || 'Manual user release',
        idempotency_key: customIdempotencyKey || relPayload.idempotency_key || crypto.randomUUID(),
        lines: (relPayload.lines || []).map(l => ({
          reservation_line_id: l.reservation_line_id || l.id,
          quantity: Number(l.quantity || l.release_quantity) || 0
        }))
      };

      const { data, error: rpcErr } = await supabase.rpc('release_inventory_reservation_atomic', {
        p_payload: payload
      });

      if (rpcErr) throw rpcErr;

      await refreshAllInventory();
      return { success: true, data };
    } catch (err) {
      console.error('[InventoryContext] releaseReservation Error:', err);
      const msg = err.message || err.details || 'Failed to release reservation';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [tenantId, activeOperatingCompanyId, submitting, refreshAllInventory]);

  // 6. Issue Inventory Against Reservation Atomic (P1-C)
  const issueInventoryAgainstReservation = useCallback(async (issuePayload, customIdempotencyKey = null) => {
    if (submitting) return { success: false, error: 'Submission in progress' };
    setSubmitting(true);
    setError(null);

    try {
      if (!activeOperatingCompanyId && !tenantId) {
        throw new Error('Tenant or Operating Company context is required');
      }

      const payload = {
        tenant_company_id: activeOperatingCompanyId,
        reservation_id: issuePayload.reservation_id,
        transaction_date: issuePayload.transaction_date || new Date().toISOString(),
        reference_no: issuePayload.reference_no?.trim() || '',
        notes: issuePayload.notes?.trim() || '',
        idempotency_key: customIdempotencyKey || issuePayload.idempotency_key || crypto.randomUUID(),
        lines: (issuePayload.lines || []).map(l => ({
          reservation_line_id: l.reservation_line_id,
          quantity: Number(l.quantity) || 0,
          notes: l.notes?.trim() || ''
        }))
      };

      const { data, error: rpcErr } = await supabase.rpc('issue_inventory_against_reservation_atomic', {
        p_payload: payload
      });

      if (rpcErr) throw rpcErr;

      await refreshAllInventory();
      return { success: true, data };
    } catch (err) {
      console.error('[InventoryContext] issueInventoryAgainstReservation Error:', err);
      const msg = err.message || err.details || 'Failed to issue inventory against reservation';
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

    const activeReservationsCount = reservations.filter(r => {
      const s = (r.status || '').toLowerCase();
      return s === 'active' || s === 'partially_released';
    }).length;

    const recentTransactions = transactions.slice(0, 5);

    return {
      totalItems,
      totalLocations,
      totalStockValue,
      lowStockCount,
      activeReservationsCount,
      recentTransactions
    };
  }, [items, locations, stockBalances, transactions, reservations]);

  const value = {
    items,
    locations,
    stockBalances,
    transactions,
    reservations,
    fulfilments,
    isLoading,
    submitting,
    error,
    setError,
    metrics,
    getCurrentStock,
    getReservedStock,
    getAvailableStock,
    refreshAllInventory,
    fetchFulfilments,
    createItem,
    createLocation,
    postTransaction,
    createReservation,
    releaseReservation,
    issueInventoryAgainstReservation,
    isManagementOrAdmin,
    works
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
