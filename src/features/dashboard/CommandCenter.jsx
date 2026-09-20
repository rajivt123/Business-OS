import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  AlertCircle, CheckCircle2, Clock, ArrowRight, FolderKanban,
  CalendarCheck, MessageSquare, FileText, ChevronRight, Inbox, Activity
} from 'lucide-react';

export default function CommandCenter() {
  const navigate = useNavigate();
  const {
    currentUser, tasks = [], reminders = [], works = [],
    notifications = [], companies = [], stageDefinitions = [],
  } = useCrm();

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser?.full_name?.split(' ')[0] || 'there';

  // Priority work — tasks that need attention
  const priorityWork = useMemo(() => {
    const items = [];

    // Overdue or upcoming tasks
    tasks.forEach(t => {
      if (t.status === 'done') return;
      const due = t.due_date ? new Date(t.due_date) : null;
      const isOverdue = due && due < now;
      const isDueSoon = due && due < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      if (isOverdue || isDueSoon || t.priority === 'high' || t.priority === 'urgent') {
        items.push({
          id: t.id,
          title: t.title || t.description || 'Untitled task',
          type: 'task',
          priority: t.priority || 'normal',
          isOverdue,
          dueDate: due,
          status: t.status,
          projectId: t.work_id,
        });
      }
    });

    // Active reminders
    reminders.forEach(r => {
      if (r.is_completed) return;
      const rDate = r.reminder_date ? new Date(r.reminder_date) : null;
      if (rDate && rDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        items.push({
          id: r.id,
          title: r.note || r.title || 'Reminder',
          type: 'reminder',
          priority: 'normal',
          isOverdue: rDate < now,
          dueDate: rDate,
        });
      }
    });

    // Sort: overdue first, then by priority, then by due date
    return items.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const pa = priorityOrder[a.priority] ?? 2;
      const pb = priorityOrder[b.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      return 0;
    }).slice(0, 8);
  }, [tasks, reminders, now]);

  // Active projects
  const activeProjects = useMemo(() => {
    return works
      .filter(w => w.status !== 'completed' && w.status !== 'cancelled')
      .slice(0, 5)
      .map(w => {
        const stage = stageDefinitions.find(s => s.id === w.current_stage_id);
        const company = companies.find(c => c.id === w.company_id);
        return { ...w, stageName: stage?.name, companyName: company?.company_name };
      });
  }, [works, stageDefinitions, companies]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return notifications.slice(0, 6).map(n => ({
      id: n.id,
      text: n.title || n.message || 'Activity',
      detail: n.body || n.message || '',
      time: n.created_at ? formatRelativeTime(n.created_at) : '',
      type: n.type || 'info',
    }));
  }, [notifications]);

  const priorityColor = (p) => {
    switch (p) {
      case 'urgent': return 'var(--bos-error)';
      case 'high': return 'var(--bos-warning)';
      case 'normal': return 'var(--bos-accent)';
      default: return 'var(--bos-text-tertiary)';
    }
  };

  return (
    <div className="bos-density-executive" style={{ padding: 'var(--bos-space-6)', maxWidth: 1200, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 'var(--bos-space-8)' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: 'var(--bos-text-primary)',
          lineHeight: 1.2, marginBottom: 'var(--bos-space-1)'
        }}>
          {greeting}, {firstName}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--bos-text-secondary)' }}>
          {formatDate(now)} — Here's what needs your attention.
        </p>
      </div>

      {/* Main Grid */}
      <div className="bos-dashboard-grid">
        <style>{`
          .bos-dashboard-grid {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
            gap: var(--bos-space-6);
          }
          @media (max-width: 860px) {
            .bos-dashboard-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-6)' }}>
          {/* Priority Work */}
          <section className="bos-section">
            <div className="bos-section-header">
              <h2 className="bos-section-title">Priority Work</h2>
              <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)' }}>
                {priorityWork.length} items
              </span>
            </div>
            <div className="bos-section-body-flush">
              {priorityWork.length === 0 ? (
                <div className="bos-empty">
                  <CheckCircle2 size={28} className="bos-empty-icon" />
                  <p className="bos-empty-text">All caught up. No urgent items.</p>
                </div>
              ) : (
                <div>
                  {priorityWork.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--bos-space-3)',
                        padding: 'var(--bos-space-3) var(--bos-space-4)',
                        borderBottom: idx < priorityWork.length - 1 ? '1px solid var(--bos-border-subtle)' : 'none',
                        cursor: 'pointer', transition: 'background 0.12s',
                      }}
                      onClick={() => {
                        if (item.projectId) navigate(`/projects/${item.projectId}`);
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bos-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Priority dot */}
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: priorityColor(item.priority),
                      }} />
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 500, color: 'var(--bos-text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {item.title}
                        </div>
                      </div>
                      {/* Badge */}
                      {item.isOverdue && (
                        <span className="bos-badge bos-badge-error" style={{ fontSize: 11 }}>Overdue</span>
                      )}
                      {item.type === 'reminder' && (
                        <span className="bos-badge bos-badge-warning" style={{ fontSize: 11 }}>Reminder</span>
                      )}
                      {/* Due date */}
                      {item.dueDate && !item.isOverdue && (
                        <span style={{ fontSize: 12, color: 'var(--bos-text-tertiary)', whiteSpace: 'nowrap' }}>
                          {formatShortDate(item.dueDate)}
                        </span>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--bos-text-disabled)', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Activity Stream */}
          <section className="bos-section">
            <div className="bos-section-header">
              <h2 className="bos-section-title">Recent Activity</h2>
            </div>
            <div className="bos-section-body-flush">
              {recentActivity.length === 0 ? (
                <div className="bos-empty">
                  <Activity size={28} className="bos-empty-icon" />
                  <p className="bos-empty-text">No recent activity to display.</p>
                </div>
              ) : (
                <div>
                  {recentActivity.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex', gap: 'var(--bos-space-3)',
                        padding: 'var(--bos-space-3) var(--bos-space-4)',
                        borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--bos-border-subtle)' : 'none',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--bos-surface-inset)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--bos-text-tertiary)',
                      }}>
                        <MessageSquare size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, color: 'var(--bos-text-primary)', lineHeight: 1.5,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {item.text}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--bos-text-tertiary)', marginTop: 1 }}>
                          {item.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-6)' }}>
          {/* Active Projects */}
          <section className="bos-section">
            <div className="bos-section-header">
              <h2 className="bos-section-title">Active Projects</h2>
              <button
                className="bos-btn bos-btn-ghost bos-btn-sm"
                onClick={() => navigate('/projects')}
                style={{ fontSize: 12 }}
              >
                View all
              </button>
            </div>
            <div className="bos-section-body-flush">
              {activeProjects.length === 0 ? (
                <div className="bos-empty">
                  <FolderKanban size={28} className="bos-empty-icon" />
                  <p className="bos-empty-text">No active projects.</p>
                </div>
              ) : (
                <div>
                  {activeProjects.map((p, idx) => (
                    <div
                      key={p.id}
                      style={{
                        padding: 'var(--bos-space-3) var(--bos-space-4)',
                        borderBottom: idx < activeProjects.length - 1 ? '1px solid var(--bos-border-subtle)' : 'none',
                        cursor: 'pointer', transition: 'background 0.12s',
                      }}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bos-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: 'var(--bos-text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        marginBottom: 4,
                      }}>
                        {p.title}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)',
                        fontSize: 12, color: 'var(--bos-text-tertiary)',
                      }}>
                        {p.companyName && <span>{p.companyName}</span>}
                        {p.stageName && (
                          <>
                            <span>·</span>
                            <span className="bos-badge bos-badge-accent" style={{ fontSize: 11 }}>
                              {p.stageName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Quick Stats (only if real data exists) */}
          <section className="bos-section">
            <div className="bos-section-header">
              <h2 className="bos-section-title">Overview</h2>
            </div>
            <div className="bos-section-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-4)' }}>
                <QuickStat label="Active Customers" value={companies.filter(c => c.status !== 'inactive').length} />
                <QuickStat label="Open Projects" value={works.filter(w => w.status !== 'completed' && w.status !== 'cancelled').length} />
                <QuickStat label="Pending Tasks" value={tasks.filter(t => t.status !== 'done').length} />
                <QuickStat label="Active Reminders" value={reminders.filter(r => !r.is_completed).length} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--bos-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--bos-text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

// Utility functions
function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatShortDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}
