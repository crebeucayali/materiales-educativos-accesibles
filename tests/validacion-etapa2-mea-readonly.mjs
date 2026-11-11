import assert from "node:assert/strict";
const SITE="https://crebeucayali.github.io/materiales-educativos-accesibles";
const SUPABASE="https://dteimbhwtzghhsijeeld.supabase.co";
const paths=[
 ["pictogramas/pictogramas.html","pictogramas.js"],
 ["rutinas/rutinas.html","rutinas.js"],
 ["generador/generador.html","generador.js"],
 ["generador-lsp/index.html","generador-senas.js"],
 ["apoyos-lsp/generador-lsp.html","generador-lsp.js"],
 ["conciencia-fonologica/conciencia-fonologica.html","conciencia-fonologica.js"]
];
async function get(url,opts={}){
 const response=await fetch(url,{signal:AbortSignal.timeout(18000),redirect:"follow",...opts});
 return response;
}
const checked=[];
for(const [path,script] of paths){
 const response=await get(SITE+"/"+path);
 assert.equal(response.status,200,"Página no accesible "+path);
 const body=await response.text();
 assert.ok(body.includes("estadisticas/recursos-mea.js?v=1"),"Falta cliente estadístico "+path);
 assert.ok(body.includes(script),"No se encuentra generador "+path);
 checked.push({type:"pagina",path,status:response.status});
}
const tracker=await get(SITE+"/estadisticas/recursos-mea.js?v=1");
assert.equal(tracker.status,200,"Cliente de métricas no publicado");
const js=await tracker.text();
assert.ok(js.includes("registrar_accion_recurso_mea"),"RPC incorrecto");
assert.ok(js.includes("EVARecursos"),"No expone cliente esperado");
checked.push({type:"cliente",status:tracker.status,bytes:js.length});
const preflight=await get(SUPABASE+"/rest/v1/rpc/registrar_accion_recurso_mea",{
 method:"OPTIONS",
 headers:{
  Origin:"https://crebeucayali.github.io",
  "Access-Control-Request-Method":"POST",
  "Access-Control-Request-Headers":"apikey,content-type"
 }
});
const allow=preflight.headers.get("access-control-allow-origin")||"";
const methods=preflight.headers.get("access-control-allow-methods")||"";
const hdrs=preflight.headers.get("access-control-allow-headers")||"";
assert.ok(preflight.status>=200 && preflight.status<300,"Falla preflight RPC "+preflight.status);
assert.ok(allow==="*" || allow==="https://crebeucayali.github.io","CORS no permite origen MEA: "+allow);
assert.ok(methods.toUpperCase().includes("POST"),"Preflight sin POST: "+methods);
for(const h of ["apikey","content-type"])assert.ok(hdrs.toLowerCase().includes(h),"Preflight no permite "+h+": "+hdrs);
checked.push({type:"RPC-preflight",status:preflight.status,origin:allow,methods,hdrs});
console.log("VALIDACION_SEGURA_READONLY",JSON.stringify(checked,null,2));
console.log("IMPORTANTE: Esta prueba no ejecuta POST, no registra descargas ni modifica contadores.");
