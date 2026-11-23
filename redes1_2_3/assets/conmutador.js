/* Tema: El conmutador · animaciones y preguntas */
(function(){
const $=s=>document.querySelector(s);
const R=Repaso;

/* ---------- tipos (ej. 8) ---------- */
R.test("tsw",[
 {q:"Una oficina de 8 puestos, sin personal técnico, que solo necesita conectar equipos.",ok:"No gestionable",exp:"Criterio: gestión. Se enchufa y funciona."},
 {q:"Un centro que debe configurar puertos, seguridad de puertos y STP.",ok:"Gestionable",exp:"Criterio: gestión. Hace falta consola, SSH, web o SNMP."},
 {q:"Alimentar 12 cámaras IP y 4 puntos de acceso por el mismo cable de datos.",ok:"Con PoE",exp:"Criterio: alimentación PoE (802.3af/at/bt)."},
 {q:"Conectar los 24 PC de un aula.",ok:"De acceso",exp:"Criterio: ubicación. Muchos puertos para equipos finales."},
 {q:"Agregar el tráfico de los 10 switches de acceso de un edificio.",ok:"De distribución",exp:"Criterio: ubicación. Agrega y transporta a alta velocidad."},
 {q:"Enrutar tráfico entre redes internas a velocidad de conmutación.",ok:"De nivel 3",exp:"Criterio: capa de funcionamiento. Enruta por hardware (ASIC)."}
],["No gestionable","Gestionable","Con PoE","De acceso","De distribución","De nivel 3"]);

/* ---------- tabla MAC animada (ej. 9) ---------- */
const P={A:[70,150],B:[570,150],HUB:[320,265],C:[200,315],D:[440,315],SW:[320,150],p1:[250,150],p2:[390,150],p3:[320,180]};
const MAC={A:"AA",B:"BB",C:"CC",D:"DD"},COL={A:"#d9485f",B:"#2f5bd3",C:"#23854a",D:"#b5770d"};
const puertoDe={A:1,B:2,C:3,D:3};
let tabla={},ultima=null,cap=null,ocup=false;
function dibuja(){
  const s=$("#swSvg");s.innerHTML="";
  [["A","p1"],["B","p2"]].forEach(([h,p])=>R.el("line",{x1:P[h][0],y1:P[h][1],x2:P[p][0],y2:P[p][1],class:"lnk"},s));
  R.el("line",{x1:P.p3[0],y1:P.p3[1],x2:P.HUB[0],y2:P.HUB[1],class:"lnk"},s);
  ["C","D"].forEach(h=>R.el("line",{x1:P[h][0],y1:P[h][1],x2:P.HUB[0],y2:P.HUB[1],class:"lnk"},s));
  R.el("rect",{x:250,y:120,width:140,height:60,rx:8,class:"dev sw"},s);
  let t=R.el("text",{x:320,y:155,"text-anchor":"middle"},s);t.textContent="SWITCH";
  [["1",256,145],["2",378,145],["3",324,174]].forEach(([n,x,y])=>{t=R.el("text",{x,y,class:"peq"},s);t.textContent=n});
  R.el("rect",{x:290,y:252,width:60,height:26,rx:5,class:"dev hub"},s);t=R.el("text",{x:320,y:269,"text-anchor":"middle"},s);t.textContent="HUB";
  ["A","B","C","D"].forEach(h=>{R.el("rect",{x:P[h][0]-28,y:P[h][1]-16,width:56,height:32,rx:6,class:"dev pc",id:"h-"+h,style:`stroke:${COL[h]}`},s);
    t=R.el("text",{x:P[h][0],y:P[h][1]+4,"text-anchor":"middle"},s);t.textContent=`${h} · ${MAC[h]}`});
}
function pintaTabla(){
  const filas=Object.entries(tabla);
  $("#swTabla").innerHTML=filas.length?filas.map(([m,p])=>`<tr class="${ultima&&ultima.m===m?ultima.cls:""}"><td>${m}</td><td>${p}</td><td>DYNAMIC</td></tr>`).join(""):'<tr><td colspan="3" class="marcador">Vacía</td></tr>';
  $("#swCap").textContent=cap?`Ocupación: ${filas.length} de ${cap} entradas`:"";
}
const ruta={1:[P.p1,P.A],2:[P.p2,P.B],3:[P.p3,P.HUB]};
const subida={A:[P.A,P.p1],B:[P.B,P.p2]};
function marcaH(h,ok){const r=$("#h-"+h);if(!r)return;r.classList.add(ok?"on":"no");setTimeout(()=>r.classList.remove("on","no"),1400)}
async function hubReparte(origen,txt,color,dst){ // desde el hub hacia C y D (menos el origen)
  await Promise.all(["C","D"].filter(h=>h!==origen).map(h=>R.trama($("#swSvg"),[P.HUB,P[h]],{txt,color,dur:600}).then(()=>marcaH(h,dst==="BC"||dst===h))));
}
async function envia(src,dst){
  const txt=`${src}→${dst==="BC"?"FF":dst}`,color=COL[src],sub=$("#swTxt");
  const inP=puertoDe[src];let msg="";
  // 1. llega al switch
  if(src==="C"||src==="D"){
    sub.innerHTML=`${src} manda una trama a ${dst==="BC"?"todos (broadcast)":dst}. Primero pasa por el <b>hub</b>, que la repite a todos sus puertos…`;
    await R.trama($("#swSvg"),[P[src],P.HUB],{txt,color,dur:600});
    await Promise.all([hubReparte(src,txt,color,dst),R.trama($("#swSvg"),[P.HUB,P.p3],{txt,color,dur:500})]);
  }else{sub.innerHTML=`${src} manda una trama a ${dst==="BC"?"todos (broadcast)":dst}…`;await R.trama($("#swSvg"),subida[src],{txt,color,dur:800})}
  // 2. aprende
  const m=MAC[src],nueva=tabla[m]===undefined;
  if(nueva&&cap&&Object.keys(tabla).length>=cap){msg=`<b>Tabla llena</b>: no puede aprender ${m}. `}
  else{tabla[m]=inP;ultima={m,cls:nueva?"nueva":"renueva"};msg=nueva?`<b>Aprende</b> ${m} (${src}) en el puerto ${inP}. `:`Ya conocía ${m}: <b>renueva</b> su temporizador. `}
  pintaTabla();sub.innerHTML=msg+"Ahora mira la MAC de destino…";await R.espera(900);
  // 3. decide
  let salida=[];const todos=[1,2,3].filter(p=>p!==inP);
  if(dst==="BC"){salida=todos;msg+=`Es <b>broadcast</b>: <b>inunda</b> por los puertos ${todos.join(" y ")}.`}
  else if(tabla[MAC[dst]]===undefined){salida=todos;msg+=`No conoce ${MAC[dst]}: <b>inunda</b> por los puertos ${todos.join(" y ")}.`}
  else if(tabla[MAC[dst]]===inP){msg+=`${MAC[dst]} está en el puerto ${inP}, el mismo por el que llegó: <b>filtra</b> (la descarta). ${dst} ya la recibió a través del hub.`}
  else{salida=[tabla[MAC[dst]]];msg+=`${MAC[dst]} está en el puerto ${salida[0]}: <b>reenvía</b> solo por ahí.`}
  sub.innerHTML=msg;
  if(!salida.length){const r=$("#swSvg").querySelector("rect.sw");r.style.stroke="var(--bad)";await R.espera(900);r.style.stroke="";}
  await Promise.all(salida.map(async p=>{await R.trama($("#swSvg"),ruta[p],{txt,color,dur:700});
    if(p===3)await hubReparte(null,txt,color,dst);else{const h=p===1?"A":"B";marcaH(h,dst==="BC"||dst===h)}}));
  if(dst!=="BC"&&(src==="C"||src==="D")&&dst!==src&&(dst==="C"||dst==="D")){} // ya entregada por el hub
  await R.espera(400);
}
async function corre(fn){if(ocup)return;ocup=true;document.querySelectorAll("#animacion .btn").forEach(b=>b.disabled=true);
  try{await fn()}finally{ocup=false;document.querySelectorAll("#animacion .btn").forEach(b=>b.disabled=false)}}
$("#swPlay").onclick=()=>corre(async()=>{tabla={};ultima=null;cap=null;pintaTabla();
  const pasos=[["A","B"],["B","A"],["C","D"],["D","C"],["A","BC"],["C","A"]];
  for(let i=0;i<pasos.length;i++){await envia(...pasos[i]);$("#swTxt").innerHTML=`<b>Paso ${i+1} de 6.</b> `+$("#swTxt").innerHTML;await R.espera(2200)}
  $("#swTxt").innerHTML+=" <b>Fin:</b> AA → 1, BB → 2, CC → 3, DD → 3. Fíjate en que C y D comparten el puerto 3 por el hub.";});
$("#swSend").onclick=()=>corre(async()=>{const s=$("#swSrc").value,d=$("#swDst").value;if(s===d){$("#swTxt").textContent="Origen y destino no pueden ser el mismo equipo.";return}await envia(s,d)});
$("#swReset").onclick=()=>{if(ocup)return;tabla={};ultima=null;cap=null;pintaTabla();$("#swTxt").textContent="Tabla vacía. Manda una trama o reproduce el ejercicio."};
$("#swAge").onclick=()=>{if(ocup)return;if(tabla.BB===undefined){$("#swTxt").textContent="BB no está en la tabla.";return}delete tabla.BB;ultima=null;pintaTabla();
  $("#swTxt").innerHTML="Han pasado 300 s (aging time por defecto en Cisco) sin tramas de B: su entrada <b>se borra</b>. La próxima trama hacia B se inundará hasta que B vuelva a hablar."};
$("#swAtaque").onclick=()=>corre(async()=>{cap=8;tabla={};ultima=null;
  for(let i=0;i<8;i++){tabla[`F${i}:${(Math.random()*255|0).toString(16).padStart(2,"0")}`]=3;pintaTabla();await R.espera(220)}
  $("#swTxt").innerHTML="Un atacante en el puerto 3 manda tramas con <b>MAC de origen falsas</b> hasta llenar la tabla (aquí, 8 entradas). Ahora mira qué pasa con una trama normal…";
  await R.espera(1600);await envia("A","B");
  $("#swTxt").innerHTML+=" Como no puede aprender, <b>inunda todo como un hub</b> y el atacante recibe el tráfico ajeno. Defensa: <b>port security</b>.";});
$("#swVel").onchange=()=>R.setVelocidad(+$("#swVel").value);
dibuja();pintaTabla();$("#swTxt").textContent="Tabla vacía. Pulsa ▶ o manda una trama.";

/* ---------- métodos de reenvío ---------- */
const MET=[["Directa (cut-through)",6,"--l7"],["Libre de fragmentos",64,"--l5"],["Almacenar y reenviar",null,"--l2"]];
function drawTL(f=1){
  const t=+$("#rvTam").value;$("#rvTamV").textContent=`${t} bytes`;
  $("#rvTL").innerHTML=`<div class="fila"><span>Bytes recibidos</span><div class="barra"><i style="--c:var(--l3);width:${f*100}%"></i><small>${Math.round(f*t)} / ${t}</small></div></div>`+
   MET.map(([n,b,c])=>{const at=Math.min(b??t,t)/t;return `<div class="fila"><span>${n}</span><div class="barra"><i style="--c:var(${c});width:${Math.min(f,at)*100}%"></i><em style="left:calc(${at*100}% - 3px)"></em><small>${f>=at?"reenviando ▸":"esperando…"}</small></div></div>`}).join("");
}
function resultado(){
  const t=+$("#rvTam").value,mal=$("#rvMal").checked,us=b=>(b*8/100).toFixed(2);
  const frag=t<64;
  $("#rvRes").innerHTML=(frag?`Es un <b>fragmento</b> de ${t} bytes (menos de 64, típico de una colisión). `:"")+
   `A 100 Mbps empiezan a reenviar a los <b>${us(6)} µs</b> (directa), <b>${frag?"—":us(64)+" µs"}</b> (libre de fragmentos) y <b>${us(t)} µs</b> (almacenar y reenviar). `+
   (frag?"La directa <b>reenvía</b> el fragmento; el libre de fragmentos y el almacenar y reenviar lo <b>filtran</b>.":
    mal?"Con la FCS errónea, <b>solo almacenar y reenviar la descarta</b>: es el único que comprueba la FCS. Los otros dos la reenvían.":"Con la FCS correcta, los tres la entregan; solo cambia la latencia.");
}
$("#rvTam").oninput=()=>{drawTL();resultado()};$("#rvMal").onchange=resultado;
$("#rvPlay").onclick=()=>{const t0=performance.now(),D=2400;if(matchMedia("(prefers-reduced-motion: reduce)").matches){drawTL(1);resultado();return}
  (function p(n){const f=Math.min(1,(n-t0)/D);drawTL(f);if(f<1)requestAnimationFrame(p);else resultado()})(t0)};
drawTL();resultado();

/* ---------- arranque ---------- */
R.ordena("arr",["POST: comprueba CPU, memoria y puertos","Boot loader (ROM): inicializa la CPU y la flash","Carga la imagen de IOS de la flash a la RAM","Copia startup-config a RAM como running-config"]);

/* ---------- LED ---------- */
R.test("led",[
 {q:"SYST en ámbar.",ok:"Fallo del equipo",exp:"Recibe alimentación pero no funciona bien (por ejemplo, falló el POST)."},
 {q:"Acabas de conectar un PC y el LED de su puerto se queda ámbar unos 30 s.",ok:"STP comprobando",exp:"STP pasa el puerto por escucha y aprendizaje antes de reenviar."},
 {q:"Puerto en verde parpadeando.",ok:"Hay tráfico",exp:"Enlace establecido y con actividad."},
 {q:"Puerto apagado en un PC encendido y bien conectado.",ok:"Desactivado o sin enlace",exp:"Sin enlace o puerto desactivado con shutdown."},
 {q:"Puerto alternando verde y ámbar.",ok:"Fallo de enlace",exp:"Hay problemas en el enlace."},
 {q:"Puerto en ámbar fijo en un enlace redundante entre switches.",ok:"STP comprobando",exp:"Puerto bloqueado por STP para evitar el bucle: no reenvía datos."}
],["Fallo del equipo","STP comprobando","Hay tráfico","Desactivado o sin enlace","Fallo de enlace"]);

/* ---------- preguntas ---------- */
R.preguntas("conmutador",[
 ["¿De qué MAC aprende el switch, de la de origen o de la de destino? ¿Por qué?","De la de <b>origen</b>: le dice qué equipo está detrás del puerto por el que entró la trama. La de destino solo la usa para decidir por dónde reenviar."],
 ["Tabla vacía; A (puerto 1) envía a B (puerto 2). ¿Qué hace el switch?","Aprende A en el puerto 1. B es desconocido: <b>inunda</b> por los puertos 2 y 3."],
 ["Después B responde a A. ¿Qué hace?","Aprende B en el puerto 2. A es conocido: <b>reenvía</b> solo por el puerto 1."],
 ["C y D comparten el puerto 3 por un hub. D envía a C cuando el switch ya conoce a C en el puerto 3. ¿Qué hace?","Aprende D en el puerto 3 y <b>filtra</b> la trama: el destino está en el mismo puerto por el que llegó (C ya la recibió por el hub)."],
 ["B no envía nada durante 400 s con el aging time por defecto de Cisco. ¿Qué pasa con su entrada?","Se borra a los <b>300 s</b>. La próxima trama hacia B se inundará hasta que B vuelva a enviar algo."],
 ["¿Qué es el MAC flooding, qué riesgo tiene y cómo se defiende?","Llenar la tabla MAC con miles de MAC de origen falsas. El switch deja de aprender e inunda todo como un hub, y el atacante captura tráfico ajeno. Defensa: <b>seguridad de puertos</b>."],
 ["Compara los tres métodos de reenvío: cuándo empiezan y si reenvían una trama de 800 bytes con la FCS errónea.","Almacenar y reenviar: tras recibirla entera; <b>la descarta</b>. Directa: tras la MAC de destino; la reenvía. Libre de fragmentos: tras 64 bytes; la reenvía."],
 ["Un puerto de 1 Gbps reenvía hacia uno de 100 Mbps: ¿qué método es imprescindible?","<b>Almacenar y reenviar</b>: la trama sale más despacio de lo que entra, así que hay que guardarla entera antes de reenviarla."],
 ["Llega un fragmento de 40 bytes de una colisión: ¿lo filtra la directa o el libre de fragmentos?","El <b>libre de fragmentos</b>, porque espera 64 bytes y el fragmento no los alcanza. La directa lo reenvía."],
 ["¿Qué guardan la RAM, la NVRAM, la flash y la ROM de un switch?","RAM: running-config y tabla MAC (se pierden al apagar). NVRAM: startup-config. Flash: imagen de IOS y vlan.dat. ROM: POST y boot loader."],
 ["¿Por qué un switch nuevo ya funciona sin configurarlo?","Sin startup-config arranca con la configuración por defecto: sin contraseñas, todos los puertos activos y en la VLAN 1, y la tabla MAC se aprende sola."],
 ["48 equipos en un hub de 100 Mbps frente a un switch de 100 Mbps: ¿cuánto ancho de banda tiene cada uno?","Con el hub lo comparten (unos 2 Mbps por equipo en el peor caso, con colisiones). Con el switch, 100 Mbps cada uno: microsegmentación."]
]);
})();
