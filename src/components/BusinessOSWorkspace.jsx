import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness,
  Building2, CalendarDays, Check, ChevronDown, ChevronRight, CircleDollarSign, ClipboardCheck,
  Clock3, CreditCard, FileBarChart, FileCheck2, FilePlus2, FileText, Filter, FolderKanban,
  Gauge, Grid2X2, HandCoins, HeartPulse, HelpCircle, Inbox, LayoutDashboard, ListChecks,
  LogOut, Menu, Package, PanelLeftClose, PanelLeftOpen, Plus, Receipt, RefreshCw, Search,
  Settings, ShieldCheck, ShoppingCart, Sparkles, Target, Truck, UserCheck, Users, WalletCards,
  X, Zap, BookOpen, Banknote, CalendarCheck2, Boxes, Calculator, Contact, Landmark, UserRound,
  ClipboardList, FileSpreadsheet, Workflow, CircleUserRound, SlidersHorizontal, ChevronUp,
  MoreHorizontal, Eye, Pencil, Send, Upload, Download, CheckCircle2, XCircle, ClockArrowUp,
  TriangleAlert, Factory, MapPin, Briefcase, UserCog, Network, KeyRound, History, Layers3,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import CrmWorkspace from './CrmWorkspace';

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
};

const money = (n) => `₹${n.toLocaleString('en-IN')}`;

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    red: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-extrabold ${tones[tone] || tones.slate}`}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, sub, trend, tone = 'blue' }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  };
  return (
    <div className="os-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}><Icon size={18} /></div>
        {trend && <span className={`text-[10px] font-extrabold flex items-center gap-0.5 ${trend.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>{trend.startsWith('-') ? <ArrowDownRight size={12}/> : <ArrowUpRight size={12}/>} {trend}</span>}
      </div>
      <div className="mt-4 text-2xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</div>
      {sub && <div className="mt-2 text-[10px] text-slate-400">{sub}</div>}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`os-card overflow-hidden ${className}`}>
      <div className="px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300"><Icon size={15}/></div>}
          <div className="min-w-0"><h3 className="text-xs font-black uppercase tracking-wider truncate">{title}</h3>{subtitle && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}</div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Progress({ value }) {
  return <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${value}%` }} /></div>;
}

function MiniTable({ columns, rows }) {
  return <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{columns.map((c) => <th key={c} className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">{row.map((cell, j) => <td key={j} className="px-4 py-3 text-xs font-semibold border-b last:border-0 border-slate-100 dark:border-slate-800/70">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Dashboard({ role, onNavigate, companyName, companies }) {
  const multi = companies.length > 1;
  if (role === 'OWNER') return <OwnerDashboard onNavigate={onNavigate} companyName={companyName} multi={multi} companies={companies}/>;
  if (role === 'MANAGER') return <ManagerDashboard onNavigate={onNavigate} companyName={companyName}/>;
  if (role === 'SALES') return <FunctionalDashboard type="sales" onNavigate={onNavigate} />;
  if (role === 'ACCOUNTANT') return <FunctionalDashboard type="accounts" onNavigate={onNavigate} />;
  if (role === 'HR') return <FunctionalDashboard type="hr" onNavigate={onNavigate} />;
  if (role === 'PROCUREMENT') return <FunctionalDashboard type="procurement" onNavigate={onNavigate} />;
  if (role === 'WAREHOUSE') return <FunctionalDashboard type="inventory" onNavigate={onNavigate} />;
  if (role === 'ENGINEER') return <FunctionalDashboard type="engineer" onNavigate={onNavigate} />;
  return <MyWorkPage onNavigate={onNavigate} />;
}

function OwnerDashboard({ onNavigate, companyName, multi, companies }) {
  const companyRows = (companies.length ? companies : [{ id: 'a', name: companyName || 'Operating Company A' }, { id: 'b', name: 'Operating Company B' }]).map((c, i) => [
    <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black">{c.name?.charAt(0) || 'C'}</div><span className="font-bold">{c.name}</span></div>,
    <Badge tone={i === 1 ? 'amber' : 'green'}>{i === 1 ? 'At Risk' : 'Healthy'}</Badge>,
    `${62 + i * 9}%`,
    money(2840000 - i * 360000),
    `${18 - i} active`,
  ]);
  return <div className="space-y-5">
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={CircleDollarSign} label="Group Revenue" value="₹8.42 Cr" sub="Current financial year" trend="12.4%" tone="blue"/><StatCard icon={WalletCards} label="Receivables" value="₹1.86 Cr" sub="₹42L overdue" trend="8.2%" tone="amber"/><StatCard icon={FolderKanban} label="Active Projects" value="24" sub="4 at risk · 2 delayed" tone="violet"/><StatCard icon={Users} label="Employees" value="186" sub="Across authorized companies" trend="4.1%" tone="emerald"/></div>
    <div className="grid xl:grid-cols-[1.6fr_1fr] gap-4">
      <SectionCard title={multi ? 'Company Performance' : 'Company Health'} subtitle={multi ? 'Consolidated view across operating companies' : 'Single-company operating overview'} icon={Building2} action={<button onClick={() => onNavigate('reports')} className="os-link">View report <ChevronRight size={13}/></button>}>
        <MiniTable columns={['Company','Health','Progress','Revenue','Projects']} rows={companyRows}/>
      </SectionCard>
      <SectionCard title="Executive Attention" subtitle="Only exceptions and decisions that need management" icon={TriangleAlert}>
        <div className="p-4 space-y-2.5">
          {[['Project PB-14 has slipped 4 days','Project','red'],['PO-1042 awaiting approval','Procurement','amber'],['Customer ABC ₹18L overdue','Finance','amber'],['Design stage bottleneck in 2 projects','Operations','violet']].map(([x,y,t])=><div key={x} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3"><div className={`h-2 w-2 rounded-full ${t==='red'?'bg-rose-500':t==='amber'?'bg-amber-500':'bg-violet-500'}`}/><div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{x}</p><p className="text-[10px] text-slate-400">{y}</p></div><ChevronRight size={14} className="text-slate-400"/></div>)}
        </div>
      </SectionCard>
    </div>
    <div className="grid lg:grid-cols-3 gap-4">
      <SectionCard title="Financial Snapshot" icon={BarChart3}><div className="p-4 space-y-4">{[['Revenue','₹8.42 Cr',82],['Gross Profit','₹1.96 Cr',64],['Expenses','₹6.46 Cr',55],['Cash + Bank','₹1.18 Cr',42]].map(([a,b,v])=><div key={a}><div className="flex justify-between mb-1.5"><span className="text-xs font-bold">{a}</span><span className="text-xs font-black">{b}</span></div><Progress value={v}/></div>)}</div></SectionCard>
      <SectionCard title="Project Health" icon={HeartPulse}><div className="p-4 grid grid-cols-3 gap-2">{[['On Track','18','green'],['At Risk','4','amber'],['Delayed','2','red']].map(([a,b,t])=><div key={a} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 text-center"><div className={`text-2xl font-black ${t==='green'?'text-emerald-500':t==='amber'?'text-amber-500':'text-rose-500'}`}>{b}</div><div className="text-[9px] font-black uppercase text-slate-400 mt-1">{a}</div></div>)}</div></SectionCard>
      <SectionCard title="Pending Approvals" icon={ClipboardCheck}><div className="p-4 space-y-2">{[['Purchase Orders',4,'procurement'],['Payments',3,'accounts'],['Quotations',2,'sales'],['HR',1,'hr']].map(([a,b,n])=><button onClick={()=>onNavigate('approvals')} key={a} className="w-full flex justify-between items-center py-2 text-left hover:text-sky-600"><span className="text-xs font-bold">{a}</span><Badge tone="amber">{b}</Badge></button>)}</div></SectionCard>
    </div>
  </div>;
}

function ManagerDashboard({ onNavigate }) {
  return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={FolderKanban} label="My Projects" value="12" sub="2 at risk" tone="violet"/><StatCard icon={ListChecks} label="Team Tasks" value="47" sub="8 overdue" tone="blue"/><StatCard icon={ClipboardCheck} label="Approvals" value="9" sub="3 high priority" tone="amber"/><StatCard icon={AlertTriangle} label="Escalations" value="4" sub="Requires review" tone="rose"/></div><div className="grid xl:grid-cols-[1.4fr_1fr] gap-4"><SectionCard title="Project Command Center" subtitle="Projects where you are responsible or accountable" icon={FolderKanban} action={<button onClick={()=>onNavigate('projects')} className="os-link">All projects <ChevronRight size={13}/></button>}><MiniTable columns={['Project','Stage','Progress','Health','Lead']} rows={[[<b>PB-14</b>,'Approval','64%',<Badge tone="amber">At Risk</Badge>,'Rajiv'],['MEP-22','Execution','81%',<Badge tone="green">On Track</Badge>,'Anil'],['FS-08','Design','42%',<Badge tone="green">On Track</Badge>,'Misbha'],['QA-31','Enquiry','18%',<Badge tone="blue">New</Badge>,'Suresh']]}/></SectionCard><SectionCard title="Team Bottlenecks" icon={Clock3}><div className="p-4 space-y-3">{['Design approval pending – 2 days','Material request not converted to PO','Site log missing for yesterday','Client document awaiting review'].map((x,i)=><div className="flex gap-3" key={x}><div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 flex items-center justify-center text-[10px] font-black">{i+1}</div><p className="text-xs font-semibold leading-5">{x}</p></div>)}</div></SectionCard></div></div>;
}

function FunctionalDashboard({ type, onNavigate }) {
  const configs = {
    sales: { title:'Sales Command Center', cards:[['Open Enquiries','24'],['Quotations','13'],['Sales Orders','8'],['Receivables','₹86L']], links:[['New Quotation','sales'],['New Proforma','sales'],['New Sales Order','sales'],['Tax Invoice','accounts']] },
    accounts: { title:'Accounts Workbench', cards:[['To Invoice','12'],['Purchase Bills','18'],['Receivables','₹86L'],['Payables','₹42L']], links:[['Tax Invoice','accounts'],['Purchase Bill','procurement'],['Receipt','accounts'],['Payment','accounts']] },
    hr: { title:'HR Operations Center', cards:[['Employees','186'],['Present Today','164'],['Leave Requests','7'],['Missing Attendance','3']], links:[['Attendance','hr'],['Leave','hr'],['Payroll','hr'],['Employees','hr']] },
    procurement: { title:'Procurement Command Center', cards:[['Purchase Requests','17'],['RFQs','9'],['PO Awaiting Approval','4'],['Bills to Verify','8']], links:[['Purchase Request','procurement'],['RFQ','procurement'],['Purchase Order','procurement'],['AI Bill Capture','procurement']] },
    inventory: { title:'Inventory Control Center', cards:[['Stock Value','₹1.24Cr'],['Low Stock','14'],['Pending GRN','6'],['Project Issues','11']], links:[['Stock Receipt','inventory'],['Stock Issue','inventory'],['Transfer','inventory'],['Project Material','inventory']] },
    engineer: { title:'Project / Site Workspace', cards:[['My Projects','4'],['My Tasks','16'],['Open Issues','5'],['Today Logs','3']], links:[['Daily Log','projects'],['My Tasks','my-work'],['Issues','projects'],['Documents','documents']] },
  };
  const c=configs[type];
  return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{c.cards.map(([a,b],i)=><StatCard key={a} icon={[Gauge,Receipt,FolderKanban,AlertTriangle][i]} label={a} value={b} tone={['blue','violet','amber','emerald'][i]}/>)}</div><div className="grid lg:grid-cols-[1.4fr_1fr] gap-4"><SectionCard title="My Priority Queue" subtitle="Actions ordered by urgency and due date" icon={Zap}><MiniTable columns={['Item','Context','Due','Priority']} rows={[[<b>Client approval</b>,'PB-14 / Design','Today',<Badge tone="red">High</Badge>],[<b>Verify purchase bill</b>,'Vendor ABC','Today',<Badge tone="amber">Medium</Badge>],[<b>Follow-up</b>,'Sail Life Sciences','Tomorrow',<Badge tone="blue">Normal</Badge>],[<b>Review document</b>,'MEP-22','12 Sep',<Badge tone="blue">Normal</Badge>]]}/></SectionCard><SectionCard title="Quick Actions" icon={Plus}><div className="p-4 grid grid-cols-2 gap-2">{c.links.map(([a,n])=><button key={a} onClick={()=>onNavigate(n)} className="os-action"><Plus size={14}/>{a}</button>)}</div></SectionCard></div><SectionCard title="Recent Activity" icon={Activity}><div className="p-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3">{['New task assigned to you','PO approved by manager','Document uploaded to PB-14','Stage moved to Approval'].map((x,i)=><div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900" key={x}><div className="text-[10px] text-slate-400">{i+1} hour ago</div><p className="text-xs font-bold mt-1">{x}</p></div>)}</div></SectionCard></div>;
}

function MyWorkPage({ onNavigate }) {
  return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-5 gap-3"><StatCard icon={ListChecks} label="My Tasks" value="16" sub="3 due today" tone="blue"/><StatCard icon={FolderKanban} label="My Projects" value="4" tone="violet"/><StatCard icon={ClipboardCheck} label="Approvals" value="2" tone="amber"/><StatCard icon={FileText} label="Documents" value="8" tone="emerald"/><StatCard icon={Bell} label="Unread" value="5" tone="rose"/></div><div className="grid xl:grid-cols-[1.5fr_1fr] gap-4"><SectionCard title="Today's Work" subtitle="Your assigned work across modules" icon={CalendarCheck2}><div className="p-4 space-y-2">{[['09:00','Site inspection – PB-14','Project','High'],['11:30','Prepare design revision','Design','High'],['14:00','Verify vendor bill','Accounts','Medium'],['16:00','Client follow-up','CRM','Normal']].map(([time,x,ctx,p])=><div key={x} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800"><span className="text-[10px] font-black text-slate-400 w-12">{time}</span><div className="h-2 w-2 rounded-full bg-sky-500"/><div className="flex-1"><p className="text-xs font-bold">{x}</p><p className="text-[10px] text-slate-400">{ctx}</p></div><Badge tone={p==='High'?'red':p==='Medium'?'amber':'blue'}>{p}</Badge></div>)}</div></SectionCard><SectionCard title="My Projects" icon={FolderKanban}><div className="p-4 space-y-3">{['PB-14 – Sail Life Sciences','MEP-22 – Matrix Pharma','FS-08 – Industrial Project'].map((x,i)=><button key={x} onClick={()=>onNavigate('projects')} className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 transition"><div className="flex justify-between"><span className="text-xs font-bold">{x}</span><ChevronRight size={14} className="text-slate-400"/></div><div className="mt-2"><Progress value={[64,81,42][i]}/></div></button>)}</div></SectionCard></div></div>;
}

function DataModulePage({ module, onNavigate }) {
  const definitions = {
    crm: { icon: Contact, title:'CRM Workspace', tabs:['Dashboard','Enquiries','Customers','Contacts','Follow-ups'], rows:[['ENQ-104','Sail Life Sciences','Sprinkler Upgrade','₹24L','Follow-up'],['ENQ-105','Matrix Pharma','Hydrant Extension','₹18L','Quotation'],['ENQ-106','ABC Industries','AMC','₹8L','New']] },
    sales: { icon: CircleDollarSign, title:'Sales Workspace', tabs:['Dashboard','Quotations','Proforma Invoices','Sales Orders','Tax Invoices','Receivables'], rows:[['QTN-1042','Sail Life Sciences','₹24,00,000','12 Sep','Negotiation'],['PI-0081','Matrix Pharma','₹18,40,000','11 Sep','Issued'],['SO-0192','ABC Industries','₹8,20,000','14 Sep','Confirmed'],['INV-0321','Sail Life Sciences','₹12,60,000','08 Sep','Part Paid']] },
    procurement: { icon: ShoppingCart, title:'Procurement Workspace', tabs:['Dashboard','Purchase Requests','RFQs','Vendor Quotes','Purchase Orders','GRN','Purchase Bills','Vendors'], rows:[['PR-220','PB-14','Sprinkler heads','240','Pending'],['PO-1042','PB-14','Pipes & fittings','₹6,80,000','Approval'],['GRN-882','MEP-22','Valves','120','Received'],['PB-401','Vendor ABC','Electrical materials','₹1,24,000','To Verify']] },
    inventory: { icon: Boxes, title:'Inventory Workspace', tabs:['Dashboard','Items','Warehouses','Stock','Receipts','Issues','Transfers','Project Material'], rows:[['SPR-001','ESFR Sprinkler','WH-01','420','Available'],['PIPE-042','MS Pipe 100mm','WH-01','1,280m','Available'],['VAL-012','Butterfly Valve','WH-02','18','Low Stock'],['MAT-88','PB-14 Allocation','WH-01','₹4.8L','Project']] },
    accounts: { icon: Landmark, title:'Accounts Workspace', tabs:['Dashboard','Tax Invoices','Purchase Bills','Receivables','Payables','Payments','Banking','Ledger','GST','E-Invoice','E-Way Bill'], rows:[['INV-0321','Sail Life Sciences','₹12,60,000','₹4,20,000','Part Paid'],['INV-0318','Matrix Pharma','₹8,40,000','₹8,40,000','Paid'],['PB-401','Vendor ABC','₹1,24,000','₹1,24,000','Payable'],['RCPT-220','Customer XYZ','₹2,80,000','₹0','Received']] },
    hr: { icon: Users, title:'HR Workspace', tabs:['Dashboard','Employees','Organization','Attendance','Leave','Payroll','Expenses','Documents','Reports'], rows:[['EMP-001','Rajiv K','Project Manager','Active','12 days'],['EMP-002','Misbha','Design Engineer','Active','10 days'],['EMP-003','Suresh','Site Engineer','Active','18 days'],['EMP-004','Anil','Accounts','Leave','—']] },
  };
  const d=definitions[module] || definitions.crm;
  const [tab,setTab]=useState(d.tabs[0]);
  return <div className="space-y-4"><div className="flex gap-2 overflow-x-auto pb-1">{d.tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`os-tab ${tab===t?'active':''}`}>{t}</button>)}</div><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={d.icon} label="Open Records" value="24" tone="blue"/><StatCard icon={Clock3} label="Pending Action" value="8" tone="amber"/><StatCard icon={CheckCircle2} label="Completed" value="146" tone="emerald"/><StatCard icon={BarChart3} label="This Month" value="₹42L" tone="violet"/></div><SectionCard title={tab} subtitle={`Manage ${tab.toLowerCase()} with consistent business controls.`} icon={d.icon} action={<div className="flex gap-2"><button className="os-icon-btn" title="Filter"><Filter size={14}/></button><button className="os-primary" onClick={()=>onNavigate(module)}><Plus size={14}/> New</button></div>}><MiniTable columns={['Reference','Name / Context','Value / Role','Date / Quantity','Status']} rows={d.rows.map(r=>[<span className="font-black text-sky-600">{r[0]}</span>,r[1],r[2],r[3],<Badge tone={String(r[4]).toLowerCase().includes('pending')||String(r[4]).toLowerCase().includes('approval')?'amber':String(r[4]).toLowerCase().includes('paid')||String(r[4]).toLowerCase().includes('active')||String(r[4]).toLowerCase().includes('received')?'green':'blue'}>{r[4]}</Badge>])}/></SectionCard></div>;
}

function ProjectsPage({ onOpenClassic }) {
  const stages=[['Enquiry',18],['Design',32],['Approval',14],['Execution',24],['Completion',6]];
  return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-5 gap-3"><StatCard icon={FolderKanban} label="Active Projects" value="24" tone="violet"/><StatCard icon={HeartPulse} label="On Track" value="18" tone="emerald"/><StatCard icon={TriangleAlert} label="At Risk" value="4" tone="amber"/><StatCard icon={AlertTriangle} label="Delayed" value="2" tone="rose"/><StatCard icon={CircleDollarSign} label="Open Value" value="₹4.82Cr" tone="blue"/></div><SectionCard title="Project Pipeline" subtitle="Configurable stages with responsibility and workload context" icon={Workflow} action={<button onClick={onOpenClassic} className="os-secondary"><Grid2X2 size={14}/> Open current CRM workspace</button>}><div className="p-4 overflow-x-auto"><div className="min-w-[850px] grid grid-cols-5 gap-3">{stages.map(([s,count],i)=><div key={s} className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-3 min-h-[180px]"><div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{i+1}. {s}</span><Badge tone={i===3?'amber':'blue'}>{count}</Badge></div>{['PB-14','MEP-22','FS-08'].slice(0,i===0?2:3).map((p,j)=><div key={p+j} className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"><div className="flex justify-between"><b className="text-xs">{p}</b><MoreHorizontal size={14} className="text-slate-400"/></div><p className="text-[10px] text-slate-400 mt-1">{['Sail Life Sciences','Matrix Pharma','Industrial Client'][j]}</p><div className="mt-2"><Progress value={[64,81,42][j]}/></div></div>)}</div>)}</div></div></SectionCard><div className="grid xl:grid-cols-[1.4fr_1fr] gap-4"><SectionCard title="Project Register" icon={FolderKanban}><MiniTable columns={['Project','Customer','Stage','Progress','Health','Manager']} rows={[[<b>PB-14</b>,'Sail Life Sciences','Approval','64%',<Badge tone="amber">At Risk</Badge>,'Rajiv'],['MEP-22','Matrix Pharma','Execution','81%',<Badge tone="green">On Track</Badge>,'Anil'],['FS-08','ABC Industries','Design','42%',<Badge tone="green">On Track</Badge>,'Misbha'],['QA-31','Customer XYZ','Enquiry','18%',<Badge tone="blue">New</Badge>,'Suresh']]}/></SectionCard><SectionCard title="Project Command Actions" icon={Zap}><div className="p-4 grid grid-cols-2 gap-2">{['New Project','Manage Stages','Assign Team','Create Task','Log Progress','Project Cost'].map(x=><button className="os-action" key={x}><Plus size={14}/>{x}</button>)}</div></SectionCard></div></div>;
}

function ReportsPage() {
  const groups=[['Executive',['Business Overview','Company Comparison','KPI Dashboard']],['Sales',['Enquiry Report','Quotation Report','Sales Order Report','Invoice Report']],['Projects',['Project Status','Project Cost','Profitability','Stage Performance','Delay Report']],['Procurement',['Purchase','Vendor','PO','Price Comparison']],['Inventory',['Stock','Movement','Project Consumption']],['Accounts',['Receivables','Payables','Ledger','Trial Balance','P&L','Balance Sheet','GST']],['HR',['Headcount','Attendance','Leave','Payroll','Employee Cost','Project Labour Cost']]];
  return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-3"><StatCard icon={BarChart3} label="Reports Available" value="42" tone="blue"/><StatCard icon={FileSpreadsheet} label="Scheduled Reports" value="8" tone="violet"/><StatCard icon={Download} label="Exports This Month" value="126" tone="emerald"/></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{groups.map(([g,items])=><SectionCard key={g} title={g} icon={FileBarChart}><div className="p-3 space-y-1">{items.map(i=><button key={i} className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800"><span className="text-xs font-bold">{i}</span><ChevronRight size={14} className="text-slate-400"/></button>)}</div></SectionCard>)}</div></div>;
}

function DocumentsPage() {
  return <div className="space-y-4"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={FileText} label="All Documents" value="1,284" tone="blue"/><StatCard icon={FolderKanban} label="Project Documents" value="684" tone="violet"/><StatCard icon={FileCheck2} label="Awaiting Review" value="17" tone="amber"/><StatCard icon={History} label="Recent Versions" value="46" tone="emerald"/></div><SectionCard title="Document Library" subtitle="Context-aware files across company, customer, project, stage and employee records" icon={FileText} action={<button className="os-primary"><Upload size={14}/> Upload</button>}><MiniTable columns={['Document','Context','Owner','Version','Access','Updated']} rows={[[<b>PB-14 Design Rev-04.pdf</b>,'PB-14 / Design','Rajiv','v4','Team','2h ago'],['PO-1042.pdf','PB-14 / Procurement','Accounts','v1','Finance','4h ago'],['GST Certificate.pdf','Rajiv Fire Systems','Admin','v2','Management','Yesterday'],['Employee Policy.pdf','HR','Senior HR','v6','HR','Yesterday']]}/></SectionCard></div>;
}

function ApprovalsPage() {
  return <div className="space-y-4"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><StatCard icon={ClipboardCheck} label="Pending" value="12" tone="amber"/><StatCard icon={Clock3} label="Due Today" value="5" tone="rose"/><StatCard icon={CheckCircle2} label="Approved This Month" value="84" tone="emerald"/><StatCard icon={XCircle} label="Rejected / Sent Back" value="6" tone="slate"/></div><SectionCard title="Pending Approval Queue" subtitle="Requests within your authority and assigned scope" icon={ClipboardCheck}><MiniTable columns={['Request','Type','Company / Project','Amount','Requested By','Due','Action']} rows={[[<b>PO-1042</b>,'Purchase Order','PB-14','₹6,80,000','Procurement','Today',<div className="flex gap-1"><button className="os-approve"><Check size={13}/>Approve</button><button className="os-icon-btn"><Eye size={13}/></button></div>],[<b>QTN-1042</b>,'Quotation','Sail Life Sciences','₹24,00,000','Sales','Today',<div className="flex gap-1"><button className="os-approve"><Check size={13}/>Approve</button><button className="os-icon-btn"><Eye size={13}/></button></div>],[<b>PAY-228</b>,'Payment','Vendor ABC','₹2,40,000','Accounts','Tomorrow',<div className="flex gap-1"><button className="os-approve"><Check size={13}/>Approve</button><button className="os-icon-btn"><Eye size={13}/></button></div>]]}/></SectionCard></div>;
}

function NotificationsPage() {
  return <div className="grid xl:grid-cols-[1.5fr_1fr] gap-4"><SectionCard title="Notifications" subtitle="Scoped to your role, company and responsibilities" icon={Bell}><div className="p-4 space-y-2">{[['Critical','Project PB-14 is delayed by 4 days','Management escalation','5 min ago','red'],['Action Required','PO-1042 is awaiting your approval','Procurement','18 min ago','amber'],['Task Assigned','Prepare design revision for PB-14','Design','1h ago','blue'],['Document','New client drawing uploaded','PB-14 / Design','2h ago','violet'],['Information','Stage moved from Design to Approval','PB-14','3h ago','blue']].map(([a,b,c,d,t])=><div key={b} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3"><div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t==='red'?'bg-rose-50 text-rose-600':t==='amber'?'bg-amber-50 text-amber-600':t==='violet'?'bg-violet-50 text-violet-600':'bg-sky-50 text-sky-600'}`}><Bell size={15}/></div><div className="flex-1"><div className="flex justify-between gap-2"><p className="text-xs font-black">{b}</p><span className="text-[9px] text-slate-400">{d}</span></div><p className="text-[10px] text-slate-400 mt-1">{c} · {a}</p></div></div>)}</div></SectionCard><SectionCard title="Notification Rules" subtitle="Future configurable routing" icon={Workflow}><div className="p-4 space-y-2">{['Task assigned → assignees','Stage bottleneck → stage responsible','Project escalation → project lead','Critical executive event → GM / Owner'].map(x=><div key={x} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold">{x}</div>)}</div></SectionCard></div>;
}

function AIPage() {
  return <div className="grid xl:grid-cols-[1.4fr_1fr] gap-4"><SectionCard title="Ask RAJIV AI" subtitle="The future AI layer will respect user permissions and business context." icon={Sparkles}><div className="p-5"><div className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5 p-5"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center"><Sparkles size={20}/></div><div><h3 className="text-sm font-black">Business Intelligence Assistant</h3><p className="text-[10px] text-slate-400">Ask about projects, finance, sales, procurement, HR and documents.</p></div></div><div className="mt-5 flex gap-2 flex-wrap">{['What is the status of PB-14?','Why are projects delayed?','Show overdue receivables','Summarize customer history','Find low-margin projects'].map(x=><button key={x} className="os-chip">{x}</button>)}</div><div className="mt-5 flex gap-2"><input className="os-input flex-1" placeholder="Ask a business question..."/><button className="os-primary"><Sparkles size={14}/> Ask AI</button></div></div></div></SectionCard><SectionCard title="AI-Assisted Workflows" icon={Zap}><div className="p-4 space-y-2">{[['Purchase Bill','Upload invoice → extract → review → post'],['Project Summary','Summarize authorized project history'],['Customer Brief','Combine CRM, sales and finance context'],['Invoice Review','Detect missing fields before posting'],['Management Brief','Summarize company exceptions']].map(([a,b])=><div key={a} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800"><p className="text-xs font-black">{a}</p><p className="text-[10px] text-slate-400 mt-1">{b}</p></div>)}</div></SectionCard></div>;
}

function AdminPage() {
  const cards=[['Organization','Companies, departments, designations',Building2],['Users & Access','Users, roles, company access',UserCog],['Permissions','View, create, edit, approve, assign, export',KeyRound],['Hierarchy','Reporting managers and delegation',Network],['Workflow','Stages, approval rules, numbering',Workflow],['Notifications','Routing and escalation rules',Bell],['Integrations','GST, e-invoice, e-way bill, Tally, SAP',Zap],['Audit Log','Immutable business activity history',History]];
  return <div className="space-y-4"><SectionCard title="Administration" subtitle="Configure the organization without changing the underlying business records." icon={Settings}><div className="p-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3">{cards.map(([a,b,I])=><button key={a} className="text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition"><div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sky-600"><I size={17}/></div><h3 className="text-xs font-black mt-3">{a}</h3><p className="text-[10px] text-slate-400 mt-1 leading-4">{b}</p></button>)}</div></SectionCard><SectionCard title="Authorization Model" subtitle="UI representation of the future access architecture" icon={ShieldCheck}><div className="p-4 grid md:grid-cols-4 gap-3">{[['Visibility','What can I see?'],['Responsibility','What am I responsible for?'],['Authority','What can I approve / assign?'],['Accountability','Who is ultimately responsible?']].map(([a,b],i)=><div key={a} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900"><div className="text-[9px] uppercase font-black text-sky-600">0{i+1}</div><h4 className="text-sm font-black mt-2">{a}</h4><p className="text-[10px] text-slate-400 mt-1">{b}</p></div>)}</div></SectionCard></div>;
}

export default function BusinessOSWorkspace() {
  const crm = useCrm();
  const {
    isDarkMode, setIsDarkMode, onSignOut, operatingCompanies, activeOperatingCompany,
    setActiveOperatingCompanyId, currentUser, tenantRole, userRole, setIsAiChatOpen,
    companies, works, setIsSidebarOpen,
  } = crm;
  const [page, setPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 800 : false);
  const [search, setSearch] = useState('');
  const [previewRole, setPreviewRole] = useState(null);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showClassic, setShowClassic] = useState(false);
  const effectiveRole = previewRole || (tenantRole || 'TEAM').toUpperCase();
  const role = roleMeta[effectiveRole]?.label || effectiveRole;
  const companyName = activeOperatingCompany?.name || 'All Companies';

  const filteredNav = useMemo(() => navSections.map(section => ({ ...section, items: section.items.filter(([id]) => {
    if (effectiveRole === 'VIEWER' && ['admin','accounts','hr'].includes(id)) return false;
    if (['SALES'].includes(effectiveRole) && !['dashboard','my-work','approvals','notifications','crm','sales','documents','reports','ai'].includes(id)) return false;
    if (effectiveRole === 'ACCOUNTANT' && ['hr','inventory','admin'].includes(id)) return false;
    if (effectiveRole === 'HR' && ['sales','procurement','inventory'].includes(id)) return false;
    return true;
  }) })).filter(s=>s.items.length), [effectiveRole]);

  const go = (next) => {
    setPage(next);
    setShowClassic(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 800) {
      setSidebarCollapsed(true);
    }
  };

  if (showClassic) {
    return <div className="h-full w-full"><button onClick={()=>setShowClassic(false)} className="fixed top-3 left-3 z-[100] os-primary shadow-xl"><ArrowDownRight size={14} className="rotate-90"/> Back to Business OS</button><CrmWorkspace /></div>;
  }

  const meta = pageMeta[page] || pageMeta.dashboard;

  return <div className={`business-os ${isDarkMode ? 'dark' : ''}`}>
    {!sidebarCollapsed && <div className="os-sidebar-backdrop" onClick={() => setSidebarCollapsed(true)} />}
    <aside className={`os-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="os-brand"><div className="os-logo"><FlameIcon/></div>{!sidebarCollapsed && <div><div className="flex items-center gap-1"><span className="os-brand-name">RAJIV</span><span className="os-brand-pill">OS</span></div><div className="os-brand-sub">Business Operating System</div></div>}</div>
      <div className="os-sidebar-scroll">
        {filteredNav.map(section=><div className="os-nav-section" key={section.label}>{!sidebarCollapsed && <div className="os-nav-label">{section.label}</div>}{section.items.map(([id,label,Icon])=><button key={id} title={sidebarCollapsed?label:''} onClick={()=>go(id)} className={`os-nav-item ${page===id?'active':''}`}><Icon size={17}/>{!sidebarCollapsed && <span>{label}</span>}{!sidebarCollapsed && id==='notifications' && <span className="os-nav-count">5</span>}</button>)}</div>)}
      </div>
      <div className="os-sidebar-bottom"><button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} className="os-nav-item">{sidebarCollapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>} {!sidebarCollapsed && <span>Collapse</span>}</button></div>
    </aside>

    <main className="os-main">
      <header className="os-topbar">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={()=>setSidebarCollapsed(prev => !prev)} className="os-mobile-menu"><Menu size={18}/></button>
          <div className="relative">
            <button onClick={()=>setShowCompanyMenu(!showCompanyMenu)} className="os-company-switch"><BriefcaseBusiness size={15}/><span className="max-w-[190px] truncate">{companyName}</span><ChevronDown size={13}/></button>
            {showCompanyMenu && <div className="os-popover left-0 top-11 w-72"> <div className="os-popover-label">Operating company context</div><button onClick={()=>{setActiveOperatingCompanyId(null);setShowCompanyMenu(false)}} className="os-company-option"><div><b>ALL COMPANIES</b><small>Consolidated authorized view</small></div>{!activeOperatingCompany && <Check size={14}/>}</button>{operatingCompanies.map(c=><button key={c.id} onClick={()=>{setActiveOperatingCompanyId(c.id);setShowCompanyMenu(false)}} className="os-company-option"><div><b>{c.name}</b><small>Operating company</small></div>{activeOperatingCompany?.id===c.id && <Check size={14}/>}</button>)}</div>}
          </div>
          <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800"/><div className="hidden lg:block text-[10px] text-slate-400 truncate">{meta[0]}</div>
        </div>
        <div className="os-global-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers, projects, PO, invoice, employee..."/><kbd>⌘ K</kbd></div>
        <div className="flex items-center gap-1.5">
          <button onClick={()=>setIsAiChatOpen?.(true)} className="os-top-action ai"><Sparkles size={15}/><span className="hidden xl:inline">AI</span></button>
          <button onClick={()=>go('notifications')} className="os-top-action relative"><Bell size={16}/><span className="os-notification-dot">5</span></button>
          <button onClick={()=>setIsDarkMode(!isDarkMode)} className="os-top-action" title="Toggle theme"><span className="text-[11px]">{isDarkMode?'☀':'◐'}</span></button>
          {effectiveRole==='OWNER' || effectiveRole==='ADMIN' ? <div className="relative hidden md:block"><button onClick={()=>setPreviewRole(!previewRole)} className="os-role-preview"><Eye size={13}/> {previewRole?'Preview: ':''}{role}</button>{previewRole && <div className="os-popover right-0 top-10 w-60"><div className="os-popover-label">UI role preview — mock only</div>{previewRoles.map(([r,l])=><button key={r} onClick={()=>{setPreviewRole(r);setPage(r==='OWNER'||r==='MANAGER'?'dashboard':'my-work')}} className={`os-company-option ${previewRole===r?'selected':''}`}><div><b>{l}</b><small>{r}</small></div>{previewRole===r&&<Check size={13}/>}</button>)}<button onClick={()=>setPreviewRole(null)} className="w-full mt-2 text-xs font-bold text-sky-600">Return to actual role</button></div>}</div>:null}
          <div className="relative"><button onClick={()=>setShowProfile(!showProfile)} className="os-user"><div className="os-avatar">{(currentUser?.email || 'R').charAt(0).toUpperCase()}</div><div className="hidden xl:block text-left"><b>{currentUser?.email?.split('@')[0] || 'User'}</b><small>{role}</small></div><ChevronDown size={13}/></button>{showProfile&&<div className="os-popover right-0 top-11 w-64"><div className="p-3 border-b border-slate-100 dark:border-slate-800"><p className="text-xs font-black">{currentUser?.email || 'User'}</p><p className="text-[10px] text-slate-400 mt-1">{role} · {companyName}</p></div><button className="os-company-option"><UserRound size={15}/><b>My Profile</b></button><button onClick={()=>go('admin')} className="os-company-option"><Settings size={15}/><b>Settings</b></button><button onClick={onSignOut} className="os-company-option text-rose-600"><LogOut size={15}/><b>Sign out</b></button></div>}</div>
        </div>
      </header>

      <div className="os-content custom-scrollbar">
        <div className="os-page-head"><div><div className="os-breadcrumb">RAJIV BUSINESS OS <ChevronRight size={11}/> {meta[0]}</div><h1>{meta[0]}</h1><p>{meta[1]}</p></div><div className="flex gap-2"><button className="os-secondary"><CalendarDays size={14}/> Today</button><button className="os-primary"><Plus size={14}/> Create</button></div></div>
        {page==='dashboard' && <Dashboard role={effectiveRole} onNavigate={go} companyName={companyName} companies={operatingCompanies || []}/>} 
        {page==='my-work' && <MyWorkPage onNavigate={go}/>} 
        {page==='approvals' && <ApprovalsPage/>}
        {page==='notifications' && <NotificationsPage/>}
        {['crm','sales','procurement','inventory','accounts','hr'].includes(page) && <DataModulePage module={page} onNavigate={go}/>} 
        {page==='projects' && <ProjectsPage onOpenClassic={()=>setShowClassic(true)}/>} 
        {page==='documents' && <DocumentsPage/>}
        {page==='reports' && <ReportsPage/>}
        {page==='ai' && <AIPage/>}
        {page==='admin' && <AdminPage/>}
      </div>
      <button className="os-ai-fab" onClick={()=>setIsAiChatOpen?.(true)}><Sparkles size={17}/><span>RAJIV AI</span></button>
    </main>
  </div>;
}

function FlameIcon(){return <span className="text-white font-black text-xs">R</span>}
