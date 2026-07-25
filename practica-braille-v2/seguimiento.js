(() => {
  'use strict';

  const URL_SEGUIMIENTO = 'https://script.google.com/macros/s/AKfycbydvWB8q6EvafNemAr8YK53_7y-O5oWrpJPud9mf_JEOtqOzX0tjpC4JYO9vwsc1HOC/exec';
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
    const restantes = Number(coincidencia[0]);
    const nivel = (etiquetaNivel?.textContent || '').toLowerCase();
    const maximo = nivel.includes('intermedio') || nivel.includes('personalizada') ? 3 : 0;
    return Math.max(0, maximo - restantes);
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

  radiosIdentidad.forEach(radio => radio.addEventListener('change', actualizarIdentidad));
  insertarEnlacePrivacidad();
  actualizarIdentidad();

  botonGenerar.addEventListener('click', () => {
    const usaNombre = identidadSeleccionada() === 'nombre';
    const usuario = obtenerUsuarioAnonimo();
    const participante = usaNombre ? nombre.value.trim() : `Usuario ${usuario}`;

    if (usaNombre && !participante) return;

    window.setTimeout(() => {
      if (dialogo.open && !usaNombre) nombreFinal.textContent = participante;
      const codigo = codigoFinal?.textContent || '';
      const totalEjercicios = Number(total?.textContent || 0);
      const aciertosPrimerIntento = Number(aciertos?.textContent || 0);
      const porcentaje = totalEjercicios > 0 ? Math.round((aciertosPrimerIntento / totalEjercicios) * 100) : 0;
      const nivel = nivelFinal?.textContent || etiquetaNivel?.textContent || nombreNivelSeleccionado?.textContent || 'Nivel no identificado';

      if (consentimiento.checked && dialogo.open) {
        registrar({
          consentimientoRegistro: true,
          usuario,
          tipoUsuario: usaNombre ? 'nominal' : 'anonimo',
          consentimientoNombre: usaNombre,
          nombre: usaNombre ? participante : '',
          modalidad: 'Práctica Braille por niveles',
          nivel,
          actividadIniciada: true,
          actividadCompletada: true,
          ejercicios: totalEjercicios,
          aciertosPrimerIntento,
          errores: Number(errores?.textContent || 0),
          pistasUtilizadas: pistasUsadasEstimadas(),
          porcentaje,
          constanciaGenerada: true,
          codigoConstancia: codigo,
          dispositivo: dispositivo()
        });
      } else if (dialogo.open) {
        estadoRegistro.textContent = 'Constancia generada sin registrar datos de uso.';
      }
    }, 0);
  });
})();
