"use strict";
const documentos=[
 {tipo:"pdf",nombre:"Sesión inclusiva DUA en PDF",archivo:"documentos/sesion-panificacion-dua.pdf",publicado:false},
 {tipo:"docx",nombre:"Sesión inclusiva DUA en Word",archivo:"documentos/sesion-panificacion-dua.docx",publicado:false}
];
const lista=document.getElementById("archivos"),visor=document.getElementById("visor-documento");
if(lista){lista.replaceChildren();for(const doc of documentos){
 const li=document.createElement("li"),nombre=document.createElement("strong");nombre.textContent=doc.nombre;li.append(nombre);
 if(doc.publicado){const link=document.createElement("a");link.href=doc.archivo;link.download="";link.textContent=" Descargar "+doc.tipo.toUpperCase();li.append(" · ",link);
 if(doc.tipo==="pdf"&&visor){visor.replaceChildren();const frame=document.createElement("iframe");frame.src=doc.archivo;frame.title="Vista previa de la sesión inclusiva DUA";frame.loading="lazy";frame.className="visor-pdf";visor.append(frame);const p=document.createElement("p"),a=document.createElement("a");a.href=doc.archivo;a.target="_blank";a.rel="noopener";a.textContent="Abrir PDF en otra pestaña";p.append(a);visor.append(p);}}
 else{const estado=document.createElement("span");estado.className="status";estado.textContent=" · Pendiente de revisión y publicación";li.append(estado);}
 lista.append(li);
}}
