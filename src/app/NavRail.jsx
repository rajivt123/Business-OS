import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShoppingBag, ClipboardList, Package, BookOpen,
  UserCircle, FolderKanban, BarChart3, Settings, HelpCircle, Flame
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
  { id: 'crm', path: '/crm', icon: Users, label: 'CRM' },
  { id: 'sales', path: '/sales', icon: ShoppingBag, label: 'Sales' },
  { id: 'procurement', path: '/procurement', icon: ClipboardList, label: 'Procurement' },
  { id: 'inventory', path: '/inventory', icon: Package, label: 'Inventory' },
  { id: 'accounts', path: '/accounts', icon: BookOpen, label: 'Accounts' },
  { id: 'hr', path: '/hr', icon: UserCircle, label: 'HR' },
  { id: 'projects', path: '/projects', icon: FolderKanban, label: 'Projects' },
  { id: 'reports', path: '/reports', icon: BarChart3, label: 'Reports' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', path: '/admin', icon: Settings, label: 'Settings' },
  { id: 'help', path: '/help', icon: HelpCircle, label: 'Help' },
];

export default function NavRail() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname.startsWith('/dashboard');
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bos-rail" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <button
        className="bos-rail-brand"
        onClick={() => navigate('/dashboard')}
        aria-label="RAJIV Business OS — Go to Command Center"
        title="RAJIV Business OS"
      >
        <Flame size={18} />
      </button>

      {/* Main Navigation */}
      <div className="bos-rail-nav" role="list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              className="bos-rail-item"
              data-active={active}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              role="listitem"
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="bos-rail-tooltip">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="bos-rail-bottom" role="list">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              className="bos-rail-item"
              data-active={active}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              role="listitem"
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="bos-rail-tooltip">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
