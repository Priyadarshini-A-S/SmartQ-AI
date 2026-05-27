import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/book", label: "Book" },
  { to: "/token", label: "Token Status" },
  { to: "/live-queue", label: "Live Queue" }
];

export function Shell({ children }) {
  const location = useLocation();

  return (
    <div className="app-frame">
      <header className="top-nav">
        <div className="brand-block">
          <span className="brand-dot" />
          <div>
            <h1>Smart Aadhaar Queue System</h1>
            <p>Reduce waiting time with smart scheduling</p>
          </div>
        </div>

        <div className="nav-wrap">
          <nav>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? "nav-link active" : "nav-link"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="nav-note">Live counters and status updates every few seconds</p>
        </div>
      </header>

      <main className="page-content">{children}</main>
    </div>
  );
}
