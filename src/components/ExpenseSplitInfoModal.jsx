// src/components/ExpenseSplitInfoModal.jsx
import { useMemo } from "react";
import { formatMoney } from "../utils/balances";

export default function ExpenseSplitInfoModal({
  open,
  onClose,
  expense,
  members = [],
  currentUser = "",
}) {
  const safeMembers = Array.isArray(members) ? members : [];

  const data = useMemo(() => {
    const amount = Number(expense?.amount) || 0;
    const paidBy = String(expense?.paidBy || "");
    const split = Array.isArray(expense?.splitBetween)
      ? expense.splitBetween.map((x) => String(x))
      : [];

    const splitCount = split.length || 1;
    const share = amount / splitCount;

    // quiénes deben al que pagó (solo los que están en split y no son paidBy)
    const oweToPayer = split.filter((m) => m !== paidBy);

    // si paidBy está en split => “partes iguales incluyéndolo”
    const isEqualAll =
      split.length > 0 &&
      safeMembers.length > 0 &&
      split.length === safeMembers.length;

    const isEqualBetweenSelected = split.includes(paidBy);

    // si split = [alguien] y paidBy NO está incluido => esa persona debe TODO
    const isTotalToOne = split.length === 1 && split[0] !== paidBy;

    // Perspectiva del usuario actual (currentUser)
    const youPaid = paidBy === currentUser;
    const youInSplit = split.includes(currentUser);

    // Mensajes “tipo Splitwise”
    const lines = [];

    if (!amount || !paidBy) {
      return {
        title: "¿Cómo se dividió este gasto?",
        lines: [{ text: "No hay datos suficientes para mostrar el split." }],
        selectedKey: "none",
      };
    }

    // --- Caso 2 personas (como tu screenshot) ---
    // Vamos a detectar “otro” si solo hay 2 miembros
    const other =
      safeMembers.length === 2
        ? safeMembers.find((m) => m !== currentUser) || ""
        : "";

    const optionEqualKey =
      youPaid ? "youPaidEqual" : "otherPaidEqual";
    const optionTotalKey =
      youPaid ? "youPaidTotal" : "otherPaidTotal";

    // Determinar cuál opción está “seleccionada” según el split actual
    let selectedKey = "custom";
    if (youPaid) {
      if (isEqualBetweenSelected && youInSplit) selectedKey = "youPaidEqual";
      if (isTotalToOne && split[0] !== paidBy) selectedKey = "youPaidTotal";
    } else {
      if (youInSplit && isEqualBetweenSelected) selectedKey = "otherPaidEqual";
      if (isTotalToOne && split[0] === currentUser) selectedKey = "otherPaidTotal";
    }

    // Construye textos tipo Splitwise:
    // 1) Tú pagaste, dividido a partes iguales. X te debe $share
    // 2) Se te debe la cantidad total. X te debe $amount
    // 3) X pagó, dividido a partes iguales. Debes a X $share
    // 4) A X se le debe la cantidad total. Debes a X $amount
    if (safeMembers.length === 2 && other) {
      if (youPaid) {
        lines.push({
          key: "youPaidEqual",
          title: "Tú pagaste, dividido a partes iguales.",
          sub: `${other} te debe ${formatMoney(share)}`,
          selected: selectedKey === "youPaidEqual",
        });

        lines.push({
          key: "youPaidTotal",
          title: "Se te debe la cantidad total.",
          sub: `${other} te debe ${formatMoney(amount)}`,
          selected: selectedKey === "youPaidTotal",
        });
      } else {
        lines.push({
          key: "otherPaidEqual",
          title: `${paidBy} pagó, dividido a partes iguales.`,
          sub: `Debes a ${paidBy} ${formatMoney(share)}`,
          selected: selectedKey === "otherPaidEqual",
          danger: true,
        });

        lines.push({
          key: "otherPaidTotal",
          title: `A ${paidBy} se le debe la cantidad total.`,
          sub: `Debes a ${paidBy} ${formatMoney(amount)}`,
          selected: selectedKey === "otherPaidTotal",
          danger: true,
        });
      }

      return { title: "¿Cómo se dividió este gasto?", lines, selectedKey };
    }

    // --- Caso general (3+ miembros) ---
    // Mostramos un resumen
    if (youPaid) {
      if (isEqualAll) {
        lines.push({
          key: optionEqualKey,
          title: "Tú pagaste, dividido en partes iguales entre todos.",
          sub: oweToPayer.length
            ? oweToPayer
                .map((m) => `${m} te debe ${formatMoney(share)}`)
                .join(" · ")
            : "Nadie te debe (split vacío o raro).",
          selected: selectedKey === optionEqualKey,
        });
      } else if (isTotalToOne) {
        lines.push({
          key: optionTotalKey,
          title: "Se te debe la cantidad total.",
          sub: `${split[0]} te debe ${formatMoney(amount)}`,
          selected: selectedKey === optionTotalKey,
        });
      } else {
        // split personalizado
        lines.push({
          key: "custom",
          title: "Split personalizado.",
          sub: split.length
            ? `Se dividió entre: ${split.join(", ")}`
            : "No hay split seleccionado.",
          selected: selectedKey === "custom",
        });
      }
    } else {
      // pagó otra persona
      if (split.includes(currentUser)) {
        // tú participaste
        if (isEqualBetweenSelected) {
          lines.push({
            key: optionEqualKey,
            title: `${paidBy} pagó, dividido en partes iguales.`,
            sub: `Debes a ${paidBy} ${formatMoney(share)}`,
            selected: selectedKey === optionEqualKey,
            danger: true,
          });
        } else {
          lines.push({
            key: "custom",
            title: `${paidBy} pagó, split personalizado.`,
            sub: `Participaste en: ${split.join(", ")} · Tu parte aprox: ${formatMoney(share)}`,
            selected: selectedKey === "custom",
            danger: true,
          });
        }
      } else {
        // tú no participaste
        lines.push({
          key: "notInSplit",
          title: "No participaste en este gasto.",
          sub: `Se dividió entre: ${split.join(", ") || "—"}`,
          selected: selectedKey === "notInSplit",
        });
      }
    }

    return { title: "¿Cómo se dividió este gasto?", lines, selectedKey };
  }, [expense, safeMembers, currentUser]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          marginTop: 24,
          borderRadius: 18,
          overflow: "hidden",
          background: "#0B1220",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
          color: "#E5E7EB",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#E5E7EB",
              fontWeight: 900,
              cursor: "pointer",
            }}
            aria-label="Cerrar"
          >
            ←
          </button>

          <div style={{ fontWeight: 900, fontSize: 18 }}>{data.title}</div>
        </div>

        {/* Body */}
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
          {data.lines.map((item) => (
            <div
              key={item.key}
              style={{
                padding: 14,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 900, opacity: 0.95 }}>
                  {item.title}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontWeight: 900,
                    color: item.danger ? "#FCA5A5" : "#86EFAC",
                  }}
                >
                  {item.sub}
                </div>
              </div>

              {item.selected && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontWeight: 900,
                  }}
                  aria-label="Seleccionado"
                >
                  ✓
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            style={{
              marginTop: 6,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#E5E7EB",
              fontWeight: 900,
              cursor: "pointer",
            }}
            onClick={() => alert("Más opciones (después lo conectamos a editar split)")}
          >
            Más opciones
          </button>
        </div>
      </div>
    </div>
  );
}
