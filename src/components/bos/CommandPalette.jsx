import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  Search, X, Building2, FolderKanban, FileText, Plus,
  Users, ShoppingBag, ClipboardList, Package, BookOpen,
  UserCircle, BarChart3, LayoutDashboard, ArrowRight,
  CheckSquare, Bell
} from 'lucide-react';

const NAV_COMMANDS = [
  { label: 'Command Center', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'CRM', icon: Users, path: '/crm' },
  { label: 'Sales', icon: ShoppingBag, path: '/sales' },
  { label: 'Procurement', icon: ClipboardList, path: '/procurement' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Accounts', icon: BookOpen, path: '/accounts' },
  { label: 'HR', icon: UserCircle, path: '/hr' },
  { label: 'Projects', icon: FolderKanban, path: '/projects' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Approvals', icon: CheckSquare, path: '/approvals' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
];

const CREATE_ACTIONS = [
  { label: 'Create Customer', icon: Plus, path: '/crm' },
  { label: 'Create Quotation', icon: Plus, path: '/sales' },
  { label: 'Create Task', icon: Plus, path: '/projects' },
  { label: 'Create Purchase Request', icon: Plus, path: '/procurement' },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { companies = [], works = [], searchQuery, handleSearch, searchResults, jumpToSearchResult } = useCrm();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build flattened item list
  const getItems = useCallback(() => {
    const items = [];

    if (query.trim()) {
      // Search mode — filter nav + create + recent companies/projects
      const q = query.toLowerCase();
      const matchedNav = NAV_COMMANDS.filter(c => c.label.toLowerCase().includes(q));
      const matchedActions = CREATE_ACTIONS.filter(c => c.label.toLowerCase().includes(q));
      const matchedCompanies = companies
        .filter(c => c.company_name?.toLowerCase().includes(q))
        .slice(0, 5);
      const matchedProjects = works
        .filter(w => w.title?.toLowerCase().includes(q))
        .slice(0, 5);

      if (matchedCompanies.length) {
        items.push({ type: 'group', label: 'Customers' });
        matchedCompanies.forEach(c => items.push({
          type: 'item', label: c.company_name, icon: Building2,
          action: () => { navigate(`/crm/customers/${c.id}`); onClose(); }
        }));
      }
      if (matchedProjects.length) {
        items.push({ type: 'group', label: 'Projects' });
        matchedProjects.forEach(w => items.push({
          type: 'item', label: w.title, icon: FolderKanban,
          action: () => { navigate(`/projects/${w.id}`); onClose(); }
        }));
      }
      if (matchedActions.length) {
        items.push({ type: 'group', label: 'Actions' });
        matchedActions.forEach(a => items.push({
          type: 'item', label: a.label, icon: a.icon,
          action: () => { navigate(a.path); onClose(); }
        }));
      }
      if (matchedNav.length) {
        items.push({ type: 'group', label: 'Navigate' });
        matchedNav.forEach(n => items.push({
          type: 'item', label: n.label, icon: n.icon,
          action: () => { navigate(n.path); onClose(); }
        }));
      }

      if (items.length === 0) {
        items.push({ type: 'empty' });
      }
    } else {
      // Default view — recent, actions, navigate
      const recentCompanies = companies.slice(0, 3);
      const recentProjects = works.slice(0, 2);

      if (recentCompanies.length || recentProjects.length) {
        items.push({ type: 'group', label: 'Recent' });
        recentCompanies.forEach(c => items.push({
          type: 'item', label: c.company_name, icon: Building2,
          action: () => { navigate(`/crm/customers/${c.id}`); onClose(); }
        }));
        recentProjects.forEach(w => items.push({
          type: 'item', label: w.title, icon: FolderKanban,
          action: () => { navigate(`/projects/${w.id}`); onClose(); }
        }));
      }

      items.push({ type: 'group', label: 'Actions' });
      CREATE_ACTIONS.forEach(a => items.push({
        type: 'item', label: a.label, icon: a.icon,
        action: () => { navigate(a.path); onClose(); }
      }));

      items.push({ type: 'group', label: 'Navigate' });
      NAV_COMMANDS.slice(0, 6).forEach(n => items.push({
        type: 'item', label: n.label, icon: n.icon,
        action: () => { navigate(n.path); onClose(); }
      }));
    }

    return items;
  }, [query, companies, works, navigate, onClose]);

  const items = getItems();
  const selectableItems = items.filter(i => i.type === 'item');

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, selectableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = selectableItems[selectedIndex];
      if (selected?.action) selected.action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!open) return null;

  let selectableIdx = -1;

  return (
    <div
      className="bos-palette-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="bos-palette" onKeyDown={handleKeyDown}>
        {/* Search input */}
        <div className="bos-palette-input-wrap">
          <Search size={18} style={{ color: 'var(--bos-text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="bos-palette-input"
            type="text"
            placeholder="Search or jump to..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search commands"
            autoComplete="off"
          />
          <button
            onClick={onClose}
            className="bos-btn bos-btn-ghost bos-btn-sm"
            aria-label="Close command palette"
            style={{ padding: '2px 6px', fontSize: 11, fontWeight: 600 }}
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="bos-palette-body" ref={listRef} role="listbox">
          {items.map((item, idx) => {
            if (item.type === 'group') {
              return (
                <div key={`g-${idx}`} className="bos-palette-group">
                  <div className="bos-palette-group-label">{item.label}</div>
                </div>
              );
            }
            if (item.type === 'empty') {
              return (
                <div key="empty" style={{
                  padding: '24px 16px', textAlign: 'center',
                  fontSize: 13, color: 'var(--bos-text-tertiary)'
                }}>
                  No results for "{query}"
                </div>
              );
            }

            selectableIdx++;
            const isSelected = selectableIdx === selectedIndex;
            const Icon = item.icon;
            const currentIdx = selectableIdx;

            return (
              <button
                key={`i-${idx}`}
                className="bos-palette-item"
                data-selected={isSelected}
                role="option"
                aria-selected={isSelected}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(currentIdx)}
              >
                <span className="bos-palette-item-icon">
                  <Icon size={16} />
                </span>
                <span className="bos-palette-item-label">{item.label}</span>
                {isSelected && (
                  <span className="bos-palette-item-hint">
                    <ArrowRight size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
