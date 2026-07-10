const API_BUSQUEDA = "https://api.arasaac.org/api/pictograms/es/search/";
const URL_IMAGEN = "https://static.arasaac.org/pictograms/";
const URL_HTML2CANVAS = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const URL_JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const scriptsExternos = new Map();

const tituloRutina = document.getElementById("titulo-rutina");
const cantidadPasos = document.getElementById("cantidad-pasos");
const botonCrearPasos = document.getElementById("crear-pasos");
const pasosLibres = document.getElementById("pasos-libres");
const estadoPasoActivo = document.getElementById("estado-paso-activo");

const formularioArasaac = document.getElementById("formulario-arasaac");
const buscadorArasaac = document.getElementById("buscador-arasaac");
const resultadosArasaac = document.getElementById("resultados-arasaac");
const estadoBusqueda = document.getElementById("estado-busqueda");

const rutinaLienzo = document.getElementById("rutina-lienzo");
const rutinaTituloPreview = document.getElementById("rutina-titulo-preview");
const rutinaSecuencia = document.getElementById("rutina-secuencia");

const botonDescargarJpg = document.getElementById("descargar-jpg");
const botonDescargarPdf = document.getElementById("descargar-pdf");

let pasos = [];
let pasoActivo = 0;

iniciarRutinas();

function iniciarRutinas(){
  if(!tituloRutina || !cantidadPasos || !botonCrearPasos || !pasosLibres || !estadoPasoActivo){
    return;
  }

  botonCrearPasos.addEventListener("click", crearEspacios);
  cantidadPasos.addEventListener("change", crearEspacios);
  tituloRutina.addEventListener("input", renderizarPreview);

  if(formularioArasaac){
    formularioArasaac.addEventListener("submit", buscarPictogramas);
  }

  if(botonDescargarJpg){
    botonDescargarJpg.addEventListener("click", descargarJpg);
  }

  if(botonDescargarPdf){
    botonDescargarPdf.addEventListener("click", descargarPdf);
  }

  agregarContactoCabecera();
  crearEspacios();
}

function agregarContactoCabecera(){
  const navegacion = document.querySelector(".navegacion");

  if(!navegacion){
    return;
  }

  const contactoUrl = "https://gabriel-lsp.github.io/accesos-complementarios/contacto.html";
  const enlaceExistente = navegacion.querySelector(`a[href="${contactoUrl}"], a[href="contacto.html"]`);

  if(enlaceExistente){
    enlaceExistente.href = contactoUrl;
    return;
  }

  const enlaceVolver = navegacion.querySelector(".enlace-cabecera");

  if(!enlaceVolver){
    return;
  }

  let contenedor = enlaceVolver.parentElement;

  if(!contenedor || contenedor === navegacion){
    contenedor = document.createElement("div");
    contenedor.style.display = "flex";
    contenedor.style.gap = "10px";
    contenedor.style.flexWrap = "wrap";
    contenedor.style.justifyContent = "flex-end";
    enlaceVolver.replaceWith(contenedor);
    contenedor.appendChild(enlaceVolver);
  }

  const enlaceContacto = document.createElement("a");
  enlaceContacto.className = "enlace-cabecera";
  enlaceContacto.href = contactoUrl;
  enlaceContacto.textContent = "Contacto";
  contenedor.appendChild(enlaceContacto);
}

function crearEspacios(){
  const total = Number(cantidadPasos.value || 4);

  pasos = Array.from({ length: total }, (_, index) => {
    return pasos[index] || {
      texto: "",
      pictograma: null
    };
  });

  if(pasoActivo >= pasos.length){
    pasoActivo = pasos.length - 1;
  }

  if(pasoActivo < 0){
    pasoActivo = 0;
  }

  renderizarPasos();
  renderizarPreview();
  actualizarEstadoPasoActivo();
}

function renderizarPasos(){
  pasosLibres.innerHTML = "";

  pasos.forEach((paso, index) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = `paso-libre ${index === pasoActivo ? "activo" : ""}`;
    tarjeta.dataset.index = index;

    const imagenHtml = paso.pictograma
      ? `
        <img
          src="${paso.pictograma.imagen}"
          alt="Pictograma de ${escaparTexto(paso.pictograma.palabra)}"
          crossorigin="anonymous"
        >
      `
      : `<p class="placeholder-paso">Selecciona este paso y busca un pictograma</p>`;

    tarjeta.innerHTML = `
      <div class="paso-superior">
        <span class="numero-paso">Paso ${index + 1}</span>
      </div>

      <div class="acciones-paso">
        <button class="cambiar-paso" type="button" data-accion="cambiar" data-index="${index}">
          Usar paso
        </button>
        <button class="quitar-paso" type="button" data-accion="quitar" data-index="${index}">
          Quitar pictograma
        </button>
      </div>

      <div class="marco-paso">
        ${imagenHtml}
      </div>

      <input
        class="texto-paso"
        type="text"
        value="${escaparTexto(paso.texto)}"
        placeholder="Texto del paso"
        data-accion="texto"
        data-index="${index}"
      >
    `;

    tarjeta.addEventListener("click", (evento) => {
      const accion = evento.target.dataset.accion;

      if(accion === "quitar"){
        quitarPictograma(index);
        return;
      }

      pasoActivo = index;
      marcarPasoActivo();
    });

    const inputTexto = tarjeta.querySelector(".texto-paso");

    inputTexto.addEventListener("click", (evento) => {
      evento.stopPropagation();
      pasoActivo = index;
      marcarPasoActivo();
    });

    inputTexto.addEventListener("input", (evento) => {
      pasos[index].texto = evento.target.value;
      renderizarPreview();
    });

    pasosLibres.appendChild(tarjeta);
  });
}

function marcarPasoActivo(){
  document.querySelectorAll(".paso-libre").forEach((tarjeta) => {
    tarjeta.classList.toggle("activo", Number(tarjeta.dataset.index) === pasoActivo);
  });

  actualizarEstadoPasoActivo();

  if(estadoBusqueda){
    estadoBusqueda.textContent = `Paso ${pasoActivo + 1} seleccionado. Puedes buscar un pictograma nuevo o reemplazar el actual.`;
  }
}

async function buscarPictogramas(evento){
  evento.preventDefault();

  const termino = buscadorArasaac.value.trim();

  if(!termino){
    estadoBusqueda.textContent = "Escribe una palabra para buscar pictogramas.";
    resultadosArasaac.innerHTML = "";
    return;
  }

  estadoBusqueda.textContent = "Buscando pictogramas en ARASAAC...";
  resultadosArasaac.innerHTML = "";

  try{
    const respuesta = await fetch(API_BUSQUEDA + encodeURIComponent(termino));

    if(!respuesta.ok){
      throw new Error("No se pudo consultar ARASAAC.");
    }

    const datos = await respuesta.json();
    const pictogramas = Array.isArray(datos) ? datos.slice(0, 18) : [];

    if(pictogramas.length === 0){
      estadoBusqueda.textContent = "No se encontraron pictogramas. Prueba con otra palabra.";
      return;
    }

    estadoBusqueda.textContent = `Selecciona un pictograma para colocarlo en el paso ${pasoActivo + 1}.`;
    renderizarResultados(pictogramas);
  }catch(error){
    console.error(error);
    estadoBusqueda.textContent = "No se pudo completar la búsqueda. Revisa la conexión e intenta nuevamente.";
  }
}

function renderizarResultados(pictogramas){
  resultadosArasaac.innerHTML = "";

  pictogramas.forEach((picto) => {
    const id = picto._id || picto.id;

    if(!id){
      return;
    }

    const palabra = obtenerPalabra(picto);
    const imagen = `${URL_IMAGEN}${id}/${id}_500.png`;

    const boton = document.createElement("button");
    boton.className = "opcion-picto";
    boton.type = "button";

    boton.innerHTML = `
      <img
        src="${imagen}"
        alt="Pictograma de ${escaparTexto(palabra)}"
        crossorigin="anonymous"
        loading="lazy"
      >
      <span>${escaparTexto(palabra)}</span>
    `;

    boton.addEventListener("click", () => {
      asignarPictograma({
        id,
        palabra,
        imagen
      });
    });

    resultadosArasaac.appendChild(boton);
  });
}

function asignarPictograma(pictograma){
  pasos[pasoActivo].pictograma = pictograma;

  if(!pasos[pasoActivo].texto.trim()){
    pasos[pasoActivo].texto = pictograma.palabra;
  }

  renderizarPasos();
  renderizarPreview();

  const siguienteVacio = buscarSiguientePasoVacio(pasoActivo);

  if(siguienteVacio !== -1){
    pasoActivo = siguienteVacio;
    marcarPasoActivo();
    estadoBusqueda.textContent = `Pictograma agregado. Ahora está seleccionado el paso ${pasoActivo + 1}.`;
  }else{
    actualizarEstadoPasoActivo();
    estadoBusqueda.textContent = "Pictograma agregado. Ya completaste todos los pasos disponibles. Puedes seleccionar cualquier paso para cambiarlo.";
  }
}

function buscarSiguientePasoVacio(desde){
  for(let i = desde + 1; i < pasos.length; i++){
    if(!pasos[i].pictograma){
      return i;
    }
  }

  for(let i = 0; i < pasos.length; i++){
    if(!pasos[i].pictograma){
      return i;
    }
  }

  return -1;
}

function quitarPictograma(index){
  pasos[index].pictograma = null;
  pasos[index].texto = "";
  pasoActivo = index;

  renderizarPasos();
  renderizarPreview();
  actualizarEstadoPasoActivo();

  if(estadoBusqueda){
    estadoBusqueda.textContent = `Se quitó el pictograma del paso ${index + 1}. Busca otro pictograma para reemplazarlo.`;
  }
}

function actualizarEstadoPasoActivo(){
  estadoPasoActivo.textContent = `Paso ${pasoActivo + 1} seleccionado. Puedes buscar un pictograma, reemplazar el actual o quitar la selección.`;
}

function renderizarPreview(){
  rutinaTituloPreview.textContent = tituloRutina.value.trim() || "Mi rutina visual";
  rutinaSecuencia.innerHTML = "";

  pasos.forEach((paso, index) => {
    const item = document.createElement("div");
    item.className = "rutina-item";

    if(paso.pictograma){
      item.innerHTML = `
        <div class="rutina-numero">${index + 1}</div>
        <img
          src="${paso.pictograma.imagen}"
          alt="Pictograma de ${escaparTexto(paso.pictograma.palabra)}"
          crossorigin="anonymous"
        >
        <p>${escaparTexto(paso.texto || paso.pictograma.palabra)}</p>
      `;
    }else{
      item.innerHTML = `
        <div class="rutina-numero">${index + 1}</div>
        <div class="rutina-pendiente">Pendiente</div>
        <p>Seleccionar pictograma</p>
      `;
    }

    rutinaSecuencia.appendChild(item);
  });
}

async function descargarJpg(){
  try{
    await asegurarDependenciasDescarga();
    await esperarImagenes(rutinaLienzo);

    const canvas = await html2canvas(rutinaLienzo, {
      backgroundColor:"#ffffff",
      scale:2,
      useCORS:true,
      allowTaint:false,
      scrollX:0,
      scrollY:0,
      windowWidth:document.documentElement.scrollWidth,
      windowHeight:document.documentElement.scrollHeight
    });

    const enlace = document.createElement("a");
    enlace.download = crearNombreArchivo("rutina-visual", "jpg");
    enlace.href = canvas.toDataURL("image/jpeg", 0.95);
    enlace.click();
  }catch(error){
    console.error(error);
    alert("No se pudo generar el JPG. Intenta recargar la página y vuelve a descargar.");
  }
}

async function descargarPdf(){
  try{
    await asegurarDependenciasDescarga();
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation:"portrait",
      unit:"mm",
      format:"a4"
    });

    const pasosPorPagina = 4;
    const grupos = [];

    for(let i = 0; i < pasos.length; i += pasosPorPagina){
      grupos.push(pasos.slice(i, i + pasosPorPagina));
    }

    for(let indiceGrupo = 0; indiceGrupo < grupos.length; indiceGrupo++){
      const paginaTemporal = crearPaginaRutinaPdf(grupos[indiceGrupo], indiceGrupo, grupos.length);
      document.body.appendChild(paginaTemporal);

      await esperarImagenes(paginaTemporal);

      const canvas = await html2canvas(paginaTemporal, {
        backgroundColor:"#ffffff",
        scale:2,
        useCORS:true,
        allowTaint:false,
        scrollX:0,
        scrollY:0,
        windowWidth:document.documentElement.scrollWidth,
        windowHeight:document.documentElement.scrollHeight
      });

      document.body.removeChild(paginaTemporal);

      const imagen = canvas.toDataURL("image/jpeg", 0.95);

      if(indiceGrupo > 0){
        pdf.addPage();
      }

      const anchoPagina = pdf.internal.pageSize.getWidth();
      const altoPagina = pdf.internal.pageSize.getHeight();

      pdf.addImage(imagen, "JPEG", 0, 0, anchoPagina, altoPagina);
    }

    pdf.save(crearNombreArchivo("rutina-visual", "pdf"));
  }catch(error){
    console.error(error);
    alert("No se pudo generar el PDF. Intenta recargar la página y vuelve a descargar.");
  }
}

function crearPaginaRutinaPdf(grupoPasos, numeroPagina, totalPaginas){
  const titulo = tituloRutina.value.trim() || "Mi rutina visual";

  const pagina = document.createElement("div");
  pagina.style.position = "fixed";
  pagina.style.left = "-9999px";
  pagina.style.top = "0";
  pagina.style.width = "794px";
  pagina.style.height = "1123px";
  pagina.style.background = "#ffffff";
  pagina.style.padding = "46px";
  pagina.style.boxSizing = "border-box";
  pagina.style.fontFamily = "Arial, Helvetica, sans-serif";
  pagina.style.color = "#072f57";

  const tituloElemento = document.createElement("h2");
  tituloElemento.textContent = totalPaginas > 1
    ? `${titulo} - página ${numeroPagina + 1}`
    : titulo;
  tituloElemento.style.margin = "0 0 28px";
  tituloElemento.style.textAlign = "center";
  tituloElemento.style.fontSize = "34px";
  tituloElemento.style.lineHeight = "1.15";
  tituloElemento.style.fontWeight = "900";
  tituloElemento.style.color = "#072f57";

  const grilla = document.createElement("div");
  grilla.style.display = "grid";
  grilla.style.gridTemplateColumns = "repeat(2, 1fr)";
  grilla.style.gap = "22px";
  grilla.style.marginTop = "20px";

  grupoPasos.forEach((paso, index) => {
    const numeroReal = numeroPagina * 4 + index + 1;
    const item = document.createElement("div");
    item.style.border = "2px solid #d9e2ec";
    item.style.borderRadius = "22px";
    item.style.padding = "18px";
    item.style.minHeight = "360px";
    item.style.background = "#fbfdff";
    item.style.display = "flex";
    item.style.flexDirection = "column";
    item.style.alignItems = "center";
    item.style.justifyContent = "space-between";
    item.style.textAlign = "center";
    item.style.boxSizing = "border-box";

    const numero = document.createElement("div");
    numero.textContent = String(numeroReal);
    numero.style.width = "38px";
    numero.style.height = "38px";
    numero.style.borderRadius = "999px";
    numero.style.background = "#e6f4f1";
    numero.style.color = "#0f766e";
    numero.style.display = "flex";
    numero.style.alignItems = "center";
    numero.style.justifyContent = "center";
    numero.style.fontWeight = "900";
    numero.style.marginBottom = "12px";

    const zonaImagen = document.createElement("div");
    zonaImagen.style.width = "100%";
    zonaImagen.style.height = "220px";
    zonaImagen.style.display = "flex";
    zonaImagen.style.alignItems = "center";
    zonaImagen.style.justifyContent = "center";

    if(paso.pictograma){
      const imagen = document.createElement("img");
      imagen.src = paso.pictograma.imagen;
      imagen.alt = `Pictograma de ${paso.pictograma.palabra}`;
      imagen.crossOrigin = "anonymous";
      imagen.style.maxWidth = "100%";
      imagen.style.maxHeight = "210px";
      imagen.style.objectFit = "contain";
      zonaImagen.appendChild(imagen);
    }else{
      const pendiente = document.createElement("p");
      pendiente.textContent = "Pendiente";
      pendiente.style.margin = "0";
      pendiente.style.color = "#486581";
      pendiente.style.fontWeight = "800";
      zonaImagen.appendChild(pendiente);
    }

    const texto = document.createElement("p");
    texto.textContent = paso.texto || paso.pictograma?.palabra || "Seleccionar pictograma";
    texto.style.margin = "14px 0 0";
    texto.style.color = "#072f57";
    texto.style.fontSize = "20px";
    texto.style.fontWeight = "900";
    texto.style.lineHeight = "1.25";

    item.append(numero, zonaImagen, texto);
    grilla.appendChild(item);
  });

  while(grilla.children.length < 4){
    const espacio = document.createElement("div");
    espacio.style.border = "2px dashed #e5edf3";
    espacio.style.borderRadius = "22px";
    espacio.style.minHeight = "360px";
    espacio.style.background = "#ffffff";
    grilla.appendChild(espacio);
  }

  const atribucion = document.createElement("p");
  atribucion.textContent = "Pictogramas procedentes de ARASAAC. Autor: Sergio Palao. Propiedad: Gobierno de Aragón, España. Licencia: Creative Commons BY-NC-SA. Material educativo sin fines de lucro.";
  atribucion.style.position = "absolute";
  atribucion.style.left = "46px";
  atribucion.style.right = "46px";
  atribucion.style.bottom = "34px";
  atribucion.style.margin = "0";
  atribucion.style.paddingTop = "14px";
  atribucion.style.borderTop = "1px solid #d9e2ec";
  atribucion.style.color = "#486581";
  atribucion.style.fontSize = "13px";
  atribucion.style.lineHeight = "1.4";
  atribucion.style.textAlign = "center";

  pagina.append(tituloElemento, grilla, atribucion);

  return pagina;
}

function esperarImagenes(contenedor){
  const imagenes = Array.from(contenedor.querySelectorAll("img"));

  return Promise.all(
    imagenes.map((img) => {
      if(img.complete){
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
}

function cargarScriptExterno(url){
  if(scriptsExternos.has(url)){
    return scriptsExternos.get(url);
  }

  const promesa = new Promise((resolve, reject) => {
    const existente = document.querySelector(`script[src="${url}"]`);

    if(existente){
      existente.addEventListener("load", resolve, { once:true });
      existente.addEventListener("error", reject, { once:true });
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  scriptsExternos.set(url, promesa);
  return promesa;
}

async function asegurarDependenciasDescarga(){
  if(!window.html2canvas){
    await cargarScriptExterno(URL_HTML2CANVAS);
  }

  if(!window.jspdf){
    await cargarScriptExterno(URL_JSPDF);
  }
}

function obtenerPalabra(picto){
  if(Array.isArray(picto.keywords) && picto.keywords.length > 0){
    const primera = picto.keywords[0];

    if(typeof primera === "string"){
      return primera;
    }

    if(primera.keyword){
      return primera.keyword;
    }
  }

  if(picto.keyword){
    return picto.keyword;
  }

  if(picto.name){
    return picto.name;
  }

  return "Pictograma";
}

function crearNombreArchivo(base, extension){
  const titulo = tituloRutina.value.trim() || base;
  const nombre = normalizarTexto(titulo)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${nombre || base}.${extension}`;
}

function normalizarTexto(texto){
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escaparTexto(texto){
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", function () {
  const selectorCampos = "textarea, input[type='text'], input:not([type]), [contenteditable='true']";

  function protegerCampo(e) {
    const campo = e.target.closest(selectorCampos);

    if (!campo) return;

    e.stopPropagation();

    setTimeout(function () {
      campo.focus({ preventScroll: true });
    }, 0);
  }

  ["pointerdown", "mousedown", "mouseup", "click", "touchstart", "touchend"].forEach(function (evento) {
    window.addEventListener(evento, protegerCampo, true);
    document.addEventListener(evento, protegerCampo, true);
  });

  document.querySelectorAll(selectorCampos).forEach(function (campo) {
    campo.addEventListener("blur", function () {
      const mismoCampo = campo;

      setTimeout(function () {
        if (document.activeElement === document.body) {
          mismoCampo.focus({ preventScroll: true });
        }
      }, 0);
    });
  });
});