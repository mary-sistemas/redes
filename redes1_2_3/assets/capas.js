/* Tema: Capas y protocolos · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);


/* ---------- capas ---------- */
const capas=[
 {n:7,nom:"Aplicación",c:"--l7",pdu:"Datos",fun:"Es la que ve el usuario: da servicios de red a los programas (navegar, correo, resolver nombres).",prot:["HTTP","HTTPS","DNS","DHCP","FTP","SMTP","POP3","IMAP","SSH","Telnet"],disp:"PC, servidor (equipos finales)",dir:"—"},
 {n:6,nom:"Presentación",c:"--l6",pdu:"Datos",fun:"Traduce el formato de los datos para que ambos extremos lo entiendan: codificación, cifrado y compresión.",prot:["ASCII","UTF-8","JPEG","MP3","TLS/SSL (cifrado)"],disp:"Equipos finales",dir:"—"},
 {n:5,nom:"Sesión",c:"--l5",pdu:"Datos",fun:"Abre, mantiene y cierra el diálogo entre las dos aplicaciones. Pone puntos de control para retomar si se corta.",prot:["NetBIOS","RPC"],disp:"Equipos finales",dir:"—"},
 {n:4,nom:"Transporte",c:"--l4",pdu:"Segmento (TCP) · Datagrama (UDP)",fun:"Comunicación extremo a extremo entre procesos: divide en trozos, numera, controla errores y flujo. Usa puertos para saber a qué programa va.",prot:["TCP","UDP"],disp:"Equipos finales (y cortafuegos)",dir:"Puertos (80, 443, 53…)"},
 {n:3,nom:"Red",c:"--l3",pdu:"Paquete",fun:"Lleva el paquete desde el origen hasta el destino final atravesando redes distintas: direccionamiento lógico y encaminamiento.",prot:["IP (v4/v6)","ICMP","ARP (entre 2 y 3)"],disp:"Router, switch de capa 3",dir:"IP (192.168.86.25)"},
 {n:2,nom:"Enlace de datos",c:"--l2",pdu:"Trama",fun:"Entrega la trama al siguiente equipo del mismo tramo, detecta errores con el FCS y controla el acceso al medio. Se divide en LLC y MAC.",prot:["Ethernet 802.3","Wi-Fi 802.11","802.1Q (VLAN)","PPP"],disp:"Switch, punto de acceso, NIC",dir:"MAC (00:1A:2B:3C:4D:25)"},
 {n:1,nom:"Física",c:"--l1",pdu:"Bits",fun:"Convierte los bits en señales (eléctricas, luz, ondas) y define cables, conectores, voltajes y velocidades.",prot:["100BASE-TX","1000BASE-T","RJ45","Fibra","Radio"],disp:"Cable, hub, repetidor",dir:"—"}
];
const tcpip={7:"Aplicación",4:"Transporte",3:"Internet",2:"Acceso a la red"};
const tcpSpan={7:3,4:1,3:1,2:2};
let sel=4;
function drawStack(){
  const s=$("#stack");
  s.innerHTML='<span class="hdr">OSI (7)</span><span class="hdr">TCP/IP (4)</span>';
  capas.forEach((c,i)=>{
    const b=document.createElement("button");
    b.className="lay"+(c.n===sel?" sel":"");
    b.style.setProperty("--c",`var(${c.c})`);
    b.style.gridColumn="1";b.style.gridRow=String(i+2);
    b.innerHTML=`<span>${c.n} · ${c.nom}</span><small>${c.pdu.split(" ")[0]}</small>`;
    b.setAttribute("aria-pressed",c.n===sel);
    b.onclick=()=>{sel=c.n;drawStack();drawDet()};
    s.appendChild(b);
    if(tcpip[c.n]){
      const t=document.createElement("div");t.className="tcp";
      t.style.gridColumn="2";t.style.gridRow=`${i+2} / span ${tcpSpan[c.n]}`;
      t.textContent=tcpip[c.n];s.appendChild(t);
    }
  });
}
function drawDet(){
  const c=capas.find(x=>x.n===sel);
  const t=Object.keys(tcpip).map(Number).sort((a,b)=>b-a).find(k=>k>=sel&&k-tcpSpan[k]<sel);
  const d=$("#det");d.style.setProperty("--c",`var(${c.c})`);
  d.innerHTML=`<h3><span class="n">${c.n}</span>${c.nom}</h3><p>${c.fun}</p>
  <dl class="kv"><dt>PDU</dt><dd><b>${c.pdu}</b></dd><dt>Dirección</dt><dd class="mono">${c.dir}</dd>
  <dt>Protocolos</dt><dd class="tags">${c.prot.map(p=>`<span class="tag">${p}</span>`).join("")}</dd>
  <dt>Aparatos</dt><dd>${c.disp}</dd><dt>En TCP/IP</dt><dd>Capa «${tcpip[t]}»</dd></dl>`;
}
drawStack();drawDet();

/* ---------- encapsulado ---------- */
const enc=[
 {capa:"Capa 7 · Aplicación",pdu:"Datos",txt:"El navegador genera la petición HTTP. De momento solo hay datos: nadie sabe aún a qué puerto, IP o MAC va."},
 {capa:"Capa 4 · Transporte",pdu:"Segmento",txt:"TCP añade su cabecera con el puerto de origen (uno aleatorio alto, 51234) y el de destino (80, el servidor web). Ahora es un segmento."},
 {capa:"Capa 3 · Red",pdu:"Paquete",txt:"IP añade las direcciones de origen y destino final, el TTL y el campo Protocolo = 6 para avisar de que dentro va TCP. Ahora es un paquete."},
 {capa:"Capa 2 · Enlace",pdu:"Trama",txt:"Ethernet añade la MAC de origen (tu PC) y la de destino, que es la del router (la puerta de enlace), no la del servidor. EtherType 0x0800 = dentro va IPv4. Al final pone el FCS para detectar errores."},
 {capa:"Capa 1 · Física",pdu:"Bits",txt:"La tarjeta de red convierte la trama en señales eléctricas por el cable. Aquí ya no hay cabeceras, solo unos y ceros."}
];
let e=0;
const blk=(c,t,m,cls="")=>`<div class="blk ${cls}" style="--c:var(${c})"><b>${t}</b><span class="mono">${m}</span></div>`;
function drawEnc(){
  const s=enc[e];$("#encCapa").textContent=s.capa;$("#encPdu").textContent=s.pdu;$("#encTxt").textContent=s.txt;
  let h="";
  if(e===4){h=`<div class="bits">${"0100010100000000 0000000000111100 1011010100100011 0100000000000000 1000000000000110 ".repeat(3)}…</div>`}
  else{
    if(e>=3)h+=blk("--l2","Ethernet","MAC orig/dest · 0x0800");
    if(e>=2)h+=blk("--l3","IP","192.168.86.25 → 93.184.216.34 · P=6");
    if(e>=1)h+=blk("--l4","TCP","51234 → 80");
    h+=blk("--l7","Datos HTTP","GET / HTTP/1.1","data");
    if(e>=3)h+=blk("--l2","FCS","CRC");
  }
  $("#pdu").innerHTML=h;
  $("#encPrev").disabled=e===0;$("#encNext").disabled=e===4;
  $("#encDots").innerHTML=enc.map((_,i)=>`<i class="${i<=e?"on":""}"></i>`).join("");
}
$("#encPrev").onclick=()=>{if(e>0){e--;drawEnc()}};
$("#encNext").onclick=()=>{if(e<4){e++;drawEnc()}};
drawEnc();

/* ---------- viaje ---------- */
const filas=[["MAC origen","--l2","mo"],["MAC destino","--l2","md"],["IP origen","--l3","io"],["IP destino","--l3","id"],["TTL","--l3","ttl"],["Puerto origen","--l4","po"],["Puerto destino","--l4","pd"]];
const base={io:"192.168.86.25",id:"93.184.216.34",po:"51234",pd:"80 (HTTP)"};
const tramos=[
 {nodo:"PC",sub:"sale",d:{...base,mo:"00:1A:2B:3C:4D:25 (PC)",md:"00:50:56:AA:00:01 (router, LAN)",ttl:"128"},
  txt:"La trama sale del PC. La MAC destino es la del router porque el servidor está en otra red: la MAC solo sirve para el tramo actual."},
 {nodo:"Switch",sub:"capa 2",d:{...base,mo:"00:1A:2B:3C:4D:25 (PC)",md:"00:50:56:AA:00:01 (router, LAN)",ttl:"128"},
  txt:"El switch lee la MAC destino, consulta su tabla y la manda solo por el puerto del router. No cambia nada: la trama sale idéntica."},
 {nodo:"Router",sub:"capa 3",d:{...base,mo:"00:50:56:AA:00:02 (router, salida)",md:"3C:84:6A:10:20:30 (siguiente router)",ttl:"127"},
  txt:"El router quita la trama, lee la IP destino, decide la ruta y crea una trama nueva: MAC origen = su interfaz de salida, MAC destino = el siguiente salto. Baja el TTL en 1 y recalcula el FCS. IP y puertos, intactos."},
 {nodo:"Servidor",sub:"llega",d:{...base,mo:"00:25:90:EE:11:01 (último router)",md:"00:25:90:FF:77:10 (servidor)",ttl:"119"},
  txt:"Tras varios routers (cada uno con MAC nuevas y TTL−1) llega al servidor. Las IP y los puertos son los mismos que salieron de tu PC. El servidor desencapsula: 0x0800 → IP, Protocolo 6 → TCP, puerto 80 → servidor web."}
];
let v=0;
function drawViaje(){
  $("#ruta").innerHTML=tramos.map((t,i)=>`${i?'<span class="flecha" aria-hidden="true">→</span>':""}<button class="nodo${i===v?" sel":""}" data-i="${i}" aria-pressed="${i===v}">${t.nodo}<small>${t.sub}</small></button>`).join("");
  $("#ruta").querySelectorAll(".nodo").forEach(b=>b.onclick=()=>{v=+b.dataset.i;drawViaje()});
  const prev=v?tramos[v-1].d:null,cur=tramos[v].d;
  $("#campos").innerHTML=filas.map(([n,c,k])=>`<tr class="${prev&&prev[k]!==cur[k]?"cambia":""}"><th><span class="cap" style="--c:var(${c})"></span>${n}</th><td>${cur[k]}</td></tr>`).join("");
  $("#viajeTxt").textContent=tramos[v].txt;
}
drawViaje();

/* ---------- TCP / UDP ---------- */
const tcpMsgs=[["der","SYN → «¿hablamos?» (seq=100)"],["izq","← SYN-ACK «sí, recibido» (seq=300, ack=101)"],["der","ACK → «perfecto» (ack=301) · conexión abierta"],["der","Datos → GET / (seq=101)"],["izq","← ACK (ack=150) · confirma que llegó"]];
let ti=0;
function resetHs(id,dest){$(id).innerHTML=`<span class="end">Cliente</span><span></span><span class="end">${dest}</span>`}
$("#tcpNext").onclick=()=>{if(ti>=tcpMsgs.length)return;const[d,t]=tcpMsgs[ti++];const m=document.createElement("div");m.className="msg "+d;m.textContent=t;$("#hsTcp").appendChild(m);if(ti>=tcpMsgs.length)$("#tcpNext").disabled=true};
$("#tcpReset").onclick=()=>{ti=0;resetHs("#hsTcp","Servidor");$("#tcpNext").disabled=false};
const udpMsgs=[["der","Consulta DNS → «¿IP de www.ejemplo.com?»",""],["izq","← Respuesta: 93.184.216.34",""],["der","Consulta DNS → (se pierde por el camino)","lost"],["der","Nadie avisa. Si la aplicación quiere, pregunta otra vez.",""]];
let ui=0;
$("#udpNext").onclick=()=>{if(ui>=udpMsgs.length)return;const[d,t,x]=udpMsgs[ui++];const m=document.createElement("div");m.className="msg "+d+" "+x;m.textContent=t;$("#hsUdp").appendChild(m);if(ui>=udpMsgs.length)$("#udpNext").disabled=true};
$("#udpReset").onclick=()=>{ui=0;resetHs("#hsUdp","Servidor DNS");$("#udpNext").disabled=false};

/* ---------- tarjetas ---------- */
const cartas=[
 ["puerto","Puerto 20 y 21","FTP (20 datos, 21 control) · TCP"],["puerto","Puerto 22","SSH · acceso remoto cifrado · TCP"],["puerto","Puerto 23","Telnet · acceso remoto sin cifrar · TCP"],
 ["puerto","Puerto 25","SMTP · enviar correo · TCP"],["puerto","Puerto 53","DNS · traducir nombres a IP · UDP (y TCP)"],["puerto","Puerto 67 y 68","DHCP (67 servidor, 68 cliente) · UDP"],
 ["puerto","Puerto 80","HTTP · web sin cifrar · TCP"],["puerto","Puerto 110","POP3 · descargar correo · TCP"],["puerto","Puerto 143","IMAP · leer correo en el servidor · TCP"],
 ["puerto","Puerto 443","HTTPS · web cifrada · TCP"],["puerto","Puerto 3389","RDP · escritorio remoto de Windows · TCP"],
 ["cab","EtherType 0x0800","Dentro de la trama va IPv4"],["cab","EtherType 0x0806","Dentro de la trama va ARP"],["cab","EtherType 0x86DD","Dentro de la trama va IPv6"],
 ["cab","Protocolo IP = 1","ICMP (lo usa ping)"],["cab","Protocolo IP = 6","TCP"],["cab","Protocolo IP = 17","UDP"]
];
let filtro="todo",fc=null;
function otra(){const pool=cartas.filter(c=>filtro==="todo"||c[0]===filtro);let n;do{n=pool[Math.floor(Math.random()*pool.length)]}while(pool.length>1&&n===fc);fc=n;
  $("#fcTipo").textContent=n[0]==="puerto"?"¿Qué protocolo usa…?":"¿Qué significa…?";$("#fcQ").textContent=n[1];$("#fcA").textContent=n[2];$("#fcA").hidden=true;$("#fcVer").disabled=false}
$("#fcVer").onclick=()=>{$("#fcA").hidden=false;$("#fcVer").disabled=true};
$("#fcOtra").onclick=otra;
document.querySelectorAll(".filtros .chip").forEach(b=>b.onclick=()=>{filtro=b.dataset.f;document.querySelectorAll(".filtros .chip").forEach(x=>x.classList.toggle("on",x===b));otra()});
otra();

/* ---------- preguntas ---------- */
const pregs=[
 ["Un paquete va de tu PC a un servidor y atraviesa 3 routers. ¿Cambia la IP de destino por el camino? ¿Y la MAC de destino?","La IP de destino no cambia: es el destino final. La MAC de destino cambia en cada salto, porque cada router crea una trama nueva dirigida al siguiente equipo del tramo."],
 ["Verdadero o falso, y explica: «El switch cambia la MAC de origen por la suya al reenviar la trama».","Falso. El switch lee la MAC de destino para saber por qué puerto mandarla, pero reenvía la trama sin modificarla. Quien cambia las MAC es el router."],
 ["Tu PC quiere hablar con un servidor de Internet. ¿Qué MAC de destino pone en la trama que sale de la tarjeta de red? ¿Por qué?","La MAC de la puerta de enlace (el router), porque el servidor está en otra red y la MAC solo sirve para llegar al siguiente equipo del mismo tramo. La IP de destino sí es la del servidor."],
 ["¿Cómo se llama la PDU en cada capa, de la 7 a la 1?","Capas 7, 6 y 5: datos. Capa 4: segmento (TCP) o datagrama (UDP). Capa 3: paquete. Capa 2: trama. Capa 1: bits."],
 ["En Wireshark ves EtherType 0x0806. ¿Qué lleva dentro esa trama? ¿Y si el campo Protocolo de la cabecera IP vale 17?","0x0806 = ARP. Protocolo 17 = UDP (6 sería TCP y 1 sería ICMP)."],
 ["¿Por qué DNS usa normalmente UDP y una descarga web usa TCP?","La consulta DNS es muy corta: si se pierde, sale más barato repetirla que hacer el saludo de 3 pasos de TCP. En una web o un archivo no puede faltar ningún trozo, así que hace falta TCP, que confirma y reenvía."],
 ["Escribe el saludo en tres pasos de TCP y di qué significa cada mensaje.","1. SYN: el cliente pide abrir conexión. 2. SYN-ACK: el servidor acepta y confirma que lo recibió. 3. ACK: el cliente confirma. A partir de ahí se envían datos."],
 ["¿Qué hace el FCS, dónde está y en qué capa?","Es un código de comprobación (CRC) que va al final de la trama, en la capa 2. El receptor lo recalcula: si no coincide, la trama tiene errores y se descarta."],
 ["¿Qué capas del modelo OSI se agrupan en cada capa del modelo TCP/IP?","Aplicación (TCP/IP) = Aplicación + Presentación + Sesión (7, 6, 5). Transporte = Transporte (4). Internet = Red (3). Acceso a la red = Enlace + Física (2, 1)."],
 ["Un paquete sale de tu PC con TTL 128. Pasa por un switch y luego por 2 routers. ¿Con qué TTL llega? ¿Para qué sirve el TTL?","Llega con 126: cada router resta 1 y el switch no lo toca. Sirve para que un paquete no dé vueltas para siempre si hay un bucle: cuando llega a 0, el router lo descarta (y avisa con ICMP)."]
];
let marcas=Repaso.marcas("capas");
function marcador(){const v=Object.values(marcas);const ok=v.filter(x=>x==="ok").length;$("#marcador").textContent=v.length?`Te has marcado ${v.length} de ${pregs.length}: ${ok} bien, ${v.length-ok} por repasar.`:`${pregs.length} preguntas. Aún no te has marcado ninguna.`}
function drawPregs(){
  $("#preguntas").innerHTML=pregs.map(([q,a],i)=>`<div class="panel preg"><h3>${q}</h3>
   <label class="eyebrow" for="r${i}">Tu respuesta</label><textarea id="r${i}"></textarea>
   <div class="stepper"><button class="btn" data-ver="${i}">Ver respuesta</button></div>
   <div class="resp" id="s${i}" hidden>${a}</div>
   <div class="autoev" id="e${i}" hidden>¿La tenías bien?
    <button class="btn okb${marcas[i]==="ok"?" on":""}" data-m="${i}" data-v="ok">Sí</button>
    <button class="btn badb${marcas[i]==="mal"?" on":""}" data-m="${i}" data-v="mal">No, a repasar</button></div></div>`).join("");
  document.querySelectorAll("[data-ver]").forEach(b=>b.onclick=()=>{const i=b.dataset.ver;$("#s"+i).hidden=false;$("#e"+i).hidden=false;b.disabled=true});
  document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{marcas[b.dataset.m]=b.dataset.v;Repaso.guardaMarcas("capas",marcas);
    b.parentNode.querySelectorAll("[data-m]").forEach(x=>x.classList.toggle("on",x===b));marcador()});
}
$("#borrar").onclick=()=>{marcas={};Repaso.guardaMarcas("capas",marcas);drawPregs();marcador()};
drawPregs();marcador();
})();
