(() => {
  'use strict';

  const ejercicios = [
    { letra: 'A', puntos: [1] }, { letra: 'B', puntos: [1,2] },
    { letra: 'C', puntos: [1,4] }, { letra: 'D', puntos: [1,4,5] },
    { letra: 'E', puntos: [1,5] }, { letra: 'F', puntos: [1,2,4] },
    { letra: 'G', puntos: [1,2,4,5] }, { letra: 'H', puntos: [1,2,5] },
    { letra: 'I', puntos: [2,4] }, { letra: 'J', puntos: [2,4,5] }
  ];

  const radiosModo = [...document.querySelectorAll('input[name="modo"]')];
  const radiosTipo = [...document.querySelectorAll('input[name="tipo"]')];
  const interruptorAyuda = document.getElementById('interruptor-ayuda');
  const interruptorNumeros = document.getElementById('interruptor-numeros');
  const estadoAyuda = document.getElementById('estado-ayuda');
  const estadoNumeros = document.getElementById('estado-numeros');
  const descripcionAyuda = document.getElementById('descripcion-ayuda');
  const descripcionNumeros = document.getElementById('descripcion-numeros');
  const controlAyuda = document.getElementById('control-ayuda');
  const controlNumeros = document.getElementById('control-numeros');
  const tituloPractica = document.getElementById('titulo-practica');
  const instruccion = document.getElementById('instruccion');
  const numeroEjercicio = document.getElementById('numero-ejercicio');
  const totalEjercicios = document.getElementById('total-ejercicios');
  const aciertosElemento = document.getElementById('aciertos');
  const letraObjetivo = document.getElementById('letra-objetivo');
  const opcionesLetras = document.getElementById('opciones-letras');
  const signoPrincipal = document.getElementById('signo-principal');
  const opcionesSignos = document.getElementById('opciones-signos');
  const etiquetaIzquierda = document.getElementById('etiqueta-panel-izquierdo');
  const tituloIzquierda = document.getElementById('titulo-panel-izquierdo');
  const etiquetaDerecha = document.getElementById('etiqueta-panel-derecho');
  const tituloDerecha = document.getElementById('titulo-panel-derecho');
  const tituloOrientacion = document.getElementById('titulo-orientacion');
  const textoOrientacion = document.getElementById('texto-orientacion');
  const avisoOrientacion = document.getElementById('aviso-orientacion');
  const ayudaReto = document.getElementById('titulo-reto');
  const contenedorPista = document.getElementById('contenedor-pista');
  const mensajeSinAyuda = document.getElementById('mensaje-sin-ayuda');
  const botonPista = document.getElementById('boton-pista');
  const botonComprobar = document.getElementById('boton-comprobar');
  const botonSiguiente = document.getElementById('boton-siguiente');
  const resultado = document.getElementById('resultado');

  let modo = 'lectura';
  let tipo = 'signo-letra';
  let indice = 0;
  let aciertos = 0;
  let seleccion = '';
  let respuestaCorrecta = false;
  let ayudaActiva = true;
  let numerosVisibles = true;

  totalEjercicios.textContent = String(ejercicios.length);

  function mezclar(lista) {
    return [...lista].sort(() => Math.random() - 0.5);
  }

  function orientacionActual() {
    return modo === 'escritura' ? 'regleta' : 'lectura';
  }

  function obtenerOpciones() {
    const objetivo = ejercicios[indice];
    const conjunto = new Set([objetivo.letra]);
    let salto = 1;
    while (conjunto.size < 4) {
      conjunto.add(ejercicios[(indice + salto * 3) % ejercicios.length].letra);
      salto += 1;
    }
    return mezclar([...conjunto]).map(letra => ejercicios.find(item => item.letra === letra));
  }

  function crearCelda(puntosActivos, pequena = false) {
    const orientacion = orientacionActual();
    const celda = document.createElement('div');
    celda.className = `mini-celda ${orientacion === 'regleta' ? 'modo-regleta' : 'modo-lectura'}${pequena ? ' pequena' : ''}${numerosVisibles ? '' : ' sin-numeros'}`;
    celda.setAttribute('aria-hidden', 'true');
    const orden = orientacion === 'regleta' ? [4,1,5,2,6,3] : [1,4,2,5,3,6];
    orden.forEach(numero => {
      const punto = document.createElement('span');
      punto.className = puntosActivos.includes(numero) ? 'mini-punto activo' : 'mini-punto';
      punto.innerHTML = `<span>${numero}</span>`;
      celda.appendChild(punto);
    });
    return celda;
  }

  function seleccionarBoton(contenedor, boton, valor) {
    [...contenedor.querySelectorAll('button')].forEach(item => item.setAttribute('aria-pressed', 'false'));
    boton.setAttribute('aria-pressed', 'true');
    seleccion = valor;
  }

  function renderSignoALetra() {
    const ejercicio = ejercicios[indice];
    letraObjetivo.hidden = true;
    opcionesLetras.hidden = false;
    signoPrincipal.hidden = false;
    opcionesSignos.hidden = true;
    opcionesLetras.innerHTML = '';
    signoPrincipal.innerHTML = '';
    signoPrincipal.appendChild(crearCelda(ejercicio.puntos));

    obtenerOpciones().forEach(opcion => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'opcion-letra';
      boton.textContent = opcion.letra;
      boton.setAttribute('aria-pressed', 'false');
      boton.addEventListener('click', () => seleccionarBoton(opcionesLetras, boton, opcion.letra));
      opcionesLetras.appendChild(boton);
    });
  }

  function renderLetraASigno() {
    const ejercicio = ejercicios[indice];
    letraObjetivo.hidden = false;
    letraObjetivo.textContent = ejercicio.letra;
    opcionesLetras.hidden = true;
    signoPrincipal.hidden = true;
    opcionesSignos.hidden = false;
    opcionesSignos.innerHTML = '';

    obtenerOpciones().forEach(opcion => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'opcion-signo';
      boton.setAttribute('aria-pressed', 'false');
      boton.setAttribute('aria-label', `Opción de signo Braille para la letra ${opcion.letra} en orientación de ${modo === 'escritura' ? 'regleta' : 'lectura'}`);
      boton.appendChild(crearCelda(opcion.puntos, true));
      boton.addEventListener('click', () => seleccionarBoton(opcionesSignos, boton, opcion.letra));
      opcionesSignos.appendChild(boton);
    });
  }

  function actualizarOrientacion() {
    const escritura = modo === 'escritura';
    avisoOrientacion.classList.toggle('orientacion-regleta', escritura);
    tituloOrientacion.textContent = escritura ? 'Orientación de escritura en regleta' : 'Orientación de lectura';
    textoOrientacion.textContent = escritura
      ? 'Todas las celdas se muestran invertidas: 4, 5 y 6 a la izquierda; 1, 2 y 3 a la derecha.'
      : 'Todas las celdas se muestran en lectura normal: 1, 2 y 3 a la izquierda; 4, 5 y 6 a la derecha.';
  }

  function mostrarEjercicio() {
    seleccion = '';
    respuestaCorrecta = false;
    numeroEjercicio.textContent = String(indice + 1);
    botonComprobar.disabled = false;
    botonSiguiente.disabled = true;
    actualizarOrientacion();

    const prefijo = modo === 'escritura' ? 'Escritura en regleta' : 'Lectura';

    if (tipo === 'signo-letra') {
      tituloPractica.textContent = `${prefijo}: signo a letra`;
      instruccion.textContent = modo === 'escritura'
        ? 'Observa el signo en orientación de regleta y selecciona la letra que representa.'
        : 'Observa el signo en orientación de lectura y selecciona la letra que representa.';
      etiquetaIzquierda.textContent = 'Opciones de letras';
      tituloIzquierda.textContent = 'Elige la letra correcta';
      etiquetaDerecha.textContent = modo === 'escritura' ? 'Signo invertido a identificar' : 'Signo a identificar';
      tituloDerecha.textContent = modo === 'escritura' ? 'Observa el signo en regleta' : 'Observa el signo Braille';
      ayudaReto.textContent = 'Relaciona el signo con una de las letras disponibles.';
      renderSignoALetra();
    } else {
      tituloPractica.textContent = `${prefijo}: letra a signo`;
      instruccion.textContent = modo === 'escritura'
        ? 'Observa la letra y selecciona el signo que debe punzarse en orientación de regleta.'
        : 'Observa la letra y selecciona su signo en orientación normal de lectura.';
      etiquetaIzquierda.textContent = 'Letra determinada';
      tituloIzquierda.textContent = 'Letra a representar';
      etiquetaDerecha.textContent = modo === 'escritura' ? 'Opciones de signos invertidos' : 'Opciones de signos';
      tituloDerecha.textContent = 'Elige el signo correcto';
      ayudaReto.textContent = modo === 'escritura'
        ? 'Selecciona la celda invertida que corresponde a la letra mostrada.'
        : 'Selecciona la celda en lectura normal que corresponde a la letra mostrada.';
      renderLetraASigno();
    }

    resultado.className = 'resultado';
    resultado.textContent = ayudaActiva ? 'Selecciona una respuesta. Puedes usar una pista.' : 'Selecciona una respuesta sin ayuda.';
  }

  function actualizarAyuda(anunciar = true) {
    ayudaActiva = interruptorAyuda.checked;
    estadoAyuda.textContent = ayudaActiva ? 'Activada' : 'Desactivada';
    descripcionAyuda.textContent = ayudaActiva ? 'Las pistas están disponibles.' : 'Las pistas están ocultas.';
    controlAyuda.classList.toggle('ayuda-encendida', ayudaActiva);
    controlAyuda.classList.toggle('ayuda-apagada', !ayudaActiva);
    contenedorPista.hidden = !ayudaActiva;
    mensajeSinAyuda.hidden = ayudaActiva;
    if (!ayudaActiva && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    if (anunciar) resultado.textContent = ayudaActiva ? 'Ayuda activada.' : 'Ayuda desactivada.';
  }

  function actualizarNumeros(anunciar = true) {
    numerosVisibles = interruptorNumeros.checked;
    estadoNumeros.textContent = numerosVisibles ? 'Visible' : 'Oculta';
    descripcionNumeros.textContent = numerosVisibles ? 'Los números están visibles.' : 'Los números están ocultos para aumentar la complejidad.';
    controlNumeros.classList.toggle('numeros-encendidos', numerosVisibles);
    controlNumeros.classList.toggle('numeros-apagados', !numerosVisibles);
    document.querySelectorAll('.mini-celda').forEach(celda => celda.classList.toggle('sin-numeros', !numerosVisibles));
    if (anunciar) resultado.textContent = numerosVisibles ? 'Numeración visible.' : 'Numeración oculta.';
  }

  function reiniciarConfiguracion() {
    indice = 0;
    aciertos = 0;
    aciertosElemento.textContent = '0';
    mostrarEjercicio();
  }

  radiosModo.forEach(radio => radio.addEventListener('change', () => {
    if (radio.checked) {
      modo = radio.value;
      reiniciarConfiguracion();
    }
  }));

  radiosTipo.forEach(radio => radio.addEventListener('change', () => {
    if (radio.checked) {
      tipo = radio.value;
      reiniciarConfiguracion();
    }
  }));

  interruptorAyuda.addEventListener('change', () => actualizarAyuda(true));
  interruptorNumeros.addEventListener('change', () => actualizarNumeros(true));

  botonComprobar.addEventListener('click', () => {
    const ejercicio = ejercicios[indice];
    if (!seleccion) {
      resultado.className = 'resultado incorrecto';
      resultado.textContent = tipo === 'signo-letra' ? 'Selecciona primero una letra.' : 'Selecciona primero uno de los signos.';
      return;
    }

    const correcta = seleccion === ejercicio.letra;
    if (correcta) {
      if (!respuestaCorrecta) aciertos += 1;
      respuestaCorrecta = true;
      aciertosElemento.textContent = String(aciertos);
      resultado.className = 'resultado correcto';
      resultado.textContent = ayudaActiva
        ? `Respuesta correcta. La letra ${ejercicio.letra} corresponde a los puntos ${ejercicio.puntos.join(', ')} en orientación de ${modo === 'escritura' ? 'regleta' : 'lectura'}.`
        : 'Respuesta correcta.';
      botonSiguiente.disabled = false;
      botonComprobar.disabled = true;
    } else {
      resultado.className = 'resultado incorrecto';
      resultado.textContent = ayudaActiva ? 'La respuesta todavía no es correcta. Revisa ambos lados o solicita una pista.' : 'La respuesta todavía no es correcta.';
    }
  });

  botonSiguiente.addEventListener('click', () => {
    if (indice < ejercicios.length - 1) {
      indice += 1;
      mostrarEjercicio();
      return;
    }
    resultado.className = 'resultado correcto';
    resultado.textContent = `Actividad completada. Obtuviste ${aciertos} aciertos de ${ejercicios.length}.`;
    botonSiguiente.disabled = true;
    botonComprobar.disabled = true;
  });

  botonPista.addEventListener('click', () => {
    if (!ayudaActiva) return;
    const ejercicio = ejercicios[indice];
    const orientacion = modo === 'escritura' ? 'orientación invertida de regleta' : 'orientación normal de lectura';
    const mensaje = tipo === 'signo-letra'
      ? `El signo mostrado corresponde a la letra ${ejercicio.letra} y utiliza los puntos ${ejercicio.puntos.join(', ')} en ${orientacion}.`
      : `La letra ${ejercicio.letra} corresponde a los puntos ${ejercicio.puntos.join(', ')} en ${orientacion}.`;
    resultado.className = 'resultado';
    resultado.textContent = mensaje;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const voz = new SpeechSynthesisUtterance(mensaje);
      voz.lang = 'es-PE';
      window.speechSynthesis.speak(voz);
    }
  });

  actualizarAyuda(false);
  actualizarNumeros(false);
  mostrarEjercicio();
})();