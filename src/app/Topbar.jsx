import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import {
  Search, Plus, Bell, ChevronDown, Moon, Sun,
  LogOut, User, Building2, Settings
} from 'lucide-react';

export default function Topbar({ onOpenCommandPalette }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser, isDarkMode, setIsDarkMode, onSignOut,
    operatingCompanies = [], activeOperatingCompany,
    setActiveOperatingCompanyId, unreadNotificationsCount = 0,
  } = useCrm();

  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const companyRef = useRef(null);
  const userRef = useRef(null);
  const createRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (companyRef.current && !companyRef.current.contains(e.target)) setShowCompanyMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (createRef.current && !createRef.current.contains(e.target)) setShowCreateMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const companyName = activeOperatingCompany?.company_name || 'Select Company';
  const userInitials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const createActions = [
    { label: 'New Customer', action: () => { navigate('/crm'); setShowCreateMenu(false); } },
    { label: 'New Quotation', action: () => { navigate('/sales'); setShowCreateMenu(false); } },
    { label: 'New Task', action: () => { navigate('/projects'); setShowCreateMenu(false); } },
    { label: 'New Purchase Request', action: () => { navigate('/procurement'); setShowCreateMenu(false); } },
  ];

  return (
    <header className="bos-topbar" role="banner">
      {/* Mobile hamburger placeholder — visible only on mobile */}
      <button
        className="bos-topbar-btn"
        onClick={onOpenCommandPalette}
        aria-label="Open menu"
        style={{ display: 'none' }}
      >
        <Search size={18} />
      </button>

      {/* Search / Command trigger */}
      <button
        className="bos-topbar-search"
        onClick={onOpenCommandPalette}
        aria-label="Search Business OS (Ctrl+K)"
        type="button"
      >
        <Search size={15} />
        <span>Search Business OS...</span>
        <kbd>⌘K</kbd>
      </button>

      <div style={{ flex: 1 }} />

      {/* Company Selector */}
      <div ref={companyRef} style={{ position: 'relative' }}>
        <button
          className="bos-topbar-company"
          onClick={() => setShowCompanyMenu(v => !v)}
          aria-label={`Current company: ${companyName}`}
          aria-expanded={showCompanyMenu}
          aria-haspopup="listbox"
        >
          <Building2 size={15} />
          <span>{companyName}</span>
          <ChevronDown size={14} />
        </button>
        {showCompanyMenu && operatingCompanies.length > 0 && (
          <div
            role="listbox"
            aria-label="Select company"
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              width: 240, background: 'var(--bos-surface)', border: '1px solid var(--bos-border)',
              borderRadius: 'var(--bos-radius-lg)', boxShadow: 'var(--bos-shadow-lg)',
              zIndex: 100, padding: '4px 0', maxHeight: 280, overflowY: 'auto'
            }}
          >
            {operatingCompanies.map(c => (
              <button
                key={c.id}
                role="option"
                aria-selected={c.id === activeOperatingCompany?.id}
                onClick={() => { setActiveOperatingCompanyId(c.id); setShowCompanyMenu(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px',
                  fontSize: 13, fontWeight: c.id === activeOperatingCompany?.id ? 600 : 400,
                  color: c.id === activeOperatingCompany?.id ? 'var(--bos-accent)' : 'var(--bos-text-primary)',
                  background: c.id === activeOperatingCompany?.id ? 'var(--bos-accent-subtle)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--bos-font-sans)'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--bos-surface-hover)'}
                onMouseLeave={e => e.target.style.background = c.id === activeOperatingCompany?.id ? 'var(--bos-accent-subtle)' : 'transparent'}
              >
                {c.company_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create */}
      <div ref={createRef} style={{ position: 'relative' }}>
        <button
          className="bos-btn bos-btn-primary bos-btn-sm"
          onClick={() => setShowCreateMenu(v => !v)}
          aria-label="Create new"
          aria-expanded={showCreateMenu}
          aria-haspopup="menu"
          style={{ gap: 4 }}
        >
          <Plus size={14} />
          <span className="bos-hide-mobile">Create</span>
        </button>
        {showCreateMenu && (
          <div
            role="menu"
            aria-label="Create actions"
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              width: 200, background: 'var(--bos-surface)', border: '1px solid var(--bos-border)',
              borderRadius: 'var(--bos-radius-lg)', boxShadow: 'var(--bos-shadow-lg)',
              zIndex: 100, padding: '4px 0'
            }}
          >
            {createActions.map((a, i) => (
              <button
                key={i}
                role="menuitem"
                onClick={a.action}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px',
                  fontSize: 13, color: 'var(--bos-text-primary)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--bos-font-sans)'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--bos-surface-hover)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bos-topbar-actions">
        {/* Notifications */}
        <button
          className="bos-topbar-btn"
          onClick={() => navigate('/notifications')}
          aria-label={`Notifications${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} unread)` : ''}`}
        >
          <Bell size={18} />
          {unreadNotificationsCount > 0 && <span className="bos-topbar-badge" />}
        </button>

        {/* Theme toggle */}
        <button
          className="bos-topbar-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            className="bos-topbar-user"
            onClick={() => setShowUserMenu(v => !v)}
            aria-label={`User menu: ${currentUser?.full_name || 'User'}`}
            aria-expanded={showUserMenu}
            aria-haspopup="menu"
          >
            {userInitials}
          </button>
          {showUserMenu && (
            <div
              role="menu"
              aria-label="User menu"
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                width: 200, background: 'var(--bos-surface)', border: '1px solid var(--bos-border)',
                borderRadius: 'var(--bos-radius-lg)', boxShadow: 'var(--bos-shadow-lg)',
                zIndex: 100, padding: '4px 0'
              }}
            >
              <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--bos-border)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bos-text-primary)' }}>
                  {currentUser?.full_name || 'User'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--bos-text-tertiary)', marginTop: 2 }}>
                  {currentUser?.email || ''}
                </div>
              </div>
              {[
                { label: 'My Profile', icon: User, action: () => { navigate('/profile'); setShowUserMenu(false); } },
                { label: 'Company Settings', icon: Settings, action: () => { navigate('/admin/company-settings'); setShowUserMenu(false); } },
              ].map((item, i) => (
                <button
                  key={i}
                  role="menuitem"
                  onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                    padding: '8px 14px', fontSize: 13, color: 'var(--bos-text-primary)',
                    background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--bos-font-sans)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bos-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <item.icon size={15} style={{ color: 'var(--bos-text-tertiary)' }} />
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--bos-border)', marginTop: 4, paddingTop: 4 }}>
                <button
                  role="menuitem"
                  onClick={() => { onSignOut(); setShowUserMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                    padding: '8px 14px', fontSize: 13, color: 'var(--bos-error)',
                    background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--bos-font-sans)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bos-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
