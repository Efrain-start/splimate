import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addGroup } from "../features/groups/groupsSlice";

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

const btnPrimary = (disabled = false) => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: disabled
    ? "rgba(255,255,255,0.10)"
    : "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(124,58,237,0.95))",
  color: disabled ? "rgba(229,231,235,0.55)" : "#fff",
  fontWeight: 900,
  cursor: disabled ? "not-allowed" : "pointer",
});

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

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(6px)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 50,
};

const modal = {
  width: "100%",
  maxWidth: 520,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(17, 24, 39, 0.85)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
  overflow: "hidden",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
};

const iconBtn = {
  width: 42,
  height: 42,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#E5E7EB",
  fontSize: 18,
  cursor: "pointer",
};

const modalBody = { padding: 14 };

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.08)",
  color: "#E5E7EB",
  outline: "none",
  marginTop: 10,
};

const label = { fontSize: 12, opacity: 0.7, marginTop: 14, marginBottom: 10 };

const typeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
};

const typeBtn = (active) => ({
  padding: "12px 8px",
  borderRadius: 14,
  border: active
    ? "1px solid rgba(99,102,241,0.65)"
    : "1px solid rgba(255,255,255,0.14)",
  background: active ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.06)",
  color: "#E5E7EB",
  cursor: "pointer",
  textAlign: "center",
  fontWeight: 800,
});

const typeIcon = { fontSize: 18, display: "block", marginBottom: 6 };
const canCreateGreen = (enabled) => ({
  ...iconBtn,
  width: "auto",
  padding: "0 14px",
  background: enabled ? "rgba(16,185,129,0.85)" : "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: enabled ? "#06281E" : "#E5E7EB",
  opacity: enabled ? 1 : 0.6,
  fontWeight: 900,
});
const switchWrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 16,
};

const switchBtn = (on) => ({
  width: 56,
  height: 32,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: on ? "rgba(16,185,129,0.85)" : "rgba(255,255,255,0.10)",
  position: "relative",
  cursor: "pointer",
});

const switchKnob = (on) => ({
  position: "absolute",
  top: 3,
  left: on ? 28 : 3,
  width: 26,
  height: 26,
  borderRadius: 999,
  background: "#fff",
  transition: "left .15s ease",
});

const dateGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 14,
};

const smallLabel = { fontSize: 12, opacity: 0.75, marginBottom: 6 };

export default function Home() {
  const dispatch = useDispatch();
  const groups = useSelector((state) => state.groups.list);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("trip");
  const [includeTripDates, setIncludeTripDates] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const canCreate =
  name.trim().length > 0 &&
  (!includeTripDates ||
    (startDate &&
      endDate &&
      new Date(endDate).getTime() >= new Date(startDate).getTime()));


  const onSelectType = (newType) => {
    setType(newType);
    if (newType !== "trip") {
      setIncludeTripDates(false);
      setStartDate("");
      setEndDate("");
    }
  };

  const close = () => {
    setOpen(false);
    setName("");
    setType("trip");
    setIncludeTripDates(false);
    setStartDate("");
    setEndDate("");
  };

  const handleCreate = () => {
    const n = name.trim();
    if (!n) return;

    dispatch(
      addGroup({
        id: Date.now().toString(),
        name: n,
        type, // ✅ nuevo
        members: [],
        expenses: [],
      })
    );

    close();
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ marginTop: 0 }}>Home</h1>
        <p style={{ color: "rgba(229,231,235,0.7)" }}>Bienvenido a SplitMate</p>

        <button onClick={() => setOpen(true)} style={btnPrimary(false)}>
          Crear grupo
        </button>
      </div>

      <div style={{ height: 16 }} />

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Tus grupos</h2>

        {groups.length === 0 ? (
  <p style={{ color: "rgba(229,231,235,0.7)" }}>
    No hay grupos todavía.
  </p>
) : (
  <>
    <div style={{ display: "grid", gap: 10 }}>
      {groups
        .slice(-3) // 👈 SOLO LOS ÚLTIMOS 3
        .reverse() // 👈 el más nuevo arriba
        .map((g) => {
          const t = TYPES.find((x) => x.key === g.type) ?? TYPES[3];

          return (
            <Link key={g.id} to={`/group/${g.id}`} style={linkCard}>
              <strong>
                <span style={{ marginRight: 8 }}>{t.icon}</span>
                {g.name}
              </strong>
              <span style={{ opacity: 0.6 }}>→</span>
            </Link>
          );
        })}
    </div>

    {groups.length > 3 && (
      <div style={{ marginTop: 12, textAlign: "center" }}>
        <Link
          to="/groups"
          style={{
            textDecoration: "none",
            fontWeight: 800,
            color: "#A5B4FC",
          }}
        >
          Ver todos los grupos →
        </Link>
      </div>
    )}
  </>
)}
</div>


      {open && (
        <div style={overlay} onClick={close}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <button style={iconBtn} onClick={close} aria-label="Cerrar">
                ✕
              </button>

              <div style={{ fontWeight: 900, fontSize: 18 }}>
                Crear un grupo
              </div>

              <button
                onClick={handleCreate}
                disabled={!canCreate}
                style={canCreateGreen(canCreate)}
              >
                Listo
              </button>
            </div>

            <div style={modalBody}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Nombre del grupo
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Vacaciones, Casa, Roomies..."
                    style={input}
                    autoFocus
                  />
                </div>
              </div>

              <div style={label}>Tipo</div>

              <div style={typeGrid}>
                {TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => onSelectType(t.key)}
                    style={typeBtn(type === t.key)}
                    type="button"
                  >
                    <span style={typeIcon}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ✅ SOLO si es viaje */}
              {type === "trip" && (
                <>
                  <div style={switchWrap}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>
                      Añadir fechas del viaje
                    </div>

                    <button
                      type="button"
                      onClick={() => setIncludeTripDates((v) => !v)}
                      style={switchBtn(includeTripDates)}
                      aria-pressed={includeTripDates}
                    >
                      <span style={switchKnob(includeTripDates)} />
                    </button>
                  </div>

                  <div
                    style={{
                      color: "rgba(229,231,235,0.65)",
                      lineHeight: 1.4,
                      marginTop: 8,
                    }}
                  >
                    SplitMate recordará a los amigos que se unan, añadan gastos
                    y salden deudas.
                  </div>

                  {includeTripDates && (
                    <div style={dateGrid}>
                      <div>
                        <div style={smallLabel}>Inicio</div>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          style={input}
                        />
                      </div>

                      <div>
                        <div style={smallLabel}>Fin</div>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          style={input}
                          min={startDate || undefined}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ height: 14 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
