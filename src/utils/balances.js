// src/utils/balances.js

export function calculateBalances(group) {
  const balances = {};

  // Inicializar balances en 0
  (group?.members ?? []).forEach((m) => {
    balances[m] = 0;
  });

  (group?.expenses ?? []).forEach((e) => {
    const split = e.splitBetween ?? [];
    if (split.length === 0) return;

    const amount = Number(e.amount) || 0;
    const share = amount / split.length;

    // quien pagó recibe el total
    balances[e.paidBy] = (balances[e.paidBy] ?? 0) + amount;

    // cada participante debe su parte
    split.forEach((m) => {
      balances[m] = (balances[m] ?? 0) - share;
    });
  });

  return balances;
}

export function settleBalances(balances) {
  const creditors = [];
  const debtors = [];

  Object.entries(balances ?? {}).forEach(([name, amount]) => {
    const v = Number(amount) || 0;
    if (v > 0) creditors.push({ name, amount: v });
    if (v < 0) debtors.push({ name, amount: -v }); // deuda en positivo
  });

  const payments = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];

    const pay = Math.min(d.amount, c.amount);

    payments.push({ from: d.name, to: c.name, amount: pay });

    d.amount -= pay;
    c.amount -= pay;

    if (d.amount < 0.01) i++;
    if (c.amount < 0.01) j++;
  }

  return payments;
}

export function formatMoney(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(n) || 0);
}
