(() => {
  "use strict";
  // Métricas de uso de recursos: sin contenido pedagógico ni identificadores de usuario.
  const ENDPOINT = "https://dteimbhwtzghhsijeeld.supabase.co/rest/v1/rpc/registrar_accion_recurso_mea";
  const KEY = "sb_publishable_tHbo1jTeW_dC90hdA5DvyQ_a6LrfKpq";
  const PERMITIDOS = new Set([
    "pictogramas:png:descarga_solicitada",
    "rutinas:jpg:exportacion_iniciada",
    "rutinas:pdf:exportacion_iniciada",
    "braille:pdf:exportacion_iniciada",
    "dactilologia_lsp:pdf:exportacion_iniciada",
    "apoyos_lsp:pdf:exportacion_iniciada",
    "conciencia_fonologica:html:exportacion_iniciada"
  ]);
  function registrar(herramienta, formato, accion) {
    if (!PERMITIDOS.has(herramienta + ":" + formato + ":" + accion)) return;
    if (!globalThis.crypto || typeof crypto.randomUUID !== "function") return;
    const body = JSON.stringify({
      p_evento_id: crypto.randomUUID(),
      p_herramienta: herramienta, p_formato: formato, p_accion: accion
    });
    try {
      // La descarga debe funcionar aunque fallen la red o las estadísticas.
      void fetch(ENDPOINT, {
        method: "POST", mode: "cors", credentials: "omit", cache: "no-store",
        keepalive: true, headers: { apikey: KEY, "Content-Type": "application/json" },
        body
      }).catch(() => {});
    } catch { /* La telemetría es complementaria. */ }
  }
  Object.defineProperty(window, "EVARecursos", {
    configurable: false, enumerable: false, writable: false,
    value: Object.freeze({ registrar })
  });
})();
