/* Tema: Redes locales y medios · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- mini test de opciones (reutilizable) ---------- */
function test(pre,casos,ops){
  let actual=null,bien=0,total=0;
  function otro(){
    let c;do{c=pick(casos)}while(casos.length>1&&c===actual);actual=c;
    $(`#${pre}Q`).textContent=c.q;$(`#${pre}Fb`).innerHTML="";
    $(`#${pre}Ops`).innerHTML=ops.map(o=>`<button class="btn" data-o="${o}">${o}</button>`).join("");
    $(`#${pre}Ops`).querySelectorAll("button").forEach(b=>b.onclick=()=>responde(b));
  }
  function responde(b){
    const ok=b.dataset.o===actual.ok;total++;if(ok)bien++;
    $(`#${pre}Ops`).querySelectorAll("button").forEach(x=>{x.disabled=true;if(x.dataset.o===actual.ok)x.classList.add("ok")});
    if(!ok)b.classList.add("mal");
    $(`#${pre}Fb`).innerHTML=`<span class="fb ${ok?"ok":"mal"}">${ok?"¡Bien!":"No: es "+actual.ok+"."}</span> ${actual.exp}`;
    $(`#${pre}Cuenta`).textContent=`${bien} de ${total} bien`;
  }
  $(`#${pre}Otra`).onclick=otro;otro();
}

/* ---------- tipos por extensión ---------- */
test("tipo",[
 {q:"Tus auriculares Bluetooth conectados al móvil.",ok:"PAN",exp:"Red de área personal: alcance de pocos metros, alrededor de una persona."},
 {q:"El router de casa con el portátil, la tele y la consola.",ok:"HAN",exp:"Red de área doméstica: la red de una vivienda. (Técnicamente también es una LAN pequeña, pero en clase se distingue como HAN)."},
 {q:"Un aula del instituto con 30 ordenadores y un switch.",ok:"LAN",exp:"Red de área local: equipos cercanos en un mismo edificio."},
 {q:"Una universidad con varios edificios dentro del mismo recinto, todos conectados.",ok:"CAN",exp:"Red de área de campus: varias LAN de edificios cercanos de una misma organización."},
 {q:"La red que une las cámaras de tráfico de toda la ciudad de Madrid.",ok:"MAN",exp:"Red de área metropolitana: cubre una ciudad."},
 {q:"La empresa conecta su sede de Madrid con la de Barcelona.",ok:"WAN",exp:"Red de área extensa: une redes entre ciudades o países."},
 {q:"Internet.",ok:"WAN",exp:"Es la WAN más grande que existe: una interred que conecta redes de todo el mundo."},
 {q:"Un reloj inteligente que manda los pasos a tu móvil.",ok:"PAN",exp:"Red personal: dispositivos que llevas encima, a uno o dos metros."}
],["PAN","HAN","LAN","CAN","MAN","WAN"]);

/* ---------- medios ---------- */
test("med",[
 {q:"Unir dos edificios de la empresa separados 3 km con mucha velocidad.",ok:"Fibra monomodo",exp:"Varios kilómetros solo los cubre la fibra monomodo (10–40 km). La multimodo se queda en unos cientos de metros."},
 {q:"Cableado entre los racks de un centro de datos, a unos 200 m.",ok:"Fibra multimodo",exp:"Para cableado interno y centros de datos hasta 300–550 m la multimodo basta y es más barata que la monomodo."},
 {q:"Conectar dos switches que están en el mismo rack a 100 Gbps, gastando poco.",ok:"DAC",exp:"El DAC es cobre con los conectores montados, pensado justo para distancias muy cortas dentro del rack: barato y con latencia mínima."},
 {q:"Llevar red desde los puestos de una oficina normal hasta el armario, a menos de 90 m.",ok:"Par trenzado UTP",exp:"Es el medio más usado en las LAN: barato y suficiente para 1 Gbps a 100 m en Cat 5e o Cat 6."},
 {q:"Una nave industrial con motores y máquinas que generan muchas interferencias.",ok:"Par trenzado STP",exp:"El S/FTP lleva malla global y lámina en cada par: es el apantallamiento pensado para entornos con interferencias."},
 {q:"Sensores de domótica con pilas que tienen que durar años.",ok:"Zigbee",exp:"Zigbee consume muy poco y llega hasta 100 m. Su poca velocidad (250 kbps) no importa para un sensor."},
 {q:"Unir dos sedes a 10 km que se ven de azotea a azotea, sin permiso para tirar cable.",ok:"Microondas",exp:"Los radioenlaces de microondas unen puntos lejanos sin cable, siempre que haya línea de visión directa entre las antenas."},
 {q:"Llevar la señal de las cámaras de videovigilancia antiguas (CCTV) de un parking.",ok:"Coaxial",exp:"El coaxial de 75 Ω es el clásico de CCTV y TV."},
 {q:"Un ratón y un teclado inalámbricos para el portátil.",ok:"Bluetooth",exp:"Bluetooth es para redes personales de 1–10 m con bajo consumo."}
],["Par trenzado UTP","Par trenzado STP","Coaxial","Fibra monomodo","Fibra multimodo","DAC","Microondas","Bluetooth","Zigbee"]);

/* ---------- topologías ---------- */
const NS="http://www.w3.org/2000/svg";
function anilloPos(n,r,cx=160,cy=130,ini=-Math.PI/2){return Array.from({length:n},(_,i)=>[cx+r*Math.cos(ini+2*Math.PI*i/n),cy+r*Math.sin(ini+2*Math.PI*i/n)])}
const topos={
  estrella:{nom:"Estrella",desc:"Todos los equipos van conectados a un nodo central (un switch). Fácil de gestionar y de ampliar: si se rompe un cable, solo cae ese equipo. Pero si falla el centro, cae toda la red. Es la topología de casi todas las LAN actuales.",
    crea(){const n=[{id:"S",x:160,y:130,lab:"Switch",centro:true}];anilloPos(5,95).forEach(([x,y],i)=>n.push({id:"P"+i,x,y,lab:"PC"+(i+1),pc:true}));
      return{n,e:n.slice(1).map(p=>({a:"S",b:p.id}))}}},
  bus:{nom:"Bus",desc:"Todos los equipos cuelgan de un único cable compartido, con un terminador en cada extremo. Sencilla y barata, pero si se corta el cable principal la señal rebota en el corte y el bus entero deja de funcionar. Además, todos comparten el medio, así que hay colisiones.",
    crea(){const n=[],e=[];const xs=[50,105,160,215,270];
      n.push({id:"T0",x:22,y:130,term:true});xs.forEach((x,i)=>{n.push({id:"t"+i,x,y:130,tap:true});n.push({id:"P"+i,x,y:i%2?205:55,lab:"PC"+(i+1),pc:true})});n.push({id:"T1",x:298,y:130,term:true});
      const esp=["T0",...xs.map((_,i)=>"t"+i),"T1"];for(let i=0;i<esp.length-1;i++)e.push({a:esp[i],b:esp[i+1],troncal:true});
      xs.forEach((_,i)=>e.push({a:"t"+i,b:"P"+i}));return{n,e}}},
  anillo:{nom:"Anillo",desc:"Cada equipo se conecta al siguiente formando un círculo, y la información da la vuelta en un sentido. El tráfico es ordenado (con testigo no hay colisiones), pero un solo cable cortado o un equipo apagado interrumpe el anillo entero.",
    crea(){const n=anilloPos(6,95).map(([x,y],i)=>({id:"P"+i,x,y,lab:"PC"+(i+1),pc:true}));return{n,e:n.map((p,i)=>({a:p.id,b:n[(i+1)%n.length].id}))}}},
  malla:{nom:"Malla",desc:"Cada equipo está conectado con todos (o con muchos) de los demás. Tiene muchísima redundancia: hay que romper muchos cables para aislar a alguien. A cambio, el cableado es carísimo: con n equipos hacen falta n·(n−1)/2 cables. Se usa en WAN e Internet entre routers.",
    crea(){const n=anilloPos(5,95).map(([x,y],i)=>({id:"P"+i,x,y,lab:"PC"+(i+1),pc:true}));const e=[];
      for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)e.push({a:n[i].id,b:n[j].id});return{n,e}}}
};
let tipo="estrella",g=null,rotos=new Set(),caidos=new Set();
function evalua(){
  const pcs=g.n.filter(x=>x.pc),vivos=pcs.filter(p=>!caidos.has(p.id));
  let enRed=new Set(),motivo="";
  const troncalRota=g.e.some((x,i)=>x.troncal&&rotos.has(i));
  if(tipo==="bus"&&troncalRota){motivo="Se ha cortado el cable principal: sin terminador, la señal rebota y el bus entero deja de funcionar."}
  else if(tipo==="anillo"&&(rotos.size||caidos.size)){motivo="El anillo está interrumpido: la información (y el testigo) ya no puede dar la vuelta."}
  else if(tipo==="estrella"&&caidos.has("S")){motivo="Ha caído el nodo central: sin switch, nadie se comunica con nadie."}
  else{
    const ady={};g.n.forEach(x=>ady[x.id]=[]);
    g.e.forEach((x,i)=>{if(rotos.has(i)||caidos.has(x.a)||caidos.has(x.b))return;ady[x.a].push(x.b);ady[x.b].push(x.a)});
    const visto=new Set();let mejor=new Set();
    vivos.forEach(p=>{if(visto.has(p.id))return;const comp=new Set(),pila=[p.id];
      while(pila.length){const v=pila.pop();if(visto.has(v))continue;visto.add(v);comp.add(v);ady[v].forEach(w=>pila.push(w))}
      const cpcs=new Set([...comp].filter(id=>id.startsWith("P")));if(cpcs.size>mejor.size)mejor=cpcs});
    if(mejor.size>=2)enRed=mejor;
  }
  const n=enRed.size,tot=pcs.length;
  let txt=`${n} de ${tot} equipos pueden comunicarse.`;
  if(motivo)txt+=" "+motivo;
  else if(!rotos.size&&!caidos.size)txt="Todo funciona. Prueba a cortar un cable o apagar un equipo.";
  else if(n===vivos.length&&n>0)txt+=" La red aguanta el fallo"+(caidos.size?" (los equipos apagados, lógicamente, no cuentan)":"")+".";
  return{enRed,txt,ok:n===vivos.length&&n>0};
}
function dibuja(){
  const svg=$("#topoSvg");svg.innerHTML="";const pos={};g.n.forEach(x=>pos[x.id]=x);
  const {enRed,txt,ok}=evalua();
  g.e.forEach((x,i)=>{const l=document.createElementNS(NS,"line");const A=pos[x.a],B=pos[x.b];
    l.setAttribute("x1",A.x);l.setAttribute("y1",A.y);l.setAttribute("x2",B.x);l.setAttribute("y2",B.y);
    l.setAttribute("class","cable"+(rotos.has(i)?" roto":""));if(x.troncal)l.setAttribute("stroke-width","5");
    const t=document.createElementNS(NS,"title");t.textContent=rotos.has(i)?"Cable cortado (pulsa para arreglar)":"Pulsa para cortar este cable";l.appendChild(t);
    l.onclick=()=>{rotos.has(i)?rotos.delete(i):rotos.add(i);dibuja()};
    // zona de toque más ancha
    const h=l.cloneNode();h.setAttribute("stroke","transparent");h.setAttribute("stroke-width","16");h.setAttribute("class","");h.style.cursor="pointer";h.onclick=l.onclick;
    svg.appendChild(l);svg.appendChild(h)});
  g.n.forEach(x=>{
    if(x.tap){const c=document.createElementNS(NS,"circle");c.setAttribute("cx",x.x);c.setAttribute("cy",x.y);c.setAttribute("r",3);c.setAttribute("fill","var(--muted)");svg.appendChild(c);return}
    if(x.term){const r=document.createElementNS(NS,"rect");r.setAttribute("x",x.x-5);r.setAttribute("y",x.y-9);r.setAttribute("width",10);r.setAttribute("height",18);r.setAttribute("rx",2);r.setAttribute("fill","var(--fg)");
      const t=document.createElementNS(NS,"title");t.textContent="Terminador";r.appendChild(t);svg.appendChild(r);return}
    const grp=document.createElementNS(NS,"g");
    const c=document.createElementNS(NS,"rect");const w=x.centro?60:44,h=x.centro?30:26;
    c.setAttribute("x",x.x-w/2);c.setAttribute("y",x.y-h/2);c.setAttribute("width",w);c.setAttribute("height",h);c.setAttribute("rx",6);
    let cls="nod"+(x.centro?" centro":"");if(caidos.has(x.id))cls+=" caido";else if(x.pc&&!enRed.has(x.id))cls+=" aislado";
    c.setAttribute("class",cls);
    const t=document.createElementNS(NS,"text");t.setAttribute("x",x.x);t.setAttribute("y",x.y+4);t.setAttribute("text-anchor","middle");t.textContent=caidos.has(x.id)?"OFF":x.lab;
    const ti=document.createElementNS(NS,"title");ti.textContent=caidos.has(x.id)?"Equipo apagado (pulsa para encender)":"Pulsa para apagar este equipo";
    grp.appendChild(c);grp.appendChild(t);grp.appendChild(ti);grp.style.cursor="pointer";
    grp.onclick=()=>{caidos.has(x.id)?caidos.delete(x.id):caidos.add(x.id);dibuja()};
    svg.appendChild(grp)});
  const est=$("#topoEstado");est.textContent=txt;est.className="estado "+(ok?"ok":"mal");
}
function ponTopo(t){tipo=t;g=topos[t].crea();rotos=new Set();caidos=new Set();$("#topoNom").textContent=topos[t].nom;$("#topoDesc").textContent=topos[t].desc;dibuja()}
document.querySelectorAll("[data-topo]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-topo]").forEach(x=>x.classList.toggle("on",x===b));ponTopo(b.dataset.topo)});
$("#topoReset").onclick=()=>{rotos.clear();caidos.clear();dibuja()};
ponTopo("estrella");

/* ---------- preguntas ---------- */
Repaso.preguntas("redes-locales",[
 ["¿Qué diferencia hay entre topología física y topología lógica? Pon un ejemplo en el que no coincidan.","La física es cómo están colocados los cables; la lógica, cómo se turnan los equipos para comunicarse. Ejemplo: una red en <b>estrella física con un hub</b> funciona como un <b>bus lógico</b>, porque el hub repite cada señal a todos los puertos como si compartieran un único cable."],
 ["¿Por qué en un anillo lógico con paso de testigo no hay colisiones y en un bus lógico sí?","En el anillo solo puede transmitir quien tiene el testigo, y solo hay uno, así que nunca hablan dos a la vez. En el bus no hay turnos: cada equipo transmite cuando ve el medio libre, y si dos lo ven libre a la vez, sus señales chocan."],
 ["Verdadero o falso, y explica: «En una topología en estrella, si se rompe el cable de un PC, se cae toda la red».","Falso. Solo se queda sin red ese PC. Lo que tumba toda la estrella es que falle el <b>nodo central</b> (el switch)."],
 ["Diferencia entre una red cliente-servidor y una P2P, con un ejemplo de cada.","En cliente-servidor un equipo central ofrece los servicios y los demás los piden (HTTP: el navegador pide y el servidor web responde). En P2P cualquier equipo puede ser cliente y servidor a la vez (BitTorrent)."],
 ["¿En qué nivel trabajan un hub, un switch y un router, y qué hace cada uno con lo que recibe?","Hub: nivel <b>físico</b>, repite la señal por todos los puertos sin filtrar (difusión). Switch: nivel de <b>enlace</b>, mira la MAC de destino y lo manda solo por el puerto correcto (conmutación). Router: nivel de <b>red</b>, mira la IP de destino y lo encamina hacia otra red; además separa los dominios de difusión."],
 ["¿Qué diferencia hay entre servicio y protocolo? Pon un ejemplo.","El servicio es la funcionalidad que un equipo ofrece a los demás; el protocolo, las normas que hay que seguir para darlo. Ejemplo: el servicio web (Apache) usa el protocolo HTTP."],
 ["Compara la fibra monomodo y la multimodo: núcleo, emisor, alcance y uso.","Monomodo: núcleo de ≈ 9 µm, láser, 10–40 km, enlaces WAN/MAN. Multimodo: núcleo de 50 o 62,5 µm, varios modos de luz, 300–550 m, cableado interno y centros de datos."],
 ["Necesitas 10 Gbps en un tramo de 90 m de par trenzado. ¿Te vale Cat 6? ¿Qué categoría pondrías?","Cat 6 no: solo da 10 Gbps hasta 37–55 m. Hace falta <b>Cat 6A</b> (500 MHz, 10 Gbps a 100 m)."],
 ["Diferencia entre UTP, FTP y STP. ¿Cuándo pondrías STP?","UTP: sin apantallar. FTP (F/UTP): una lámina de aluminio que envuelve todos los pares. STP (S/FTP): malla global y además lámina en cada par. El STP se pone en entornos con muchas interferencias, como una nave industrial."],
 ["Nombra las capas del cable coaxial de dentro a fuera y la función de cada una.","1. Núcleo de cobre: lleva la señal. 2. Dieléctrico: aísla el núcleo de la malla. 3. Malla o blindaje: retorno de la señal y protección frente al ruido. 4. Cubierta exterior: protección mecánica."],
 ["¿Qué diferencia hay entre half-duplex y full-duplex? ¿En cuál puede haber colisiones y qué es la autonegociación?","Half-duplex: los dos sentidos pero no a la vez, puede haber colisiones (CSMA/CD). Full-duplex: los dos sentidos a la vez, sin colisiones y con el doble de ancho de banda efectivo. La autonegociación es el intercambio de pulsos FLP para acordar velocidad y modo dúplex."],
 ["Tu móvil ve la red de casa en 2,4 GHz y en 5 GHz. Estás en la habitación más lejana del router. ¿A cuál te conectas y por qué?","Probablemente a la de <b>2,4 GHz</b>: tiene más alcance y atraviesa mejor las paredes. La de 5 GHz es más rápida y tiene menos interferencias, pero llega peor a distancia."],
 ["¿Qué ventaja tiene Zigbee frente a Bluetooth para un sensor de temperatura con pilas?","Consume mucho menos (las pilas duran años) y llega más lejos (hasta 100 m). Es más lento (250 kbps frente a 3 Mbps), pero para un sensor da igual."],
 ["¿Qué tienen en común las microondas terrestres y los infrarrojos, y en qué se diferencian?","Los dos necesitan <b>línea de visión directa</b>, sin obstáculos. Se diferencian en el alcance: las microondas unen puntos a kilómetros (sedes, torres de telefonía) y los infrarrojos solo funcionan a muy corta distancia (mandos a distancia)."]
]);
})();
