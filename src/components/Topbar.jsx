import { Link } from "react-router-dom";

export default function Topbar({ isDesktop, onOpenMobileMenu }) {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        splitMate
      </Link>

      {isDesktop ? (
        <nav className="nav">
          <Link className="navLink" to="/">Inicio</Link>
          <Link className="navLink" to="/groups">Grupos</Link>
          <Link className="navLink" to="/insights">Insights</Link>
        </nav>
      ) : (
        <button className="menuBtn" onClick={onOpenMobileMenu} aria-label="Abrir menú">
          ☰
        </button>
      )}
    </header>
  );
}
