import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/houses" className="text-2xl font-bold text-slate-900">
          HouseFinder
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/houses"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Browse Houses
          </Link>
          <Link
            to="/apply-agent"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Become an Agent
          </Link>
          <Link
            to="/login"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/dashboard"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
