import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Search, User } from 'lucide-react';

const TABS = [
  { id: 'today', path: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { id: 'work', path: '/my-work', icon: CheckSquare, label: 'Work' },
  { id: 'search', path: '/search', icon: Search, label: 'Search' },
  { id: 'profile', path: '/profile', icon: User, label: 'Profile' },
];

export default function MobileBottomNav({ onOpenSearch }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname.startsWith('/dashboard');
    return location.pathname.startsWith(path);
  };

  const handleClick = (tab) => {
    if (tab.id === 'search' && onOpenSearch) {
      onOpenSearch();
    } else {
      navigate(tab.path);
    }
  };

  return (
    <nav className="bos-mobile-nav" role="navigation" aria-label="Mobile navigation">
      <div className="bos-mobile-nav-items">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              className="bos-mobile-nav-item"
              data-active={active}
              onClick={() => handleClick(tab)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
