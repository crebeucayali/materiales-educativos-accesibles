"use strict";
const documentos=[
 {tipo:"pdf",nombre:"Sesión adaptada para TEA en PDF",archivo:"documentos/sesion-costa-peruana-adaptada-tea.pdf",publicado:false},
 {tipo:"docx",nombre:"Sesión adaptada para TEA en Word",archivo:"documentos/sesion-costa-peruana-adaptada-tea.docx",publicado:false}
];
const lista=document.getElementById("documentos-lista");
const visor=document.getElementById("visor-documento");
if(lista){
 lista.replaceChildren();
 for(const doc of documentos){
  const li=document.createElement("li");
  const nombre=document.createElement("strong");nombre.textContent=doc.nombre;li.append(nombre);
  if(doc.publicado){
   const link=document.createElement("a");link.href=doc.archivo;link.download="";link.textContent=" Descargar "+doc.tipo.toUpperCase();li.append(" · ",link);
   if(doc.tipo==="pdf"&&visor){
    const frame=document.createElement("iframe");frame.src=doc.archivo;frame.title="Vista previa de la sesión adaptada para TEA";frame.loading="lazy";frame.className="visor-pdf";visor.append(frame);
    const p=document.createElement("p"),a=document.createElement("a");a.href=doc.archivo;a.target="_blank";a.rel="noopener";a.textContent="Abrir PDF en otra pestaña";p.append(a);visor.append(p);
   }
  }else{const status=document.createElement("span");status.className="status";status.textContent=" · Pendiente de revisión y publicación";li.append(status);}
  lista.append(li);
 }
}
