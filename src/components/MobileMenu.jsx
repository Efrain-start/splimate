import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const overlayStyle = (open) => ({
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" : "none",
  transition: "opacity .18s ease",
  zIndex: 50,
});

const drawerStyle = (open) => ({
  position: "fixed",
  top: 12,
  left: 12,
  bottom: 12,
  width: 280,
  borderRadius: 18,
  padding: 14,
  background: "rgba(17, 24, 39, 0.72)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
  backdropFilter: "blur(10px)",
  transform: open ? "translateX(0)" : "translateX(-120%)",
  transition: "transform .2s ease",
  zIndex: 60,
  color: "#E5E7EB",
});

const topbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 16,
  background: "rgba(17, 24, 39, 0.55)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.30)",
  backdropFilter: "blur(8px)",
  color: "#E5E7EB",
};

const iconBtn = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.08)",
  color: "#E5E7EB",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 900,
};

const itemStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 12,
  marginTop: 8,
  color: "#E5E7EB",
  border: "1px solid rgba(255,255,255,0.10)",
  background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.06)",
});

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Cierra el menú al cambiar de ruta
  useEffect(() => setOpen(false), [pathname]);

  // Cierra con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Topbar */}
      <div style={topbarStyle}>
        <button onClick={() => setOpen(true)} style={iconBtn} aria-label="Abrir menú">
          ☰
        </button>

        <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
          SplitMate
        </div>

        <div style={{ width: 44 }} />
      </div>

      {/* Overlay */}
      <div style={overlayStyle(open)} onClick={() => setOpen(false)} />

      {/* Drawer */}
      <aside style={drawerStyle(open)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900 }}>Menú</div>
          <button onClick={() => setOpen(false)} style={iconBtn} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
          Navegación
        </div>

        <nav style={{ marginTop: 6 }}>
          <Link to="/" style={itemStyle(pathname === "/")}>
            Home <span style={{ opacity: 0.7 }}>→</span>
          </Link>

          <Link to="/groups" style={itemStyle(pathname.startsWith("/groups"))}>
            Groups <span style={{ opacity: 0.7 }}>→</span>
          </Link>

          <Link to="/insights" style={itemStyle(pathname.startsWith("/insights"))}>
            Insights <span style={{ opacity: 0.7 }}>→</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
