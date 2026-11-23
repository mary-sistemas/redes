/* Tema: Cableado estructurado · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);

/* ---------- subsistemas ---------- */
const subs=[
 {n:"Acometida / entrada",c:"--l1",t:"Por donde llegan los cables de los operadores (fibra, cobre) al edificio.",m:"—"},
 {n:"Sala de equipos (MDF)",c:"--l7",t:"El distribuidor principal: aquí terminan la acometida y los troncales, y están los equipos centrales (router, núcleo, servidores).",m:"—"},
 {n:"Cableado de campus",c:"--l6",t:"Une edificios distintos de un mismo recinto.",m:"Fibra monomodo o multimodo de exterior; a veces un radioenlace."},
 {n:"Cableado vertical (troncal)",c:"--l3",t:"Une los cuartos de comunicaciones de cada planta con la sala de equipos.",m:"Fibra (multimodo hasta unos 2000 m orientativos, monomodo para más); cobre si es corto."},
 {n:"Cuarto de planta (IDF)",c:"--l2",t:"El armario de cada planta: panel de parcheo, switches de acceso y panel de fibra del vertical.",m:"—"},
 {n:"Cableado horizontal",c:"--l4",t:"De cada roseta al panel de parcheo del cuarto de su planta. Topología en estrella.",m:"Par trenzado Cat 6/6A. Máximo 90 m fijos (100 m de canal con latiguillos)."},
 {n:"Área de trabajo",c:"--l5",t:"De la roseta al equipo del usuario: el latiguillo del puesto.",m:"Par trenzado flexible, latiguillo de 5 m como máximo."}
];
let sv=5;
function drawSub(){
  $("#subEsq").innerHTML=subs.map((s,i)=>`<button class="btn${i===sv?" sel":""}" style="--c:var(${s.c})" data-i="${i}" aria-pressed="${i===sv}">${s.n}</button>`).join("");
  $("#subEsq").querySelectorAll("button").forEach(b=>b.onclick=()=>{sv=+b.dataset.i;drawSub()});
  const s=subs[sv];$("#subDet").innerHTML=`<h3>${s.n}</h3><p>${s.t}</p><dl class="kv"><dt>Medio</dt><dd>${s.m}</dd></dl>`;
}
drawSub();

/* ---------- distancias ---------- */
const f=n=>String(n).replace(".",",");
function drawDist(){
  const p=+$("#dPan").value,h=+$("#dHor").value,u=+$("#dUsu").value,lat=p+u,tot=p+h+u;
  $("#vPan").textContent=f(p)+" m";$("#vHor").textContent=h+" m";$("#vUsu").textContent=f(u)+" m";
  const fallos=[];
  if(h>90)fallos.push(`el cable fijo mide ${h} m y pasa de 90 m`);
  if(lat>10)fallos.push(`los latiguillos suman ${f(lat)} m y pasan de 10 m`);
  if(u>5)fallos.push(`el latiguillo de usuario (${f(u)} m) pasa de los 5 m recomendados en el área de trabajo`);
  if(tot>100)fallos.push(`el canal completo mide ${f(tot)} m y pasa de 100 m`);
  $("#dRes").innerHTML=`Canal total: <b>${f(tot)} m</b> (${h} m fijos + ${f(lat)} m de latiguillos). `+
    (fallos.length?`<span class="fb mal">No cumple:</span> ${fallos.join("; ")}. Soluciones: acercar el armario, poner un switch intermedio en otro cuarto o llevar fibra hasta un punto más cercano.`:`<span class="fb ok">Cumple.</span>`);
}
["#dPan","#dHor","#dUsu"].forEach(id=>$(id).oninput=drawDist);drawDist();

/* ---------- tomas (ej. 18) ---------- */
const tom={12:"12 son solo las de los puestos. Faltan la impresora y el AP.",13:"Te falta una: la impresora o el AP también necesitan su toma.",
 14:"6 puestos × 2 tomas = 12, + 1 de la impresora + 1 del AP = 14. Se etiquetarían P1-A01 a P1-A14.",8:"Así solo pones una por puesto: la regla pide al menos 2 por puesto (datos + voz o reserva)."};
$("#tomOps").innerHTML=[8,12,13,14].map(n=>`<button class="btn" data-n="${n}">${n}</button>`).join("");
$("#tomOps").querySelectorAll("button").forEach(b=>b.onclick=()=>{
  $("#tomOps").querySelectorAll("button").forEach(x=>{x.classList.remove("ok","mal");if(x.dataset.n==="14")x.classList.add("ok")});
  const ok=b.dataset.n==="14";if(!ok)b.classList.add("mal");
  $("#tomFb").innerHTML=`<span class="fb ${ok?"ok":"mal"}">${ok?"¡Bien!":"No."}</span> ${tom[b.dataset.n]}${ok?"":" "+tom[14]} Y de las distancias del ejercicio (24, 31, 57, 72, 88, 96, 45 y 63 m), solo la de 96 m no cumple: pasa de los 90 m.`});

/* ---------- herramientas ---------- */
Repaso.test("her",[
 {q:"Tienes 48 cables llegando al armario y no sabes cuál es el de la roseta del aula 3.",ok:"Generador y sonda de tonos",exp:"Metes el tono en la roseta y lo buscas con la sonda en el armario."},
 {q:"Tienes que entregar la instalación nueva demostrando que cumple Cat 6A.",ok:"Certificador",exp:"Solo el certificador mide atenuación, diafonía, longitud… y genera el informe."},
 {q:"Acabas de crimpar un latiguillo y quieres ver si los 8 hilos están bien.",ok:"Comprobador básico",exp:"Comprueba continuidad y orden con los LED 1–8."},
 {q:"Un cable instalado falla y quieres saber a cuántos metros está el corte.",ok:"Comprobador con medida de longitud",exp:"Mide la longitud y localiza cortes o cortocircuitos."},
 {q:"Tienes que meter cada hilo en los contactos de una roseta.",ok:"Herramienta de impacto",exp:"Inserta y corta el hilo en los contactos IDC."},
 {q:"Tienes que poner un conector RJ-45 en un latiguillo.",ok:"Crimpadora",exp:"Presiona el conector para que los contactos perforen los hilos."}
],["Comprobador básico","Comprobador con medida de longitud","Certificador","Generador y sonda de tonos","Herramienta de impacto","Crimpadora"]);

/* ---------- sobresuscripción ---------- */
const num=v=>parseFloat(String(v).replace(",","."));
const fx=n=>n.toLocaleString("es-ES",{maximumFractionDigits:2});
function drawSob(){
  const p=num($("#sPu").value),v=num($("#sVe").value),u=num($("#sUp").value),uso=num($("#sUso").value);
  if(!(p>0&&v>0&&u>0&&uso>=0)){$("#sRes").textContent="Rellena todos los campos con números válidos.";return}
  const tot=p*v,ratio=tot/u,dem=tot*uso/100;
  $("#sRes").innerHTML=`Capacidad de acceso: ${fx(p)} × ${fx(v)} Gbps = <b>${fx(tot)} Gbps</b>. Sobresuscripción: ${fx(tot)} ÷ ${fx(u)} = <b>${fx(ratio)}:1</b>. `+
   `Con un ${fx(uso)} % de uso simultáneo, la demanda prevista es <b>${fx(dem)} Gbps</b>: `+(dem<=u?`<span class="fb ok">el enlace de ${fx(u)} Gbps la aguanta.</span>`:`<span class="fb mal">el enlace de ${fx(u)} Gbps se queda corto.</span> Habría que subir el enlace ascendente o añadir otro.`);
}
["#sPu","#sVe","#sUp","#sUso"].forEach(id=>$(id).oninput=drawSob);drawSob();

/* ---------- SNMP ---------- */
Repaso.ordena("snm",["Activar el agente SNMP en el dispositivo","Dar de alta el dispositivo en la aplicación de monitorización","Seleccionar los parámetros que se van a vigilar","Definir umbrales y alertas","Analizar las gráficas históricas"]);

/* ---------- preguntas ---------- */
Repaso.preguntas("estructurado",[
 ["¿Qué es el cableado estructurado y qué ventaja tiene frente a tirar cables según se necesiten?","Un sistema de cableado normalizado e independiente de la aplicación, diseñado para 10–15 años. Los cambios se hacen moviendo latiguillos en el panel de parcheo, sin tirar cable nuevo: es ordenado, escalable y fácil de mantener y diagnosticar."],
 ["Nombra los subsistemas del cableado estructurado de fuera hacia dentro.","Acometida → sala de equipos (MDF) → cableado de campus (entre edificios) → cableado vertical (entre plantas) → cuarto de planta (IDF) → cableado horizontal (hasta la roseta) → área de trabajo (latiguillo al equipo)."],
 ["¿Qué medio se usa normalmente en el cableado horizontal y cuál en el vertical? ¿Por qué?","Horizontal: <b>par trenzado</b> Cat 6/6A, barato y suficiente hasta 90 m, y permite PoE. Vertical: <b>fibra</b>, porque une plantas o edificios con mucha capacidad y más distancia, y aísla eléctricamente."],
 ["¿Cuántas tomas pondrías en una oficina de 6 puestos con una impresora y un AP? ¿Cómo las etiquetarías en la planta 1, panel A?","2 por puesto (12) + 1 impresora + 1 AP = <b>14</b>. De P1-A01 a P1-A14, con la misma etiqueta en la roseta y en el puerto del panel."],
 ["Una toma está a 96 m del armario. ¿Cumple? Propón dos soluciones de capa física.","No: pasa de los 90 m del cableado horizontal permanente. Soluciones: poner un armario o switch intermedio más cerca, o llevar fibra hasta un punto cercano y desde ahí cobre."],
 ["¿Para qué sirve el panel de parcheo?","Termina el cable horizontal rígido por detrás y ofrece puertos RJ-45 por delante. Con latiguillos cortos se decide a qué puerto del switch va cada roseta, sin tocar el cableado fijo."],
 ["¿Qué es una U de rack y cuánto mide un rack estándar de ancho?","1 U = 44,45 mm (1,75 pulgadas) de altura. El ancho estándar es de 19 pulgadas (482,6 mm)."],
 ["Cita cuatro requisitos de un cuarto de comunicaciones.","Centrado (ningún cable horizontal &gt; 90 m), exclusivo y con llave, 18–24 °C y 40–60 % de humedad, SAI y toma de tierra, lejos de agua e interferencias, extintor de CO₂."],
 ["¿Por qué hay que separar los cables de datos de los de corriente y cómo se hace?","Los cables eléctricos, motores y fluorescentes generan interferencias. Se separan al menos 30 cm en paralelo (o canaleta con separador metálico) y se cruzan en perpendicular."],
 ["¿Por qué no se pueden empalmar cables de cobre en el tendido horizontal y la fibra sí?","El empalme de cobre rompe el trenzado y la impedancia, y degrada la señal. La fibra admite empalmes por fusión con pérdidas muy pequeñas (~0,05 dB)."],
 ["Diferencia entre comprobador básico y certificador.","El comprobador solo verifica continuidad y orden de los hilos. El certificador mide atenuación, diafonía, longitud, retardo… y certifica que el enlace cumple su categoría con un informe."],
 ["Explica las tres capas del diseño jerárquico y qué es un núcleo colapsado.","Acceso: conecta usuarios (PoE, seguridad de puerto). Distribución: agrupa el acceso y aplica políticas (ACL, QoS, enrutamiento entre VLAN). Núcleo: transporte muy rápido y redundante, sin lógica pesada. Núcleo colapsado: en redes pequeñas, núcleo y distribución en una sola capa."],
 ["Un switch tiene 48 puertos de 1 Gbps y un enlace ascendente de 10 Gbps. ¿Cuál es la sobresuscripción?","48 Gbps ÷ 10 Gbps = <b>4,8:1</b>."],
 ["Diferencia entre mapa físico y mapa lógico, con un dato de cada uno.","Físico: dónde están los equipos y cables (capa 1), por ejemplo «SW-A1 Gi0/12 → panel A puerto 12 → roseta P0-A12». Lógico: cómo fluye la información (capas 2-3), por ejemplo «VLAN 10, 192.168.10.0/24, gateway .1»."],
 ["En SNMP, ¿qué son el gestor, el agente y la MIB? ¿Qué versión recomiendas y por qué?","Gestor: la aplicación que consulta (Zabbix). Agente: el software del equipo vigilado. MIB: el árbol de variables del equipo. Se recomienda <b>SNMPv3</b> porque autentica y cifra; v1 y v2c mandan la comunidad sin cifrar."],
 ["¿Por qué no hay que usar la comunidad «public» en SNMP?","Es la que viene por defecto y la primera que prueba cualquiera: permitiría leer la topología y el estado de la red, o incluso cambiar la configuración si es de escritura."]
]);
})();
