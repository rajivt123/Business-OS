import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import ObjectPageLayout from '../../components/bos/ObjectPageLayout';
import {
  FolderKanban, Building2, User, Calendar, CheckSquare,
  Users, DollarSign, FileText, Clock, ChevronRight, AlertCircle,
  Plus, Edit, ArrowRight
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'team', label: 'Team' },
  { id: 'financials', label: 'Financials' },
  { id: 'documents', label: 'Documents' },
  { id: 'activity', label: 'Activity' },
];

export default function Project360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    works = [], companies = [], tasks = [], stageDefinitions = [],
    profiles = [], tenantMembers = [],
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview');

  // Find target project (default to first active if no ID)
  const targetId = id || (works.length > 0 ? works[0].id : null);
  const project = useMemo(() => works.find(w => w.id === targetId), [works, targetId]);

  // Related customer
  const customer = useMemo(() => {
    if (!project?.company_id) return null;
    return companies.find(c => c.id === project.company_id);
  }, [project, companies]);

  // Stage info
  const stage = useMemo(() => {
    if (!project?.current_stage_id) return null;
    return stageDefinitions.find(s => s.id === project.current_stage_id);
  }, [project, stageDefinitions]);

  // Related tasks
  const projectTasks = useMemo(() => {
    if (!project?.id) return [];
    return tasks.filter(t => t.work_id === project.id);
  }, [project, tasks]);

  if (!project) {
    return (
      <div className="bos-empty" style={{ paddingTop: 80 }}>
        <FolderKanban size={36} className="bos-empty-icon" />
        <p className="bos-empty-text">No project selected or found.</p>
        <button
          className="bos-btn bos-btn-secondary bos-btn-sm"
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: 12 }}
        >
          Back to Command Center
        </button>
      </div>
    );
  }

  const statusVariant =
    project.status === 'completed' ? 'success' :
    project.status === 'on-hold' ? 'warning' :
    project.status === 'cancelled' ? 'neutral' : 'accent';

  return (
    <ObjectPageLayout
      title={project.title || project.name || 'Untitled Project'}
      status={{
        label: stage?.name || project.status || 'Active',
        variant: statusVariant
      }}
      metadata={[
        customer ? {
          label: 'Customer',
          value: customer.company_name,
          icon: Building2,
          onClick: () => navigate(`/crm/customers/${customer.id}`)
        } : null,
        project.lead_name ? { label: 'Lead', value: project.lead_name, icon: User } : null,
        project.start_date ? {
          label: 'Start',
          value: new Date(project.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          icon: Calendar
        } : null,
        project.target_completion_date ? {
          label: 'Target Due',
          value: new Date(project.target_completion_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          icon: Calendar
        } : null,
      ].filter(Boolean)}
      actions={[
        { label: 'New Task', icon: Plus, variant: 'primary', onClick: () => {} },
        { label: 'Edit Project', icon: Edit, variant: 'secondary', onClick: () => {} },
      ]}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && (
        <OverviewTab
          project={project}
          customer={customer}
          stage={stage}
          tasks={projectTasks}
          stages={stageDefinitions}
          navigate={navigate}
        />
      )}
      {activeTab === 'tasks' && <TasksTab tasks={projectTasks} />}
      {activeTab === 'team' && <TeamTab project={project} profiles={profiles} />}
      {activeTab === 'financials' && <FinancialsTab project={project} />}
      {activeTab === 'documents' && <PlaceholderTab icon={FileText} text="Project documents and drawings will appear here." />}
      {activeTab === 'activity' && <PlaceholderTab icon={Clock} text="Project audit and event activity stream." />}
    </ObjectPageLayout>
  );
}

/* ── Overview Tab ── */
function OverviewTab({ project, customer, stage, tasks, stages, navigate }) {
  const openTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="bos-360-overview">
      <style>{`
        .bos-360-overview {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: var(--bos-space-5);
        }
        @media (max-width: 840px) {
          .bos-360-overview { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-5)' }}>
        {/* Project Pipeline Stages */}
        {stages && stages.length > 0 && (
          <section className="bos-section">
            <div className="bos-section-header">
              <h3 className="bos-section-title">Pipeline Stage</h3>
              {stage && (
                <span className="bos-badge bos-badge-accent" style={{ fontSize: 11 }}>
                  {stage.name}
                </span>
              )}
            </div>
            <div className="bos-section-body">
              <div style={{
                display: 'flex',
                gap: 'var(--bos-space-2)',
                overflowX: 'auto',
                paddingBottom: 4
              }}>
                {stages.map((s, idx) => {
                  const isCurrent = s.id === project.current_stage_id;
                  return (
                    <div
                      key={s.id || idx}
                      style={{
                        flex: '1 0 100px',
                        padding: 'var(--bos-space-2) var(--bos-space-3)',
                        borderRadius: 'var(--bos-radius-md)',
                        border: `1px solid ${isCurrent ? 'var(--bos-accent)' : 'var(--bos-border-subtle)'}`,
                        background: isCurrent ? 'var(--bos-accent-muted)' : 'var(--bos-surface-subtle)',
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: isCurrent ? 600 : 400,
                        color: isCurrent ? 'var(--bos-accent)' : 'var(--bos-text-secondary)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {s.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Scope & Description */}
        <section className="bos-section">
          <div className="bos-section-header">
            <h3 className="bos-section-title">Scope & Specifications</h3>
          </div>
          <div className="bos-section-body">
            <p style={{
              fontSize: 13,
              color: project.description ? 'var(--bos-text-primary)' : 'var(--bos-text-tertiary)',
              lineHeight: 1.6
            }}>
              {project.description || project.scope || 'No project description or scope notes provided yet.'}
            </p>
          </div>
        </section>

        {/* Open Tasks */}
        <section className="bos-section">
          <div className="bos-section-header">
            <h3 className="bos-section-title">Deliverables & Tasks</h3>
            <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>
              {openTasks.length} open / {tasks.length} total
            </span>
          </div>
          <div className="bos-section-body-flush">
            {tasks.length === 0 ? (
              <div className="bos-empty">
                <CheckSquare size={24} className="bos-empty-icon" />
                <p className="bos-empty-text">No tasks created for this project.</p>
              </div>
            ) : (
              tasks.slice(0, 5).map((t, idx) => (
                <div
                  key={t.id || idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--bos-space-3)',
                    padding: 'var(--bos-space-3) var(--bos-space-4)',
                    borderBottom: idx < Math.min(tasks.length, 5) - 1 ? '1px solid var(--bos-border-subtle)' : 'none',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: t.status === 'done' ? 'var(--bos-success)' :
                      (t.priority === 'urgent' || t.priority === 'high' ? 'var(--bos-error)' : 'var(--bos-accent)')
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: t.status === 'done' ? 'var(--bos-text-tertiary)' : 'var(--bos-text-primary)',
                      textDecoration: t.status === 'done' ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {t.title || t.description}
                    </div>
                  </div>
                  {t.priority && (
                    <span className={`bos-badge bos-badge-${t.priority === 'urgent' ? 'error' : t.priority === 'high' ? 'warning' : 'neutral'}`} style={{ fontSize: 11 }}>
                      {t.priority}
                    </span>
                  )}
                  {t.due_date && (
                    <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>
                      {new Date(t.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-5)' }}>
        {/* Progress & Health */}
        <section className="bos-section">
          <div className="bos-section-header">
            <h3 className="bos-section-title">Execution Health</h3>
          </div>
          <div className="bos-section-body">
            <div style={{ marginBottom: 'var(--bos-space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--bos-text-secondary)' }}>Task Completion</span>
                <span style={{ fontWeight: 600, color: 'var(--bos-text-primary)' }}>{progressPercent}%</span>
              </div>
              <div style={{
                height: 6,
                borderRadius: 'var(--bos-radius-full)',
                background: 'var(--bos-surface-inset)',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'var(--bos-accent)',
                  borderRadius: 'var(--bos-radius-full)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div className="bos-kv-list">
              <span className="bos-kv-label">Status</span>
              <span className="bos-kv-value" style={{ textTransform: 'capitalize' }}>{project.status || 'In Progress'}</span>
              <span className="bos-kv-label">Customer</span>
              <span className="bos-kv-value">
                {customer ? (
                  <button
                    onClick={() => navigate(`/crm/customers/${customer.id}`)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: 'var(--bos-accent)', fontWeight: 500, cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    {customer.company_name}
                  </button>
                ) : 'Unassigned'}
              </span>
              {project.estimated_budget != null && (
                <>
                  <span className="bos-kv-label">Budget</span>
                  <span className="bos-kv-value">₹{Number(project.estimated_budget).toLocaleString('en-IN')}</span>
                </>
              )}
              {project.contract_value != null && (
                <>
                  <span className="bos-kv-label">Contract Value</span>
                  <span className="bos-kv-value">₹{Number(project.contract_value).toLocaleString('en-IN')}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Quick Contacts */}
        {customer && (
          <section className="bos-section">
            <div className="bos-section-header">
              <h3 className="bos-section-title">Client Account</h3>
            </div>
            <div className="bos-section-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-3)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--bos-radius-md)',
                  background: 'var(--bos-accent-muted)', color: 'var(--bos-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14
                }}>
                  {customer.company_name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bos-text-primary)' }}>
                    {customer.company_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>
                    {customer.city || customer.state || 'India'}
                  </div>
                </div>
                <button
                  className="bos-btn bos-btn-ghost bos-btn-sm"
                  onClick={() => navigate(`/crm/customers/${customer.id}`)}
                  style={{ fontSize: 12 }}
                >
                  View 360
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ── Tasks Tab ── */
function TasksTab({ tasks }) {
  return (
    <section className="bos-section">
      <div className="bos-section-header">
        <h3 className="bos-section-title">Project Tasks ({tasks.length})</h3>
      </div>
      <div className="bos-table-container">
        {tasks.length === 0 ? (
          <div className="bos-empty">
            <CheckSquare size={28} className="bos-empty-icon" />
            <p className="bos-empty-text">No tasks logged.</p>
          </div>
        ) : (
          <table className="bos-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <span className={`bos-badge bos-badge-${t.status === 'done' ? 'success' : 'neutral'}`} style={{ fontSize: 11 }}>
                      {t.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--bos-text-primary)' }}>
                    {t.title || t.description}
                  </td>
                  <td>
                    <span className={`bos-badge bos-badge-${t.priority === 'urgent' ? 'error' : t.priority === 'high' ? 'warning' : 'neutral'}`} style={{ fontSize: 11 }}>
                      {t.priority || 'normal'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--bos-text-tertiary)' }}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

/* ── Team Tab ── */
function TeamTab({ project, profiles }) {
  return (
    <section className="bos-section">
      <div className="bos-section-header">
        <h3 className="bos-section-title">Project Team</h3>
      </div>
      <div className="bos-section-body">
        <p style={{ fontSize: 13, color: 'var(--bos-text-secondary)', marginBottom: 'var(--bos-space-4)' }}>
          Assigned resources and leads for {project.title || 'this project'}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--bos-space-4)' }}>
          {project.lead_name && (
            <div style={{
              padding: 'var(--bos-space-4)',
              borderRadius: 'var(--bos-radius-md)',
              border: '1px solid var(--bos-border-subtle)',
              background: 'var(--bos-surface-subtle)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--bos-accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                Project Lead
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--bos-text-primary)' }}>
                {project.lead_name}
              </div>
            </div>
          )}
          {profiles.slice(0, 3).map(p => (
            <div
              key={p.id}
              style={{
                padding: 'var(--bos-space-4)',
                borderRadius: 'var(--bos-radius-md)',
                border: '1px solid var(--bos-border-subtle)',
                background: 'var(--bos-surface-card)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--bos-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>
                {p.role || 'Member'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bos-text-primary)' }}>
                {p.full_name || p.email || 'Team Member'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Financials Tab ── */
function FinancialsTab({ project }) {
  return (
    <section className="bos-section">
      <div className="bos-section-header">
        <h3 className="bos-section-title">Commercial & Billing Overview</h3>
      </div>
      <div className="bos-section-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--bos-space-4)', marginBottom: 'var(--bos-space-5)' }}>
          <div style={{ padding: 'var(--bos-space-4)', borderRadius: 'var(--bos-radius-md)', background: 'var(--bos-surface-subtle)', border: '1px solid var(--bos-border-subtle)' }}>
            <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>Estimated Budget</span>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bos-text-primary)', marginTop: 4 }}>
              {project.estimated_budget ? `₹${Number(project.estimated_budget).toLocaleString('en-IN')}` : '—'}
            </div>
          </div>
          <div style={{ padding: 'var(--bos-space-4)', borderRadius: 'var(--bos-radius-md)', background: 'var(--bos-surface-subtle)', border: '1px solid var(--bos-border-subtle)' }}>
            <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>Contract Value</span>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bos-accent)', marginTop: 4 }}>
              {project.contract_value ? `₹${Number(project.contract_value).toLocaleString('en-IN')}` : '—'}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--bos-text-secondary)' }}>
          Linked sales orders, milestone billings, and vendor purchase orders will aggregate here.
        </p>
      </div>
    </section>
  );
}

function PlaceholderTab({ icon: Icon, text }) {
  return (
    <div className="bos-empty" style={{ padding: 'var(--bos-space-12) 0' }}>
      <Icon size={28} className="bos-empty-icon" />
      <p className="bos-empty-text">{text}</p>
    </div>
  );
}
