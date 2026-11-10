import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, Check, Eye, KeyRound, Loader2, Lock, RefreshCw, Save, ShieldCheck, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MODULES = [
  { key: 'hr', label: 'HR & Employees', detail: 'Employee records, documents and assignments' },
  { key: 'payroll', label: 'Payroll', detail: 'Payroll runs, payslips and statutory data' },
  { key: 'accounts', label: 'Accounts', detail: 'Accounting, banking and financial reports' },
  { key: 'crm', label: 'CRM & Sales', detail: 'Customers, enquiries and sales activity' },
  { key: 'inventory', label: 'Inventory', detail: 'Stock, warehouses and movements' },
  { key: 'procurement', label: 'Procurement', detail: 'Purchase requests, orders and suppliers' },
  { key: 'projects', label: 'Projects', detail: 'Projects, tasks, issues and documents' },
];
const ACTIONS = [
  ['can_read', 'Read'], ['can_create', 'Create'], ['can_update', 'Update'],
  ['can_delete', 'Delete'], ['can_approve', 'Approve'], ['can_export', 'Export'],
  ['can_manage_permissions', 'Manage permissions'],
];
const TENANT_ACTIONS = [
  ['tenant_settings_manage', 'Manage tenant settings'],
  ['membership_manage', 'Manage memberships'],
  ['company_create', 'Create companies'],
  ['company_archive', 'Archive companies'],
  ['tenant_delete', 'Delete tenant'],
  ['ownership_transfer', 'Transfer ownership'],
];
const emptyPermissions = () => Object.fromEntries(ACTIONS.map(([key]) => [key, false]));
const permissionKey = (membershipId, companyId, moduleKey) => membershipId + ':' + companyId + ':' + moduleKey;

export default function PermissionsWorkspace({ tenantId, tenantRole, onOpenUserPanel, onNavigate }) {
  const [workspace, setWorkspace] = useState(null);
  const [selectedMembershipId, setSelectedMembershipId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [drafts, setDrafts] = useState({});
  const [selectedAction, setSelectedAction] = useState('membership_manage');
  const [delegationDraft, setDelegationDraft] = useState({ can_execute: false, can_delegate: false });
  const [tab, setTab] = useState('modules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadWorkspace = useCallback(async () => {
    if (!tenantId) {
      setWorkspace(null);
      setLoading(false);
      setError('No active tenant context. Select a tenant before managing permissions.');
      return;
    }
    setLoading(true);
    setError('');
    setNotice('');
    const { data, error: rpcError } = await supabase.rpc('admin_get_permission_workspace', { p_tenant_id: tenantId });
    if (rpcError) {
      setWorkspace(null);
      setError(rpcError.message || 'Unable to load Administrator Settings.');
      setLoading(false);
      return;
    }
    setWorkspace(data || null);
    setSelectedMembershipId(current => data?.members?.some(m => m.membership_id === current) ? current : '');
    setSelectedCompanyId(current => data?.companies?.some(c => c.id === current) ? current : (data?.companies?.[0]?.id || ''));
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);

  const members = workspace?.members || [];
  const companies = workspace?.companies || [];
  const selectedMember = members.find(m => m.membership_id === selectedMembershipId) || null;
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
  const savedPermissions = useMemo(() => {
    const result = {};
    for (const row of selectedMember?.module_permissions || []) {
      result[permissionKey(row.tenant_company_id, row.module_key)] = Object.fromEntries(ACTIONS.map(([key]) => [key, row[key] === true]));
    }
    return result;
  }, [selectedMember]);
  const currentPermissions = selectedCompany
    ? (drafts[permissionKey(selectedCompany.id, 'all')] || null)
    : null;
  const permissionFor = moduleKey => {
    if (!selectedCompany || !selectedMember) return emptyPermissions();
    const key = permissionKey(selectedMember.membership_id, selectedCompany.id, moduleKey);
    return drafts[key] || savedPermissions[key] || emptyPermissions();
  };

  const updatePermission = (moduleKey, action, checked) => {
    if (action !== 'can_read' && checked && !permissionFor(moduleKey).can_read) {
      setNotice('Enable Read before granting any other action.');
      return;
    }
    setDrafts(current => ({
      ...current,
      [permissionKey(selectedCompanyId, moduleKey)]: {
        ...permissionFor(moduleKey),
        [action]: checked,
        ...(action === 'can_read' && !checked ? Object.fromEntries(ACTIONS.filter(([key]) => key !== 'can_read').map(([key]) => [key, false])) : {}),
      },
    }));
    setNotice('');
  };

  const saveModulePermissions = async () => {
    if (!workspace?.is_owner && !selectedMember) return;
    if (!selectedMember || !selectedCompany) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      for (const module of MODULES) {
        const key = permissionKey(selectedMember.membership_id, selectedCompany.id, module.key);
        const value = drafts[key];
        if (!value) continue;
        const { error: saveError } = await supabase.rpc('admin_upsert_company_module_permissions', {
          p_target_membership_id: selectedMember.membership_id,
          p_tenant_company_id: selectedCompany.id,
          p_module_key: module.key,
          p_permissions: value,
        });
        if (saveError) throw saveError;
      }
      setNotice('Permission changes saved and audited.');
      setDrafts(current => {
        const next = { ...current };
        MODULES.forEach(m => delete next[permissionKey(selectedMember.membership_id, selectedCompany.id, m.key)]);
        return next;
      });
      await loadWorkspace();
    } catch (e) {
      setError(e?.message || 'Permission save failed. No success was assumed.');
    } finally {
      setSaving(false);
    }
  };

  const savedDelegation = selectedMember?.tenant_action_delegations?.find(d => d.action_key === selectedAction);
  useEffect(() => {
    setDelegationDraft({
      can_execute: savedDelegation?.can_execute === true,
      can_delegate: savedDelegation?.can_delegate === true,
    });
  }, [selectedMembershipId, selectedAction, savedDelegation?.can_execute, savedDelegation?.can_delegate]);

  const saveDelegation = async () => {
    if (!selectedMember) return;
    setSaving(true);
    setError('');
    setNotice('');
    const { error: saveError } = await supabase.rpc('admin_upsert_tenant_action_delegation', {
      p_target_membership_id: selectedMember.membership_id,
      p_action_key: selectedAction,
      p_can_execute: delegationDraft.can_execute,
      p_can_delegate: delegationDraft.can_delegate,
    });
    if (saveError) setError(saveError.message || 'Delegation update failed.');
    else {
      setNotice('Tenant action delegation saved and audited.');
      await loadWorkspace();
    }
    setSaving(false);
  };

  const isOwner = workspace?.is_owner === true;
  const hasModuleDraft = selectedCompany && selectedMember && MODULES.some(m => drafts[permissionKey(selectedMember.membership_id, selectedCompany.id, m.key)]);
  const actorMember = (workspace?.members || []).find(m => m.membership_id === workspace?.actor_membership_id);
  const hasDelegationAuthority = isOwner || (actorMember?.tenant_action_delegations || []).some(d => d.action_key === selectedAction && d.can_delegate === true);

  return (
    <div className="space-y-4">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-300"><ShieldCheck size={15}/> TENANT ADMINISTRATION</div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">People & permissions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Company-scoped access, module actions and tenant-level delegation.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadWorkspace} className="os-secondary inline-flex items-center gap-2" disabled={loading}><RefreshCw size={14}/> Refresh</button>
          <button type="button" onClick={() => onNavigate?.('company-settings')} className="os-secondary inline-flex items-center gap-2"><Building2 size={14}/> Company settings</button>
          <button type="button" onClick={() => { onOpenUserPanel?.(); }} className="os-secondary inline-flex items-center gap-2"><Users size={14}/> User panel</button>
        </div>
      </header>

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 dark:border-sky-500/30 dark:bg-sky-500/10 p-3 flex gap-2.5">
        <Lock size={16} className="text-sky-700 dark:text-sky-300 shrink-0 mt-0.5"/>
        <div className="text-xs text-sky-900 dark:text-sky-100">
          <p className="font-extrabold">Backend-authorized workspace</p>
          <p className="mt-0.5 opacity-80">All permission changes use audited server-side RPCs. Company assignment changes are intentionally not available here until their own controlled workflow is implemented.</p>
        </div>
      </div>

      {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30 p-3 text-xs text-rose-800 dark:text-rose-200"><AlertTriangle size={14} className="inline mr-2"/>{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/30 p-3 text-xs text-emerald-800 dark:text-emerald-200">{notice}</div>}

      {loading ? <div className="os-card p-8 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 size={17} className="animate-spin"/>Loading authorized workspace…</div> : workspace && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="os-card p-4"><Building2 size={18} className="text-sky-600"/><p className="text-xs text-slate-500 mt-3">Visible companies</p><p className="text-xl font-black">{companies.length}</p></div>
            <div className="os-card p-4"><Users size={18} className="text-sky-600"/><p className="text-xs text-slate-500 mt-3">Active tenant members</p><p className="text-xl font-black">{members.length}</p></div>
            <div className="os-card p-4 col-span-2 xl:col-span-1"><ShieldCheck size={18} className="text-sky-600"/><p className="text-xs text-slate-500 mt-3">Authority</p><p className="text-sm font-black mt-1">{isOwner ? 'Tenant owner' : 'Delegated administrator'}</p></div>
          </div>

          <div className="grid xl:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.8fr)] gap-4">
            <section className="os-card overflow-hidden">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-black">Tenant members</h3><p className="text-[11px] text-slate-500 mt-1">Only members visible under your delegated scope.</p></div>
              <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {members.map(member => <button key={member.membership_id} type="button" onClick={() => setSelectedMembershipId(member.membership_id)} className={'w-full text-left p-3 transition ' + (selectedMembershipId === member.membership_id ? 'bg-sky-50 dark:bg-sky-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40')}>
                  <p className="text-xs font-bold truncate">{member.display_name || member.email || 'Member'}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{member.email || member.role}</p>
                  <p className="text-[10px] text-sky-700 dark:text-sky-300 mt-1">{member.role} · {member.company_access?.length || 0} company assignments</p>
                </button>)}
                {members.length === 0 && <p className="p-4 text-xs text-slate-500">No active members returned.</p>}
              </div>
            </section>

            <section className="os-card overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
                <div><h3 className="text-sm font-black">{selectedMember?.display_name || 'Select a member'}</h3><p className="text-xs text-slate-500 mt-1">{selectedMember?.email || 'Choose a member to inspect access.'}</p></div>
                <div className="flex flex-wrap gap-2">
                  <select value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)} className="os-input text-xs" aria-label="Company">
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              {!selectedMember ? <p className="p-5 text-xs text-slate-500">Select a member to view their permissions.</p> : (
                <div className="p-4 space-y-4">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <p className="text-xs font-bold mb-2">Explicit company assignments</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedMember.company_access || []).map(access => {
                        const company = companies.find(c => c.id === access.tenant_company_id);
                        return company ? <span key={company.id} className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px]">{company.name} · {access.can_edit ? 'Edit' : 'Read only'}</span> : null;
                      })}
                      {!selectedMember.company_access?.length && <span className="text-[11px] text-amber-700">No company assignments.</span>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><h4 className="text-xs font-extrabold">Module permissions</h4><p className="text-[11px] text-slate-500 mt-1">Choose individual actions. Any write/approve/export right requires Read.</p></div>
                    {MODULES.map(module => {
                      const permissions = permissionFor(module.key);
                      const assigned = (selectedMember.company_access || []).some(a => a.tenant_company_id === selectedCompanyId && a.can_view);
                      const mayEdit = assigned && (isOwner || selectedMember.membership_id !== workspace.actor_membership_id);
                      return <div key={module.key} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div><p className="text-xs font-bold">{module.label}</p><p className="text-[10px] text-slate-500 mt-0.5">{module.detail}</p></div>
                          {!assigned && <span className="text-[10px] text-amber-700">No company assignment</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                          {ACTIONS.map(([key,label]) => <label key={key} className={'flex items-center gap-2 text-[11px] ' + ((!mayEdit || (key !== 'can_read' && !permissions.can_read)) ? 'opacity-50' : '')}>
                            <input type="checkbox" checked={permissions[key] === true} disabled={!mayEdit || saving || (key !== 'can_read' && !permissions.can_read)} onChange={e => updatePermission(module.key,key,e.target.checked)}/>
                            {label}
                          </label>)}
                        </div>
                      </div>;
                    })}
                  </div>
                  <div className="flex justify-end"><button type="button" disabled={!hasModuleDraft || saving || (!isOwner && selectedMember.membership_id === workspace.actor_membership_id)} onClick={saveModulePermissions} className="os-primary inline-flex items-center gap-2 disabled:opacity-50"><Save size={14}/>{saving ? 'Saving…' : 'Save module permissions'}</button></div>
                  <p className="text-[10px] text-slate-500">The server enforces the grantor's own permission ceiling. A delegated administrator cannot grant themselves higher rights.</p>
                </div>
              )}
            </section>
          </div>

          <section className="os-card p-4 space-y-3">
            <div><h3 className="text-sm font-black">Tenant-wide action delegation</h3><p className="text-xs text-slate-500 mt-1">Delegation is exact-action scoped. Re-delegation is only possible when explicitly granted.</p></div>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="space-y-1"><span className="text-[11px] font-bold text-slate-500">Member</span><select value={selectedMembershipId} onChange={e => setSelectedMembershipId(e.target.value)} className="os-input w-full text-xs">{members.map(m => <option key={m.membership_id} value={m.membership_id}>{m.display_name || m.email || m.role}</option>)}</select></label>
              <label className="space-y-1"><span className="text-[11px] font-bold text-slate-500">Action</span><select value={selectedAction} onChange={e => setSelectedAction(e.target.value)} className="os-input w-full text-xs">{TENANT_ACTIONS.map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
              <div className="flex items-end gap-4 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={delegationDraft.can_execute} onChange={e => setDelegationDraft(d => ({can_execute:e.target.checked,can_delegate:e.target.checked ? d.can_delegate : false}))}/> Execute</label><label className="flex items-center gap-2"><input type="checkbox" checked={delegationDraft.can_delegate} disabled={!delegationDraft.can_execute} onChange={e => setDelegationDraft(d => ({...d,can_delegate:e.target.checked}))}/> Re-delegate</label></div>
            </div>
            <div className="flex justify-end"><button type="button" disabled={!selectedMember || saving || !hasDelegationAuthority || (!isOwner && selectedMember.membership_id === workspace.actor_membership_id)} onClick={saveDelegation} className="os-primary inline-flex items-center gap-2 disabled:opacity-50"><Save size={14}/>Save delegation</button></div>
            {!hasDelegationAuthority && <p className="text-[11px] text-amber-700">You do not have tenant-action delegation authority. Ask the tenant owner.</p>}
          </section>
        </>
      )}
    </div>
  );
}
