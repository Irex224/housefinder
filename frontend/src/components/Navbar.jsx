import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  canAccessAgentPanel,
  canAccessDashboard,
  getStoredUser,
  isSuperAdmin,
  roleLabel,
} from "../utils/helpers";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const location = useLocation();

  useEffect(() => {
    setUser(getStoredUser());
    setMenuOpen(false);
  }, [location.pathname]);

  const linkClass = (path) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/houses", label: "Browse Houses" },
    { to: "/apply-agent", label: "Become an Agent" },
  ];

  const authLinks = user ? (
    <>
      {canAccessDashboard(user) && (
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
      )}
      {canAccessAgentPanel(user) && (
        <Link to="/agent" className={linkClass("/agent")}>
          My Listings
        </Link>
      )}
      <Link to="/saved" className={linkClass("/saved")}>
        Saved
      </Link>
      <span className="hidden text-xs text-slate-500 lg:inline">{roleLabel(user)}</span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Sign out
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
        Sign in
      </Link>
      <Link to="/register?mode=signup" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
        Create account
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-slate-900 sm:text-2xl">
          HouseFinder
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={linkClass(to)}>{label}</Link>
          ))}
          {authLinks}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 px-4 py-3 md:hidden">
          <div className="space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass(to)}>{label}</Link>
            ))}
            {user && (
              <p className="px-3 py-2 text-xs text-slate-500">
                {roleLabel(user)}
                {isSuperAdmin(user) && user.email === "thugforsign@gmail.com" ? " (You)" : ""}
              </p>
            )}
            {authLinks}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
