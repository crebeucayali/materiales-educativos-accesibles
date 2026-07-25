(() => {
'use strict';
const crearItem = (id, etiqueta, nombre, puntos, grupo = 'alfabeto') => ({
id,
etiqueta,
nombre,
grupo,
celdas: Array.isArray(puntos[0]) ? puntos : [puntos]
});
const alfabeto = [
['A',[1]],['B',[1,2]],['C',[1,4]],['D',[1,4,5]],['E',[1,5]],['F',[1,2,4]],['G',[1,2,4,5]],['H',[1,2,5]],['I',[2,4]],['J',[2,4,5]],
['K',[1,3]],['L',[1,2,3]],['M',[1,3,4]],['N',[1,3,4,5]],['Ñ',[1,2,4,5,6]],['O',[1,3,5]],['P',[1,2,3,4]],['Q',[1,2,3,4,5]],['R',[1,2,3,5]],['S',[2,3,4]],['T',[2,3,4,5]],
['U',[1,3,6]],['V',[1,2,3,6]],['W',[2,4,5,6]],['X',[1,3,4,6]],['Y',[1,3,4,5,6]],['Z',[1,3,5,6]]
].map(([letra,puntos]) => crearItem(`letra-${letra}`, letra, `letra ${letra}`, puntos));
const acentuacion = [
crearItem('acentuada-a','Á','letra Á',[1,2,3,5,6],'acentuacion'),
crearItem('acentuada-e','É','letra É',[2,3,4,6],'acentuacion'),
crearItem('acentuada-i','Í','letra Í',[3,4],'acentuacion'),
crearItem('acentuada-o','Ó','letra Ó',[3,4,6],'acentuacion'),
crearItem('acentuada-u','Ú','letra Ú',[2,3,4,5,6],'acentuacion'),
crearItem('dieresis-u','Ü','letra Ü',[1,2,5,6],'acentuacion')
];
const puntuacion = [
crearItem('puntuacion-coma',',','coma',[2],'puntuacion'),
crearItem('puntuacion-punto','.','punto',[2,5,6],'puntuacion'),
crearItem('puntuacion-punto-coma',';','punto y coma',[2,3],'puntuacion'),
crearItem('puntuacion-dos-puntos',':','dos puntos',[2,5],'puntuacion'),
crearItem('puntuacion-interrogacion','?','signo de interrogación',[2,6],'puntuacion'),
crearItem('puntuacion-exclamacion','!','signo de exclamación',[2,3,5],'puntuacion'),
crearItem('puntuacion-guion','-','guion',[3,6],'puntuacion')
];
const prefijoNumero = [3,4,5,6];
const baseNumeros = [
['1',[1]],['2',[1,2]],['3',[1,4]],['4',[1,4,5]],['5',[1,5]],
['6',[1,2,4]],['7',[1,2,4,5]],['8',[1,2,5]],['9',[2,4]],['0',[2,4,5]]
];
const numeros = baseNumeros.map(([numero,puntos]) => crearItem(`numero-${numero}`, numero, `número ${numero}`, [prefijoNumero,puntos], 'numeros'));
const prefijoMayuscula = [4,6];
const mayusculas = alfabeto.map(item => crearItem(`mayuscula-${item.etiqueta}`, item.etiqueta, `${item.etiqueta} mayúscula`, [prefijoMayuscula,item.celdas[0]], 'mayusculas'));
const grupos = { alfabeto, acentuacion, puntuacion, numeros, mayusculas };
const niveles = {
inicial:{nombre:'Nivel 1: Explorador Braille',etiqueta:'Nivel inicial',logro:'Explorador Braille',cantidadLetras:10,total:10,pistas:99,numeros:true,modoFijo:'lectura',tipoFijo:'signo-letra',umbral:0,criterio:'Constancia al completar los 10 ejercicios.'},
intermedio:{nombre:'Nivel 2: Reconocedor Braille',etiqueta:'Nivel intermedio',logro:'Reconocedor Braille',cantidadLetras:27,total:15,pistas:3,numeros:true,modoFijo:null,tipoFijo:null,umbral:.80,criterio:'Constancia con al menos 80 % de aciertos al primer intento.'},
avanzado:{nombre:'Nivel 3: Desafío Braille',etiqueta:'Nivel avanzado',logro:'Desafío Braille',cantidadLetras:27,total:20,pistas:0,numeros:false,modoFijo:null,tipoFijo:null,umbral:.90,criterio:'Constancia con al menos 90 % de aciertos al primer intento y sin pistas.'},
personalizado:{nombre:'Nivel 4: Práctica personalizada',etiqueta:'Práctica personalizada',logro:'Especialista Braille',cantidadLetras:27,total:20,pistas:3,numeros:true,modoFijo:null,tipoFijo:null,umbral:.85,criterio:'Constancia con al menos 85 % de aciertos al primer intento.'}
};
const $ = id => document.getElementById(id);
const tarjetas = [...document.querySelectorAll('.tarjeta-nivel')];
const radiosModo = [...document.querySelectorAll('input[name="modo"]')];
const radiosTipo = [...document.querySelectorAll('input[name="tipo"]')];
const casillasContenido = [...document.querySelectorAll('input[name="grupo-contenido"]')];
const panelPractica = $('panel-practica');
const panelNiveles = $('seleccion-nivel');
const configuracionContenido = $('configuracion-contenido');
const resultado = $('resultado');
let nivelClave='inicial';
let configuracion=niveles.inicial;
let universoActual=alfabeto.slice(0,10);
let ejercicios=[];
let indice=0;
let seleccion='';
let intentos=0;
let aciertosPrimerIntento=0;
let errores=0;
let pistasUsadas=0;
let modo='lectura';
let tipo='signo-letra';
let numerosVisibles=true;
let ayudaActiva=true;
function mezclar(lista){
const copia=[...lista];
for(let i=copia.length-1;i>0;i-=1){
const j=Math.floor(Math.random()*(i+1));
[copia[i],copia[j]]=[copia[j],copia[i]];
}
return copia;
}
function gruposSeleccionados(){
return ['alfabeto',...casillasContenido.filter(c=>!c.disabled&&c.checked).map(c=>c.value)];
}
function actualizarResumenContenidos(){
const nombres={alfabeto:'alfabeto español',acentuacion:'acentuación y diéresis',puntuacion:'signos de puntuación',numeros:'números',mayusculas:'mayúsculas'};
$('resumen-contenidos').textContent=`Contenido seleccionado: ${gruposSeleccionados().map(g=>nombres[g]).join(', ')}.`;
}
function obtenerUniverso(){
if(nivelClave!=='personalizado') return alfabeto.slice(0,configuracion.cantidadLetras);
return gruposSeleccionados().flatMap(grupo=>grupos[grupo]);
}
function prepararEjercicios(){
universoActual=obtenerUniverso();
const lista=[];
while(lista.length<configuracion.total) lista.push(...mezclar(universoActual));
ejercicios=lista.slice(0,configuracion.total);
}
function aplicarConfiguracionEjercicio(){
if(configuracion.modoFijo) modo=configuracion.modoFijo;
if(configuracion.tipoFijo) tipo=configuracion.tipoFijo;
radiosModo.forEach(r=>{
r.checked=r.value===modo;
r.disabled=Boolean(configuracion.modoFijo);
});
radiosTipo.forEach(r=>{
r.checked=r.value===tipo;
r.disabled=Boolean(configuracion.tipoFijo)||nivelClave==='intermedio';
});
}
function actualizarApoyos(){
const quedanPistas=configuracion.pistas>pistasUsadas;
const puedeConfigurarAyuda=nivelClave==='inicial' || nivelClave==='intermedio' || nivelClave==='personalizado';
$('interruptor-numeros').checked=numerosVisibles;
$('interruptor-numeros').disabled=nivelClave==='avanzado';
$('estado-numeros').textContent=numerosVisibles?'Visible':'Oculta';
$('descripcion-numeros').textContent=numerosVisibles?'Los números están visibles.':'Los números están ocultos para aumentar la complejidad.';
$('interruptor-ayuda').checked=ayudaActiva&&quedanPistas;
$('interruptor-ayuda').disabled=!puedeConfigurarAyuda || !quedanPistas;
const ayudaDisponible=ayudaActiva&&quedanPistas;
$('contenedor-pista').hidden=!ayudaDisponible;
$('mensaje-sin-ayuda').hidden=ayudaDisponible;
$('estado-ayuda').textContent=ayudaDisponible?'Activada':'Desactivada';
$('descripcion-ayuda').textContent=ayudaDisponible?(configuracion.pistas===99?'Las pistas están disponibles.':`Quedan ${configuracion.pistas-pistasUsadas} pistas.`):'La ayuda está desactivada o ya no quedan pistas.';
$('pistas-restantes').textContent=configuracion.pistas===99?'':`(${Math.max(0,configuracion.pistas-pistasUsadas)})`;
}
function crearCelda(puntos,pequena=false){
const celda=document.createElement('div');
celda.className=`mini-celda ${modo==='escritura'?'modo-regleta':'modo-lectura'}${pequena?' pequena':''}${numerosVisibles?'':' sin-numeros'}`;
celda.setAttribute('aria-hidden','true');
const orden=modo==='escritura'?[4,1,5,2,6,3]:[1,4,2,5,3,6];
orden.forEach(n=>{
const p=document.createElement('span');
p.className=puntos.includes(n)?'mini-punto activo':'mini-punto';
p.innerHTML=`<span>${n}</span>`;
celda.appendChild(p);
});
return celda;
}
function crearSigno(item,pequeno=false){
const contenedor=document.createElement('div');
contenedor.className=`secuencia-braille${pequeno?' secuencia-pequena':''}`;
item.celdas.forEach(celda=>contenedor.appendChild(crearCelda(celda,pequeno)));
return contenedor;
}
function opcionesPara(objetivo){
const conjunto=new Set([objetivo.id]);
while(conjunto.size<Math.min(4,universoActual.length)) conjunto.add(universoActual[Math.floor(Math.random()*universoActual.length)].id);
return mezclar([...conjunto]).map(id=>universoActual.find(x=>x.id===id));
}
function seleccionar(contenedor,boton,valor){
[...contenedor.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed','false'));
boton.setAttribute('aria-pressed','true');
seleccion=valor;
}
function textoOpcion(item){
if(item.grupo==='puntuacion') return `${item.nombre} (${item.etiqueta})`;
if(item.grupo==='numeros') return `Número ${item.etiqueta}`;
if(item.grupo==='mayusculas') return item.nombre;
return item.etiqueta;
}
function renderizarOpciones(){
const objetivo=ejercicios[indice];
const letras=$('opciones-letras');
const signos=$('opciones-signos');
const signo=$('signo-principal');
const letra=$('letra-objetivo');
letras.innerHTML='';
signos.innerHTML='';
signo.innerHTML='';
if(tipo==='signo-letra'){
letra.hidden=true;
letras.hidden=false;
signo.hidden=false;
signos.hidden=true;
signo.appendChild(crearSigno(objetivo));
opcionesPara(objetivo).forEach(op=>{
const b=document.createElement('button');
b.type='button';
b.className='opcion-letra';
b.textContent=textoOpcion(op);
b.setAttribute('aria-pressed','false');
b.onclick=()=>seleccionar(letras,b,op.id);
letras.appendChild(b);
});
}else{
letra.hidden=false;
letra.textContent=textoOpcion(objetivo);
letras.hidden=true;
signo.hidden=true;
signos.hidden=false;
opcionesPara(objetivo).forEach(op=>{
const b=document.createElement('button');
b.type='button';
b.className='opcion-signo';
b.setAttribute('aria-pressed','false');
b.setAttribute('aria-label',`Opción Braille para ${op.nombre}`);
b.appendChild(crearSigno(op,true));
b.onclick=()=>seleccionar(signos,b,op.id);
signos.appendChild(b);
});
}
}
function actualizarTextosEjercicio(){
$('titulo-practica').textContent=`${modo==='escritura'?'Escritura en regleta':'Lectura'}: ${tipo==='signo-letra'?'signo a carácter':'carácter a signo'}`;
$('instruccion').textContent=tipo==='signo-letra'?'Observa el signo Braille y selecciona el carácter que representa.':'Observa el carácter y selecciona su representación Braille.';
$('titulo-orientacion').textContent=modo==='escritura'?'Orientación de escritura en regleta':'Orientación de lectura';
$('texto-orientacion').textContent=modo==='escritura'?'Puntos 4, 5 y 6 a la izquierda; puntos 1, 2 y 3 a la derecha.':'Puntos 1, 2 y 3 a la izquierda; puntos 4, 5 y 6 a la derecha.';
$('etiqueta-panel-izquierdo').textContent=tipo==='signo-letra'?'Opciones de caracteres':'Carácter determinado';
$('titulo-panel-izquierdo').textContent=tipo==='signo-letra'?'Elige el carácter correcto':'Carácter a representar';
$('etiqueta-panel-derecho').textContent=tipo==='signo-letra'?'Signo a identificar':'Opciones de signos';
$('titulo-panel-derecho').textContent=tipo==='signo-letra'?'Observa el signo Braille':'Elige el signo correcto';
}
function refrescarEjercicioPorConfiguracion(){
seleccion='';
intentos=0;
actualizarTextosEjercicio();
renderizarOpciones();
$('boton-comprobar').disabled=false;
$('boton-siguiente').disabled=true;
resultado.className='resultado';
resultado.textContent='La configuración se actualizó. Selecciona una respuesta y comprueba.';
}
function mostrarEjercicio(){
seleccion='';
intentos=0;
aplicarConfiguracionEjercicio();
actualizarApoyos();
$('numero-ejercicio').textContent=indice+1;
$('total-ejercicios').textContent=configuracion.total;
$('aciertos').textContent=aciertosPrimerIntento;
$('errores').textContent=errores;
$('etiqueta-nivel').textContent=configuracion.etiqueta;
actualizarTextosEjercicio();
$('boton-comprobar').disabled=false;
$('boton-siguiente').disabled=true;
resultado.className='resultado';
resultado.textContent='Selecciona una respuesta y comprueba.';
renderizarOpciones();
}
function finalizar(){
const porcentaje=aciertosPrimerIntento/configuracion.total;
const aprobado=configuracion.umbral===0||porcentaje>=configuracion.umbral;
resultado.className=`resultado ${aprobado?'correcto':'incorrecto'}`;
resultado.textContent=`Actividad completada. Obtuviste ${aciertosPrimerIntento} aciertos al primer intento de ${configuracion.total} (${Math.round(porcentaje*100)} %).`;
$('boton-comprobar').disabled=true;
$('boton-siguiente').disabled=true;
$('panel-constancia').hidden=!aprobado;
if(aprobado){
$('texto-logro-panel').textContent=`Completaste ${configuracion.nombre} y alcanzaste el criterio del nivel. Escribe tu nombre para generar el reconocimiento.`;
$('panel-constancia').scrollIntoView({behavior:'smooth',block:'center'});
}else{
resultado.textContent+=` Para obtener la constancia necesitas alcanzar al menos ${Math.round(configuracion.umbral*100)} % al primer intento.`;
}
}
function iniciar(){
configuracion=niveles[nivelClave];
indice=0;
aciertosPrimerIntento=0;
errores=0;
pistasUsadas=0;
modo='lectura';
tipo='signo-letra';
numerosVisibles=configuracion.numeros;
ayudaActiva=configuracion.pistas>0;
$('panel-constancia').hidden=true;
prepararEjercicios();
panelNiveles.hidden=true;
panelPractica.hidden=false;
mostrarEjercicio();
panelPractica.scrollIntoView({behavior:'smooth'});
}
function volverAlPanelDeNiveles(){
panelPractica.hidden=true;
panelNiveles.hidden=false;
$('panel-constancia').hidden=true;
const tituloNiveles=$('titulo-niveles');
panelNiveles.scrollIntoView({behavior:'smooth',block:'start'});
window.setTimeout(()=>{
tituloNiveles.setAttribute('tabindex','-1');
tituloNiveles.focus({preventScroll:true});
},350);
}
tarjetas.forEach(t=>t.addEventListener('click',()=>{
nivelClave=t.dataset.nivel;
configuracion=niveles[nivelClave];
tarjetas.forEach(x=>{
const activa=x===t;
x.classList.toggle('activa',activa);
x.setAttribute('aria-pressed',String(activa));
});
configuracionContenido.hidden=nivelClave!=='personalizado';
$('nombre-nivel-seleccionado').textContent=configuracion.nombre;
$('criterio-nivel').textContent=configuracion.criterio;
if(nivelClave==='personalizado') actualizarResumenContenidos();
}));
casillasContenido.forEach(c=>c.addEventListener('change',actualizarResumenContenidos));
$('seleccionar-todos').addEventListener('click',()=>{
casillasContenido.forEach(c=>{if(!c.disabled)c.checked=true;});
actualizarResumenContenidos();
});
$('quitar-adicionales').addEventListener('click',()=>{
casillasContenido.forEach(c=>{if(!c.disabled)c.checked=false;});
actualizarResumenContenidos();
});
radiosModo.forEach(r=>r.addEventListener('change',()=>{
if(r.disabled || !r.checked) return;
modo=r.value;
refrescarEjercicioPorConfiguracion();
}));
radiosTipo.forEach(r=>r.addEventListener('change',()=>{
if(r.disabled || !r.checked) return;
tipo=r.value;
refrescarEjercicioPorConfiguracion();
}));
$('interruptor-ayuda').addEventListener('change',e=>{
ayudaActiva=e.target.checked;
actualizarApoyos();
});
$('interruptor-numeros').addEventListener('change',e=>{
if(nivelClave==='avanzado') return;
numerosVisibles=e.target.checked;
actualizarApoyos();
document.querySelectorAll('.mini-celda').forEach(c=>c.classList.toggle('sin-numeros',!numerosVisibles));
});
$('iniciar-nivel').addEventListener('click',iniciar);
$('cambiar-nivel').addEventListener('click',volverAlPanelDeNiveles);
$('volver-niveles').addEventListener('click',volverAlPanelDeNiveles);
$('boton-comprobar').addEventListener('click',()=>{
if(!seleccion){
resultado.className='resultado incorrecto';
resultado.textContent='Selecciona primero una respuesta.';
return;
}
intentos+=1;
const correcto=seleccion===ejercicios[indice].id;
if(correcto){
if(intentos===1) aciertosPrimerIntento+=1;
$('aciertos').textContent=aciertosPrimerIntento;
resultado.className='resultado correcto';
resultado.textContent=intentos===1?'Respuesta correcta al primer intento.':'Respuesta correcta. Puedes continuar.';
$('boton-comprobar').disabled=true;
$('boton-siguiente').disabled=false;
}else{
errores+=1;
$('errores').textContent=errores;
resultado.className='resultado incorrecto';
resultado.textContent='La respuesta no es correcta. Inténtalo nuevamente.';
}
});
$('boton-siguiente').addEventListener('click',()=>{
if(indice<configuracion.total-1){
indice+=1;
mostrarEjercicio();
}else{
finalizar();
}
});
$('boton-pista').addEventListener('click',()=>{
if(!ayudaActiva || configuracion.pistas<=pistasUsadas) return;
pistasUsadas+=1;
const e=ejercicios[indice];
const descripcion=e.celdas.map((celda,i)=>`${e.celdas.length>1?`celda ${i+1}, `:''}puntos ${celda.join(', ')}`).join('; ');
const mensaje=`${e.nombre} utiliza ${descripcion}.`;
resultado.className='resultado';
resultado.textContent=mensaje;
actualizarApoyos();
if('speechSynthesis' in window){
window.speechSynthesis.cancel();
const voz=new SpeechSynthesisUtterance(mensaje);
voz.lang='es-PE';
window.speechSynthesis.speak(voz);
}
});
const dialogo=$('dialogo-constancia');
$('generar-constancia').addEventListener('click',()=>{
const nombre=$('nombre-constancia').value.trim();
if(!nombre){
$('nombre-constancia').setCustomValidity('Escribe el nombre del participante.');
$('nombre-constancia').reportValidity();
return;
}
$('nombre-constancia').setCustomValidity('');
$('constancia-nombre').textContent=nombre;
$('constancia-nivel').textContent=configuracion.nombre;
$('constancia-logro').textContent=`Logro motivacional: ${configuracion.logro}`;
$('constancia-texto').textContent=`por completar satisfactoriamente ${configuracion.nombre}, alcanzando ${Math.round((aciertosPrimerIntento/configuracion.total)*100)} % de respuestas correctas al primer intento.`;
$('constancia-fecha').textContent=new Intl.DateTimeFormat('es-PE',{dateStyle:'long'}).format(new Date());
$('constancia-codigo').textContent=`MEA-BRAILLE-V2-${nivelClave.toUpperCase()}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
dialogo.showModal();
});
$('nombre-constancia').addEventListener('input',e=>e.target.setCustomValidity(''));
$('cerrar-constancia').addEventListener('click',()=>dialogo.close());
$('imprimir-constancia').addEventListener('click',()=>window.print());
dialogo.addEventListener('click',e=>{if(e.target===dialogo)dialogo.close();});
actualizarResumenContenidos();
})();