import type { ReactNode } from "react";

import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
  subtitle?: string;
}

export default function Layout({ children, pageTitle, subtitle }: LayoutProps) {
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/decks", label: "Decks" },
    { to: "/study", label: "Study" },
    { to: "/posts", label: "Posts" },
    { to: "/user", label: "My Page" },
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
                    pathname === link.to ? "rgba(255, 255, 255, 0.25)" : undefined,
                  background:
                    pathname === link.to ? "rgba(255, 255, 255, 0.08)" : undefined,
                  color: pathname === link.to ? "#ffffff" : undefined,
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
                  borderColor: pathname === "/login" ? "rgba(255, 255, 255, 0.25)" : undefined,
                  background: pathname === "/login" ? "rgba(255, 255, 255, 0.08)" : undefined,
                  color: pathname === "/login" ? "#ffffff" : undefined,
                }}
              >
                Login
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
                Logout
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
