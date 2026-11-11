import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ORIGIN="http://127.0.0.1:8765";
const samplePng=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFUlEQVR4nGP8//8/AzbAhFV00EoAAFbUAw037MyjAAAAAElFTkSuQmCC","base64");
const cases=[
 {label:"pictogramas PNG",page:"pictogramas/pictogramas.html",expected:"pictogramas:png:descarga_solicitada",extension:".png",prepare:async p=>{
   await p.locator("#buscador-pictogramas").fill("comer");
   await p.locator("#formulario-pictogramas").evaluate(el=>el.requestSubmit());
   await p.locator(".descargar-png").first().waitFor();
 },select:".descargar-png"},
 {label:"rutinas PDF",page:"rutinas/rutinas.html",expected:"rutinas:pdf:exportacion_iniciada",extension:".pdf",select:"#descargar-pdf"},
 {label:"rutinas JPG",page:"rutinas/rutinas.html",expected:"rutinas:jpg:exportacion_iniciada",extension:".jpg",prepare:async p=>p.locator("#descargar-jpg").evaluate(x=>x.hidden=false),select:"#descargar-jpg"},
 {label:"braille PDF",page:"generador/generador.html",expected:"braille:pdf:exportacion_iniciada",extension:".pdf",prepare:async p=>p.locator("#entrada-braille").fill("mesa"),select:"#descargar-pdf-braille"},
 {label:"dactilología LSP PDF",page:"generador-lsp/index.html",expected:"dactilologia_lsp:pdf:exportacion_iniciada",extension:".pdf",prepare:async p=>{await p.locator("#texto-senas").fill("mesa");await p.locator("#generar").click();await p.locator("#descargar").waitFor({state:"visible"});},select:"#descargar"},
 {label:"apoyos LSP PDF",page:"apoyos-lsp/generador-lsp.html",expected:"apoyos_lsp:pdf:exportacion_iniciada",extension:".pdf",prepare:async p=>{await p.locator("#texto-senas").fill("mesa");await p.locator("#generar").click();},select:"#descargar"},
 {label:"conciencia fonológica HTML",page:"conciencia-fonologica/conciencia-fonologica.html",expected:"conciencia_fonologica:html:exportacion_iniciada",extension:".html",select:"#descargarHtml"}
];
const browser=await chromium.launch({headless:true});
const failures=[],results=[];
async function execute(testCase, offline=false, mobile=false){
  const context=await browser.newContext({acceptDownloads:true,...(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1280,height:900}})});
  const page=await context.newPage();
  const events=[],errors=[],requests=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",msg=>{if(msg.type()==="error")errors.push(msg.text());});
  page.on("requestfailed",req=>requests.push({url:req.url(),failure:req.failure()?.errorText}));
  await page.route("**/*",async route=>{
    const url=route.request().url();
    if(url.startsWith(ORIGIN))return route.continue();
    const headers={"access-control-allow-origin":"*"};
    if(url.includes("/rpc/registrar_accion_recurso_mea")){
      if(!offline)events.push(JSON.parse(route.request().postData()||"{}"));
      return route.fulfill({status:offline?503:200,headers,contentType:"application/json",body:offline?'{"error":"simulated"}':"true"});
    }
    if(url.includes("api.arasaac.org/api/pictograms/es/search/"))
      return route.fulfill({status:200,headers,contentType:"application/json",body:'[{"_id":1234,"keywords":[{"keyword":"comer"}]}]'});
    if(url.includes("static.arasaac.org/pictograms/"))
      return route.fulfill({status:200,headers,contentType:"image/png",body:samplePng});
    if(url.includes("diccionario_lsp.json")) {
      const dict=["m","e","s","a","mesa"].map(p=>({palabra:p,archivo_imagen:"imagenes/alfabeto_manual_peruano/"+p+".png"}));
      return route.fulfill({status:200,headers,contentType:"application/json",body:JSON.stringify(dict)});
    }
    if(url.includes("/banco-digital-accesible/lsp/imagenes/"))
      return route.fulfill({status:200,headers,contentType:"image/png",body:samplePng});
    if(url.endsWith(".js")||url.includes(".js?"))
      return route.fulfill({status:200,headers,contentType:"application/javascript",body:""});
    if(url.endsWith(".css")||url.includes(".css?"))
      return route.fulfill({status:200,headers,contentType:"text/css",body:""});
    return route.fulfill({status:200,headers,contentType:"text/plain",body:""});
  });
  try{
    await page.goto(ORIGIN+"/"+testCase.page,{waitUntil:"domcontentloaded",timeout:25000});
    await page.waitForFunction(()=>Boolean(window.EVARecursos),null,{timeout:15000});
    if(testCase.prepare)await testCase.prepare(page);
    if(testCase.expected.includes("_lsp:pdf")) {
      const images=page.locator("#resultado .letra-sena img, #resultado .sena-completa img");
      assert.ok(await images.count()>0,"El generador LSP no incorporó imágenes de señas");
      const imageState=await images.first().evaluate(img=>({src:img.currentSrc,complete:img.complete,width:img.naturalWidth}));
      assert.ok(imageState.width>0,"Imagen LSP no cargada: "+JSON.stringify({imageState,requests,errors}));
    }
    await page.locator(testCase.select).waitFor({state:"visible"});
    const [download]=await Promise.all([
      page.waitForEvent("download",{timeout:25000}),
      page.locator(testCase.select).click({timeout:10000})
    ]);
    assert.ok(download.suggestedFilename().toLowerCase().endsWith(testCase.extension),"Extensión incorrecta: "+download.suggestedFilename());
    const saved=await download.path();
    assert.ok(saved,"Archivo no disponible");
    const fileBytes=await readFile(saved);
    assert.ok(fileBytes.length>20,"Archivo vacío o incompleto");
    if(testCase.extension===".pdf")assert.equal(fileBytes.subarray(0,4).toString(),"%PDF","Archivo PDF inválido");
    if(testCase.extension===".png")assert.equal(fileBytes.subarray(1,4).toString(),"PNG","Archivo PNG inválido");
    if(testCase.extension===".jpg")assert.equal(fileBytes.subarray(0,2).toString("hex"),"ffd8","Archivo JPG inválido");
    if(testCase.extension===".html")assert.match(fileBytes.toString("utf8").slice(0,100),/<!doctype html>/i,"Archivo HTML inválido");
    await page.waitForTimeout(300);
    if(!offline){
      assert.equal(events.length,1,"Se esperaba una acción estadística");
      const e=events[0];
      assert.equal([e.p_herramienta,e.p_formato,e.p_accion].join(":"),testCase.expected,"Evento incorrecto");
      assert.deepEqual(Object.keys(e).sort(),["p_accion","p_evento_id","p_formato","p_herramienta"]);
    }
    results.push({case:testCase.label,mode:(mobile?"Móvil simulado / ":"Escritorio / ")+(offline?"RPC falla":"RPC responde"),file:download.suggestedFilename(),bytes:fileBytes.length,events:events.length,passed:true});
  }catch(e){
    failures.push({case:testCase.label,mode:(mobile?"Móvil simulado / ":"Escritorio / ")+(offline?"RPC falla":"RPC responde"),message:e.stack||String(e),errors});
  }finally{
    await context.close();
  }
}
try{
  for(const scenario of cases)await execute(scenario,false);
  // El sistema estadístico debe ser opcional: probar descarga aun con error HTTP.
  for(const scenario of [cases[0],cases[1],cases[6]])await execute(scenario,true);
  for(const scenario of cases)await execute(scenario,false,true);
  console.log("RESULTADOS",JSON.stringify(results,null,2));
  if(failures.length){console.error("FALLOS",JSON.stringify(failures,null,2));process.exitCode=1;}
}finally{await browser.close();}
