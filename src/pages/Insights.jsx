import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const formatMoney = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n) || 0
  );

function calculateBalances(group) {
  const balances = {};

  (group.members ?? []).forEach((m) => {
    balances[m] = 0;
  });

  (group.expenses ?? []).forEach((e) => {
    const split = e.splitBetween ?? [];
    if (split.length === 0) return;

    const amount = Number(e.amount) || 0;
    const share = amount / split.length;

    balances[e.paidBy] = (balances[e.paidBy] ?? 0) + amount;

    split.forEach((m) => {
      balances[m] = (balances[m] ?? 0) - share;
    });
  });

  return balances;
}

export default function Insights() {
  const groups = useSelector((state) => state.groups.list);
  const handleReset = () => {
    if (confirm("¿Seguro que quieres borrar todos los datos?")) {
      localStorage.removeItem("splitmate_state_v1");
      location.reload();
    }
  };

  // Totales por grupo + globales
  const perGroup = groups.map((g) => {
    const expenses = g.expenses ?? [];
    const totalSpent = expenses.reduce(
      (acc, e) => acc + (Number(e.amount) || 0),
      0
    );

    // pagado por persona dentro del grupo
    const paidBy = {};
    expenses.forEach((e) => {
      const payer = e.paidBy ?? "Desconocido";
      paidBy[payer] = (paidBy[payer] ?? 0) + (Number(e.amount) || 0);
    });

    const balances = calculateBalances(g);

    return {
      id: g.id,
      name: g.name,
      totalSpent,
      paidBy,
      balances,
      membersCount: (g.members ?? []).length,
      expensesCount: expenses.length,
    };
  });

  const globalTotal = perGroup.reduce((acc, g) => acc + g.totalSpent, 0);

  // Top payer global
  const globalPaidBy = {};
  perGroup.forEach((g) => {
    Object.entries(g.paidBy).forEach(([name, amount]) => {
      globalPaidBy[name] = (globalPaidBy[name] ?? 0) + (Number(amount) || 0);
    });
  });

  const topPayer =
    Object.entries(globalPaidBy).sort((a, b) => b[1] - a[1])[0] || null;

  // Balances globales (sumando balances de todos los grupos)
  const globalBalances = {};
  perGroup.forEach((g) => {
    Object.entries(g.balances).forEach(([name, bal]) => {
      globalBalances[name] = (globalBalances[name] ?? 0) + (Number(bal) || 0);
    });
  });

  const sortedBalances = Object.entries(globalBalances).sort(
    (a, b) => b[1] - a[1]
  );
  const mostReceives = sortedBalances.find(([, v]) => v > 0) || null;
  const mostOwes = [...sortedBalances].reverse().find(([, v]) => v < 0) || null;

  const linkBtn = (variant = "ghost") => {
    const variants = {
      ghost: {
        bg: "rgba(255,255,255,0.08)",
        color: "#E5E7EB",
        border: "rgba(255,255,255,0.14)",
      },
      danger: {
        bg: "rgba(239,68,68,0.16)",
        color: "#FCA5A5",
        border: "rgba(239,68,68,0.28)",
      },
    };

    const v = variants[variant] ?? variants.ghost;

    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 12px",
      borderRadius: 12,
      border: `1px solid ${v.border}`,
      background: v.bg,
      color: v.color,
      fontWeight: 900,
      textDecoration: "none", // ✅ adiós subrayado
      cursor: "pointer",
      userSelect: "none",
    };
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Insights</h1>
      <p>Resumen general de SplitMate</p>
      <button
        onClick={handleReset}
        style={{
          margin: "12px 0",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "#FFECEC",
          color: "#B00020",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Reset app (borrar todo)
      </button>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <div>
          <strong>Total global gastado:</strong> {formatMoney(globalTotal)}
        </div>

        <div>
          <strong>Quién pagó más:</strong>{" "}
          {topPayer ? `${topPayer[0]} (${formatMoney(topPayer[1])})` : "—"}
        </div>

        <div>
          <strong>Quién más recibe:</strong>{" "}
          {mostReceives
            ? `${mostReceives[0]} (${formatMoney(mostReceives[1])})`
            : "—"}
        </div>

        <div>
          <strong>Quién más debe:</strong>{" "}
          {mostOwes
            ? `${mostOwes[0]} (${formatMoney(Math.abs(mostOwes[1]))})`
            : "—"}
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h2>Grupos</h2>

      {perGroup.length === 0 ? (
        <p>No hay grupos todavía. Crea uno en Home.</p>
      ) : (
        <ul style={{ display: "grid", gap: 10 }}>
          {perGroup.map((g) => (
            <li
              key={g.id}
              style={{
                padding: 14,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.06)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.30)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <strong>{g.name}</strong>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Miembros: {g.membersCount} · Gastos: {g.expensesCount}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Total</div>
                  <div>
                    <strong>{formatMoney(g.totalSpent)}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <Link to={`/group/${g.id}`} style={linkBtn("ghost")}>
                  Ver detalle →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "16px 0" }} />

      <h2>Balances globales</h2>
      {sortedBalances.length === 0 ? (
        <p>Sin datos todavía.</p>
      ) : (
        <ul>
          {sortedBalances.map(([name, bal]) => (
            <li key={name}>
              {name}:{" "}
              {bal === 0
                ? "Está en paz"
                : bal > 0
                ? `Recibe ${formatMoney(bal)}`
                : `Debe ${formatMoney(Math.abs(bal))}`}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "16px 0" }} />
      <div style={{ marginTop: 14 }}>
        <Link to="/" style={linkBtn("ghost")}>
          ← Volver a Home
        </Link>
      </div>
    </div>
  );
}
