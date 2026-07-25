(() => {
  'use strict';

  const URL_SEGUIMIENTO = 'https://script.google.com/macros/s/AKfycbydvWB8q6EvafNemAr8YK53_7y-O5oWrpJPud9mf_JEOtqOzX0tjpC4JYO9vwsc1HOC/exec';
  const resultado = document.getElementById('resultado');
  const aciertos = document.getElementById('aciertos');
  const total = document.getElementById('total-ejercicios');
  const panel = document.getElementById('panel-constancia');
  const nombre = document.getElementById('nombre-constancia');
  const campoNombre = document.getElementById('campo-nombre-opcional');
  const radiosIdentidad = [...document.querySelectorAll('input[name="identidad-constancia"]')];
  const consentimiento = document.getElementById('consentimiento-registro');
  const estadoRegistro = document.getElementById('estado-registro');
  const botonGenerar = document.getElementById('generar-constancia');
  const dialogo = document.getElementById('dialogo-constancia');
  const nombreFinal = document.getElementById('constancia-nombre');
  const fechaFinal = document.getElementById('constancia-fecha');
  const codigoFinal = document.getElementById('constancia-codigo');
  const cerrar = document.getElementById('cerrar-constancia');
  const imprimir = document.getElementById('imprimir-constancia');

  const footerFinal = document.querySelector('.footer-final');
  if (footerFinal) {
    footerFinal.innerHTML = '<p>© 2026 Gabriel Berrospi. Desarrollo original. Uso institucional autorizado al CREBE "Señor de los Milagros" - Ucayali.</p>';
  }

  if (!resultado || !panel || !botonGenerar || !dialogo) return;

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

  function generarCodigo() {
    const fecha = new Date();
    const sello = fecha.toISOString().slice(0, 10).replaceAll('-', '');
    const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `MEA-BRAILLE-${sello}-${aleatorio}`;
  }

  function obtenerUsuarioAnonimo() {
    const clave = 'evaBrailleUsuario';
    let usuario = localStorage.getItem(clave);
    if (!usuario) {
      usuario = `EVA-BR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      localStorage.setItem(clave, usuario);
    }
    return usuario;
  }

  function dispositivo() {
    return window.matchMedia('(max-width: 768px)').matches ? 'Móvil' : 'Escritorio';
  }

  function revisarFinalizacion() {
    const completo = resultado.textContent.includes('Actividad completada');
    const puntajePerfecto = Number(aciertos?.textContent || 0) === Number(total?.textContent || 0);
    panel.hidden = !(completo && puntajePerfecto);
    if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  async function registrar(datos) {
    estadoRegistro.textContent = 'Registrando resultado…';
    try {
      await fetch(URL_SEGUIMIENTO, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datos)
      });
      estadoRegistro.textContent = 'Se realizó el intento de envío del resultado para seguimiento educativo.';
    } catch (error) {
      estadoRegistro.textContent = 'La constancia se generó, pero el registro estadístico no pudo enviarse.';
    }
  }

  const observador = new MutationObserver(revisarFinalizacion);
  observador.observe(resultado, { childList: true, subtree: true, characterData: true });
  radiosIdentidad.forEach(radio => radio.addEventListener('change', actualizarIdentidad));
  insertarEnlacePrivacidad();
  actualizarIdentidad();

  botonGenerar.addEventListener('click', () => {
    const usaNombre = identidadSeleccionada() === 'nombre';
    const usuario = obtenerUsuarioAnonimo();
    const participante = usaNombre ? nombre.value.trim() : `Usuario ${usuario}`;

    if (usaNombre && !participante) {
      nombre.focus();
      nombre.setCustomValidity('Escribe el nombre que deseas mostrar.');
      nombre.reportValidity();
      return;
    }

    nombre.setCustomValidity('');
    const codigo = generarCodigo();
    nombreFinal.textContent = participante;
    fechaFinal.textContent = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date());
    codigoFinal.textContent = codigo;
    dialogo.showModal();

    if (consentimiento.checked) {
      registrar({
        consentimientoRegistro: true,
        usuario,
        tipoUsuario: usaNombre ? 'nominal' : 'anonimo',
        consentimientoNombre: usaNombre,
        nombre: usaNombre ? participante : '',
        modalidad: 'Práctica Braille básica',
        nivel: 'Inicial',
        actividadIniciada: true,
        actividadCompletada: true,
        ejercicios: Number(total?.textContent || 10),
        aciertosPrimerIntento: Number(aciertos?.textContent || 10),
        errores: 0,
        pistasUtilizadas: 0,
        porcentaje: 100,
        constanciaGenerada: true,
        codigoConstancia: codigo,
        dispositivo: dispositivo()
      });
    } else {
      estadoRegistro.textContent = 'Constancia generada sin registrar datos de uso.';
    }
  });

  nombre.addEventListener('input', () => nombre.setCustomValidity(''));
  cerrar.addEventListener('click', () => dialogo.close());
  imprimir.addEventListener('click', () => window.print());
  dialogo.addEventListener('click', evento => {
    if (evento.target === dialogo) dialogo.close();
  });
})();
