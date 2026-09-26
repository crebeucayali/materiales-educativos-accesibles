const formulario = document.getElementById("formulario-pictogramas");
const buscador = document.getElementById("buscador-pictogramas");
const lista = document.getElementById("lista-pictogramas");
const contador = document.getElementById("contador-resultados");
const estadoVacio = document.getElementById("estado-vacio");
const mensajeError = document.getElementById("mensaje-error");

const API_BUSQUEDA = "https://api.arasaac.org/api/pictograms/es/search/";
const URL_IMAGEN = "https://static.arasaac.org/pictograms/";

formulario.addEventListener("submit", function(evento){
  evento.preventDefault();
  buscarPictogramas();
});

async function buscarPictogramas(){
  const termino = buscador.value.trim();

  if(!termino){
    mostrarEstadoInicial();
    return;
  }

  lista.replaceChildren();
  mensajeError.hidden = true;
  estadoVacio.hidden = false;
  estadoVacio.querySelector("h3").textContent = "Buscando pictogramas...";
  estadoVacio.querySelector("p").textContent = "Espera un momento mientras se consulta ARASAAC.";
  contador.textContent = "Buscando...";

  try{
    const respuesta = await fetch(API_BUSQUEDA + encodeURIComponent(termino));

    if(!respuesta.ok){
      throw new Error("No se pudo consultar la API.");
    }

    const datos = await respuesta.json();
    const resultados = Array.isArray(datos) ? datos.slice(0, 32) : [];

    if(resultados.length === 0){
      lista.replaceChildren();
      estadoVacio.hidden = false;
      estadoVacio.querySelector("h3").textContent = "No se encontraron pictogramas";
      estadoVacio.querySelector("p").textContent = "Prueba con otra palabra o una forma más simple.";
      contador.textContent = "0 resultados";
      return;
    }

    estadoVacio.hidden = true;
    contador.textContent = `${resultados.length} resultado${resultados.length === 1 ? "" : "s"}`;
    renderizarPictogramas(resultados);
  }catch(error){
    console.error(error);
    lista.replaceChildren();
    estadoVacio.hidden = true;
    mensajeError.hidden = false;
    contador.textContent = "Error de búsqueda";
  }
}

function renderizarPictogramas(pictogramas){
  lista.replaceChildren();

  pictogramas.forEach(function(picto){
    const idTexto = String(picto._id || picto.id || "").trim();
    if(!/^\d+$/.test(idTexto)){
      return;
    }

    const palabra = obtenerPalabra(picto);
    const imagen = `${URL_IMAGEN}${idTexto}/${idTexto}_500.png`;

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-picto";

    const marco = document.createElement("div");
    marco.className = "marco-picto";

    const img = document.createElement("img");
    img.src = imagen;
    img.alt = `Pictograma de ${palabra}`;
    img.loading = "lazy";
    marco.appendChild(img);

    const titulo = document.createElement("h3");
    titulo.textContent = palabra;

    const descripcion = document.createElement("p");
    descripcion.textContent = `Pictograma procedente de ARASAAC. ID: ${idTexto}`;

    const acciones = document.createElement("div");
    acciones.className = "acciones-picto";

    const descargar = document.createElement("button");
    descargar.className = "descargar-png";
    descargar.type = "button";
    descargar.dataset.url = imagen;
    descargar.dataset.nombre = crearNombreArchivo(palabra, idTexto);
    descargar.textContent = "Descargar PNG";

    const abrir = document.createElement("a");
    abrir.className = "abrir-original";
    abrir.href = imagen;
    abrir.target = "_blank";
    abrir.rel = "noopener noreferrer";
    abrir.textContent = "Abrir imagen";

    acciones.append(descargar, abrir);
    tarjeta.append(marco, titulo, descripcion, acciones);
    lista.appendChild(tarjeta);
  });
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

async function descargarImagenPng(url, nombreArchivo){
  try{
    const respuesta = await fetch(url);

    if(!respuesta.ok){
      throw new Error("No se pudo descargar la imagen.");
    }

    const blob = await respuesta.blob();
    const enlaceTemporal = document.createElement("a");
    const urlTemporal = URL.createObjectURL(blob);

    enlaceTemporal.href = urlTemporal;
    enlaceTemporal.download = nombreArchivo;
    document.body.appendChild(enlaceTemporal);
    enlaceTemporal.click();

    enlaceTemporal.remove();
    URL.revokeObjectURL(urlTemporal);
  }catch(error){
    console.error(error);
    window.open(url, "_blank", "noopener");
  }
}

function crearNombreArchivo(palabra, id){
  const nombreLimpio = normalizarTexto(palabra)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `picto-arasaac-${nombreLimpio || "pictograma"}-${id}.png`;
}

function normalizarTexto(texto){
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mostrarEstadoInicial(){
  lista.replaceChildren();
  mensajeError.hidden = true;
  estadoVacio.hidden = false;
  estadoVacio.querySelector("h3").textContent = "Realiza una búsqueda";
  estadoVacio.querySelector("p").textContent = "Puedes iniciar con palabras como comer, baño, ayuda, escuela o esperar.";
  contador.textContent = "Esperando búsqueda";
}

function actualizarEnlacesExternos(){
  const bloques = document.querySelectorAll(".footer-bloque");
  const bloqueEnlaces = Array.from(bloques).find((bloque) => {
    const titulo = bloque.querySelector("h2");
    return titulo && titulo.textContent.trim().toLowerCase() === "enlaces";
  });

  if(!bloqueEnlaces){
    return;
  }

  const parrafo = bloqueEnlaces.querySelector("p");
  if(!parrafo){
    return;
  }

  const enlaces = [
    ["Capacitaciones CREBE", "https://crebeucayali.github.io/capacitaciones/"],
    ["Banco Digital Accesible", "https://crebeucayali.github.io/banco-digital-accesible/"],
    ["Juegos Educativos Accesibles", "https://crebeucayali.github.io/juegos-interactivos-accesibles/"],
    ["Noti Inclusivos", "https://crebeucayali.github.io/noti-inclusivos/"]
  ];

  parrafo.replaceChildren();
  enlaces.forEach(([texto, href], indice) => {
    const enlace = document.createElement("a");
    enlace.href = href;
    enlace.textContent = texto;
    parrafo.appendChild(enlace);
    if(indice < enlaces.length - 1){
      parrafo.appendChild(document.createElement("br"));
    }
  });
}

actualizarEnlacesExternos();