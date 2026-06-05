import React from "react";
import { Link, NavLink } from "react-router-dom";

/* Shared top navigation. Minimal logo mark (no name) on the left. */
export default function Nav() {
  return (
    <header className="topbar">
      <Link className="logo-mark" to="/" aria-label="Home">
        <span className="dot" />
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/demos">Demos</NavLink>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}
