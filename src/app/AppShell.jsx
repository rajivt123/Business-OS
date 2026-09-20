import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import NavRail from './NavRail';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import CommandPalette from '../components/bos/CommandPalette';

export default function AppShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closePalette = useCallback(() => setCommandPaletteOpen(false), []);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="bos-shell">
      {/* Desktop Navigation Rail */}
      <NavRail />

      {/* Main Content Area */}
      <div className="bos-content-area">
        {/* Topbar */}
        <Topbar onOpenCommandPalette={openPalette} />

        {/* Page Content — filled by React Router Outlet */}
        <main className="bos-page-content" id="bos-main-content" role="main">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenSearch={openPalette} />

      {/* Command Palette Overlay */}
      <CommandPalette open={commandPaletteOpen} onClose={closePalette} />
    </div>
  );
}
