(function(){
  const mapaBraille={"a":[1],"b":[1,2],"c":[1,4],"d":[1,4,5],"e":[1,5],"f":[1,2,4],"g":[1,2,4,5],"h":[1,2,5],"i":[2,4],"j":[2,4,5],"k":[1,3],"l":[1,2,3],"m":[1,3,4],"n":[1,3,4,5],"ñ":[1,2,4,5,6],"o":[1,3,5],"p":[1,2,3,4],"q":[1,2,3,4,5],"r":[1,2,3,5],"s":[2,3,4],"t":[2,3,4,5],"u":[1,3,6],"v":[1,2,3,6],"w":[2,4,5,6],"x":[1,3,4,6],"y":[1,3,4,5,6],"z":[1,3,5,6],"á":[1,2,3,5,6],"é":[2,3,4,6],"í":[3,4],"ó":[3,4,6],"ú":[2,3,4,5,6],"ü":[1,2,5,6],".":[2,5,6],",":[2],";":[2,3],":":[2,5],"?":[2,6],"¿":[2,6],"!":[2,3,5],"¡":[2,3,5],"-":[3,6]};
  const mapaNumeros={"1":"a","2":"b","3":"c","4":"d","5":"e","6":"f","7":"g","8":"h","9":"i","0":"j"};
  const entrada=document.getElementById("entrada-braille");
  const botonGenerar=document.getElementById("generar-braille");
  const botonLimpiar=document.getElementById("limpiar-braille");
  const botonPdf=document.getElementById("descargar-pdf-braille");
  const resultado=document.getElementById("resultado-braille");
  const tituloResultado=document.getElementById("texto-generado-braille");
  const recurso=document.getElementById("recurso-braille");

  function crearCelda(puntos,etiqueta){
    const contenedor=document.createElement("div");contenedor.className="braille-letra";
    const celda=document.createElement("div");celda.className="celda-braille";
    for(let i=1;i<=6;i++){const punto=document.createElement("span");punto.className="punto-braille p"+i;if(puntos.includes(i)){punto.classList.add("activo");}celda.appendChild(punto);}
    const letra=document.createElement("span");letra.className="letra-base";letra.textContent=etiqueta;
    contenedor.appendChild(celda);contenedor.appendChild(letra);return contenedor;
  }

  function generarBraille(){
    const textoOriginal=entrada.value.trim();resultado.innerHTML="";
    if(!textoOriginal){tituloResultado.textContent="Tu palabra aparecerá aquí";resultado.innerHTML='<p class="mensaje-inicial">Ingresa una palabra para generar su representación en Braille.</p>';return;}
    tituloResultado.textContent=textoOriginal.toUpperCase();
    textoOriginal.toLowerCase().split("").forEach(function(caracter){
      if(caracter===" "){const espacio=document.createElement("div");espacio.style.width="28px";resultado.appendChild(espacio);return;}
      if(mapaNumeros[caracter]){resultado.appendChild(crearCelda([3,4,5,6],"#"));const letraNumero=mapaNumeros[caracter];resultado.appendChild(crearCelda(mapaBraille[letraNumero],caracter));return;}
      if(mapaBraille[caracter]){resultado.appendChild(crearCelda(mapaBraille[caracter],caracter.toUpperCase()));}
    });
  }

  function limpiarBraille(){entrada.value="";generarBraille();entrada.focus();}

  async function descargarPDF(){
    const textoOriginal=entrada.value.trim();
    if(!textoOriginal){alert("Primero escribe una palabra o frase y genera el recurso.");return;}
    generarBraille();
    if(!window.html2canvas||!window.jspdf){alert("No se pudo cargar la herramienta de descarga. Verifica tu conexión a internet.");return;}
    const canvas=await html2canvas(recurso,{scale:2,backgroundColor:"#ffffff"});
    const imagen=canvas.toDataURL("image/png");
    const pdf=new window.jspdf.jsPDF("p","mm","a4");
    pdf.setFont("helvetica","bold");pdf.setFontSize(18);pdf.text("Recurso en Braille",20,22);
    pdf.setFont("helvetica","normal");pdf.setFontSize(11);pdf.text("Materiales Educativos Accesibles",20,30);
    const anchoPagina=170;const altoImagen=canvas.height*anchoPagina/canvas.width;
    pdf.addImage(imagen,"PNG",20,42,anchoPagina,altoImagen);
    pdf.setFontSize(9);pdf.text("Material educativo generado para apoyar la consulta y práctica inicial del sistema Braille.",20,285);
    pdf.save("recurso-braille.pdf");
  }

  botonGenerar.addEventListener("click",generarBraille);
  botonLimpiar.addEventListener("click",limpiarBraille);
  botonPdf.addEventListener("click",descargarPDF);
  entrada.addEventListener("keydown",function(event){if(event.key==="Enter"){generarBraille();}});
})();