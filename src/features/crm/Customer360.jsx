import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import ObjectPageLayout from '../../components/bos/ObjectPageLayout';
import {
  Edit, MoreHorizontal, User, Building2, Phone, Mail,
  MapPin, CreditCard, FileText, Clock, FolderKanban,
  ChevronRight, Users, ShoppingBag, CheckSquare, MessageSquare, Inbox
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'projects', label: 'Projects' },
  { id: 'sales', label: 'Sales' },
  { id: 'documents', label: 'Documents' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'activity', label: 'Activity' },
];

export default function Customer360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    companies = [], units = [], works = [], tasks = [],
    reminders = [], stageDefinitions = [], notifications = [],
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview');

  // Find the company (fallback to first available if no ID given)
  const targetId = id || (companies.length > 0 ? companies[0].id : null);
  const company = useMemo(() => companies.find(c => c.id === targetId), [companies, targetId]);

  // Related data
  const contacts = useMemo(() => units.filter(u => u.company_id === targetId), [units, targetId]);
  const projects = useMemo(() =>
    works.filter(w => w.company_id === targetId).map(w => ({
      ...w,
      stageName: stageDefinitions.find(s => s.id === w.current_stage_id)?.name
    })),
    [works, targetId, stageDefinitions]
  );
  const projectIds = useMemo(() => new Set(projects.map(p => p.id)), [projects]);
  const relatedTasks = useMemo(() =>
    tasks.filter(t => projectIds.has(t.work_id)),
    [tasks, projectIds]
  );

  if (!company) {
    return (
      <div className="bos-empty" style={{ paddingTop: 80 }}>
        <Building2 size={32} className="bos-empty-icon" />
        <p className="bos-empty-text">Customer not found.</p>
        <button className="bos-btn bos-btn-secondary bos-btn-sm" onClick={() => navigate('/crm')}
          style={{ marginTop: 12 }}>
          Back to CRM
        </button>
      </div>
    );
  }

  const statusVariant = company.status === 'active' ? 'success' : company.status === 'inactive' ? 'neutral' : 'accent';

  return (
    <ObjectPageLayout
      title={company.company_name}
      status={{ label: company.status || 'Active', variant: statusVariant }}
      metadata={[
        company.owner_name ? { label: 'Owner', value: company.owner_name, icon: User } : null,
        company.industry ? { label: 'Industry', value: company.industry } : null,
        company.city ? { value: company.city, icon: MapPin } : null,
      ].filter(Boolean)}
      actions={[
        { label: 'Edit', icon: Edit, variant: 'secondary', onClick: () => navigate('/crm') },
      ]}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && <OverviewTab company={company} contacts={contacts} projects={projects} relatedTasks={relatedTasks} navigate={navigate} />}
      {activeTab === 'contacts' && <ContactsTab contacts={contacts} />}
      {activeTab === 'projects' && <ProjectsTab projects={projects} navigate={navigate} />}
      {activeTab === 'sales' && <PlaceholderTab icon={ShoppingBag} text="Sales data for this customer will appear here." />}
      {activeTab === 'documents' && <PlaceholderTab icon={FileText} text="Documents linked to this customer will appear here." />}
      {activeTab === 'tasks' && <TasksTab tasks={relatedTasks} navigate={navigate} />}
      {activeTab === 'activity' && <PlaceholderTab icon={Clock} text="Activity timeline for this customer will appear here." />}
    </ObjectPageLayout>
  );
}

/* ── Overview Tab ── */
function OverviewTab({ company, contacts, projects, relatedTasks, navigate }) {
  return (
    <div className="bos-360-overview">
      <style>{`
        .bos-360-overview {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: var(--bos-space-5);
        }
        @media (max-width: 767px) {
          .bos-360-overview { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-5)' }}>
        {/* Key Information */}
        <section className="bos-section">
          <div className="bos-section-header">
            <h3 className="bos-section-title">Key Information</h3>
          </div>
          <div className="bos-section-body">
            <div className="bos-kv-list">
              {company.gstin && <><span className="bos-kv-label">GSTIN</span><span className="bos-kv-value">{company.gstin}</span></>}
              {company.pan && <><span className="bos-kv-label">PAN</span><span className="bos-kv-value">{company.pan}</span></>}
              {(company.address || company.city) && (
                <>
                  <span className="bos-kv-label">Address</span>
                  <span className="bos-kv-value">{[company.address, company.city, company.state, company.pincode].filter(Boolean).join(', ')}</span>
                </>
              )}
              {company.phone && <><span className="bos-kv-label">Phone</span><span className="bos-kv-value">{company.phone}</span></>}
              {company.email && <><span className="bos-kv-label">Email</span><span className="bos-kv-value">{company.email}</span></>}
              {company.payment_terms && <><span className="bos-kv-label">Payment Terms</span><span className="bos-kv-value">{company.payment_terms}</span></>}
              {company.credit_limit != null && (
                <><span className="bos-kv-label">Credit Limit</span><span className="bos-kv-value">₹{Number(company.credit_limit).toLocaleString('en-IN')}</span></>
              )}
              {company.category && <><span className="bos-kv-label">Category</span><span className="bos-kv-value">{company.category}</span></>}
            </div>
          </div>
        </section>

        {/* Contacts Summary */}
        <section className="bos-section">
          <div className="bos-section-header">
            <h3 className="bos-section-title">Contacts</h3>
            <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>{contacts.length}</span>
          </div>
          <div className="bos-section-body-flush">
            {contacts.length === 0 ? (
              <div className="bos-empty">
                <Users size={24} className="bos-empty-icon" />
                <p className="bos-empty-text">No contacts added yet.</p>
              </div>
            ) : (
              contacts.slice(0, 4).map((c, i) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--bos-space-3)',
                  padding: 'var(--bos-space-3) var(--bos-space-4)',
                  borderBottom: i < Math.min(contacts.length, 4) - 1 ? '1px solid var(--bos-border-subtle)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--bos-accent-muted)', color: 'var(--bos-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {(c.name || c.unit_name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bos-text-primary)' }}>
                      {c.name || c.unit_name || 'Unnamed'}
                    </div>
                    {c.designation && (
                      <div style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>{c.designation}</div>
                    )}
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} style={{ color: 'var(--bos-text-tertiary)' }} aria-label={`Call ${c.name}`}>
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-5)' }}>
        {/* Active Projects */}
        <section className="bos-section">
          <div className="bos-section-header">
            <h3 className="bos-section-title">Active Projects</h3>
            <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>{projects.length}</span>
          </div>
          <div className="bos-section-body-flush">
            {projects.length === 0 ? (
              <div className="bos-empty">
                <FolderKanban size={24} className="bos-empty-icon" />
                <p className="bos-empty-text">No projects linked to this customer.</p>
              </div>
            ) : (
              projects.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    padding: 'var(--bos-space-3) var(--bos-space-4)',
                    borderBottom: i < Math.min(projects.length, 4) - 1 ? '1px solid var(--bos-border-subtle)' : 'none',
                    cursor: 'pointer', transition: 'background 0.12s',
                  }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bos-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--bos-text-primary)' }}>{p.title}</span>
                    <ChevronRight size={14} style={{ color: 'var(--bos-text-disabled)' }} />
                  </div>
                  {p.stageName && (
                    <span className="bos-badge bos-badge-accent" style={{ fontSize: 11, marginTop: 4 }}>
                      {p.stageName}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tasks Summary */}
        <section className="bos-section">
          <div className="bos-section-header">
            <h3 className="bos-section-title">Open Tasks</h3>
            <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>
              {relatedTasks.filter(t => t.status !== 'done').length}
            </span>
          </div>
          <div className="bos-section-body-flush">
            {relatedTasks.filter(t => t.status !== 'done').length === 0 ? (
              <div className="bos-empty">
                <CheckSquare size={24} className="bos-empty-icon" />
                <p className="bos-empty-text">No open tasks.</p>
              </div>
            ) : (
              relatedTasks.filter(t => t.status !== 'done').slice(0, 4).map((t, i, arr) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--bos-space-3)',
                  padding: 'var(--bos-space-3) var(--bos-space-4)',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--bos-border-subtle)' : 'none',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: t.priority === 'high' || t.priority === 'urgent' ? 'var(--bos-error)' : 'var(--bos-accent)',
                  }} />
                  <span style={{
                    fontSize: 13, color: 'var(--bos-text-primary)', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {t.title || t.description || 'Untitled'}
                  </span>
                  {t.due_date && (
                    <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)', whiteSpace: 'nowrap' }}>
                      {new Date(t.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Contacts Tab ── */
function ContactsTab({ contacts }) {
  if (contacts.length === 0) {
    return <EmptyTab icon={Users} text="No contacts for this customer." />;
  }
  return (
    <div className="bos-section" style={{ overflow: 'auto' }}>
      <table className="bos-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Designation</th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(c => (
            <tr key={c.id}>
              <td style={{ fontWeight: 500 }}>{c.name || c.unit_name || '—'}</td>
              <td>{c.designation || '—'}</td>
              <td>{c.phone || '—'}</td>
              <td>{c.email || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Projects Tab ── */
function ProjectsTab({ projects, navigate }) {
  if (projects.length === 0) {
    return <EmptyTab icon={FolderKanban} text="No projects linked to this customer." />;
  }
  return (
    <div className="bos-section" style={{ overflow: 'auto' }}>
      <table className="bos-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Stage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr
              key={p.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <td style={{ fontWeight: 500, color: 'var(--bos-text-link)' }}>{p.title}</td>
              <td>{p.stageName ? <span className="bos-badge bos-badge-accent">{p.stageName}</span> : '—'}</td>
              <td>{p.status || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Tasks Tab ── */
function TasksTab({ tasks, navigate }) {
  if (tasks.length === 0) {
    return <EmptyTab icon={CheckSquare} text="No tasks linked to this customer's projects." />;
  }
  return (
    <div className="bos-section" style={{ overflow: 'auto' }}>
      <table className="bos-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td style={{ fontWeight: 500 }}>{t.title || t.description || '—'}</td>
              <td>
                <span className={`bos-badge bos-badge-${t.status === 'done' ? 'success' : 'neutral'}`}>
                  {t.status || '—'}
                </span>
              </td>
              <td>
                <span className={`bos-badge bos-badge-${t.priority === 'high' || t.priority === 'urgent' ? 'error' : 'neutral'}`}>
                  {t.priority || '—'}
                </span>
              </td>
              <td>{t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Placeholder Tab ── */
function PlaceholderTab({ icon: Icon, text }) {
  return <EmptyTab icon={Icon} text={text} />;
}

function EmptyTab({ icon: Icon, text }) {
  return (
    <div className="bos-empty" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <Icon size={28} className="bos-empty-icon" />
      <p className="bos-empty-text">{text}</p>
    </div>
  );
}
