"use strict";
const documentos = [
  {tipo:"pdf", nombre:"Sesión original en PDF", archivo:"documentos/sesion-costa-peruana-original.pdf", publicado:false},
  {tipo:"docx", nombre:"Sesión original editable en Word", archivo:"documentos/sesion-costa-peruana-original.docx", publicado:false}
];
const lista=document.getElementById("documentos-lista");
const visor=document.getElementById("visor-documento");
if(lista){
  documentos.forEach(doc=>{
    const item=document.createElement("li");
    const titulo=document.createElement("strong");titulo.textContent=doc.nombre;item.append(titulo);
    if(doc.publicado){
      const enlace=document.createElement("a");enlace.href=doc.archivo;enlace.textContent=" Descargar "+doc.tipo.toUpperCase();enlace.setAttribute("download","");item.append(enlace);
      if(doc.tipo==="pdf"&&visor){
        const marco=document.createElement("iframe");marco.src=doc.archivo;marco.title="Vista previa de la sesión original en PDF";marco.loading="lazy";marco.className="visor-pdf";visor.append(marco);
        const alternativa=document.createElement("p");const link=document.createElement("a");link.href=doc.archivo;link.textContent="Abrir PDF en otra pestaña";link.target="_blank";link.rel="noopener";alternativa.append(link);visor.append(alternativa);
      }
    }else{
      const estado=document.createElement("span");estado.className="status";estado.textContent=" · Pendiente de revisión y publicación";item.append(estado);
    }
    lista.append(item);
  });
}
