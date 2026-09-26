(() => {
  'use strict';

  const URL_SEGUIMIENTO = 'https://script.google.com/macros/s/AKfycbydvWB8q6EvafNemAr8YK53_7y-O5oWrpJPud9mf_JEOtqOzX0tjpC4JYO9vwsc1HOC/exec';
  const CLAVE_ULTIMO_REGISTRO = 'evaBrailleUltimoRegistroV1';
  const ESPERA_ENTRE_REGISTROS_MS = 30000;

  const panel = document.getElementById('panel-constancia');
  const nombre = document.getElementById('nombre-constancia');
  const campoNombre = document.getElementById('campo-nombre-opcional');
  const radiosIdentidad = [...document.querySelectorAll('input[name="identidad-constancia"]')];
  const consentimiento = document.getElementById('consentimiento-registro');
  const estadoRegistro = document.getElementById('estado-registro');
  const botonGenerar = document.getElementById('generar-constancia');
  const dialogo = document.getElementById('dialogo-constancia');
  const nombreFinal = document.getElementById('constancia-nombre');
  const codigoFinal = document.getElementById('constancia-codigo');
  const nivelFinal = document.getElementById('constancia-nivel');
  const total = document.getElementById('total-ejercicios');
  const aciertos = document.getElementById('aciertos');
  const errores = document.getElementById('errores');
  const pistasRestantes = document.getElementById('pistas-restantes');
  const etiquetaNivel = document.getElementById('etiqueta-nivel');
  const nombreNivelSeleccionado = document.getElementById('nombre-nivel-seleccionado');

  const footerFinal = document.querySelector('.footer-final');
  if (footerFinal) {
    footerFinal.innerHTML = '<p>© 2026 Gabriel Berrospi. Desarrollo original. Uso institucional autorizado al CREBE "Señor de los Milagros" - Ucayali.</p>';
  }

  if (!panel || !botonGenerar || !dialogo) return;

  function limpiarTexto(valor, maximo) {
    return String(valor ?? '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maximo);
  }

  function protegerParaHoja(valor, maximo) {
    const texto = limpiarTexto(valor, maximo);
    return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  }

  function numeroSeguro(valor, minimo, maximo, respaldo = 0) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return respaldo;
    return Math.min(maximo, Math.max(minimo, Math.round(numero)));
  }

  function leerUltimoRegistro() {
    try { return Number(localStorage.getItem(CLAVE_ULTIMO_REGISTRO) || 0); }
    catch (error) { return 0; }
  }

  function guardarUltimoRegistro() {
    try { localStorage.setItem(CLAVE_ULTIMO_REGISTRO, String(Date.now())); }
    catch (error) { /* Continúa sin persistencia. */ }
  }

  function puedeRegistrarAhora() {
    const ultimo = leerUltimoRegistro();
    return !ultimo || Date.now() - ultimo >= ESPERA_ENTRE_REGISTROS_MS;
  }

  function insertarEnlacePrivacidad() {
    const aviso = panel.querySelector('.aviso-privacidad');
    if (!aviso || aviso.querySelector('a')) return;
    aviso.append(' ');
    const enlace = document.createElement('a');
    enlace.href = '../paginas/privacidad-seguimiento-braille.html';
    enlace.textContent = 'Consulta el aviso de privacidad del seguimiento Braille.';
    enlace.setAttribute('aria-label', 'Consultar el aviso de privacidad del seguimiento de las prácticas Braille');
    aviso.appendChild(enlace);
  }

  function fragmentoAleatorio() {
    if (window.crypto?.getRandomValues) {
      const valores = new Uint32Array(2);
      window.crypto.getRandomValues(valores);
      return Array.from(valores, valor => valor.toString(36)).join('').slice(0, 10).toUpperCase();
    }
    return Math.random().toString(36).slice(2, 12).toUpperCase();
  }

  function obtenerUsuarioAnonimo() {
    const clave = 'evaBrailleUsuario';
    let usuario = '';
    try { usuario = localStorage.getItem(clave) || ''; }
    catch (error) { usuario = ''; }

    usuario = limpiarTexto(usuario, 50);
    if (!/^EVA-BR-[A-Z0-9]+$/.test(usuario)) {
      usuario = `EVA-BR-${fragmentoAleatorio().slice(0, 10)}`;
      try { localStorage.setItem(clave, usuario); }
      catch (error) { /* Continúa sin persistencia. */ }
    }
    return usuario;
  }

  function dispositivo() {
    return window.matchMedia('(max-width: 768px)').matches ? 'Móvil' : 'Escritorio';
  }

  function identidadSeleccionada() {
    return radiosIdentidad.find(radio => radio.checked)?.value || 'anonimo';
  }

  function actualizarIdentidad() {
    const usaNombre = identidadSeleccionada() === 'nombre';
    campoNombre.hidden = !usaNombre;
    if (!usaNombre) {
      nombre.value = '';
      nombre.setCustomValidity('');
    }
  }

  function pistasUsadasEstimadas() {
    const texto = pistasRestantes?.textContent || '';
    const coincidencia = texto.match(/\d+/);
    if (!coincidencia) return 0;
    const restantes = numeroSeguro(coincidencia[0], 0, 20, 0);
    const nivel = (etiquetaNivel?.textContent || '').toLowerCase();
    const maximo = nivel.includes('intermedio') || nivel.includes('personalizada') ? 3 : 0;
    return Math.max(0, maximo - restantes);
  }

  async function registrar(datos) {
    if (!puedeRegistrarAhora()) {
      estadoRegistro.textContent = 'La constancia se generó. Para evitar registros duplicados, espera unos segundos antes de enviar otro resultado.';
      return false;
    }

    estadoRegistro.textContent = 'Registrando resultado…';
    try {
      await fetch(URL_SEGUIMIENTO, {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'strict-origin-when-cross-origin',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datos)
      });
      guardarUltimoRegistro();
      estadoRegistro.textContent = 'Resultado enviado para procesamiento estadístico.';
      return true;
    } catch (error) {
      estadoRegistro.textContent = 'La constancia se generó, pero el registro estadístico no pudo enviarse.';
      return false;
    }
  }

  radiosIdentidad.forEach(radio => radio.addEventListener('change', actualizarIdentidad));
  insertarEnlacePrivacidad();
  actualizarIdentidad();

  botonGenerar.addEventListener('click', () => {
    const usaNombre = identidadSeleccionada() === 'nombre';
    const usuario = obtenerUsuarioAnonimo();
    const participante = usaNombre ? limpiarTexto(nombre?.value, 80) : `Usuario ${usuario}`;

    if (usaNombre && !participante) {
      nombre?.focus();
      nombre?.setCustomValidity('Escribe el nombre que deseas mostrar.');
      nombre?.reportValidity();
      return;
    }

    nombre?.setCustomValidity('');
    if (usaNombre && nombre) nombre.value = participante;

    window.setTimeout(() => {
      if (dialogo.open && !usaNombre) nombreFinal.textContent = participante;

      const codigo = limpiarTexto(codigoFinal?.textContent || '', 80);
      const totalEjercicios = numeroSeguro(total?.textContent, 1, 100, 10);
      const aciertosPrimerIntento = numeroSeguro(aciertos?.textContent, 0, totalEjercicios, 0);
      const erroresRegistrados = numeroSeguro(errores?.textContent, 0, 500, 0);
      const porcentaje = totalEjercicios > 0
        ? numeroSeguro((aciertosPrimerIntento / totalEjercicios) * 100, 0, 100, 0)
        : 0;
      const nivel = limpiarTexto(
        nivelFinal?.textContent || etiquetaNivel?.textContent || nombreNivelSeleccionado?.textContent || 'Nivel no identificado',
        120
      );

      if (consentimiento.checked && dialogo.open) {
        registrar({
          consentimientoRegistro: true,
          usuario: protegerParaHoja(usuario, 50),
          tipoUsuario: usaNombre ? 'nominal' : 'anonimo',
          consentimientoNombre: usaNombre,
          nombre: usaNombre ? protegerParaHoja(participante, 80) : '',
          modalidad: 'Práctica Braille por niveles',
          nivel: protegerParaHoja(nivel, 120),
          actividadIniciada: true,
          actividadCompletada: true,
          ejercicios: totalEjercicios,
          aciertosPrimerIntento,
          errores: erroresRegistrados,
          pistasUtilizadas: numeroSeguro(pistasUsadasEstimadas(), 0, 20, 0),
          porcentaje,
          constanciaGenerada: true,
          codigoConstancia: protegerParaHoja(codigo, 80),
          dispositivo: dispositivo()
        });
      } else if (dialogo.open) {
        estadoRegistro.textContent = 'Constancia generada sin registrar datos de uso.';
      }
    }, 0);
  });

  nombre?.addEventListener('input', () => nombre.setCustomValidity(''));
})();
