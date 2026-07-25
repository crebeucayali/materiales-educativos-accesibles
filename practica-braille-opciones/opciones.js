document.addEventListener("DOMContentLoaded", () => {
  const footerFinal = document.querySelector(".footer-final");
  if (footerFinal) {
    footerFinal.innerHTML = '<p>© 2026 Gabriel Berrospi. Desarrollo original. Uso institucional autorizado al CREBE "Señor de los Milagros" - Ucayali.</p>';
  }

  const acordeon = document.querySelector("[data-acordeon-unico]");

  if (!acordeon) {
    return;
  }

  const secciones = Array.from(acordeon.querySelectorAll("details"));

  secciones.forEach((seccion) => {
    seccion.addEventListener("toggle", () => {
      if (!seccion.open) {
        return;
      }

      secciones.forEach((otraSeccion) => {
        if (otraSeccion !== seccion) {
          otraSeccion.open = false;
        }
      });
    });
  });
});
