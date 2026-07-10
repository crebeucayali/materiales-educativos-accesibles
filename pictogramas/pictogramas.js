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

  lista.innerHTML = "";
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
      lista.innerHTML = "";
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
    lista.innerHTML = "";
    estadoVacio.hidden = true;
    mensajeError.hidden = false;
    contador.textContent = "Error de búsqueda";
  }
}

function renderizarPictogramas(pictogramas){
  lista.innerHTML = "";

  pictogramas.forEach(function(picto){
    const id = picto._id || picto.id;

    if(!id){
      return;
    }

    const palabra = obtenerPalabra(picto);
    const imagen = `${URL_IMAGEN}${id}/${id}_500.png`;

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-picto";

    tarjeta.innerHTML = `
      <div class="marco-picto">
        <img
          src="${imagen}"
          alt="Pictograma de ${escaparTexto(palabra)}"
          loading="lazy"
        >
      </div>

      <h3>${escaparTexto(palabra)}</h3>
      <p>
        Pictograma procedente de ARASAAC. ID: ${id}
      </p>

      <div class="acciones-picto">
        <button
          class="descargar-png"
          type="button"
          data-url="${imagen}"
          data-nombre="${crearNombreArchivo(palabra, id)}"
        >
          Descargar PNG
        </button>

        <a
          class="abrir-original"
          href="${imagen}"
          target="_blank"
          rel="noopener"
        >
          Ver imagen
        </a>
      </div>
    `;

    const botonDescarga = tarjeta.querySelector(".descargar-png");
    botonDescarga.addEventListener("click", function(){
      descargarImagenPng(
        botonDescarga.dataset.url,
        botonDescarga.dataset.nombre
      );
    });

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

function escaparTexto(texto){
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mostrarEstadoInicial(){
  lista.innerHTML = "";
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

  parrafo.innerHTML = `
    <a href="https://gabriel-lsp.github.io/capacitaciones-crebe-ucayali/">Capacitaciones CREBE</a><br>
    <a href="https://gabriel-lsp.github.io/banco-digital-accesible/">Banco Digital Accesible</a><br>
    <a href="https://gabriel-lsp.github.io/juegos-interactivos-accesibles/">Juegos Educativos Accesibles</a><br>
    <a href="https://gabriel-lsp.github.io/banco-digital-accesible/noti-inclusivos/">Noti Inclusivos</a>
  `;
}

actualizarEnlacesExternos();
