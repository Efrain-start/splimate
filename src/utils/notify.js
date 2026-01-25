export async function ensureNotificationPermission() {
  if (!("Notification" in window)) {
    return { ok: false, reason: "Este navegador no soporta notificaciones." };
  }

  if (Notification.permission === "granted") {
    return { ok: true };
  }

  if (Notification.permission === "denied") {
    return { ok: false, reason: "Notificaciones bloqueadas en el navegador." };
  }

  const res = await Notification.requestPermission();
  return res === "granted"
    ? { ok: true }
    : { ok: false, reason: "Permiso no concedido." };
}

export function showNotification(title, options = {}) {
  try {
    new Notification(title, options);
  } catch (e) {
    console.error("Notification error:", e);
  }
}
