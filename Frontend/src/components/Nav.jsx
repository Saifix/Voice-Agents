import React from "react";
import { Link, NavLink } from "react-router-dom";

/* Shared top navigation used across the portfolio + demo pages. */
export default function Nav() {
  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="dot" /> Saif-ur-Rehman
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/demos">Demos</NavLink>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}
