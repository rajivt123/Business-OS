import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowLeft, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness,
  Building2, CalendarDays, Check, ChevronDown, ChevronRight, CircleDollarSign, ClipboardCheck,
  Clock3, CreditCard, FileBarChart, FileCheck2, FilePlus2, FileText, Filter, FolderKanban,
  Gauge, Grid2X2, HandCoins, HeartPulse, HelpCircle, Inbox, LayoutDashboard, ListChecks,
  LogOut, Menu, Package, PanelLeftClose, PanelLeftOpen, Plus, Receipt, RefreshCw, Search,
  Settings, ShieldCheck, ShoppingCart, Sparkles, Target, Truck, UserCheck, Users, WalletCards,
  X, Zap, BookOpen, Banknote, CalendarCheck2, Boxes, Calculator, Contact, Landmark, UserRound,
  ClipboardList, FileSpreadsheet, Workflow, CircleUserRound, SlidersHorizontal, ChevronUp,
  MoreHorizontal, Eye, Pencil, Send, Upload, Download, CheckCircle2, XCircle, ClockArrowUp,
  TriangleAlert, Factory, MapPin, Briefcase, UserCog, Network, KeyRound, History, Layers3, Palmtree
} from 'lucide-react';
import { useCrm, getUserDisplayName } from '../context/CrmContext';
import CrmWorkspace from './crm/CrmWorkspace';
import EmployeeWorkspace from './hr/EmployeeWorkspace';
import HrPolicyCenter from './hr/HrPolicyCenter';
import RecruitmentWorkspace from './hr/RecruitmentWorkspace';
import PublicApplicationForm from './hr/PublicApplicationForm';
import ApprovalCenter from './ApprovalCenter';
import EmployeeChangeRequests from './hr/EmployeeChangeRequests';
import AttendanceWorkspace from './hr/AttendanceWorkspace';
import LeaveWorkspace from './hr/LeaveWorkspace';
import PayrollWorkspace from './hr/PayrollWorkspace';
import SalesWorkspace from './sales/SalesWorkspace';
import ProcurementWorkspace from './procurement/ProcurementWorkspace';
import InventoryWorkspace from './inventory/InventoryWorkspace';
import AccountsWorkspace from './accounts/AccountsWorkspace';
import ReportsWorkspace from './reports/ReportsWorkspace';
import CompanySettingsWorkspace from './admin/CompanySettingsWorkspace';
import ProfileWorkspace from './profile/ProfileWorkspace';

const roleMeta = {
  OWNER: { label: 'Owner', tone: 'violet', home: 'owner' },
  ADMIN: { label: 'Administrator', tone: 'indigo', home: 'owner' },
  MANAGER: { label: 'Manager', tone: 'sky', home: 'manager' },
  TEAM: { label: 'Team Member', tone: 'emerald', home: 'my-work' },
  VIEWER: { label: 'Viewer', tone: 'slate', home: 'my-work' },
};

const previewRoles = [
  ['OWNER', 'Owner / Group'],
  ['MANAGER', 'GM / AGM / Manager'],
  ['SALES', 'Sales Manager'],
  ['ACCOUNTANT', 'Accounts'],
  ['HR', 'Senior HR'],
  ['PROCUREMENT', 'Procurement'],
  ['WAREHOUSE', 'Warehouse'],
  ['ENGINEER', 'Project / Site'],
  ['TEAM', 'Team Member'],
];

const navSections = [
  {
    label: 'Workspace',
    items: [
      ['dashboard', 'Dashboard', LayoutDashboard],
      ['my-work', 'My Work', ListChecks],
      ['approvals', 'Approval Center', ClipboardCheck],
      ['notifications', 'Notifications', Bell],
    ],
  },
  {
    label: 'Business',
    items: [
      ['crm', 'CRM', Contact],
      ['sales', 'Sales', CircleDollarSign],
      ['projects', 'Projects', FolderKanban],
      ['procurement', 'Procurement', ShoppingCart],
      ['inventory', 'Inventory', Boxes],
      ['accounts', 'Accounts', Landmark],
      ['hr', 'HR', Users],
    ],
  },
  {
    label: 'Insights',
    items: [
      ['documents', 'Documents', FileText],
      ['reports', 'Reports', BarChart3],
      ['ai', 'RAJIV AI', Sparkles],
    ],
  },
  {
    label: 'Administration',
    items: [
      ['admin', 'Administration', Settings],
      ['company-settings', 'Company Settings', Building2],
    ],
  },
];

const pageMeta = {
  dashboard: ['Business Dashboard', 'Executive overview, company health and action priorities.'],
  'my-work': ['My Workspace', 'Everything assigned or requiring your attention.'],
  approvals: ['Approval Center', 'Review requests within your authority and scope.'],
  notifications: ['Notifications', 'Scoped alerts, escalations and business events.'],
  crm: ['CRM', 'Customers, enquiries, contacts and follow-ups.'],
  sales: ['Sales', 'Quotations, proforma invoices, sales orders and tax invoices.'],
  projects: ['Projects', 'Project pipeline, execution, tasks, issues, documents and profitability.'],
  procurement: ['Procurement', 'Purchase requests, RFQs, purchase orders, GRN and bills.'],
  inventory: ['Inventory', 'Stock, warehouses, movements and project material allocation.'],
  accounts: ['Accounts', 'Receivables, payables, banking, accounting and GST.'],
  hr: ['Human Resources', 'People, organization, attendance, leave, payroll and employee cost.'],
  documents: ['Documents', 'Central business document workspace with context and history.'],
  reports: ['Reports & Analytics', 'Operational, financial, project and people intelligence.'],
  ai: ['RAJIV AI', 'Permission-aware business intelligence and assisted workflows.'],
  admin: ['Administration', 'Organization, users, permissions, workflows and system controls.'],
  'company-settings': ['Company Settings', 'Owner workspace for managing company profiles, registrations, addresses, contacts, bank details, tax settings, branding, documents and audit history.'],
  profile: ['My Profile', 'Manage personal information, work preferences, organization membership and account security.'],
};

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    red: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, sub, trend, tone = 'blue' }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  };
  const isUnavailable = value === 'Unavailable';

  return (
    <div className="os-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}><Icon size={18} /></div>
        {trend && <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>{trend.startsWith('-') ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />} {trend}</span>}
      </div>
      {isUnavailable ? (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>Not connected</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
      )}
      <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      {sub && <div className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 leading-normal">{sub}</div>}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`os-card overflow-hidden ${className}`}>
      <div className="px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300"><Icon size={15} /></div>}
          <div className="min-w-0"><h3 className="text-xs font-bold uppercase tracking-wider truncate">{title}</h3>{subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}</div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MiniTable({ columns, rows }) {
  return <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{columns.map((c) => <th key={c} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">{row.map((cell, j) => <td key={j} className="px-4 py-3 text-xs font-medium border-b last:border-0 border-slate-100 dark:border-slate-800/70">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function UnavailableAction({ children, className = 'os-secondary', title = 'Unavailable: no backend support exists for this action.' }) {
  return <button type="button" disabled title={title} className={`${className} opacity-60 cursor-not-allowed`}>{children}</button>;
}

function Dashboard({ role, onNavigate, onOpenCrm, companyName, companies = [], data = {} }) {
  const multi = (companies || []).length > 1;
  if (role === 'OWNER') return <OwnerDashboard onNavigate={onNavigate} onOpenCrm={onOpenCrm} companyName={companyName} multi={multi} companies={companies} data={data} />;
  if (role === 'MANAGER') return <ManagerDashboard onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
  if (role === 'SALES') return <FunctionalDashboard type="sales" onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
  if (role === 'ACCOUNTANT') return <FunctionalDashboard type="accounts" onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
  if (role === 'HR') return <FunctionalDashboard type="hr" onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
  if (role === 'PROCUREMENT') return <FunctionalDashboard type="procurement" onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
  if (role === 'WAREHOUSE') return <FunctionalDashboard type="inventory" onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
  if (role === 'ENGINEER') return <FunctionalDashboard type="engineer" onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
  return <MyWorkPage onNavigate={onNavigate} onOpenCrm={onOpenCrm} data={data} />;
}

function OwnerDashboard({ onNavigate, onOpenCrm, companyName, multi, companies = [], data = {} }) {
  const works = data?.works || [];
  const reminders = data?.reminders || [];
  const missingData = data?.missingData || [];
  const companyRows = (companies || []).map(c => {
    const companyWorks = works.filter(work => work.tenant_company_id === c.id);
    return [
      <div key={c.id} className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">{c.name?.charAt(0) || 'C'}</div>
        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{c.name}</span>
      </div>,
      <span key="health" className="text-slate-400 text-xs">—</span>,
      <span key="progress" className="text-slate-400 text-xs">—</span>,
      <span key="revenue" className="text-slate-400 text-xs">—</span>,
      <span key="projects" className="text-xs font-medium text-slate-600 dark:text-slate-300">{companyWorks.length} loaded</span>,
    ];
  });
  const attention = [
    ...missingData.slice(0, 3).map(work => ({ text: `${work.title} is missing project data`, type: 'Project', tone: 'amber', work })),
    ...reminders.filter(reminder => !reminder.is_completed && !reminder.is_deleted).slice(0, 2).map(reminder => ({ text: reminder.content, type: 'Reminder', tone: 'blue', reminder }))
  ];
  return <div className="space-y-5">
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={CircleDollarSign} label="Group Revenue" value="Unavailable" sub="No revenue backend in current application" tone="blue" /><StatCard icon={WalletCards} label="Receivables" value="Unavailable" sub="No receivables backend in current application" tone="amber" /><StatCard icon={FolderKanban} label="Loaded Projects" value={works.length} sub={multi ? 'Across loaded authorized context' : `${companyName} context`} tone="violet" /><StatCard icon={Users} label="Employees" value="Unavailable" sub="No employee backend in current application" tone="emerald" /></div>
    <div className="grid xl:grid-cols-[1.6fr_1fr] gap-4">
      <SectionCard title={multi ? 'Company Performance' : 'Company Health'} subtitle={multi ? 'Consolidated view across operating companies' : 'Single-company operating overview'} icon={Building2} action={<button onClick={() => onNavigate('reports')} className="os-link">View report <ChevronRight size={13} /></button>}>
        <MiniTable columns={['Company', 'Health', 'Progress', 'Revenue', 'Projects']} rows={companyRows.length ? companyRows : [[<span key="name">{companyName}</span>, <span key="h" className="text-slate-400 text-xs">—</span>, <span key="p" className="text-slate-400 text-xs">—</span>, <span key="r" className="text-slate-400 text-xs">—</span>, <span key="l" className="text-xs text-slate-500">0 loaded</span>]]} />
      </SectionCard>
      <SectionCard title="Executive Attention" subtitle="Only exceptions and decisions that need management" icon={TriangleAlert}>
        <div className="p-4 space-y-2.5">
          {attention.length ? attention.map((item, idx) => (
            <button
              onClick={() => {
                if (item.work?.company_id) {
                  data?.navigateToContext?.(item.work.company_id, item.work.unit_id, item.work.id);
                  onOpenCrm?.();
                } else if (item.reminder?.work_id) {
                  data?.navigateToContext?.(item.reminder.company_id, item.reminder.unit_id, item.reminder.work_id);
                  onOpenCrm?.();
                } else {
                  onNavigate('projects');
                }
              }}
              key={idx}
              className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:border-sky-300 transition"
            >
              <div className={`h-2 w-2 rounded-full ${item.tone === 'red' ? 'bg-rose-500' : item.tone === 'amber' ? 'bg-amber-500' : 'bg-sky-500'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{item.text}</p>
                <p className="text-xs text-slate-400">{item.type}</p>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          )) : <p className="p-3 text-xs italic text-slate-400">No loaded exceptions in the current context.</p>}
        </div>
      </SectionCard>
    </div>
    <div className="grid lg:grid-cols-3 gap-4">
      <SectionCard title="Financial Snapshot" icon={BarChart3}>
        <div className="p-4 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
          <span>Financial and accounting backend pending module connection.</span>
        </div>
      </SectionCard>
      <SectionCard title="Project Health" icon={HeartPulse}>
        <div className="p-4 grid grid-cols-3 gap-2">
          {[['Loaded', '' + works.length, 'blue'], ['At Risk', '—', 'slate'], ['Delayed', '—', 'slate']].map(([a, b, t]) => (
            <div key={a} className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-3 text-center">
              <div className={`text-base font-bold ${t === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{b}</div>
              <div className="text-xs font-medium text-slate-400 mt-1">{a}</div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Pending Approvals" icon={ClipboardCheck}>
        <div className="p-4 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
          <span>Workflow approval backend pending module connection.</span>
        </div>
      </SectionCard>
    </div>
  </div>;
}

function ManagerDashboard({ onNavigate, onOpenCrm, data = {} }) {
  const works = data?.works || [];
  const tasks = data?.tasks || [];
  const assignments = data?.projectAssignments || [];
  const missingData = data?.missingData || [];
  const profiles = data?.profiles || [];
  const tenantMembers = data?.tenantMembers || [];
  const stageDefinitions = data?.stageDefinitions || [];

  const projectRows = works.map(work => {
    const lead = assignments.find(assignment => assignment.work_id === work.id && assignment.status === 'active' && assignment.project_role === 'lead');
    const stage = stageDefinitions.find(item => item.work_id === work.id && item.status === 'active');
    return [
      <button
        onClick={() => {
          data?.navigateToContext?.(work.company_id, work.unit_id, work.id);
          onOpenCrm?.();
        }}
        className="text-left font-bold hover:text-sky-500 transition"
      >
        {work.title}
      </button>,
      stage?.name || 'In Progress',
      'Unavailable',
      <Badge tone="slate">Unavailable</Badge>,
      lead ? getUserDisplayName(lead.user_id, profiles, tenantMembers) : 'Unassigned'
    ];
  });

  return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={FolderKanban} label="Loaded Projects" value={works.length} sub="Current loaded context" tone="violet" /><StatCard icon={ListChecks} label="Loaded Tasks" value={tasks.length} sub="Selected project context" tone="blue" /><StatCard icon={ClipboardCheck} label="Approvals" value="Unavailable" sub="No approval backend" tone="amber" /><StatCard icon={AlertTriangle} label="Missing Data Alerts" value={missingData.length} sub="Existing project checks" tone="rose" /></div><div className="grid xl:grid-cols-[1.4fr_1fr] gap-4"><SectionCard title="Project Command Center" subtitle="Loaded projects where assignment context is available" icon={FolderKanban} action={<button onClick={() => onNavigate('projects')} className="os-link">All projects <ChevronRight size={13} /></button>}><MiniTable columns={['Project', 'Stage', 'Progress', 'Health', 'Lead']} rows={projectRows.length ? projectRows : [['No loaded projects', 'Unavailable', 'Unavailable', 'Unavailable', 'Unavailable']]} /></SectionCard><SectionCard title="Team Bottlenecks" icon={Clock3}><div className="p-4"><p className="text-xs italic text-slate-400">Unavailable: no bottleneck or escalation backend is connected.</p></div></SectionCard></div></div>;
}

function FunctionalDashboard({ type, onNavigate, onOpenCrm, data = {} }) {
  const configs = {
    sales: { title: 'Sales Command Center', cards: [['Open Enquiries', '24'], ['Quotations', '13'], ['Sales Orders', '8'], ['Receivables', '₹86L']], links: [['New Quotation', 'sales'], ['New Proforma', 'sales'], ['New Sales Order', 'sales'], ['Tax Invoice', 'accounts']] },
    accounts: { title: 'Accounts Workbench', cards: [['To Invoice', '12'], ['Purchase Bills', '18'], ['Receivables', '₹86L'], ['Payables', '₹42L']], links: [['Tax Invoice', 'accounts'], ['Purchase Bill', 'procurement'], ['Receipt', 'accounts'], ['Payment', 'accounts']] },
    hr: { title: 'HR Operations Center', cards: [['Employees', '186'], ['Present Today', '164'], ['Leave Requests', '7'], ['Missing Attendance', '3']], links: [['Attendance', 'hr'], ['Leave', 'hr'], ['Payroll', 'hr'], ['Employees', 'hr']] },
    procurement: { title: 'Procurement Command Center', cards: [['Purchase Requests', '17'], ['RFQs', '9'], ['PO Awaiting Approval', '4'], ['Bills to Verify', '8']], links: [['Purchase Request', 'procurement'], ['RFQ', 'procurement'], ['Purchase Order', 'procurement'], ['AI Bill Capture', 'procurement']] },
    inventory: { title: 'Inventory Control Center', cards: [['Stock Value', '₹1.24Cr'], ['Low Stock', '14'], ['Pending GRN', '6'], ['Project Issues', '11']], links: [['Stock Receipt', 'inventory'], ['Stock Issue', 'inventory'], ['Transfer', 'inventory'], ['Project Material', 'inventory']] },
    engineer: { title: 'Project / Site Workspace', cards: [['My Projects', '4'], ['My Tasks', '16'], ['Open Issues', '5'], ['Today Logs', '3']], links: [['Daily Log', 'projects'], ['My Tasks', 'my-work'], ['Issues', 'projects'], ['Documents', 'documents']] },
  };
  const c = configs[type];
  const isEngineer = type === 'engineer';
  const tasks = data?.tasks || [];
  const works = data?.works || [];
  const issues = data?.issues || [];
  const logs = data?.logs || [];
  const taskCount = tasks.length;
  const workCount = works.length;
  const issueCount = issues.filter(issue => issue.status === 'open').length;
  const logCount = logs.filter(log => !log.is_deleted).length;
  const cards = isEngineer ? [['Loaded Projects', workCount], ['Loaded Tasks', taskCount], ['Open Issues', issueCount], ['Loaded Logs', logCount]] : c.cards.map(([label]) => [label, 'Unavailable']);
  return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{cards.map(([a, b], i) => <StatCard key={a} icon={[Gauge, Receipt, FolderKanban, AlertTriangle][i]} label={a} value={b} sub={isEngineer ? 'Current loaded context' : 'No backend for this module'} tone={['blue', 'violet', 'amber', 'emerald'][i]} />)}</div><div className="grid lg:grid-cols-[1.4fr_1fr] gap-4"><SectionCard title="My Priority Queue" subtitle={isEngineer ? 'Existing project/task context' : 'Unavailable until this module has a real backend'} icon={Zap}>{isEngineer ? <MiniTable columns={['Item', 'Context', 'Due', 'Priority']} rows={tasks.slice(0, 4).map(task => [<b key={task.id}>{task.title}</b>, task.stage_id ? 'Stage task' : 'Project task', task.due_date ? new Date(task.due_date).toLocaleDateString() : '—', <Badge key={`b-${task.id}`} tone={task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'amber' : 'blue'}>{task.priority}</Badge>])} /> : <div className="p-4"><p className="text-xs italic text-slate-400">Unavailable: no operational data source is connected for {c.title}.</p><button onClick={onOpenCrm} className="os-link mt-3">Open CRM workspace <ChevronRight size={13} /></button></div>}</SectionCard><SectionCard title="Quick Actions" icon={Plus}><div className="p-4 grid grid-cols-2 gap-2">{c.links.map(([a, n]) => isEngineer ? <button key={a} onClick={() => n === 'projects' ? onOpenCrm() : onNavigate(n)} className="os-action"><Plus size={14} />{a}</button> : <UnavailableAction key={a} className="os-action"><Plus size={14} />{a}</UnavailableAction>)}</div></SectionCard></div><SectionCard title="Recent Activity" icon={Activity}><div className="p-4"><p className="text-xs italic text-slate-400">Unavailable: no activity feed backend is connected to this dashboard.</p></div></SectionCard></div>;
}

function MyWorkPage({ onNavigate, onOpenCrm, data = {} }) {
  const tasks = data?.tasks || [];
  const works = data?.works || [];
  const reminders = data?.reminders || [];
  return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-5 gap-3"><StatCard icon={ListChecks} label="Loaded Tasks" value={tasks.length} sub="Selected project context" tone="blue" /><StatCard icon={FolderKanban} label="Loaded Projects" value={works.length} tone="violet" /><StatCard icon={ClipboardCheck} label="Approvals" value="Unavailable" tone="amber" /><StatCard icon={FileText} label="Documents" value="Unavailable" tone="emerald" /><StatCard icon={Bell} label="Open Reminders" value={reminders.filter(reminder => !reminder.is_completed && !reminder.is_deleted).length} tone="rose" /></div><div className="grid xl:grid-cols-[1.5fr_1fr] gap-4"><SectionCard title="Today's Work" subtitle="Existing tasks and reminders in the loaded context" icon={CalendarCheck2}><div className="p-4 space-y-2">{tasks.length ? tasks.slice(0, 5).map(task => <button key={task.id} onClick={() => { if (task.work_id) { const w = works.find(item => item.id === task.work_id); if (w) data?.navigateToContext?.(w.company_id, w.unit_id, w.id); } onOpenCrm(); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-left hover:border-sky-300 transition"><span className="text-[10px] font-black text-slate-400 w-12">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</span><div className="h-2 w-2 rounded-full bg-sky-500" /><div className="flex-1"><p className="text-xs font-bold">{task.title}</p><p className="text-[10px] text-slate-400">{task.status.replace('_', ' ')}</p></div><Badge tone={task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'amber' : 'blue'}>{task.priority}</Badge></button>) : <p className="text-xs italic text-slate-400">No loaded 7F tasks for the current project context.</p>}</div></SectionCard><SectionCard title="My Projects" icon={FolderKanban}><div className="p-4 space-y-3">{works.length ? works.slice(0, 5).map(work => <button key={work.id} onClick={() => { data?.navigateToContext?.(work.company_id, work.unit_id, work.id); onOpenCrm(); }} className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 transition"><div className="flex justify-between"><span className="text-xs font-bold">{work.title}</span><ChevronRight size={14} className="text-slate-400" /></div><div className="mt-2 text-[9px] text-slate-400">Click to view project in CRM</div></button>) : <p className="text-xs italic text-slate-400">No loaded projects in the current context.</p>}</div></SectionCard></div></div>;
}

function DataModulePage({ module, onNavigate }) {
  const definitions = {
    crm: { icon: Contact, title: 'CRM Workspace', tabs: ['Dashboard', 'Enquiries', 'Customers', 'Contacts', 'Follow-ups'], rows: [['ENQ-104', 'Sail Life Sciences', 'Sprinkler Upgrade', '₹24L', 'Follow-up'], ['ENQ-105', 'Matrix Pharma', 'Hydrant Extension', '₹18L', 'Quotation'], ['ENQ-106', 'ABC Industries', 'AMC', '₹8L', 'New']] },
    sales: { icon: CircleDollarSign, title: 'Sales Workspace', tabs: ['Dashboard', 'Quotations', 'Proforma Invoices', 'Sales Orders', 'Tax Invoices', 'Receivables'], rows: [['QTN-1042', 'Sail Life Sciences', '₹24,00,000', '12 Sep', 'Negotiation'], ['PI-0081', 'Matrix Pharma', '₹18,40,000', '11 Sep', 'Issued'], ['SO-0192', 'ABC Industries', '₹8,20,000', '14 Sep', 'Confirmed'], ['INV-0321', 'Sail Life Sciences', '₹12,60,000', '08 Sep', 'Part Paid']] },
    procurement: { icon: ShoppingCart, title: 'Procurement Workspace', tabs: ['Dashboard', 'Purchase Requests', 'RFQs', 'Vendor Quotes', 'Purchase Orders', 'GRN', 'Purchase Bills', 'Vendors'], rows: [['PR-220', 'PB-14', 'Sprinkler heads', '240', 'Pending'], ['PO-1042', 'PB-14', 'Pipes & fittings', '₹6,80,000', 'Approval'], ['GRN-882', 'MEP-22', 'Valves', '120', 'Received'], ['PB-401', 'Vendor ABC', 'Electrical materials', '₹1,24,000', 'To Verify']] },
    inventory: { icon: Boxes, title: 'Inventory Workspace', tabs: ['Dashboard', 'Items', 'Warehouses', 'Stock', 'Receipts', 'Issues', 'Transfers', 'Project Material'], rows: [['SPR-001', 'ESFR Sprinkler', 'WH-01', '420', 'Available'], ['PIPE-042', 'MS Pipe 100mm', 'WH-01', '1,280m', 'Available'], ['VAL-012', 'Butterfly Valve', 'WH-02', '18', 'Low Stock'], ['MAT-88', 'PB-14 Allocation', 'WH-01', '₹4.8L', 'Project']] },
    accounts: { icon: Landmark, title: 'Accounts Workspace', tabs: ['Dashboard', 'Tax Invoices', 'Purchase Bills', 'Receivables', 'Payables', 'Payments', 'Banking', 'Ledger', 'GST', 'E-Invoice', 'E-Way Bill'], rows: [['INV-0321', 'Sail Life Sciences', '₹12,60,000', '₹4,20,000', 'Part Paid'], ['INV-0318', 'Matrix Pharma', '₹8,40,000', '₹8,40,000', 'Paid'], ['PB-401', 'Vendor ABC', '₹1,24,000', '₹1,24,000', 'Payable'], ['RCPT-220', 'Customer XYZ', '₹2,80,000', '₹0', 'Received']] },
    hr: { icon: Users, title: 'HR Workspace', tabs: ['Dashboard', 'Employees', 'Organization', 'Attendance', 'Leave', 'Payroll', 'Expenses', 'Documents', 'Reports'], rows: [['EMP-001', 'Rajiv K', 'Project Manager', 'Active', '12 days'], ['EMP-002', 'Misbha', 'Design Engineer', 'Active', '10 days'], ['EMP-003', 'Suresh', 'Site Engineer', 'Active', '18 days'], ['EMP-004', 'Anil', 'Accounts', 'Leave', '—']] },
  };
  const d = definitions[module] || definitions.crm;
  const [tab, setTab] = useState(d.tabs[0]);
  return <div className="space-y-4"><div className="flex gap-2 overflow-x-auto pb-1">{d.tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`os-tab ${tab === t ? 'active' : ''}`}>{t}</button>)}</div><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={d.icon} label="Open Records" value="Unavailable" sub="No backend connected" tone="blue" /><StatCard icon={Clock3} label="Pending Action" value="Unavailable" sub="No backend connected" tone="amber" /><StatCard icon={CheckCircle2} label="Completed" value="Unavailable" sub="No backend connected" tone="emerald" /><StatCard icon={BarChart3} label="This Month" value="Unavailable" sub="No backend connected" tone="violet" /></div><SectionCard title={tab} subtitle="Module backend is not connected in the current application." icon={d.icon} action={<div className="flex gap-2"><UnavailableAction className="os-icon-btn" title="Unavailable: module filter backend is not connected."><Filter size={14} /></UnavailableAction><UnavailableAction className="os-primary"><Plus size={14} /> New</UnavailableAction></div>}><p className="p-4 text-xs italic text-slate-400">No live {tab.toLowerCase()} records are available from the current backend.</p></SectionCard></div>;
}

function ProjectsPage({ onOpenCrm, data = {} }) {
  const works = data?.works || [];
  const stageDefinitions = data?.stageDefinitions || [];
  const clientCompanies = data?.companies || [];
  const projectAssignments = data?.projectAssignments || [];
  const profiles = data?.profiles || [];
  const tenantMembers = data?.tenantMembers || [];

  const projectRows = works.map(work => {
    const client = clientCompanies.find(c => c.id === work.company_id);
    const stage = stageDefinitions.find(item => item.work_id === work.id && item.status === 'active');
    const lead = projectAssignments.find(a => a.work_id === work.id && a.status === 'active' && a.project_role === 'lead');
    return [
      <button
        onClick={() => {
          data?.navigateToContext?.(work.company_id, work.unit_id, work.id);
          onOpenCrm?.();
        }}
        className="text-left font-bold hover:text-sky-500 transition"
      >
        {work.title}
      </button>,
      client?.name || 'Client Unit',
      stage?.name || 'In Progress',
      'Unavailable',
      <Badge tone="slate">Unavailable</Badge>,
      lead ? getUserDisplayName(lead.user_id, profiles, tenantMembers) : 'Unassigned'
    ];
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <StatCard icon={FolderKanban} label="Loaded Projects" value={works.length} tone="violet" />
        <StatCard icon={HeartPulse} label="On Track" value="Unavailable" tone="emerald" />
        <StatCard icon={TriangleAlert} label="At Risk" value="Unavailable" tone="amber" />
        <StatCard icon={AlertTriangle} label="Delayed" value="Unavailable" tone="rose" />
        <StatCard icon={CircleDollarSign} label="Open Value" value="Unavailable" tone="blue" />
      </div>
      <SectionCard title="Project Pipeline" subtitle="Pipeline metrics require project status/progress fields not present in the current application model" icon={Workflow} action={<button onClick={onOpenCrm} className="os-secondary"><Grid2X2 size={14} /> Open CRM workspace</button>}>
        <div className="p-4"><p className="text-xs italic text-slate-400">Pipeline aggregation is unavailable. Use the CRM workspace for live projects and stages.</p></div>
      </SectionCard>
      <div className="grid xl:grid-cols-[1.4fr_1fr] gap-4">
        <SectionCard title="Project Register" icon={FolderKanban}>
          <MiniTable columns={['Project', 'Customer', 'Stage', 'Progress', 'Health', 'Manager']} rows={projectRows.length ? projectRows : [['No loaded projects', 'Unavailable', 'Unavailable', 'Unavailable', 'Unavailable', 'Unavailable']]} />
        </SectionCard>
        <SectionCard title="Project Command Actions" icon={Zap}>
          <div className="p-4 grid grid-cols-2 gap-2">
            <button onClick={() => { data?.openNewWorkModal?.(); onOpenCrm?.(); }} className="os-action cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 transition"><Plus size={14} /> New Project</button>
            <button onClick={() => { data?.openStageManager?.(); onOpenCrm?.(); }} className="os-action cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 transition"><Workflow size={14} /> Manage Stages</button>
            <button onClick={() => { data?.setIsProjectTeamModalOpen?.(true); onOpenCrm?.(); }} className="os-action cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 transition"><UserCog size={14} /> Assign Team</button>
            <button onClick={() => { data?.openNewTask?.(); onOpenCrm?.(); }} className="os-action cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 transition"><ListChecks size={14} /> Create Task</button>
            <button onClick={() => { data?.openGlobalReminderModal?.(); onOpenCrm?.(); }} className="os-action cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 transition"><Bell size={14} /> Add Reminder</button>
            <UnavailableAction className="os-action"><Plus size={14} /> Project Cost</UnavailableAction>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ReportsPage() {
  return <ReportsWorkspace />;
}

function DocumentsPage() {
  return <div className="space-y-4"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={FileText} label="All Documents" value="Unavailable" tone="blue" /><StatCard icon={FolderKanban} label="Project Documents" value="Unavailable" tone="violet" /><StatCard icon={FileCheck2} label="Awaiting Review" value="Unavailable" tone="amber" /><StatCard icon={History} label="Recent Versions" value="Unavailable" tone="emerald" /></div><SectionCard title="Document Library" subtitle="Document backend is not connected in the current application." icon={FileText} action={<UnavailableAction className="os-primary"><Upload size={14} /> Upload</UnavailableAction>}><p className="p-4 text-xs italic text-slate-400">No live documents are available.</p></SectionCard></div>;
}

function ApprovalsPage() {
  return <div className="space-y-4"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={ClipboardCheck} label="Pending" value="Unavailable" tone="amber" /><StatCard icon={Clock3} label="Due Today" value="Unavailable" tone="rose" /><StatCard icon={CheckCircle2} label="Approved This Month" value="Unavailable" tone="emerald" /><StatCard icon={XCircle} label="Rejected / Sent Back" value="Unavailable" tone="slate" /></div><SectionCard title="Pending Approval Queue" subtitle="Approval backend is not connected in the current application." icon={ClipboardCheck}><p className="p-4 text-xs italic text-slate-400">No live approval records are available.</p></SectionCard></div>;
}

function NotificationsPage({ notifications = [], isLoading = false, onMarkRead, onMarkAllRead, profiles = [], tenantMembers = [], onNotificationClick }) {
  console.log('[NOTIF TRACE 7] NotificationsPage render:', notifications?.length);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeBadgeTone = (type) => {
    switch (type) {
      case 'task_assigned':
      case 'task_reassigned':
        return 'blue';
      case 'project_assigned':
        return 'violet';
      case 'stage_assigned':
        return 'amber';
      case 'task_completed':
        return 'green';
      case 'task_status_changed':
        return 'slate';
      case 'task_due':
      case 'task_overdue':
        return 'red';
      default:
        return 'blue';
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="grid xl:grid-cols-[1.6fr_1fr] gap-4">
      <SectionCard
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : "All caught up"}
        icon={Bell}
        action={
          unreadCount > 0 ? (
            <button
              onClick={onMarkAllRead}
              className="os-link flex items-center gap-1.5 hover:text-sky-600 transition text-xs font-bold"
            >
              <CheckCircle2 size={14} /> Mark all as read
            </button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">No notifications found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => {
              const actorName = n.actor_id ? getUserDisplayName(n.actor_id, profiles, tenantMembers) : null;
              return (
                <div
                  key={n.id}
                  onClick={() => onNotificationClick?.(n)}
                  className={`p-4 transition flex items-start gap-3.5 cursor-pointer ${
                    !n.is_read
                      ? 'bg-sky-50/40 dark:bg-sky-950/20 font-medium'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {!n.is_read ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500 block" title="Unread" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700 block" title="Read" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-extrabold truncate ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </h4>
                      <Badge tone={getTypeBadgeTone(n.type)}>
                        {n.type?.replace('_', ' ') || 'system'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                      {actorName && <span>By: {actorName}</span>}
                      <span>{formatTime(n.created_at)}</span>
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead?.(n.id);
                      }}
                      className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0 self-center px-2 py-1 rounded bg-sky-100/60 dark:bg-sky-900/40"
                      title="Mark as read"
                    >
                      Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Notification Settings" subtitle="Preferences & channel routing" icon={Workflow}>
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Real-time notifications are automatically sent when you are assigned to project teams, pipeline stages, or 7F tasks.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Task Assignments</span>
              <span className="text-emerald-600 font-extrabold">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Project Assignments</span>
              <span className="text-emerald-600 font-extrabold">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Stage Assignments</span>
              <span className="text-emerald-600 font-extrabold">Active</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function AIPage({ onOpenAiChat }) {
  return (
    <div className="grid xl:grid-cols-[1.4fr_1fr] gap-4">
      <SectionCard title="Ask RAJIV AI" subtitle="Permission-aware business intelligence and assisted workflows." icon={Sparkles}>
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            RAJIV AI is ready to assist with project summaries, customer insights, and workflow queries.
          </p>
          <button onClick={onOpenAiChat} className="os-primary cursor-pointer">
            <Sparkles size={14} /> Launch AI Assistant
          </button>
        </div>
      </SectionCard>
      <SectionCard title="AI-Assisted Workflows" icon={Zap}>
        <div className="p-5 flex items-center gap-2 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
          <span>Workflow automation backend pending module connection.</span>
        </div>
      </SectionCard>
    </div>
  );
}

function AdminPage({ onNavigate, onOpenCrm, data = {} }) {
  const cards = [
    ['Company Settings', 'Company profiles, registrations, tax, branding & documents', Building2, true, 'company-settings'],
    ['Users & Access', 'Users, roles, company access', UserCog, true, 'admin-panel'],
    ['Permissions', 'View, create, edit, approve, assign, export', KeyRound, false],
    ['Hierarchy', 'Reporting managers and delegation', Network, false],
    ['Workflow', 'Stages, approval rules, numbering', Workflow, false],
    ['Notifications', 'Routing and escalation rules', Bell, false],
    ['Integrations', 'GST, e-invoice, e-way bill, Tally, SAP', Zap, false],
    ['Audit Log', 'Immutable business activity history', History, false]
  ];
  return (
    <div className="space-y-4">
      <SectionCard title="Administration" subtitle="System controls and user access management." icon={Settings}>
        <div className="p-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          {cards.map(([a, b, I, isLive, navTarget]) => isLive ? (
            <button key={a} onClick={() => {
              if (navTarget === 'company-settings') {
                onNavigate('company-settings');
              } else {
                data?.openAdminPanel?.();
                onOpenCrm?.();
              }
            }} className="text-left p-4 rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/50 dark:bg-sky-950/20 hover:border-sky-500 transition cursor-pointer">
              <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-300"><I size={17} /></div>
              <h3 className="text-xs font-black mt-3 text-sky-900 dark:text-sky-200">{a}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-4">{b}</p>
            </button>
          ) : (
            <UnavailableAction key={a} className="text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"><I size={17} /></div>
              <h3 className="text-xs font-black mt-3">{a}</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-4">{b}</p>
            </UnavailableAction>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Authorization Model" subtitle="Existing user authorization management." icon={ShieldCheck}>
        <div className="p-4 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage active team member profiles, roles, and approval requests.</p>
          <button onClick={() => { data?.openAdminPanel?.(); onOpenCrm?.(); }} className="os-primary cursor-pointer"><UserCog size={14} /> Open User Control Panel</button>
        </div>
      </SectionCard>
    </div>
  );
}

export default function BusinessOSWorkspace() {
  const crm = useCrm();
  const {
    isDarkMode, setIsDarkMode, onSignOut, operatingCompanies = [], activeOperatingCompany,
    setActiveOperatingCompanyId, currentUser, tenantRole, userRole, setIsAiChatOpen,
    companies = [], works = [], tasks = [], taskAssignees = [], reminders = [], missingData = [],
    projectAssignments = [], stageDefinitions = [], profiles = [], issues = [], logs = [],
    notifications = [], isNotificationsLoading = false, unreadNotificationsCount = 0,
    markNotificationAsRead, markAllNotificationsAsRead, tenantMembers = [],
    setIsSidebarOpen, searchQuery, handleSearch, searchResults, jumpToSearchResult, setSearchQuery,
    openNewWorkModal, openStageManager, setIsProjectTeamModalOpen, openNewTask,
    openGlobalReminderModal, setIsAdminPanelOpen, fetchProfiles, navigateToContext
  } = crm;

  const [page, setPage] = useState('dashboard');
  const [hrSubTab, setHrSubTab] = useState('master');
  const [publicApplyToken, setPublicApplyToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('apply_token') || '';
    }
    return '';
  });
  const [isRailHovered, setIsRailHovered] = useState(false);
  const [isRailPinned, setIsRailPinned] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rajiv_os_rail_pinned') === 'true';
    }
    return false;
  });
  const hoverTimeoutRef = useRef(null);

  const isExpanded = isRailPinned || isRailHovered;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsRailHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsRailHovered(false);
    }, 120);
  };

  const toggleRailPinned = () => {
    setIsRailPinned(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('rajiv_os_rail_pinned', String(next));
      }
      return next;
    });
  };
  const [previewRole, setPreviewRole] = useState(null);
  const [activePopover, setActivePopover] = useState(null); // 'company' | 'profile' | 'role' | null
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCompanyOpen, setIsMobileCompanyOpen] = useState(false);

  const topbarRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const mobileBackdropRef = useRef(null);

  const togglePopover = (name) => setActivePopover(prev => prev === name ? null : name);
  const closePopovers = () => {
    setActivePopover(null);
    setShowCreateMenu(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (topbarRef.current && !topbarRef.current.contains(event.target)) {
        setActivePopover(null);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        if (setSearchQuery) setSearchQuery('');
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setActivePopover(null);
        setShowCreateMenu(false);
        setIsMobileSearchOpen(false);
        setIsMobileMenuOpen(false);
        setIsMobileCompanyOpen(false);
        if (setSearchQuery) setSearchQuery('');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
          setIsMobileSearchOpen(true);
        } else if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSearchQuery]);

  // Mobile swipe gesture for sidebar drawer with real-time interactive tracking animation
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isTracking = false;
    let isDragging = false;
    let activePointerId = null;
    let openArmed = false;
    let closeArmed = false;

    const getDrawerWidth = () => {
      if (typeof window === 'undefined') return 280;
      return Math.min(280, window.innerWidth * 0.85);
    };

    const handlePointerDown = (e) => {
      // Only process touch pointers (or primary mouse button if testing)
      if (e.pointerType && e.pointerType === 'mouse' && e.buttons !== 1) return;

      const target = e.target;
      // Do not trigger if interacting with form inputs, sliders, or explicit no-swipe elements
      const isInput = target && target.closest && target.closest('input, textarea, select, [contenteditable="true"], [role="slider"], .no-swipe');
      if (isInput) return;

      startX = e.clientX;
      startY = e.clientY;
      currentX = e.clientX;
      currentY = e.clientY;
      activePointerId = e.pointerId;

      if (!isMobileMenuOpen) {
        // Arm OPEN gesture only if touch starts near the screen left edge (<= 40px)
        if (startX <= 40) {
          isTracking = true;
          openArmed = true;
          closeArmed = false;
        } else {
          isTracking = false;
          openArmed = false;
          closeArmed = false;
        }
      } else {
        // When drawer is OPEN, allow right-to-left swipe from anywhere
        isTracking = true;
        closeArmed = true;
        openArmed = false;
      }
    };

    const handlePointerMove = (e) => {
      if (!isTracking || (activePointerId !== null && e.pointerId !== activePointerId)) return;

      currentX = e.clientX;
      currentY = e.clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const absDeltaY = Math.abs(deltaY);

      if (!isDragging) {
        if (openArmed) {
          if (deltaX > 6 && deltaX > absDeltaY) {
            isDragging = true;
            if (mobileDrawerRef.current) mobileDrawerRef.current.style.transition = 'none';
            if (mobileBackdropRef.current) {
              mobileBackdropRef.current.style.transition = 'none';
              mobileBackdropRef.current.style.visibility = 'visible';
            }
          } else if (absDeltaY > 15) {
            isTracking = false;
            return;
          }
        } else if (closeArmed) {
          if (deltaX < -6 && Math.abs(deltaX) > absDeltaY) {
            isDragging = true;
            if (mobileDrawerRef.current) mobileDrawerRef.current.style.transition = 'none';
            if (mobileBackdropRef.current) {
              mobileBackdropRef.current.style.transition = 'none';
              mobileBackdropRef.current.style.visibility = 'visible';
            }
          } else if (absDeltaY > 15) {
            isTracking = false;
            return;
          }
        }
      }

      if (isDragging) {
        const drawerW = getDrawerWidth();
        if (openArmed) {
          const offset = Math.max(0, Math.min(drawerW, deltaX));
          const translateX = offset - drawerW;
          const backdropOpacity = (offset / drawerW);
          if (mobileDrawerRef.current) {
            mobileDrawerRef.current.style.transform = `translateX(${translateX}px)`;
          }
          if (mobileBackdropRef.current) {
            mobileBackdropRef.current.style.opacity = `${backdropOpacity}`;
          }
        } else if (closeArmed) {
          const offset = Math.max(-drawerW, Math.min(0, deltaX));
          const backdropOpacity = 1 + (offset / drawerW);
          if (mobileDrawerRef.current) {
            mobileDrawerRef.current.style.transform = `translateX(${offset}px)`;
          }
          if (mobileBackdropRef.current) {
            mobileBackdropRef.current.style.opacity = `${Math.max(0, backdropOpacity)}`;
          }
        }
      }
    };

    const finishGesture = (finalX, finalY) => {
      if (!isTracking) return;
      isTracking = false;

      const deltaX = finalX - startX;
      const deltaY = finalY - startY;
      const absDeltaY = Math.abs(deltaY);

      if (mobileDrawerRef.current) {
        mobileDrawerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        mobileDrawerRef.current.style.transform = '';
      }
      if (mobileBackdropRef.current) {
        mobileBackdropRef.current.style.transition = 'opacity 0.28s ease, visibility 0.28s ease';
        mobileBackdropRef.current.style.opacity = '';
        mobileBackdropRef.current.style.visibility = '';
      }

      if (openArmed) {
        if (deltaX > 50 && deltaX > absDeltaY * 1.5) {
          setIsMobileMenuOpen(true);
        } else {
          setIsMobileMenuOpen(false);
        }
      } else if (closeArmed) {
        if (deltaX < -50 && Math.abs(deltaX) > absDeltaY * 1.5) {
          setIsMobileMenuOpen(false);
        } else {
          setIsMobileMenuOpen(true);
        }
      }

      activePointerId = null;
      openArmed = false;
      closeArmed = false;
      isDragging = false;
    };

    const handlePointerUp = (e) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      const finalX = e.clientX !== undefined ? e.clientX : currentX;
      const finalY = e.clientY !== undefined ? e.clientY : currentY;
      finishGesture(finalX, finalY);
    };

    const handlePointerCancel = (e) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      finishGesture(currentX, currentY);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerCancel, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [isMobileMenuOpen]);

  const effectiveRole = previewRole || (tenantRole || 'TEAM').toUpperCase();
  const role = roleMeta[effectiveRole]?.label || effectiveRole;
  const companyName = activeOperatingCompany?.name || 'All Companies';

  const dashboardData = {
    companies: companies || [],
    works: works || [],
    tasks: tasks || [],
    taskAssignees: taskAssignees || [],
    reminders: reminders || [],
    missingData: missingData || [],
    projectAssignments: projectAssignments || [],
    stageDefinitions: stageDefinitions || [],
    profiles: profiles || [],
    issues: issues || [],
    logs: logs || [],
    notifications: notifications || [],
    openNewWorkModal,
    openStageManager,
    setIsProjectTeamModalOpen,
    openNewTask,
    openGlobalReminderModal,
    navigateToContext,
    openAdminPanel: () => {
      setPage('crm');
      if (setIsAdminPanelOpen) setIsAdminPanelOpen(true);
      if (fetchProfiles) fetchProfiles();
    }
  };

  const filteredNav = useMemo(() => navSections.map(section => ({
    ...section, items: section.items.filter(([id]) => {
      if (effectiveRole === 'VIEWER' && ['admin', 'accounts', 'hr'].includes(id)) return false;
      if (['SALES'].includes(effectiveRole) && !['dashboard', 'my-work', 'approvals', 'notifications', 'crm', 'sales', 'documents', 'reports', 'ai'].includes(id)) return false;
      if (effectiveRole === 'ACCOUNTANT' && ['hr', 'inventory', 'admin'].includes(id)) return false;
      if (effectiveRole === 'HR' && ['sales', 'procurement', 'inventory'].includes(id)) return false;
      return true;
    })
  })).filter(s => s.items.length), [effectiveRole]);

  const handleNotificationClick = (n) => {
    if (!n) return;
    if (!n.is_read) {
      markNotificationAsRead?.(n.id);
    }

    if (n.entity_type === 'task' && n.entity_id) {
      const task = (tasks || []).find(t => t.id === n.entity_id);
      if (task) {
        const targetWork = (works || []).find(w => w.id === task.work_id);
        if (targetWork) {
          navigateToContext?.(targetWork.company_id, targetWork.unit_id, targetWork.id);
        }
        setPage('crm');
        if (crm?.openEditTask) {
          crm.openEditTask(task);
        }
        return;
      }
    }

    if ((n.entity_type === 'project' || n.entity_type === 'work') && n.entity_id) {
      const targetWork = (works || []).find(w => w.id === n.entity_id);
      if (targetWork) {
        navigateToContext?.(targetWork.company_id, targetWork.unit_id, targetWork.id);
        setPage('crm');
        return;
      }
    }

    setPage('crm');
  };

  const go = (next) => {
    setPage(next);
    setIsMobileMenuOpen(false);
    closePopovers();
  };

  const handleNav = (id) => {
    if (id === 'ai') {
      setIsAiChatOpen?.(true);
    }
    go(id);
    if (!isRailPinned) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsRailHovered(false);
    }
  };

  const meta = pageMeta[page] || pageMeta.dashboard;

  return <div className={`business-os ${isDarkMode ? 'dark' : ''}`}>
    {/* DESKTOP NAVIGATION RAIL WITH HOVER EXPANSION */}
    <div
      className={`hidden md:block os-rail-wrapper ${isRailPinned ? 'w-60' : 'w-[60px]'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <nav
        className={`os-rail ${isExpanded ? 'os-rail-expanded' : ''} ${
          isRailPinned ? 'os-rail-pinned' : ''
        }`}
        aria-label="Main Navigation"
      >
        <div className={`os-rail-brand ${isExpanded ? 'px-3 justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="os-rail-logo" title="Rajiv Business OS">
              R
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  RAJIV OS
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                  Business OS
                </span>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRailPinned();
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                isRailPinned ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
              title={isRailPinned ? 'Unpin sidebar (collapse on mouse leave)' : 'Pin sidebar open'}
              aria-label={isRailPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              {isRailPinned ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            </button>
          )}
        </div>

        <div className="os-rail-nav custom-scrollbar">
          {filteredNav.map((section, sIdx) => (
            <div key={section.label} className="w-full">
              {isExpanded ? (
                <div className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.label}
                </div>
              ) : (
                sIdx > 0 && <div className="os-rail-divider mx-auto" />
              )}
              <div className={`w-full flex flex-col ${isExpanded ? 'gap-0.5 px-2' : 'items-center gap-1'}`}>
                {section.items.map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    className={
                      isExpanded
                        ? `os-rail-item-expanded ${page === id ? 'active' : ''}`
                        : `os-rail-btn ${page === id ? 'active' : ''}`
                    }
                    aria-label={label}
                    title={!isExpanded ? label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {isExpanded && (
                      <span className="truncate flex-1 text-left text-xs font-semibold">{label}</span>
                    )}
                    {id === 'notifications' && unreadNotificationsCount > 0 && (
                      <span className={isExpanded ? 'os-rail-badge-expanded' : 'os-rail-badge'}>
                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                      </span>
                    )}
                    {!isExpanded && <div className="os-rail-tooltip">{label}</div>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`os-rail-footer ${isExpanded ? 'px-2' : ''}`}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={isExpanded ? 'os-rail-item-expanded' : 'os-rail-btn'}
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="text-sm leading-none shrink-0 flex items-center justify-center w-5">
              {isDarkMode ? '☀' : '◐'}
            </span>
            {isExpanded && (
              <span className="truncate flex-1 text-left text-xs font-semibold">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
            {!isExpanded && <div className="os-rail-tooltip">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</div>}
          </button>
          <button
            onClick={() => go('profile')}
            className={
              isExpanded
                ? `os-rail-item-expanded ${page === 'profile' ? 'active' : ''}`
                : `os-rail-btn ${page === 'profile' ? 'active' : ''}`
            }
            aria-label="My Profile"
            title={!isExpanded ? 'My Profile' : undefined}
          >
            <UserRound size={18} className="shrink-0" />
            {isExpanded && (
              <div className="truncate flex-1 text-left min-w-0">
                <div className="truncate text-xs font-bold leading-tight text-slate-800 dark:text-slate-200">
                  {currentUser?.email?.split('@')[0] || 'My Profile'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight truncate">
                  {role}
                </div>
              </div>
            )}
            {!isExpanded && <div className="os-rail-tooltip">My Profile</div>}
          </button>
        </div>
      </nav>
    </div>

    <main className="os-main">
      {/* SINGLE CLEAN TOPBAR */}
      <header className="os-topbar" ref={topbarRef}>
        {/* Left: Mobile menu toggle, Brand, Company Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden os-btn-icon"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>

          <div className="os-topbar-brand shrink-0">
            <span>RAJIV</span>
            <span className="os-topbar-brand-badge">OS</span>
          </div>

          <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Operating Company Context (Desktop Only) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => togglePopover('company')}
              className="os-company-btn"
              title="Operating Company Context"
            >
              <BriefcaseBusiness size={14} className="text-slate-400 shrink-0" />
              <span className="max-w-[130px] sm:max-w-[190px] truncate">{companyName}</span>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>
            {activePopover === 'company' && (
              <div className="os-popover-menu left-0 top-11 w-72">
                <div className="os-popover-title">Operating Company Context</div>
                <button
                  onClick={() => { setActiveOperatingCompanyId(null); closePopovers(); }}
                  className={`os-menu-item justify-between ${!activeOperatingCompany ? 'active' : ''}`}
                >
                  <div>
                    <div className="font-bold">ALL COMPANIES</div>
                    <div className="text-xs text-slate-400 font-normal">Consolidated authorized view</div>
                  </div>
                  {!activeOperatingCompany && <Check size={14} className="text-blue-600 shrink-0" />}
                </button>
                {operatingCompanies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setActiveOperatingCompanyId(c.id); closePopovers(); }}
                    className={`os-menu-item justify-between ${activeOperatingCompany?.id === c.id ? 'active' : ''}`}
                  >
                    <div>
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-slate-400 font-normal">Operating company</div>
                    </div>
                    {activeOperatingCompany?.id === c.id && <Check size={14} className="text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search (Desktop Only) */}
        <div className="os-search-box relative hidden md:flex" ref={searchContainerRef}>
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery || ''}
            onChange={handleSearch}
            placeholder="Search customers, units, projects, contacts... (⌘K)"
          />
          {searchQuery ? (
            <button
              onClick={() => handleSearch({ target: { value: '' } })}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd>⌘K</kbd>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="os-popover-menu top-full left-0 right-0 mt-1.5 shadow-xl overflow-hidden">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-500">
                <span>Results ({searchResults.length})</span>
                <button onClick={() => handleSearch({ target: { value: '' } })} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={result.id || idx}
                    onClick={() => {
                      jumpToSearchResult(result);
                      handleSearch({ target: { value: '' } });
                      go('crm');
                    }}
                    className="w-full text-left px-3 py-2 border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={15} className="text-blue-600 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-semibold block truncate text-slate-800 dark:text-slate-200">{result.label || result.title || result.name}</span>
                        <span className="text-xs text-slate-400 truncate block">{result.subtext || result.po_number || ''}</span>
                      </div>
                    </div>
                    {result.result_type && (
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                        {result.result_type}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Global Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Icon (Mobile Only) */}
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="os-btn-icon md:hidden"
            title="Search Business OS"
          >
            <Search size={16} />
          </button>

          {/* Notifications (Desktop Only) */}
          <button
            onClick={() => go('notifications')}
            className="os-btn-icon relative hidden md:inline-flex"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadNotificationsCount > 0 && (
              <span className="os-topbar-dot">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle (Desktop Only) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="os-btn-icon hidden md:inline-flex"
            title="Toggle theme"
          >
            <span className="text-sm leading-none">{isDarkMode ? '☀' : '◐'}</span>
          </button>

          {/* Role Preview (Desktop Only) */}
          {(effectiveRole === 'OWNER' || effectiveRole === 'ADMIN') ? (
            <div className="relative hidden xl:block">
              <button onClick={() => togglePopover('role')} className="os-role-badge">
                <Eye size={13} /> {previewRole ? `Preview: ${role}` : role}
              </button>
              {activePopover === 'role' && (
                <div className="os-popover-menu right-0 top-11 w-60">
                  <div className="os-popover-title">UI Role Preview</div>
                  {previewRoles.map(([r, l]) => (
                    <button
                      key={r}
                      onClick={() => { setPreviewRole(r); setPage(r === 'OWNER' || r === 'MANAGER' ? 'dashboard' : 'my-work'); closePopovers(); }}
                      className={`os-menu-item justify-between ${previewRole === r ? 'active' : ''}`}
                    >
                      <div>
                        <div className="font-bold">{l}</div>
                        <div className="text-xs text-slate-400 font-normal">{r}</div>
                      </div>
                      {previewRole === r && <Check size={13} className="text-blue-600 shrink-0" />}
                    </button>
                  ))}
                  <button onClick={() => { setPreviewRole(null); closePopovers(); }} className="w-full mt-2 text-xs font-bold text-blue-600 p-2 text-center hover:underline">
                    Return to actual role
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* User Profile */}
          <div className="relative">
            <button onClick={() => togglePopover('profile')} className="os-user-btn">
              <div className="os-avatar-sm">{(currentUser?.email || 'R').charAt(0).toUpperCase()}</div>
              <span className="hidden xl:inline font-semibold text-xs text-slate-700 dark:text-slate-200 max-w-[110px] truncate">
                {currentUser?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>
            {activePopover === 'profile' && (
              <div className="os-popover-menu right-0 top-11 w-64">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser?.email || 'User'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{role} · {companyName}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { go('profile'); closePopovers(); }} className="os-menu-item">
                    <UserRound size={15} /> <span>My Profile</span>
                  </button>
                  <button onClick={() => { go('admin'); closePopovers(); }} className="os-menu-item">
                    <Settings size={15} /> <span>Settings</span>
                  </button>
                  <button onClick={() => { onSignOut?.(); closePopovers(); }} className="os-menu-item text-rose-600 hover:text-rose-700">
                    <LogOut size={15} /> <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH OVERLAY / DRAWER */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex flex-col p-3 sm:p-6 overflow-hidden">
          <div className={`w-full max-w-2xl mx-auto flex-1 flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
              <button 
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  if (handleSearch) handleSearch({ target: { value: '' } });
                }} 
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft size={18} />
                <span>Search Business OS</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  if (handleSearch) handleSearch({ target: { value: '' } });
                }} 
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                <Search size={16} className="shrink-0 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery || ''}
                  onChange={handleSearch}
                  placeholder="Search customers, units, projects, contacts, enquiries..."
                  className="w-full bg-transparent text-xs font-semibold outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => handleSearch({ target: { value: '' } })} 
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {searchResults && searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((result, idx) => (
                    <button
                      key={result.id || idx}
                      onClick={() => {
                        jumpToSearchResult(result);
                        if (handleSearch) handleSearch({ target: { value: '' } });
                        setIsMobileSearchOpen(false);
                        go('crm');
                      }}
                      className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${isDarkMode ? 'hover:bg-slate-800/70 border border-transparent hover:border-slate-700' : 'hover:bg-sky-50/70 border border-transparent hover:border-sky-100'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate">{result.label || result.title || result.name}</span>
                          <span className="text-xs text-slate-400 truncate block mt-0.5">{result.subtext || result.po_number || ''}</span>
                        </div>
                      </div>
                      {result.result_type && (
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                          {result.result_type}
                        </span>
                      )}
                    </button>
                  ))}
                </>
              ) : searchQuery ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching results found for "{searchQuery}"
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Type above to search customers, projects, contacts, enquiries...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="os-content custom-scrollbar">
        <div className="os-page-head">
          <div>
            <div className="os-breadcrumb">RAJIV BUSINESS OS <ChevronRight size={11} /> {meta[0]}</div>
            <h1>{meta[0]}</h1>
            <p>{meta[1]}</p>
          </div>
          <div className="flex gap-2 relative">
            <UnavailableAction className="os-secondary"><CalendarDays size={14} /> Today</UnavailableAction>
            <div className="relative">
              <button onClick={() => setShowCreateMenu(!showCreateMenu)} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Create <ChevronDown size={12} />
              </button>
              {showCreateMenu && (
                <div className={`absolute right-0 top-10 w-52 z-50 p-1.5 rounded-2xl shadow-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => { openNewWorkModal?.(); go('crm'); setShowCreateMenu(false); }} className="w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer">
                    <Briefcase size={14} className="text-sky-500" /><span>New Project</span>
                  </button>
                  <button onClick={() => { openNewTask?.(); go('crm'); setShowCreateMenu(false); }} className="w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer">
                    <ListChecks size={14} className="text-emerald-500" /><span>New 7F Task</span>
                  </button>
                  <button onClick={() => { openGlobalReminderModal?.(); go('crm'); setShowCreateMenu(false); }} className="w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer">
                    <Bell size={14} className="text-amber-500" /><span>New Reminder</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {page === 'dashboard' && <Dashboard role={effectiveRole} onNavigate={go} onOpenCrm={() => go('crm')} companyName={companyName} companies={operatingCompanies || []} data={dashboardData} />}
        {page === 'my-work' && (
          <MyWorkPage onNavigate={go} onOpenCrm={() => go('crm')} data={dashboardData} />
        )}
        {page === 'approvals' && <ApprovalCenter />}
        {page === 'notifications' && (
          <NotificationsPage
            notifications={notifications}
            isLoading={isNotificationsLoading}
            onMarkRead={markNotificationAsRead}
            onMarkAllRead={markAllNotificationsAsRead}
            profiles={profiles}
            tenantMembers={tenantMembers}
            onNotificationClick={handleNotificationClick}
          />
        )}
        {page === 'sales' && <SalesWorkspace />}
        {page === 'procurement' && <ProcurementWorkspace />}
        {page === 'inventory' && <InventoryWorkspace isDarkMode={isDarkMode} />}
        {page === 'crm' && <CrmWorkspace embedded />}
        {page === 'accounts' && <AccountsWorkspace isDarkMode={isDarkMode} />}
        {page === 'hr' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setHrSubTab('master')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hrSubTab === 'master'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Users size={14} /> Employee Master
              </button>
              <button
                type="button"
                onClick={() => setHrSubTab('recruitment')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hrSubTab === 'recruitment'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Briefcase size={14} /> Recruitment
              </button>
              <button
                type="button"
                onClick={() => setHrSubTab('policy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hrSubTab === 'policy'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ShieldCheck size={14} /> Policy Center
              </button>
              <button
                type="button"
                onClick={() => setHrSubTab('change_requests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hrSubTab === 'change_requests'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ClipboardCheck size={14} /> Profile Requests
              </button>
              <button
                type="button"
                onClick={() => setHrSubTab('attendance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hrSubTab === 'attendance'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Clock3 size={14} /> Attendance
              </button>
              <button
                type="button"
                onClick={() => setHrSubTab('leave')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hrSubTab === 'leave'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Palmtree size={14} /> Leave Management
              </button>
              <button
                type="button"
                onClick={() => setHrSubTab('payroll')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hrSubTab === 'payroll'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Banknote size={14} /> Payroll
              </button>
            </div>
            {hrSubTab === 'master' && <EmployeeWorkspace />}
            {hrSubTab === 'recruitment' && <RecruitmentWorkspace />}
            {hrSubTab === 'policy' && <HrPolicyCenter />}
            {hrSubTab === 'change_requests' && <EmployeeChangeRequests />}
            {hrSubTab === 'attendance' && <AttendanceWorkspace />}
            {hrSubTab === 'leave' && <LeaveWorkspace />}
            {hrSubTab === 'payroll' && <PayrollWorkspace />}
          </div>
        )}

        {/* Public Candidate Application Modal Overlay */}
        {publicApplyToken && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl my-8">
              <PublicApplicationForm token={publicApplyToken} onClose={() => setPublicApplyToken('')} />
            </div>
          </div>
        )}
        {page === 'projects' && (
          <ProjectsPage onOpenCrm={() => go('crm')} data={dashboardData} />
        )}
        {page === 'documents' && <DocumentsPage />}
        {page === 'reports' && <ReportsPage />}
        {page === 'ai' && <AIPage onOpenAiChat={() => setIsAiChatOpen?.(true)} />}
        {page === 'admin' && <AdminPage onNavigate={go} onOpenCrm={() => go('crm')} data={dashboardData} />}
        {page === 'company-settings' && <CompanySettingsWorkspace />}
        {page === 'profile' && <ProfileWorkspace onNavigate={go} />}
      </div>

      {/* MOBILE DRAWER */}
      <div className="md:hidden">
        <div
          ref={mobileBackdropRef}
          className={`os-mobile-drawer-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside
          ref={mobileDrawerRef}
          className={`os-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        >
            <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="os-rail-logo text-sm font-bold w-7 h-7">R</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">RAJIV OS</div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="os-btn-icon" aria-label="Close navigation menu">
                <X size={16} />
              </button>
            </div>

            {/* Mobile Operating Company Selector */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <BriefcaseBusiness size={13} />
                <span>Operating Company</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsMobileCompanyOpen(!isMobileCompanyOpen)}
                  className="w-full os-company-btn justify-between text-xs py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{companyName}</span>
                  <ChevronDown size={13} className="text-slate-400 shrink-0" />
                </button>
                {isMobileCompanyOpen && (
                  <div className="mt-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-1 space-y-0.5 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setActiveOperatingCompanyId(null); setIsMobileCompanyOpen(false); setIsMobileMenuOpen(false); }}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center justify-between cursor-pointer ${!activeOperatingCompany ? 'bg-blue-50 text-blue-600 font-bold dark:bg-blue-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <div>
                        <div className="font-bold">ALL COMPANIES</div>
                        <div className="text-[11px] text-slate-400 font-normal">Consolidated view</div>
                      </div>
                      {!activeOperatingCompany && <Check size={14} className="text-blue-600 shrink-0" />}
                    </button>
                    {operatingCompanies.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setActiveOperatingCompanyId(c.id); setIsMobileCompanyOpen(false); setIsMobileMenuOpen(false); }}
                        className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center justify-between cursor-pointer ${activeOperatingCompany?.id === c.id ? 'bg-blue-50 text-blue-600 font-bold dark:bg-blue-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        <div>
                          <div className="font-bold truncate">{c.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">Operating company</div>
                        </div>
                        {activeOperatingCompany?.id === c.id && <Check size={14} className="text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
              {filteredNav.map(section => (
                <div key={section.label}>
                  <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">{section.label}</div>
                  <div className="space-y-0.5 mt-1">
                    {section.items.map(([id, label, Icon]) => (
                      <button
                        key={id}
                        onClick={() => handleNav(id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          page === id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} />
                          <span>{label}</span>
                        </div>
                        {id === 'notifications' && unreadNotificationsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="os-avatar-sm">{(currentUser?.email || 'R').charAt(0).toUpperCase()}</div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser?.email?.split('@')[0]}</div>
                  <div className="text-xs text-slate-400">{role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="os-btn-icon"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span className="text-xs leading-none">{isDarkMode ? '☀' : '◐'}</span>
                </button>
                <button onClick={onSignOut} className="os-btn-icon text-rose-500 hover:text-rose-600" title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>
        </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="os-mobile-bottom-nav md:hidden" aria-label="Mobile Navigation">
        <button onClick={() => go('dashboard')} className={`os-mobile-tab ${page === 'dashboard' ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Home</span>
        </button>
        <button onClick={() => go('my-work')} className={`os-mobile-tab ${page === 'my-work' ? 'active' : ''}`}>
          <ListChecks size={18} />
          <span>Work</span>
        </button>
        <button onClick={() => go('crm')} className={`os-mobile-tab ${page === 'crm' ? 'active' : ''}`}>
          <Contact size={18} />
          <span>CRM</span>
        </button>
        <button onClick={() => go('notifications')} className={`os-mobile-tab relative ${page === 'notifications' ? 'active' : ''}`}>
          <Bell size={18} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1/4 h-2 w-2 rounded-full bg-rose-500" />
          )}
          <span>Alerts</span>
        </button>
      </nav>
    </main>
  </div>;
}

function FlameIcon() { return <span className="text-white font-black text-xs">R</span> }
