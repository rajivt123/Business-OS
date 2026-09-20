/**
 * ObjectPageLayout — Reusable layout for 360-degree object pages.
 * Used by Customer 360, Project 360, Employee 360.
 *
 * Props:
 *   title        — Object name (string)
 *   status       — { label, variant } where variant is 'success'|'warning'|'error'|'neutral'|'accent'
 *   metadata     — [{ label, value, icon? }]
 *   actions      — [{ label, onClick, variant?, icon? }]
 *   tabs         — [{ id, label }]
 *   activeTab    — Current tab id
 *   onTabChange  — (tabId) => void
 *   children     — Tab content
 */
export default function ObjectPageLayout({
  title, status, metadata = [], actions = [],
  tabs = [], activeTab, onTabChange, children
}) {
  return (
    <div style={{ minHeight: '100%' }}>
      {/* Object Header */}
      <div className="bos-object-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-3)', flexWrap: 'wrap' }}>
            <h1 className="bos-object-title">{title}</h1>
            {status && (
              <span className={`bos-badge bos-badge-${status.variant || 'neutral'}`}>
                {status.label}
              </span>
            )}
          </div>
          {metadata.length > 0 && (
            <div className="bos-object-meta" style={{ marginTop: 'var(--bos-space-2)' }}>
              {metadata.map((m, i) => (
                <div key={i} className="bos-object-meta-item">
                  {m.icon && <m.icon size={14} style={{ color: 'var(--bos-text-tertiary)' }} />}
                  {m.label && <span className="bos-object-meta-label">{m.label}:</span>}
                  <span>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions.length > 0 && (
          <div className="bos-object-actions">
            {actions.map((a, i) => (
              <button
                key={i}
                className={`bos-btn bos-btn-${a.variant || 'secondary'}`}
                onClick={a.onClick}
                aria-label={a.label}
              >
                {a.icon && <a.icon size={15} />}
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="bos-tabs" role="tablist" style={{ paddingLeft: 'var(--bos-space-6)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="bos-tab"
              data-active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        style={{ padding: 'var(--bos-space-5) var(--bos-space-6)' }}
      >
        {children}
      </div>
    </div>
  );
}
