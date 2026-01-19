import type { ReactNode } from "react";

import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
  subtitle?: string;
}

  const { pathname } = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  };

  const links = [
  ];

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="top-nav">
          <div className="brand">
            <span className="brand-dot" /> JP Card Studio
          </div>
          <div className="nav-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link"
                style={{
                  borderColor:
                  background:
                }}
              >
                {link.label}
              </Link>
            ))}
            {!token ? (
              <Link
                to="/login"
                className="nav-link"
                style={{
                }}
              >
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "inherit",
                  fontFamily: "inherit",
                }}
              >
              </button>
            )}
          </div>
        </header>

        <main className="content-area">{children}</main>

        <footer className="footer">
          <span className="status">
            <span className="status-dot" /> Crafted UI with monochrome sheen
          </span>
          <span className="muted">Connected to backend @ localhost:8080/api</span>
        </footer>
      </div>
    </div>
  );
}
