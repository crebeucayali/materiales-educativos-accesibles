const vocales = ['a', 'e', 'i', 'o', 'u'];

const bancoPalabras = {
  m: ['mamá', 'mesa', 'misa', 'moto', 'mula', 'mano'],
  p: ['papá', 'pato', 'pelo', 'pipa', 'puma', 'pan'],
  l: ['luna', 'lupa', 'loma', 'leche', 'lima', 'lana'],
  s: ['sapo', 'sopa', 'silla', 'sol', 'suma', 'sal'],
  t: ['taza', 'tela', 'tina', 'toro', 'tuna', 'tomate'],
  n: ['nube', 'nido', 'nene', 'nota', 'nariz', 'nuez'],
  d: ['dado', 'dedo', 'diente', 'dona', 'ducha', 'dama'],
  f: ['foca', 'foto', 'familia', 'fila', 'feo', 'fuma'],
  b: ['boca', 'bebé', 'bota', 'burro', 'bala', 'barco'],
  r: ['rana', 'rosa', 'rama', 'ropa', 'rueda', 'río'],
  c: ['casa', 'cama', 'coco', 'cuna', 'carro', 'comida'],
  g: ['gato', 'goma', 'gusano', 'guitarra', 'gorro', 'gallina'],
  j: ['jugo', 'jirafa', 'jabón', 'jalea', 'jota', 'jardín'],
  ñ: ['ñato', 'ñoquis', 'ñu'],
  ch: ['chapa', 'chico', 'chupón', 'choclo', 'chicha', 'chile'],
  ll: ['llave', 'llama', 'lluvia', 'llanta', 'lleno']
};

const $ = (id) => document.getElementById(id);

let imagenActual = '';
let fuenteImagen = '';

function normalizarTexto(texto){
  return (texto || '').trim().toLowerCase();
}

function capitalizar(texto){
  const limpio = (texto || '').trim();
  return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : '';
}

function obtenerLetraBase(){
  return $('letraBase').value;
}

function obtenerFamiliaSilabica(letra){
  return vocales.map((vocal) => letra + vocal);
}

function dividirSilabasEntrada(){
  const entrada = $('silabas').value.trim();
  if(!entrada) return [];
  return entrada.split(/[-,\s]+/).map((silaba) => silaba.trim()).filter(Boolean);
}

function sugerirSilabasSimples(palabra){
  const limpia = normalizarTexto(palabra).replace(/[^a-záéíóúñü]/gi, '');
  if(!limpia) return '';

  const grupos = [];
  let i = 0;

  while(i < limpia.length){
    const actual = limpia[i];
    const siguiente = limpia[i + 1] || '';
    const tercer = limpia[i + 2] || '';

    if('aeiouáéíóú'.includes(actual)){
      grupos.push(actual);
      i += 1;
    }else if(actual === 'c' && siguiente === 'h' && tercer){
      grupos.push('ch' + tercer);
      i += 3;
    }else if(actual === 'l' && siguiente === 'l' && tercer){
      grupos.push('ll' + tercer);
      i += 3;
    }else if(siguiente){
      grupos.push(actual + siguiente);
      i += 2;
    }else{
      grupos.push(actual);
      i += 1;
    }
  }

  return grupos.join('-');
}

function actualizarMiniatura(url, fuente){
  const contenedor = $('miniatura');
  contenedor.innerHTML = '';

  if(!url){
    contenedor.textContent = 'Aún no se ha cargado una imagen.';
    return;
  }

  const img = document.createElement('img');
  img.alt = 'Imagen de apoyo seleccionada';
  img.src = url;
  img.onerror = () => {
    contenedor.textContent = 'No se pudo cargar la imagen. Puedes pegar otra URL o usar una imagen desde tu equipo.';
  };
  contenedor.appendChild(img);

  if(fuente){
    const texto = document.createElement('span');
    texto.className = 'nota-campo';
    texto.textContent = fuente;
    contenedor.appendChild(texto);
  }
}

function colocarImagenEnFicha(){
  const contenedor = $('imagenFicha');
  contenedor.innerHTML = '';

  if(!imagenActual){
    const span = document.createElement('span');
    span.textContent = 'Imagen de apoyo';
    contenedor.appendChild(span);
    return;
  }

  const img = document.createElement('img');
  img.alt = 'Imagen de apoyo de la palabra trabajada';
  img.src = imagenActual;
  img.onerror = () => {
    contenedor.innerHTML = '<span>No se pudo cargar la imagen</span>';
  };
  contenedor.appendChild(img);
}

function crearCasillaSilaba(texto){
  const div = document.createElement('div');
  div.className = 'casilla-silaba';
  div.textContent = texto;
  return div;
}

function actualizarFicha(){
  const letra = obtenerLetraBase();
  const palabra = $('palabra').value.trim() || 'palabra';
  const silabasEntrada = dividirSilabasEntrada();
  const silabasPalabra = silabasEntrada.length ? silabasEntrada : [palabra];
  const familia = obtenerFamiliaSilabica(letra);

  $('textoConsigna').textContent = $('consigna').value.trim() || 'Observa, lee y completa.';
  $('etiquetaSilabas').textContent = 'Sílabas: ' + silabasPalabra.join(' - ');
  $('palabraGrande').textContent = palabra.toUpperCase();

  const chips = $('silabasGrandes');
  chips.innerHTML = '';
  silabasPalabra.forEach((silaba) => {
    const span = document.createElement('span');
    span.className = 'chip-silaba';
    span.textContent = silaba;
    chips.appendChild(span);
  });

  colocarImagenEnFicha();

  const silabario = $('silabario');
  silabario.innerHTML = '';
  familia.forEach((silaba) => silabario.appendChild(crearCasillaSilaba(silaba)));

  const palabras = bancoPalabras[letra] || [];
  const tabla = $('tablaInicial');
  tabla.innerHTML = '';
  const seleccionadas = [palabra, ...palabras.filter((item) => normalizarTexto(item) !== normalizarTexto(palabra))].slice(0, 4);

  seleccionadas.forEach((item) => {
    const sugerida = sugerirSilabasSimples(item).split('-')[0] || '';
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + capitalizar(item) + '</td><td>' + sugerida + '</td><td><span class="linea-respuesta"></span></td>';
    tabla.appendChild(tr);
  });

  const completar = $('completarPalabra');
  completar.innerHTML = '';
  const primeraSilaba = silabasPalabra[0] || '';
  const resto = palabra.slice(primeraSilaba.length);
  const linea = document.createElement('div');
  linea.className = 'actividad-linea';
  linea.innerHTML = '<span>Completa: <strong>____' + resto + '</strong></span><span>Respuesta: <span class="linea-respuesta"></span></span>';
  completar.appendChild(linea);

  const ordenar = $('ordenarSilabas');
  ordenar.innerHTML = '';
  [...silabasPalabra].reverse().forEach((silaba) => {
    const div = document.createElement('div');
    div.className = 'caja-recorte';
    div.textContent = silaba;
    ordenar.appendChild(div);
  });

  $('bloqueFamilia').classList.toggle('oculto', !$('actFamilia').checked);
  $('bloqueInicial').classList.toggle('oculto', !$('actInicial').checked);
  $('bloqueCompletar').classList.toggle('oculto', !$('actCompletar').checked);
  $('bloqueOrdenar').classList.toggle('oculto', !$('actOrdenar').checked);
}

async function buscarImagenArasaac(){
  const palabra = $('palabra').value.trim();
  const mensaje = $('mensajeArasaac');
  mensaje.className = 'mensaje-arasaac visible';
  mensaje.textContent = 'Buscando pictograma en ARASAAC...';

  if(!palabra){
    mensaje.textContent = 'Escribe primero una palabra.';
    return;
  }

  try{
    const respuesta = await fetch('https://api.arasaac.org/api/pictograms/es/search/' + encodeURIComponent(palabra));
    if(!respuesta.ok) throw new Error('No se pudo consultar ARASAAC.');
    const datos = await respuesta.json();

    if(!Array.isArray(datos) || datos.length === 0){
      mensaje.textContent = 'No se encontró un pictograma para esa palabra. Puedes pegar una URL o cargar una imagen propia.';
      return;
    }

    const pictograma = datos[0];
    const id = pictograma._id || pictograma.id;
    if(!id) throw new Error('El resultado no tiene identificador.');

    imagenActual = 'https://api.arasaac.org/api/pictograms/' + id + '?download=false';
    fuenteImagen = 'Pictograma ARASAAC. ID: ' + id;
    $('imagenUrl').value = imagenActual;
    actualizarMiniatura(imagenActual, fuenteImagen);
    actualizarFicha();
    mensaje.textContent = 'Pictograma cargado. Revisa si corresponde a la palabra trabajada.';
  }catch(error){
    mensaje.textContent = 'No se pudo conectar con ARASAAC desde este navegador. Puedes pegar una URL de imagen o cargar un archivo local.';
  }
}

function pronunciarTexto(texto){
  if(!('speechSynthesis' in window)) return;
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = 'es-PE';
  voz.rate = .85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(voz);
}

function descargarFichaHtml(){
  actualizarFicha();
  const contenido = $('hojaFicha').outerHTML;
  const documento = '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ficha de silabeo</title><style>body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#102a43}.hoja-ficha{max-width:794px;margin:auto}.cabecera-ficha{display:flex;justify-content:space-between;gap:18px;border-bottom:2px solid #f0f4f8;padding-bottom:18px;margin-bottom:18px}.cabecera-ficha h2{margin:0;color:#072f57;font-family:Georgia,Times New Roman,serif;font-size:2rem}.etiqueta-ficha{background:#e6f4f1;color:#0f766e;border-radius:999px;padding:9px 14px;font-weight:900}.bloque-ficha{border:1px solid #d9e2ec;border-radius:22px;padding:18px;margin-bottom:18px}.presentacion-palabra{display:grid;grid-template-columns:190px 1fr;gap:20px}.imagen-ficha{min-height:170px;border:1px solid #d9e2ec;border-radius:20px;display:grid;place-items:center;padding:14px}.imagen-ficha img{max-width:100%;max-height:190px}.palabra-principal{font-size:64px;font-weight:900;text-transform:uppercase}.chip-silaba,.casilla-silaba,.caja-recorte{display:inline-flex;align-items:center;justify-content:center;border:2px solid #9fb3c8;border-radius:18px;padding:12px 18px;margin:5px;font-size:28px;font-weight:900}.silabario{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.tabla-actividad{width:100%;border-collapse:collapse}.tabla-actividad th,.tabla-actividad td{border:1px solid #d9e2ec;padding:12px}.tabla-actividad th{background:#f0fdfa;color:#072f57}.linea-respuesta{display:inline-block;min-width:190px;height:30px;border-bottom:2px solid #334e68}.cajas-recorte{display:flex;flex-wrap:wrap;gap:10px}.pie-ficha{border-top:1px solid #d9e2ec;margin-top:20px;padding-top:14px;color:#627d98;font-size:.78rem}.oculto{display:none!important}</style></head><body>' + contenido + '</body></html>';
  const blob = new Blob([documento], { type:'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ficha-silabeo.html';
  a.click();
  URL.revokeObjectURL(url);
}

$('palabra').addEventListener('input', () => {
  if(!$('silabas').dataset.editado){
    $('silabas').value = sugerirSilabasSimples($('palabra').value);
  }
});

$('silabas').addEventListener('input', () => {
  $('silabas').dataset.editado = 'true';
});

$('letraBase').addEventListener('change', actualizarFicha);
$('consigna').addEventListener('input', actualizarFicha);

$('imagenUrl').addEventListener('input', () => {
  imagenActual = $('imagenUrl').value.trim();
  fuenteImagen = imagenActual ? 'Imagen desde URL proporcionada.' : '';
  actualizarMiniatura(imagenActual, fuenteImagen);
  actualizarFicha();
});

$('archivoImagen').addEventListener('change', (evento) => {
  const archivo = evento.target.files[0];
  if(!archivo) return;

  const lector = new FileReader();
  lector.onload = () => {
    imagenActual = lector.result;
    fuenteImagen = 'Imagen cargada desde el equipo.';
    $('imagenUrl').value = '';
    actualizarMiniatura(imagenActual, fuenteImagen);
    actualizarFicha();
  };
  lector.readAsDataURL(archivo);
});

$('buscarArasaac').addEventListener('click', buscarImagenArasaac);

$('quitarImagen').addEventListener('click', () => {
  imagenActual = '';
  fuenteImagen = '';
  $('imagenUrl').value = '';
  actualizarMiniatura('', '');
  actualizarFicha();
});

$('generar').addEventListener('click', actualizarFicha);

$('imprimir').addEventListener('click', () => {
  actualizarFicha();
  window.print();
});

$('descargarHtml').addEventListener('click', descargarFichaHtml);
$('pronunciar').addEventListener('click', () => pronunciarTexto($('palabra').value.trim() || 'mesa'));

['actFamilia', 'actInicial', 'actCompletar', 'actOrdenar'].forEach((id) => {
  $(id).addEventListener('change', actualizarFicha);
});

actualizarFicha();
