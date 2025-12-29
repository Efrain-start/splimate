import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const TYPES = [
  { key: "trip", label: "Viaje", icon: "✈️" },
  { key: "home", label: "Casa", icon: "🏠" },
  { key: "couple", label: "Pareja", icon: "❤️" },
  { key: "other", label: "Otro", icon: "🧾" },
];

const page = { minHeight: "100vh", padding: 20, color: "#E5E7EB" };

const card = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(17, 24, 39, 0.55)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  backdropFilter: "blur(8px)",
};

const linkCard = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.06)",
  textDecoration: "none",
  color: "#E5E7EB",
};

const btnPrimary = (disabled = false) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: disabled
    ? "rgba(255,255,255,0.10)"
    : "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(124,58,237,0.95))",
  color: disabled ? "rgba(229,231,235,0.55)" : "#fff",
  fontWeight: 900,
  cursor: disabled ? "not-allowed" : "pointer",
  textDecoration: "none",
});

export default function Groups() {
  const groups = useSelector((state) => state.groups.list);

  return (
    <div style={page}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Groups</h1>

        {/* En tu app crear grupo se hace en Home con el modal */}
        <Link to="/" style={btnPrimary(false)}>
          + Crear grupo
        </Link>
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Tus grupos</h2>

        {groups.length === 0 ? (
          <p style={{ color: "rgba(229,231,235,0.7)" }}>
            No hay grupos todavía.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {groups.map((g) => {
              const t = TYPES.find((x) => x.key === g.type) ?? TYPES[3];

              return (
                <Link key={g.id} to={`/group/${g.id}`} style={linkCard}>
                  <strong>
                    <span style={{ marginRight: 8 }}>{t.icon}</span>
                    {g.name}
                  </strong>

                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {g.isSettled && (
                      <span style={{ fontSize: 12, opacity: 0.75 }}>🔒</span>
                    )}
                    <span style={{ opacity: 0.6 }}>→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
