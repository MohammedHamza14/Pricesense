import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

/* ── Icons ── */
const IconDashboard = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
);
const IconProducts = () => (
  <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
);
const IconSales = () => (
  <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const IconImport = () => (
  <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

const NAV_ITEMS = [
  { to: "/",        label: "Dashboard",   icon: <IconDashboard />, end: true },
  { to: "/products",label: "Products",    icon: <IconProducts /> },
  { to: "/sales",   label: "Sales",       icon: <IconSales /> },
  { to: "/import",  label: "Import Data", icon: <IconImport /> },
];

function Sidebar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar__toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation">
        {open ? <IconClose /> : <IconMenu />}
      </button>

      {/* Overlay */}
      <div
        className={`sidebar__overlay${open ? " sidebar--open" : ""}`}
        onClick={close}
      />

      {/* Sidebar panel */}
      <aside className={`sidebar${open ? " sidebar--open" : ""}`}>

        {/* Brand */}
        <div className="sidebar__brand">
          <NavLink to="/" className="sidebar__logo" onClick={close}>
            <div className="sidebar__logo-icon">
              <IconTarget />
            </div>
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-name">
                Price<span>Sense</span>
              </span>
              <span className="sidebar__logo-sub">Command v2.0</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav" aria-label="Main navigation">
          <span className="sidebar__section-label">Navigation</span>

          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={close}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <span className="nav-link__icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          {/* Theme Toggle */}
          <div className="sidebar__theme-toggle">
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="theme-toggle-btn__icon">
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </span>
              <span className="theme-toggle-btn__label">
                {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
              </span>
              <span className="theme-toggle-btn__track">
                <span className={`theme-toggle-btn__thumb ${theme === 'light' ? 'theme-toggle-btn__thumb--active' : ''}`} />
              </span>
            </button>
          </div>
          
          <div className="sidebar__status">
            <span className="sidebar__status-dot" />
            <span className="sidebar__status-text">System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;