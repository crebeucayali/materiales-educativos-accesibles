"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const shared = fs.readFileSync(path.join(root, "estadisticas/recursos-mea.js"), "utf8");
const mapping = [
 ["pictogramas/pictogramas.js","pictogramas","png","descarga_solicitada"],
 ["rutinas/rutinas.js","rutinas","jpg","exportacion_iniciada"],
 ["rutinas/rutinas.js","rutinas","pdf","exportacion_iniciada"],
 ["generador/generador.js","braille","pdf","exportacion_iniciada"],
 ["generador-lsp/generador-senas.js","dactilologia_lsp","pdf","exportacion_iniciada"],
 ["apoyos-lsp/generador-lsp.js","apoyos_lsp","pdf","exportacion_iniciada"],
 ["conciencia-fonologica/conciencia-fonologica.js","conciencia_fonologica","html","exportacion_iniciada"]
];

function setup({ reject = false } = {}) {
 const calls=[], window={}; let n=0;
 const ctx = {window,globalThis:{crypto:{}},crypto:{randomUUID:()=>`00000000-0000-4000-8000-${String(++n).padStart(12,"0")}`},
   fetch:(url,options)=>{calls.push({url,options});return reject?Promise.reject(new Error("offline")):Promise.resolve({ok:true});}};
 ctx.globalThis.crypto=ctx.crypto;
 vm.runInNewContext(shared,ctx);
 return {calls,window};
}

test("registro de siete combinaciones admisibles y sin contenido educativo",async()=>{
 const {calls,window}=setup();
 for(const [,tool,format,action] of mapping)window.EVARecursos.registrar(tool,format,action);
 assert.equal(calls.length,7);
 for(const {options} of calls){
  const body=JSON.parse(options.body);
  assert.deepEqual(Object.keys(body).sort(),["p_accion","p_evento_id","p_formato","p_herramienta"]);
  assert.match(body.p_evento_id,/^[0-9a-f-]{36}$/i);
  assert.equal(options.credentials,"omit");
 }
});
test("acciones desconocidas no se transmiten",()=>{
 const {calls,window}=setup();
 window.EVARecursos.registrar("rutinas","docx","exportacion_iniciada");
 window.EVARecursos.registrar("biblioteca","pdf","descarga_solicitada");
 assert.equal(calls.length,0);
});
test("fallos de red no bloquean la descarga",async()=>{
 const {window}=setup({reject:true});
 assert.doesNotThrow(()=>window.EVARecursos.registrar("braille","pdf","exportacion_iniciada"));
 await new Promise(resolve=>setImmediate(resolve));
});
test("cada exportación instrumentada coincide con su combinación permitida",()=>{
 for(const [file,tool,format,action] of mapping){
   const src=fs.readFileSync(path.join(root,file),"utf8");
   assert.ok(src.includes(`EVARecursos?.registrar("${tool}","${format}","${action}")`) ||
      src.includes(`EVARecursos?.registrar('${tool}','${format}','${action}')`),file);
 }
});
test("seis páginas cargan el rastreador antes del generador",()=>{
 const htmls=[
  ["pictogramas/pictogramas.html","pictogramas.js"],
  ["rutinas/rutinas.html","rutinas.js"],
  ["generador/generador.html","generador.js"],
  ["generador-lsp/index.html","generador-senas.js"],
  ["apoyos-lsp/generador-lsp.html","generador-lsp.js"],
  ["conciencia-fonologica/conciencia-fonologica.html","conciencia-fonologica.js"]
 ];
 for(const [file,script] of htmls){
  const html=fs.readFileSync(path.join(root,file),"utf8");
  const tracker=html.indexOf('estadisticas/recursos-mea.js?v=1');
  const generator=html.indexOf('src="'+script+"?v=");
  assert.ok(tracker>=0 && generator>=0 && tracker<generator,file);
  assert.ok(html.includes('connect-src'),file);
 }
});
