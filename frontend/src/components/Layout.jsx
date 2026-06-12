import Sidebar from "./Sidebar";

/**
 * Layout — wraps every page with the sidebar shell.
 * Children render in the main content area.
 */
function Layout({ children, theme, toggleTheme }) {
  return (
    <div className="app-shell">
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;