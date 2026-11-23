/* Tema: Crimpado y comprobador · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);
const H={bn:["Blanco/naranja","--w-nar",1],n:["Naranja","--w-nar",0],bv:["Blanco/verde","--w-ver",1],v:["Verde","--w-ver",0],
         ba:["Blanco/azul","--w-azu",1],a:["Azul","--w-azu",0],bm:["Blanco/marrón","--w-mar",1],m:["Marrón","--w-mar",0]};
const STD={B:["bn","n","bv","a","ba","v","bm","m"],A:["bv","v","bn","a","ba","n","bm","m"]};
const hilo=(k,pin,extra="")=>{const[n,c,r]=H[k];return `<span class="hilo${r?" rayas":""}${extra}" style="--col:var(${c})" title="${n}" role="img" aria-label="Pin ${pin}: ${n}"><small>${pin}</small></span>`};
$("#norB").innerHTML=STD.B.map((k,i)=>hilo(k,i+1)).join("");
$("#norA").innerHTML=STD.A.map((k,i)=>hilo(k,i+1)).join("");

/* ---------- montador ---------- */
let std="B",puestos=[];
function drawMont(fb){
  $("#montaje").innerHTML=Array.from({length:8},(_,i)=>{const k=puestos[i];
    if(!k)return `<span class="hilo vacio"><small>${i+1}</small></span>`;
    const cls=fb?(k===STD[std][i]?" bien":" mal"):"";return hilo(k,i+1,cls)}).join("");
  $("#paleta").innerHTML=Object.keys(H).map(k=>{const[n,c,r]=H[k];
    return `<button class="hilo${r?" rayas":""}" style="--col:var(${c})" data-k="${k}" title="${n}" aria-label="${n}" ${puestos.includes(k)?"disabled":""}></button>`}).join("");
  $("#paleta").querySelectorAll("button").forEach(b=>b.onclick=()=>{if(puestos.length<8){puestos.push(b.dataset.k);$("#montFb").textContent="";drawMont()}});
}
$("#montOk").onclick=()=>{
  if(puestos.length<8){$("#montFb").textContent=`Faltan ${8-puestos.length} hilos.`;return}
  const mal=puestos.map((k,i)=>k===STD[std][i]?0:i+1).filter(Boolean);drawMont(true);
  if(!mal.length){$("#montFb").innerHTML=`<span class="fb ok">¡Perfecto! T568${std} correcto.</span>`;return}
  const otro=std==="B"?"A":"B",esOtro=puestos.every((k,i)=>k===STD[otro][i]);
  $("#montFb").innerHTML=`<span class="fb mal">Mal en ${mal.length===1?"el pin":"los pines"} ${mal.join(", ")}.</span> `+
    (esOtro?`Has montado un T568${otro} perfecto, pero se pedía T568${std}. Si el otro extremo fuera ${std}, tendrías un cable cruzado sin querer.`:
     "Recuerda: en la B los pines 1-2 son el par naranja, el 3 y el 6 el verde, el 4-5 el azul y el 7-8 el marrón. Siempre el blanco con raya primero.");
};
$("#montDeshacer").onclick=()=>{puestos.pop();$("#montFb").textContent="";drawMont()};
$("#montBorra").onclick=()=>{puestos=[];$("#montFb").textContent="";drawMont()};
document.querySelectorAll("[data-std]").forEach(b=>b.onclick=()=>{std=b.dataset.std;document.querySelectorAll("[data-std]").forEach(x=>x.classList.toggle("on",x===b));puestos=[];$("#montFb").textContent="";drawMont()});
drawMont();

/* ---------- tipos de cable ---------- */
Repaso.test("tip",[
 {q:"PC ↔ PC",ok:"Cruzado",exp:"Equipos iguales: los dos transmiten por los mismos pines, hay que cruzar."},
 {q:"Switch ↔ Router",ok:"Directo",exp:"Equipos distintos: lo que transmite uno encaja con lo que recibe el otro."},
 {q:"Router ↔ PC",ok:"Cruzado",exp:"El router usa los pines como un PC, así que cuentan como equipos «iguales»."},
 {q:"Switch ↔ Switch",ok:"Cruzado",exp:"Equipos iguales."},
 {q:"Router ↔ Router",ok:"Cruzado",exp:"Equipos iguales."},
 {q:"PC ↔ puerto de consola del router",ok:"Consola",exp:"Para configurar el equipo sin red se usa el cable de consola (rollover), con adaptador DB-9 o USB en el PC."},
 {q:"Punto de acceso ↔ Switch",ok:"Directo",exp:"Equipos distintos, como un PC con un switch."},
 {q:"PC ↔ roseta de la pared",ok:"Directo",exp:"La roseta lleva al panel y de ahí al switch: al final es PC ↔ switch."},
 {q:"Hub ↔ Switch",ok:"Cruzado",exp:"Hub y switch usan los pines igual: cuentan como equipos iguales."}
],["Directo","Cruzado","Consola"]);

/* ---------- ordenar pasos ---------- */
Repaso.ordena("ord",["Medir y cortar el cable","Pelar 2,5–3 cm de cubierta","Destrenzar los pares","Ordenar los hilos en T568B","Cortar a ras dejando 12–14 mm","Meter los hilos hasta el fondo","Crimpar","Montar el otro extremo","Comprobar con el tester"]);

/* ---------- comprobador ---------- */
const casos={
 directo:{n:"Directo bien",map:{1:[1],2:[2],3:[3],4:[4],5:[5],6:[6],7:[7],8:[8],G:["G"]},txt:"Cada pin llega al mismo pin del otro extremo: <b>cable directo correcto</b>."},
 cruzado:{n:"Cruzado bien",map:{1:[3],2:[6],3:[1],4:[4],5:[5],6:[2],7:[7],8:[8],G:["G"]},txt:"El par naranja y el verde cambian de sitio: <b>cable cruzado correcto</b> (T568B ↔ T568A)."},
 abierto:{n:"Pin 5 no llega al fondo",map:{1:[1],2:[2],3:[3],4:[4],5:[],6:[6],7:[7],8:[8],G:["G"]},txt:"El LED 5 no se enciende: <b>hilo abierto</b>. Corrección: cortar el conector y volver a crimpar asegurando que los 8 hilos llegan al fondo."},
 invertido:{n:"7 y 8 invertidos",map:{1:[1],2:[2],3:[3],4:[4],5:[5],6:[6],7:[8],8:[7],G:["G"]},txt:"El 7 y el 8 salen al revés y no es la secuencia del cruzado: <b>hilos invertidos</b>. Corrección: rehacer ese extremo con el orden bien (blanco/marrón en el 7, marrón en el 8)."},
 corto:{n:"Cortocircuito 2-3",map:{1:[1],2:[2,3],3:[2,3],4:[4],5:[5],6:[6],7:[7],8:[8],G:["G"]},txt:"El 2 y el 3 se encienden a la vez: <b>cortocircuito</b> entre esos hilos (aislante dañado o pelado de más). Corrección: cortar y volver a crimpar."},
 roto:{n:"Cable roto",map:{1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],G:[]},txt:"No se enciende ninguno: <b>cable roto o no conectado</b>. Primero comprueba que los dos extremos están bien metidos en el comprobador."},
 malla:{n:"Sin malla (apantallado)",map:{1:[1],2:[2],3:[3],4:[4],5:[5],6:[6],7:[7],8:[8],G:[]},txt:"Los 8 bien pero la G apagada: la <b>malla o pantalla no tiene continuidad</b>. Solo importa en cable apantallado."}
};
const pins=[1,2,3,4,5,6,7,8,"G"];
let caso="directo",timer=null;
function ledsVacios(){["#ledP","#ledR"].forEach(id=>{$(id).querySelectorAll(".led").forEach(x=>x.remove());pins.forEach(p=>{const s=document.createElement("span");s.className="led";s.dataset.p=p;s.textContent=p;$(id).appendChild(s)})})}
$("#casos").innerHTML=Object.entries(casos).map(([k,c])=>`<button class="chip${k===caso?" on":""}" data-caso="${k}">${c.n}</button>`).join("");
$("#casos").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{caso=b.dataset.caso;$("#casos").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));clearInterval(timer);ledsVacios();$("#secR").textContent="—";$("#testTxt").textContent=""});
$("#probar").onclick=()=>{
  clearInterval(timer);ledsVacios();$("#testTxt").textContent="";let i=0,sec=[];const c=casos[caso];
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paso=()=>{
    document.querySelectorAll(".led").forEach(x=>x.classList.remove("on","ko"));
    if(i>=pins.length){clearInterval(timer);$("#testTxt").innerHTML=c.txt;return}
    const p=pins[i];$(`#ledP .led[data-p="${p}"]`).classList.add("on");
    const r=c.map[p];
    if(r.length)r.forEach(x=>$(`#ledR .led[data-p="${x}"]`).classList.add("on"));else $(`#ledR .led[data-p="${p}"]`).classList.add("ko");
    if(p!=="G")sec.push(r.length===0?"(apagado)":r.length>1?"["+r.join("+")+"]":r[0]);
    $("#secR").textContent=sec.join("-");i++;
  };
  if(reduce){while(i<pins.length)paso();paso()}else{paso();timer=setInterval(paso,650)}
};
ledsVacios();

/* ---------- diagnóstico ---------- */
Repaso.test("dia",[
 {q:"Remoto: <code>1-2-3-4-5-6-7-8</code>",ok:"Directo correcto",exp:"Misma secuencia que el principal: los dos extremos en T568B."},
 {q:"Remoto: <code>3-6-1-4-5-2-7-8</code>",ok:"Cruzado correcto",exp:"El par naranja (1-2) y el verde (3-6) cambian de sitio: un extremo B y el otro A."},
 {q:"Remoto: <code>1-2-3-4-(5 apagado)-6-7-8</code>",ok:"Hilo abierto",exp:"El hilo 5 (blanco/azul) no hace contacto, normalmente porque no llegó al fondo. Se corta el conector y se vuelve a crimpar."},
 {q:"Remoto: <code>1-2-3-4-5-6-8-7</code>",ok:"Hilos invertidos",exp:"El 7 y el 8 están al revés (no es la secuencia del cruzado). Se rehace el extremo con blanco/marrón en el 7 y marrón en el 8."},
 {q:"Remoto: el <b>2 y el 3</b> se encienden a la vez",ok:"Cortocircuito",exp:"Los hilos 2 y 3 se tocan (aislante dañado o pelado de más). Se corta y se vuelve a crimpar."},
 {q:"Remoto: <b>ningún LED</b> se enciende",ok:"Cable roto",exp:"Cable roto o no conectado. Primero se comprueba que está bien enchufado al comprobador."},
 {q:"Remoto: <code>1-2-6-4-5-3-7-8</code>",ok:"Hilos invertidos",exp:"El 3 y el 6 están intercambiados en un extremo. Ojo: no es un cruzado, porque en el cruzado también cambian el 1 y el 2."}
],["Directo correcto","Cruzado correcto","Hilo abierto","Hilos invertidos","Cortocircuito","Cable roto"]);

/* ---------- preguntas ---------- */
Repaso.preguntas("crimpado",[
 ["Escribe el orden de colores de T568B del pin 1 al 8 y explica qué cambia en T568A.","T568B: blanco/naranja, naranja, blanco/verde, azul, blanco/azul, verde, blanco/marrón, marrón. En T568A se intercambian el par naranja y el verde (pines 1-2 con 3-6); el azul y el marrón se quedan igual."],
 ["¿Qué cable usarías entre un PC y un switch? ¿Y entre dos switches? ¿Por qué?","PC–switch: <b>directo</b>, porque son equipos distintos y lo que uno transmite encaja con lo que el otro recibe. Switch–switch: <b>cruzado</b>, porque son iguales y los dos transmitirían por los mismos pines."],
 ["Si los equipos tienen Auto-MDI/MDI-X, ¿sigue siendo imprescindible el cable cruzado?","No: el puerto detecta los pares y los intercambia por dentro, así que un directo sirve. En 1000BASE-T es obligatorio que los puertos lo hagan. Aun así hay que saber hacerlo (equipos antiguos, examen, diagnóstico)."],
 ["¿Para qué sirve el cable de consola y cómo está hecho?","Para configurar un router o switch por primera vez, sin red, desde un PC con un programa de terminal. Un extremo en T568B y el otro con el orden de colores invertido; RJ-45 en el equipo y DB-9 o USB (con adaptador) en el PC."],
 ["El comprobador muestra en el remoto 1-2-3-4-(5 apagado)-6-7-8. Diagnóstico, hilo afectado y corrección.","<b>Hilo abierto</b> en el pin 5 (blanco/azul): no hace contacto, normalmente porque no llegó al fondo del conector. Se corta el conector y se vuelve a crimpar."],
 ["El remoto muestra 1-2-3-4-5-6-8-7. ¿Qué pasa?","<b>Hilos invertidos</b>: el 7 y el 8 (par marrón) están al revés en un extremo. No es un cruzado. Se rehace ese extremo."],
 ["En el remoto se encienden a la vez el 2 y el 3. ¿Qué significa?","<b>Cortocircuito</b> entre los hilos 2 y 3: los cobres se tocan, por ejemplo por pelar de más o dañar el aislante. Se corta y se vuelve a crimpar."],
 ["¿Por qué un cable cruzado da 3-6-1-4-5-2-7-8 en el remoto?","Porque un extremo está en B y el otro en A: el par naranja y el verde cambian de sitio. Lo que sale por el pin 1 llega al 3, el 2 al 6, el 3 al 1 y el 6 al 2. Los demás no cambian."],
 ["¿Puede el comprobador básico garantizar que un enlace cumple Cat 6A? Si no, ¿qué lo haría?","No: solo comprueba continuidad y orden de los hilos. No mide atenuación, diafonía ni longitud. Para certificar la categoría hace falta un <b>certificador</b> (analizador de cableado)."],
 ["Al tirar suavemente de un cable recién crimpado se sale el conector. ¿Qué error se cometió?","La <b>cubierta quedó fuera del conector</b>, así que el retenedor apretó solo los hilos y no hay sujeción mecánica. Hay que pelar menos (o cortar los hilos más cortos) para que la cubierta entre."],
 ["¿Por qué no hay que destrenzar más de lo necesario al crimpar?","Porque el trenzado es lo que cancela las interferencias y la diafonía entre pares. Si se destrenza mucho, aumenta la diafonía y el cable puede no alcanzar su categoría."],
 ["Verdadero o falso: «Un cable cruzado y uno directo se distinguen con el comprobador por el orden en que se encienden los LED del remoto».","<b>Verdadero.</b> El directo da 1-2-3-4-5-6-7-8 y el cruzado 3-6-1-4-5-2-7-8."]
]);
})();
