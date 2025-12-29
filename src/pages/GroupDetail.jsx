import {
  calculateBalances,
  settleBalances,
  formatMoney,
} from "../utils/balances";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  addMemberToGroup,
  removeMemberFromGroup,
  addExpenseToGroup,
  removeExpenseFromGroup,
  settleGroup,
  reopenGroup,
  removeGroup,
} from "../features/groups/groupsSlice";

const badgeStyle = (balance) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  marginLeft: 8,
  background:
    balance > 0
      ? "linear-gradient(135deg, #E8FFF1, #D1FAE5)"
      : balance < 0
      ? "linear-gradient(135deg, #FFECEC, #FECACA)"
      : "#F3F4F6",
  color: balance > 0 ? "#166534" : balance < 0 ? "#991B1B" : "#374151",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
});

const TYPE_THEME = {
  trip: {
    gradient: "linear-gradient(135deg, #BAE6FD, #E0F2FE)", // blue 200 → 100
    soft: "rgba(186,230,253,0.08)",
  },
  home: {
    gradient: "linear-gradient(135deg, #BBF7D0, #DCFCE7)", // green 200 → 100
    soft: "rgba(187,247,208,0.08)",
  },
  couple: {
    gradient: "linear-gradient(135deg, #FBCFE8, #FCE7F3)", // pink 200 → 100
    soft: "rgba(251,207,232,0.08)",
  },
  other: {
    gradient: "linear-gradient(135deg, #E2E8F0, #F1F5F9)", // slate 200 → 100
    soft: "rgba(226,232,240,0.08)",
  },
};

const TYPE_META = {
  trip: { label: "Viaje", icon: "✈️" },
  home: { label: "Casa", icon: "🏠" },
  couple: { label: "Pareja", icon: "❤️" },
  other: { label: "Otro", icon: "🧾" },
};

const TYPE_BG = {
  trip: "✈️",
  home: "🏠",
  couple: "❤️",
  other: "🧾",
};

export default function GroupDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const group = useSelector((state) =>
    state.groups.list.find((g) => String(g.id) === String(id))
  );

  // Members
  const [memberName, setMemberName] = useState("");

  // Expenses
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (!group) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 20,
          background: `
      radial-gradient(900px 500px at 10% 0%, rgba(99,102,241,0.20), transparent),
      radial-gradient(700px 400px at 90% 20%, rgba(34,197,94,0.18), transparent),
      #0F172A
    `,
          color: "#E5E7EB",
        }}
      >
        <h1>Group Detail</h1>
        <p>No encontré ese grupo (ID: {id})</p>
        <div style={{ marginTop: 16 }}>
          <button onClick={() => navigate("/")} style={btn("ghost", false)}>
            ← Volver a Home
          </button>
        </div>
      </div>
    );
  }

  const theme = TYPE_THEME?.[group?.type] ?? TYPE_THEME.other;
  const typeMeta = TYPE_META?.[group?.type] ?? TYPE_META.other;
  const bgIcon = TYPE_BG?.[group?.type] ?? TYPE_BG.other;

  const members = group.members ?? [];
  const expenses = group.expenses ?? [];
  const balances = calculateBalances(group);
  const settlements = settleBalances(balances);
  const isSettled = !!group.isSettled;

  const handleSettle = () => {
    if (isSettled) return;

    const ok = confirm(
      "¿Seguro que quieres liquidar este grupo? Ya NO podrás agregar nuevos gastos."
    );
    if (!ok) return;

    dispatch(settleGroup({ groupId: id }));
  };

  const handleReopen = () => {
    if (!isSettled) return;

    const ok = confirm("¿Reabrir este grupo? Podrás volver a agregar gastos.");
    if (!ok) return;

    dispatch(reopenGroup({ groupId: id }));

    setDesc("");
    setAmount("");
    setPaidBy("");
    setSplitBetween([]);
  };

  const handleDeleteGroup = () => {
    if (!isSettled) return;

    const ok = confirm(
      `¿Eliminar el grupo "${group.name}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    dispatch(removeGroup({ groupId: id }));
    navigate("/");
  };

  // --- MEMBERS ---
  const handleAddMember = () => {
    const name = memberName.trim();
    if (!name) return;
    dispatch(addMemberToGroup({ groupId: id, memberName: name }));
    setMemberName("");
  };

  // Si borras un miembro, también lo quitamos de splitBetween y paidBy (si aplica)
  const handleRemoveMember = (m) => {
    dispatch(removeMemberFromGroup({ groupId: id, memberName: m }));
    setSplitBetween((prev) => prev.filter((x) => x !== m));
    setPaidBy((prev) => (prev === m ? "" : prev));
  };

  // --- EXPENSES ---
  const toggleSplit = (m) => {
    setSplitBetween((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleAddExpense = () => {
    dispatch(
      addExpenseToGroup({
        groupId: id,
        description: desc,
        amount,
        paidBy,
        splitBetween,
      })
    );

    // limpiar form
    setDesc("");
    setAmount("");
    setPaidBy("");
    setSplitBetween([]);
  };

  const canAddExpense =
    desc.trim() &&
    Number(amount) > 0 &&
    paidBy &&
    splitBetween.length > 0 &&
    !isSettled;

  const totalSpent = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );
  const totalMembers = members.length;
  const totalExpenses = expenses.length;

  const balancesSorted = Object.entries(balances).sort((a, b) => {
    const va = Number(a[1]) || 0;
    const vb = Number(b[1]) || 0;

    // Deudores (negativos) primero, luego acreedores (positivos), luego ceros
    const rank = (v) => (v < 0 ? 0 : v > 0 ? 1 : 2);

    const ra = rank(va);
    const rb = rank(vb);

    if (ra !== rb) return ra - rb;

    // Dentro de cada grupo, ordenar por magnitud (más grande primero)
    return Math.abs(vb) - Math.abs(va);
  });

  const statPill = {
    padding: "8px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#E5E7EB",
    fontWeight: 800,
    letterSpacing: 0.2,
    backdropFilter: "blur(6px)",
  };

  const card = {
    padding: 16,
    borderRadius: 16,
    background: "rgba(17, 24, 39, 0.55)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    backdropFilter: "blur(8px)",
  };

  const field = (disabled = false) => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
    color: "#E5E7EB",
    outline: "none",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  });

  const selectStyle = (disabled = false) => ({
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
    color: "#E5E7EB",
    outline: "none",
  });

  const hint = {
    margin: "6px 0 0",
    fontSize: 12,
    color: "rgba(229,231,235,0.65)",
  };

  const expenseCard = {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.30)",
  };

  const btn = (variant = "primary", disabled = false) => {
    const variants = {
      primary: {
        bg: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(124,58,237,0.95))",
        text: "#fff",
        border: "rgba(255,255,255,0.18)",
      },
      danger: {
        bg: "linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))",
        text: "#fff",
        border: "rgba(255,255,255,0.18)",
      },
      warning: {
        bg: "linear-gradient(135deg, rgba(245,158,11,0.95), rgba(217,119,6,0.95))",
        text: "#111827",
        border: "rgba(255,255,255,0.22)",
      },
      ghost: {
        bg: "rgba(255,255,255,0.08)",
        text: "#E5E7EB",
        border: "rgba(255,255,255,0.14)",
      },
    };

    const v = variants[variant] ?? variants.primary;

    return {
      padding: "10px 12px",
      borderRadius: 12,
      border: `1px solid ${v.border}`,
      background: disabled ? "rgba(255,255,255,0.08)" : v.bg,
      color: disabled ? "rgba(229,231,235,0.55)" : v.text,
      fontWeight: 900,
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 10px 22px rgba(0,0,0,0.28)",
      transition: "transform .08s ease, filter .12s ease",
      userSelect: "none",
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 20,
        color: "#E5E7EB",
      }}
    >
      {/* ✅ WRAPPER de animación */}
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 800ms ease, transform 800ms ease",
          willChange: "opacity, transform",
        }}
      >
        {/* HEADER CARD */}
        <div
          style={{
            ...card,
            position: "relative",
            overflow: "hidden",
            background: "rgba(17, 24, 39, 0.55)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {/* watermark según tipo */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -20,
              top: -40,
              fontSize: 180,
              opacity: 0.1,
              transform: "rotate(12deg)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {bgIcon}
          </div>

          {/* contenido encima */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1>Group Detail</h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 28,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {typeMeta.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {typeMeta.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>
                  {group.name}
                </div>
              </div>

              {isSettled && (
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    background: "rgba(245,158,11,0.18)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "#FBBF24",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔒 Liquidado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}
        >
          <span style={statPill}>
            <strong>Miembros:</strong> {totalMembers}
          </span>

          <span style={statPill}>
            <strong>Gastos:</strong> {totalExpenses}
          </span>

          <span style={statPill}>
            <strong>Total:</strong> {formatMoney(totalSpent)}
          </span>
        </div>

        <hr />

        {/* MEMBERS */}
        <div style={card}>
          <h2>Members: {members.length}</h2>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Nombre del miembro"
              style={field(isSettled)}
              disabled={isSettled}
            />

            <button
              onClick={handleAddMember}
              disabled={isSettled}
              style={btn("primary", isSettled)}
            >
              Agregar miembro
            </button>
          </div>

          <ul>
            {members.map((m) => (
              <li
                key={m}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 0",
                }}
              >
                <span style={{ fontWeight: 700 }}>{m}</span>

                <button
                  onClick={() => handleRemoveMember(m)}
                  disabled={isSettled}
                  style={btn("danger", isSettled)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <hr />

        {/* EXPENSES */}
        <div style={card}>
          <h2>Gastos: {expenses.length}</h2>

          {isSettled && (
            <div
              style={{
                margin: "8px 0 12px",
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(245,158,11,0.18)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#FBBF24",
                fontWeight: 800,
              }}
            >
              ✅ Este grupo está liquidado. Ya no se pueden agregar más gastos.
            </div>
          )}

          {members.length === 0 ? (
            <p>Primero agrega miembros para poder registrar gastos.</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  maxWidth: 520,
                  marginTop: 10,
                }}
              >
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Descripción (ej. Hotel, Gasolina)"
                  disabled={isSettled}
                  style={field(isSettled)}
                />

                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Monto (ej. 1200)"
                  inputMode="decimal"
                  disabled={isSettled}
                  style={field(isSettled)}
                />

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ minWidth: 44 }}>Pagó:</span>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    disabled={isSettled}
                    style={{ ...selectStyle(isSettled), flex: 1 }}
                  >
                    <option value="">-- Selecciona --</option>
                    {members.map((m) => (
                      <option key={m} value={m} style={{ color: "#111827" }}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ marginBottom: 6 }}>Se divide entre:</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {members.map((m) => (
                      <label key={m} style={{ display: "flex", gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={splitBetween.includes(m)}
                          onChange={() => toggleSplit(m)}
                          disabled={isSettled}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddExpense}
                  disabled={!canAddExpense}
                  style={btn("primary", !canAddExpense)}
                >
                  Agregar gasto
                </button>

                {!canAddExpense && (
                  <p style={hint}>Completa todo para agregar un gasto.</p>
                )}
              </div>

              <div style={{ marginTop: 14 }} />

              {expenses.length === 0 ? (
                <p style={{ marginTop: 8 }}>No hay gastos todavía.</p>
              ) : (
                <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                  {expenses.map((e) => (
                    <div key={e.id} style={expenseCard}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 900 }}>{e.description}</div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "rgba(229,231,235,0.70)",
                              marginTop: 2,
                            }}
                          >
                            Pagó: <strong>{e.paidBy}</strong> · Split:{" "}
                            {(e.splitBetween ?? []).join(", ")}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 900, color: "#E5E7EB" }}>
                            {formatMoney(e.amount)}
                          </div>

                          <button
                            onClick={() =>
                              dispatch(
                                removeExpenseFromGroup({
                                  groupId: id,
                                  expenseId: e.id,
                                })
                              )
                            }
                            disabled={isSettled}
                            style={{
                              ...btn("danger", isSettled),
                              marginTop: 6,
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <hr />

        {/* BALANCES */}
        <div style={card}>
          <h2>Balances</h2>

          <ul>
            {balancesSorted.map(([name, balance]) => (
              <li key={name} style={{ marginBottom: 8 }}>
                <strong>{name}</strong>
                <span style={badgeStyle(balance)}>
                  {balance === 0
                    ? "Está en paz"
                    : balance > 0
                    ? `Recibe ${formatMoney(balance)}`
                    : `Debe ${formatMoney(Math.abs(balance))}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* BUTTONS */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <button
            onClick={handleSettle}
            disabled={isSettled}
            style={btn("warning", isSettled)}
          >
            {isSettled ? "Grupo liquidado ✅" : "✅ Liquidar grupo"}
          </button>

          {isSettled && (
            <button onClick={handleReopen} style={btn("ghost", false)}>
              🔓 Reabrir grupo
            </button>
          )}

          {isSettled && (
            <div style={{ marginBottom: 24 }}>
              <button onClick={handleDeleteGroup} style={btn("danger", false)}>
                🗑️ Eliminar grupo
              </button>
            </div>
          )}
        </div>

        <div style={card}>
          <h2>Pagos sugeridos</h2>

          {settlements.length === 0 ? (
            <p>Todo está balanceado ✅</p>
          ) : (
            <ul>
              {settlements.map((p, idx) => (
                <li key={idx}>
                  <strong>{p.from}</strong> paga{" "}
                  <strong>{formatMoney(p.amount)}</strong> a{" "}
                  <strong>{p.to}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button onClick={() => navigate("/")} style={btn("ghost", false)}>
            ← Volver a Home
          </button>
        </div>
      </div>
    </div>
  );
}
