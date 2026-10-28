import React, { useState } from 'react';
import {
  AlertTriangle, Building2, Users, KeyRound, Network, ShieldCheck, Search, Check,
  Lock, Eye, Pencil, Plus, ChevronRight, RotateCcw, Landmark, WalletCards,
  Contact, Boxes, ShoppingCart, FolderKanban, Gauge
} from 'lucide-react';

const companies = [
  { id: 'co1', name: 'Metrix Engineers India Pvt. Ltd.', code: 'MET' },
  { id: 'co2', name: 'Rajiv Industrial Systems', code: 'RIS' },
  { id: 'co3', name: 'Apex Projects & Services', code: 'APS' },
  { id: 'co4', name: 'Northstar Trading Co.', code: 'NTC' },
];
const people = [
  { id: 'p1', name: 'Central HR Manager', email: 'hr.manager@example.com', role: 'HR Manager', companies: ['co1','co2','co3'], initials: 'HR' },
  { id: 'p2', name: 'Accounts Manager', email: 'accounts.manager@example.com', role: 'Accounts Manager', companies: ['co1','co2','co3','co4'], initials: 'AM' },
  { id: 'p3', name: 'Sleeping Partner', email: 'partner@example.com', role: 'Partner · Read only', companies: ['co2'], initials: 'SP' },
  { id: 'p4', name: 'Company Operations Lead', email: 'operations@example.com', role: 'Operations Manager', companies: ['co1','co4'], initials: 'OL' },
];
const modules = [
  { key: 'HR', name: 'HR & Employees', detail: 'Employee records, documents and assignments', icon: Users },
  { key: 'Payroll', name: 'Payroll', detail: 'Payroll runs, payslips and statutory data', icon: WalletCards },
  { key: 'Accounts', name: 'Accounts', detail: 'Accounting, banking and financial reports', icon: Landmark },
  { key: 'CRM', name: 'CRM & Sales', detail: 'Customers, enquiries and sales activity', icon: Contact },
  { key: 'Inventory', name: 'Inventory', detail: 'Stock, warehouses and movements', icon: Boxes },
  { key: 'Procurement', name: 'Procurement', detail: 'Purchase requests, orders and suppliers', icon: ShoppingCart },
  { key: 'Projects', name: 'Projects', detail: 'Projects, tasks, issues and documents', icon: FolderKanban },
];
const initialPermissions = {
  p1: { HR: 'write', Payroll: 'read', Accounts: 'read', CRM: 'none', Inventory: 'none', Procurement: 'none', Projects: 'read' },
  p2: { HR: 'none', Payroll: 'none', Accounts: 'write', CRM: 'none', Inventory: 'none', Procurement: 'none', Projects: 'read' },
  p3: { HR: 'none', Payroll: 'none', Accounts: 'none', CRM: 'none', Inventory: 'none', Procurement: 'none', Projects: 'none' },
  p4: { HR: 'none', Payroll: 'none', Accounts: 'none', CRM: 'write', Inventory: 'read', Procurement: 'read', Projects: 'write' },
};
const accessLabel = value => value === 'write' ? 'Read & write' : value === 'read' ? 'Read only' : 'No access';
const accessTone = value => value === 'write'
  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
  : value === 'read'
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

export default function PermissionsWorkspace({ onOpenUserPanel, onNavigate }) {
  const [tab, setTab] = useState('overview');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('p1');
  const [selectedCompanyId, setSelectedCompanyId] = useState('co1');
  const [draft, setDraft] = useState({});
  const [showDelegation, setShowDelegation] = useState(false);
  const [notice, setNotice] = useState('');
  const selected = people.find(person => person.id === selectedId) || people[0];
  const visiblePeople = people.filter(person => {
    const matchesCompany = companyFilter === 'all' || person.companies.includes(companyFilter);
    const text = (person.name + ' ' + person.email + ' ' + person.role).toLowerCase();
    return matchesCompany && text.includes(query.trim().toLowerCase());
  });
  const permissionKey = selectedId + ':' + selectedCompanyId;
  const permissionValue = (personId, companyId, moduleKey) => draft[personId + ':' + companyId]?.[moduleKey] ?? initialPermissions[personId]?.[moduleKey] ?? 'none';
  const changePermission = (moduleKey, value) => {
    setDraft(current => ({ ...current, [permissionKey]: { ...(current[permissionKey] || {}), [moduleKey]: value } }));
    setNotice('Preview updated locally for this person and company. Nothing has been saved to the database.');
  };
  const tabs = [
    ['overview', 'Overview', Gauge],
    ['people', 'People & companies', Users],
    ['modules', 'Module permissions', KeyRound],
    ['delegation', 'Role delegation', Network],
  ];
  const inputClass = 'os-input min-w-0 text-xs';
  const sectionClass = 'os-card overflow-hidden';
  const tabClass = id => 'inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ' +
    (tab === id ? 'border-sky-500 text-sky-700 dark:text-sky-300' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200');

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-300"><ShieldCheck size={15} /> TENANT ADMINISTRATION</div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">People & permissions</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">Manage company access, module rights and delegated authority in one workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setTab('people'); onOpenUserPanel?.(); }} className="os-secondary inline-flex items-center gap-2"><Users size={14} /> Existing user panel</button>
          <button type="button" onClick={() => { setTab('people'); setNotice('Invitation is not connected in this UI-only preview.'); }} className="os-primary inline-flex items-center gap-2"><Plus size={14} /> Add person</button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-300/70 bg-amber-50/80 dark:bg-amber-500/10 dark:border-amber-500/30 px-3.5 py-3 flex items-start gap-2.5">
        <AlertTriangle size={17} className="text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
        <div><p className="text-xs font-extrabold text-amber-900 dark:text-amber-200">UI preview only — not connected to authorization</p><p className="text-xs text-amber-800/90 dark:text-amber-200/80 mt-0.5 leading-relaxed">People and permission values are illustrative. Changes remain local to this screen and do not update Supabase or change actual access.</p></div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {tabs.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => { setTab(id); setNotice(''); }} className={tabClass(id)}><Icon size={15} />{label}</button>)}
      </div>
      {notice && <div role="status" className="rounded-lg border border-sky-200 bg-sky-50 dark:bg-sky-500/10 dark:border-sky-500/30 px-3 py-2 text-xs text-sky-800 dark:text-sky-200">{notice}</div>}

      {tab === 'overview' && <div className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            [Building2, 'Operating companies', '4', 'Company access is assigned separately'],
            [Users, 'People in workspace', '4 preview users', 'One person can serve multiple companies'],
            [KeyRound, 'Permission model', 'Module-wise', 'Different rights by company and module'],
            [ShieldCheck, 'Delegation', 'Owner controlled', 'Scope can be limited and revoked'],
          ].map(([Icon, label, value, sub]) => <div key={label} className="os-card p-4"><div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300 flex items-center justify-center"><Icon size={17} /></div><p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{label}</p><p className="text-base font-black mt-1">{value}</p><p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{sub}</p></div>)}
        </div>
        <div className="grid xl:grid-cols-5 gap-4">
          <section className={sectionClass + ' xl:col-span-3'}>
            <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Operating companies</h3><p className="text-xs text-slate-400 mt-0.5">Partnership or job title does not automatically grant access.</p></div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">{companies.map(company => {
              const assigned = people.filter(person => person.companies.includes(company.id)).length;
              return <button key={company.id} type="button" onClick={() => { setCompanyFilter(company.id); setTab('people'); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"><div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300">{company.code}</div><div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{company.name}</p><p className="text-[11px] text-slate-400 mt-1">{assigned} people assigned in this preview</p></div><ChevronRight size={16} className="text-slate-400" /></button>;
            })}</div>
          </section>
          <section className={sectionClass + ' xl:col-span-2'}>
            <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Permission principles</h3><p className="text-xs text-slate-400 mt-0.5">Owner's intended rules</p></div>
            <div className="p-4 space-y-3">{[
              ['Explicit company access', 'No access to another company by default.'],
              ['Module-level rights', 'Read, write or no access per module.'],
              ['Delegation is limited', 'Delegates cannot exceed their granted scope.'],
              ['Owner can revoke', 'Revocation must remove effective access.'],
            ].map(([title, detail]) => <div key={title} className="flex gap-2.5"><Check size={15} className="text-emerald-500 shrink-0 mt-0.5" /><div><p className="text-xs font-bold">{title}</p><p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{detail}</p></div></div>)}</div>
          </section>
        </div>
        <section className={sectionClass}>
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Example company assignments</h3><p className="text-xs text-slate-400 mt-0.5">Illustrative only — shows shared managers and company-specific partners.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead><tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">{['Person / role','Metrix','Rajiv Industrial','Apex Projects','Northstar'].map(x => <th key={x} className="px-4 py-3 font-bold">{x}</th>)}</tr></thead><tbody>{people.map(person => <tr key={person.id} className="border-b last:border-0 border-slate-100 dark:border-slate-800/70"><td className="px-4 py-3"><p className="font-bold">{person.name}</p><p className="text-[10px] text-slate-400 mt-0.5">{person.role}</p></td>{companies.map(company => <td key={company.id} className="px-4 py-3">{person.companies.includes(company.id) ? <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300"><Check size={13} /> Assigned</span> : <span className="text-slate-400">—</span>}</td>)}</tr>)}</tbody></table></div>
        </section>
      </div>}

      {tab === 'people' && <div className="grid xl:grid-cols-5 gap-4">
        <section className={sectionClass + ' xl:col-span-2'}>
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5"><div className="flex items-center justify-between gap-2"><h3 className="text-xs font-black">People</h3><span className="text-[11px] text-slate-400">{visiblePeople.length} shown</span></div><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people or roles…" className="os-input w-full pl-9 text-xs" /></div><select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className={inputClass + ' w-full'}><option value="all">All operating companies</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">{visiblePeople.map(person => <button key={person.id} type="button" onClick={() => setSelectedId(person.id)} className={'w-full text-left p-3 flex items-start gap-3 transition ' + (selectedId === person.id ? 'bg-sky-50 dark:bg-sky-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40')}><div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-black text-slate-600 dark:text-slate-300 shrink-0">{person.initials}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{person.name}</p><p className="text-[11px] text-slate-400 truncate mt-0.5">{person.email}</p><p className="text-[10px] text-sky-700 dark:text-sky-300 mt-1">{person.companies.length} assigned companies</p></div>{selectedId === person.id && <ChevronRight size={15} className="text-sky-600 shrink-0 mt-1" />}</button>)}</div>
          {visiblePeople.length === 0 && <p className="p-5 text-xs text-slate-400">No people match this filter.</p>}
        </section>
        <div className="xl:col-span-3 space-y-4">
          <section className={sectionClass}>
            <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Person access</h3><p className="text-xs text-slate-400 mt-0.5">Illustrative access assignment</p></div>
            <div className="p-4 space-y-4"><div className="flex flex-col sm:flex-row sm:items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 flex items-center justify-center font-black">{selected.initials}</div><div className="flex-1 min-w-0"><h3 className="text-sm font-black">{selected.name}</h3><p className="text-xs text-slate-500 mt-0.5">{selected.email}</p><p className="text-xs text-sky-700 dark:text-sky-300 mt-1">{selected.role}</p></div><button type="button" onClick={() => setNotice('Person editing is a UI placeholder; no profile or access changes are saved.')} className="os-secondary inline-flex items-center gap-2 self-start"><Pencil size={13} /> Edit details</button></div>
              <div><p className="text-xs font-extrabold mb-2">Assigned operating companies</p><div className="grid sm:grid-cols-2 gap-2">{companies.map(company => { const assigned = selected.companies.includes(company.id); return <div key={company.id} className={'rounded-xl border p-3 flex items-center gap-2.5 ' + (assigned ? 'border-sky-200 bg-sky-50/60 dark:border-sky-500/30 dark:bg-sky-500/5' : 'border-slate-200 dark:border-slate-800 opacity-70')}><div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black bg-slate-100 text-slate-500 dark:bg-slate-800">{company.code}</div><div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{company.name}</p><p className="text-[10px] mt-0.5 text-slate-400">{assigned ? 'Explicitly assigned' : 'No access'}</p></div>{assigned ? <Check size={15} className="text-emerald-500" /> : <Lock size={14} className="text-slate-400" />}</div>; })}</div></div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-start gap-2.5"><Eye size={16} className="text-amber-500 shrink-0 mt-0.5" /><div><p className="text-xs font-bold">Sleeping partner example</p><p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Company profile visibility can be read-only. HR and financial module access should be separately defined to avoid exposing sensitive records unintentionally.</p></div></div>
              <button type="button" onClick={() => setTab('modules')} className="os-secondary inline-flex items-center gap-2"><KeyRound size={14} /> Edit module permissions</button>
            </div>
          </section>
          <section className={sectionClass}><div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Module access summary · {companies.find(company => company.id === selectedCompanyId)?.name || 'Selected company'}</h3></div><div className="p-3 grid sm:grid-cols-2 gap-2">{modules.map(module => { const value = permissionValue(selected.id, selectedCompanyId, module.key); const Icon = module.icon; return <div key={module.key} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-2.5"><Icon size={16} className="text-slate-400 shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs font-bold">{module.name}</p><p className="text-[10px] text-slate-400 mt-0.5">{module.detail}</p></div><span className={'text-[10px] font-bold border rounded-md px-2 py-1 whitespace-nowrap ' + accessTone(value)}>{accessLabel(value)}</span></div>; })}</div></section>
        </div>
      </div>}

      {tab === 'modules' && <div className="space-y-4">
        <section className={sectionClass}>
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Module permissions</h3><p className="text-xs text-slate-400 mt-0.5">Select a person and preview rights per module.</p></div>
          <div className="p-4 grid sm:grid-cols-2 gap-3"><label className="space-y-1.5"><span className="text-[11px] font-bold text-slate-500">Person</span><select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputClass + ' w-full'}>{people.map(person => <option key={person.id} value={person.id}>{person.name} — {person.role}</option>)}</select></label><label className="space-y-1.5"><span className="text-[11px] font-bold text-slate-500">Company context</span><select value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)} className={inputClass + ' w-full'}>{companies.filter(company => selected.companies.includes(company.id)).map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label></div>
          <div className="border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">{modules.map(module => { const value = permissionValue(selectedId, selectedCompanyId, module.key); const Icon = module.icon; return <div key={module.key} className="p-4 flex flex-col md:flex-row md:items-center gap-3"><div className="flex items-center gap-3 flex-1 min-w-0"><div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Icon size={16} /></div><div><p className="text-xs font-extrabold">{module.name}</p><p className="text-[11px] text-slate-400 mt-0.5">{module.detail}</p></div></div><div className="flex items-center gap-2 flex-wrap">{['none','read','write'].map(option => <button key={option} type="button" onClick={() => changePermission(module.key, option)} className={'px-3 py-2 rounded-lg border text-[11px] font-bold transition ' + (value === option ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' : 'border-slate-200 text-slate-500 dark:border-slate-700 hover:border-slate-400')}>{option === 'none' ? 'No access' : option === 'read' ? 'Read only' : 'Read & write'}</button>)}</div></div>; })}</div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><p className="text-[11px] text-slate-400">Approve, delete, export and administer may require separate rights.</p><button type="button" onClick={() => setNotice('Draft is local to this preview only. No database changes were made.')} className="os-primary inline-flex items-center gap-2"><Check size={14} /> Keep preview draft</button></div>
        </section>
      </div>}

      {tab === 'delegation' && <div className="grid xl:grid-cols-5 gap-4">
        <section className={sectionClass + ' xl:col-span-3'}>
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Delegated role management</h3><p className="text-xs text-slate-400 mt-0.5">Owner grants and revokes role-management authority.</p></div>
          <div className="p-4 space-y-3"><div className="rounded-xl border border-sky-200 bg-sky-50/60 dark:border-sky-500/30 dark:bg-sky-500/5 p-3 flex gap-3"><ShieldCheck size={18} className="text-sky-600 dark:text-sky-300 shrink-0 mt-0.5" /><div><p className="text-xs font-extrabold">Authority has a boundary</p><p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Delegation is separate from job title and limited to assigned companies and permission levels. A delegate cannot expand their own authority.</p></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">{['Delegate','Company scope','Maximum grant','Status'].map(item => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody>{[['Central HR Manager','Metrix, Rajiv Industrial','HR read/write','Preview'],['Accounts Manager','All four companies','Accounts read/write','Preview'],['Operations Lead','Metrix, Northstar','None','Preview']].map(row => <tr key={row[0]} className="border-b last:border-0 border-slate-100 dark:border-slate-800/70">{row.map((cell,index) => <td key={cell} className={'px-3 py-3 align-top ' + (index === 3 ? 'text-amber-600 dark:text-amber-300 font-bold' : '')}>{cell}</td>)}</tr>)}</tbody></table></div>
            <button type="button" onClick={() => setShowDelegation(!showDelegation)} className="os-primary inline-flex items-center gap-2"><Pencil size={14} /> {showDelegation ? 'Close delegation preview' : 'Configure delegation preview'}</button>
            {showDelegation && <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"><p className="text-xs font-extrabold">Preview delegated authority</p><label className="block space-y-1.5"><span className="text-[11px] font-bold text-slate-500">Delegate</span><select className={inputClass + ' w-full'}><option>Central HR Manager</option><option>Accounts Manager</option><option>Company Operations Lead</option></select></label><div className="space-y-1.5"><span className="text-[11px] font-bold text-slate-500">Companies in scope</span><div className="grid sm:grid-cols-2 gap-2">{companies.map(company => <label key={company.id} className="flex items-center gap-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2.5"><input type="checkbox" defaultChecked={['co1','co2'].includes(company.id)} />{company.name}</label>)}</div></div><label className="block space-y-1.5"><span className="text-[11px] font-bold text-slate-500">Maximum permission they can grant</span><select className={inputClass + ' w-full'}><option>Read only</option><option>Read & write</option></select></label><label className="flex items-start gap-2 text-xs"><input type="checkbox" defaultChecked className="mt-0.5" /><span>Only assign roles within their own granted scope.</span></label><button type="button" onClick={() => setNotice('Delegation editor is a visual prototype only. Nothing was saved or granted.')} className="os-secondary inline-flex items-center gap-2"><Check size={14} /> Review preview</button></div>}
          </div>
        </section>
        <section className={sectionClass + ' xl:col-span-2'}>
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold uppercase tracking-wider">Owner guardrails</h3></div>
          <div className="p-4 space-y-3">{[['Cannot expand own access','A delegate cannot grant themselves more companies or higher rights.'],['Cannot manage outside scope','No role changes for companies they cannot administer.'],['Owner-only security actions','Ownership transfer and tenant deletion remain owner-only.'],['Revocation takes effect','Revoking delegation must remove effective access server-side.']].map(([title,detail]) => <div key={title} className="flex gap-2.5"><Lock size={14} className="text-slate-400 shrink-0 mt-0.5" /><div><p className="text-xs font-bold">{title}</p><p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{detail}</p></div></div>)}</div>
        </section>
      </div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 px-1"><span>Administration workspace · UI-only prototype</span><button type="button" onClick={() => { setTab('overview'); setCompanyFilter('all'); setQuery(''); setSelectedId('p1'); setSelectedCompanyId('co1'); setDraft({}); setNotice(''); }} className="inline-flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200"><RotateCcw size={12} /> Reset preview</button></div>
    </div>
  );
}
