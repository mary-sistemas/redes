/* Tema: Tramas y direcciones MAC · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);
const h2=n=>n.toString(16).toUpperCase().padStart(2,"0");

/* ---------- analizador de MAC ---------- */
const ejemplos=["5C-F9-DD-47-B2-8A","01:00:5E:00:00:05","FF:FF:FF:FF:FF:FF","02:42:AC:11:00:02","a4:5e:60:d1:8f:c2","0c85.25a1.9f30"];
$("#macEj").innerHTML=ejemplos.map(m=>`<button class="chip" data-m="${m}">${m}</button>`).join("");
$("#macEj").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{$("#macIn").value=b.dataset.m;analiza()});
function analiza(){
  const raw=$("#macIn").value.trim(),hex=raw.replace(/[^0-9a-fA-F]/g,"");
  if(hex.length!==12||/[^0-9a-fA-F:\-.\s]/.test(raw)){$("#macRes").innerHTML=`<p class="fb mal">Una MAC tiene 12 cifras hexadecimales (6 bytes). Has escrito ${hex.length}.</p>`;return}
  const B=hex.match(/../g).map(x=>parseInt(x,16)),b0=B[0],bits=b0.toString(2).padStart(8,"0");
  const ig=b0&1,ul=(b0>>1)&1,bc=B.every(x=>x===255);
  const tipo=bc?"Broadcast":ig?"Multicast":"Unicast";
  const fmtW=B.map(h2).join("-"),fmtL=B.map(x=>h2(x).toLowerCase()).join(":"),fmtC=hex.toLowerCase().replace(/(....)(....)(....)/,"$1.$2.$3");
  $("#macRes").innerHTML=`
   <div>Primer byte: <b class="mono">0x${h2(b0)}</b> = <span class="bitbyte">${[...bits].map((c,i)=>`<b class="${i===6?"ug":i===7?"ig":""}">${c}</b>`).join("")}</span>
    <span class="marcador"> · penúltimo = U/L · último = I/G</span></div>
   <div class="resul">
    <div><span>OUI (fabricante)</span><b>${B.slice(0,3).map(h2).join("-")}</b></div>
    <div><span>Bit I/G</span><b>${ig} · ${ig?"grupo":"individual"}</b></div>
    <div><span>Bit U/L</span><b>${ul} · ${ul?"local":"universal"}</b></div>
    <div><span>Como destino</span><b>${tipo}</b></div>
   </div>
   <div class="tbl-scroll"><table class="grid-tabla" style="min-width:0"><tbody>
    <tr><th>Windows</th><td class="n">${fmtW}</td></tr><tr><th>Linux</th><td class="n">${fmtL}</td></tr><tr><th>Cisco</th><td class="n">${fmtC}</td></tr></tbody></table></div>
   <p>${bc?"Todos los bits a 1: es la dirección de <b>broadcast</b>. No puede ser MAC de origen.":
     ig?"I/G = 1: dirección de <b>grupo</b> (multicast). Solo la procesan los equipos del grupo. <b>No vale como origen.</b>"+(B[0]===1&&B[1]===0&&B[2]===0x5e?" El prefijo 01:00:5E es el de multicast IPv4.":""):
     "I/G = 0: <b>unicast</b>, un único equipo. Vale como origen."} ${ul&&!bc?"U/L = 1: la ha asignado el software (máquinas virtuales, Docker…), no el fabricante.":""}</p>`;
}
$("#macIn").oninput=analiza;analiza();

/* ---------- tipos de trama (ej. 2) ---------- */
Repaso.test("tip",[
 {q:"Un PC pide una página web a un servidor de su misma red local. ¿Qué tipo de trama es y la acepta un PC ajeno?",ok:"Unicast · no",exp:"Va a la MAC del servidor. Un PC ajeno en modo normal la descarta."},
 {q:"Un PC manda una petición ARP para descubrir la MAC de su puerta de enlace.",ok:"Broadcast · sí",exp:"Va a FF:FF:FF:FF:FF:FF: todos los equipos del dominio la reciben y la procesan (aunque solo responda el router)."},
 {q:"Un equipo envía una trama a 01:00:5E:00:00:05, grupo al que solo pertenecen dos servidores.",ok:"Multicast · no",exp:"Solo la procesan los equipos del grupo. Un PC ajeno en modo normal la descarta."},
 {q:"Un PC manda una trama a su vecino, cuya MAC ya conoce.",ok:"Unicast · no",exp:"Va solo a la MAC del vecino."},
 {q:"El PC ajeno tiene la tarjeta en modo promiscuo y recibe una trama unicast que no es suya.",ok:"Unicast · sí",exp:"En modo promiscuo acepta todas las tramas que le llegan. Es lo que hacen Wireshark y los analizadores."}
],["Unicast · no","Unicast · sí","Multicast · no","Broadcast · sí"]);

/* ---------- tamaño y relleno (ej. 3a) ---------- */
$("#tamEj").innerHTML=[["20",0],["46",0],["700",0],["1500",0],["1501",0],["1500",1]].map(([d,q])=>`<button class="chip" data-d="${d}" data-q="${q}">${d} B${q?" + 802.1Q":""}</button>`).join("");
$("#tamEj").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{$("#tamDat").value=b.dataset.d;$("#tamQ").checked=b.dataset.q==="1";tam()});
function tam(){
  const d=parseInt($("#tamDat").value,10),q=$("#tamQ").checked;
  if(!(d>=0)){$("#tamRes").textContent="Escribe un número de bytes.";return}
  const rel=Math.max(0,46-d),tot=12+(q?4:0)+2+d+rel+4,max=q?1522:1518;
  $("#tamBarra").innerHTML=`<div style="--c:var(--l7)"><b>MAC dst + orig</b><span>12 B</span></div>${q?'<div style="--c:var(--l1)"><b>802.1Q</b><span>4 B</span></div>':""}<div style="--c:var(--l5)"><b>Tipo</b><span>2 B</span></div><div style="--c:var(--l3);flex:${Math.max(1,Math.min(6,d/120))}"><b>Datos</b><span>${d} B</span></div>${rel?`<div class="gris" style="--c:var(--l4)"><b>Relleno</b><span>${rel} B</span></div>`:""}<div style="--c:var(--l2)"><b>FCS</b><span>4 B</span></div>`;
  $("#tamRes").innerHTML=d>1500?`<span class="fb mal">No válida.</span> ${d} bytes supera la MTU de 1500: no cabe en una trama Ethernet. La capa de red tendría que dividir el paquete antes.`:
   `Relleno: <b>${rel} B</b>${rel?` (46 − ${d})`:""}. Trama: 12 + ${q?"4 + ":""}2 + ${d} + ${rel} + 4 = <b>${tot} bytes</b>. <span class="fb ok">Válida</span> (entre 64 y ${max}).`;
}
$("#tamDat").oninput=tam;$("#tamQ").onchange=tam;tam();

/* ---------- tipo o longitud (ej. 3b) ---------- */
Repaso.test("et",[
 {q:"<code>0x0800</code>",ok:"EtherType: IPv4",exp:"Mayor que 0x0600: es un tipo."},
 {q:"<code>0x0806</code>",ok:"EtherType: ARP",exp:"Mayor que 0x0600: es un tipo."},
 {q:"<code>0x86DD</code>",ok:"EtherType: IPv6",exp:"Mayor que 0x0600: es un tipo."},
 {q:"<code>0x8100</code>",ok:"EtherType: 802.1Q",exp:"Indica que la trama lleva una etiqueta de VLAN (4 bytes más)."},
 {q:"<code>0x05DC</code>",ok:"Longitud",exp:"0x05DC = 1500: es una longitud (los datos ocupan 1500 bytes). Trama 802.3 con LLC."},
 {q:"<code>0x002E</code>",ok:"Longitud",exp:"0x002E = 46: longitud de 46 bytes de datos. Trama 802.3 con LLC."}
],["EtherType: IPv4","EtherType: ARP","EtherType: IPv6","EtherType: 802.1Q","Longitud"]);

/* ---------- trama en binario (ej. 3c) ---------- */
const binTxt=`10101010 10101010 10101010 10101010 10101010 10101010 10101010 10101011
00000001 00000000 01011110 00101101 10011101 01011101 00111100 01010010
10000010 10011110 11010100 00010111 00001000 00000000 11001110 00110001
00101100 01001100 01001011 11101100 00101011 10010000 10011011 01100101
00000011 11100011 00010001 01011110 01011000 10110100 01111100 00000001
01011110 11111101 11000110 01100111 10101010 01100011 11110110 10110000
01110110 10011101 01011101 00001011 10010011 11000111 01100111 11001001
11101100 00111111 11000111 00001000 11001000 11001101 11101011 11100101
00000100 11100000 11011110 00111010 00100101 01000000 00110110 01010001`;
const BY=binTxt.split(/\s+/);
const campos=[["Preámbulo",1,7,"--muted"],["SFD",8,8,"--l1"],["MAC destino",9,14,"--l7"],["MAC origen",15,20,"--l6"],["Tipo o longitud",21,22,"--l5"],["Datos",23,68,"--l3"],["FCS",69,72,"--l2"]];
const campoDe=i=>campos.find(c=>i>=c[1]&&i<=c[2]);
let coloreado=false;
function drawBin(sel){
  $("#binBytes").innerHTML=BY.map((b,i)=>{const n=i+1,c=campoDe(n);return `<span style="--c:var(${coloreado?c[3]:"--line"})" data-i="${n}" class="${sel===n?"hl":""}" title="Byte ${n}">${h2(parseInt(b,2))}</span>`}).join("");
  $("#binBytes").querySelectorAll("span").forEach(s=>s.onclick=()=>{const n=+s.dataset.i,c=campoDe(n);
    $("#binInfo").innerHTML=`Byte <b>${n}</b>: <span class="mono">${BY[n-1]}</span> = <b class="mono">0x${h2(parseInt(BY[n-1],2))}</b> → <b>${c[0]}</b> (bytes ${c[1]}–${c[2]})`;drawBin(n)});
}
const hx=(a,b)=>BY.slice(a-1,b).map(x=>h2(parseInt(x,2)));
$("#binSep").onclick=()=>{coloreado=true;drawBin();
  $("#binTabla").innerHTML=`<div class="tbl-scroll"><table class="grid-tabla"><thead><tr><th>Campo</th><th>Bytes</th><th>Valor</th></tr></thead><tbody>${
   campos.map(([n,a,b,c])=>`<tr><td><span class="cap" style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(${c});margin-right:6px"></span>${n}</td><td class="n">${a}–${b} (${b-a+1} B)</td><td class="n">${
    n==="MAC destino"||n==="MAC origen"?hx(a,b).join(":"):n==="Tipo o longitud"?"0x"+hx(a,b).join(""):n==="Datos"?"46 bytes":n==="Preámbulo"?"10101010 × 7":n==="SFD"?"10101011":"0x"+hx(a,b).join("")}</td></tr>`).join("")}</tbody></table></div>
   <div class="note" style="margin-top:10px"><b>Conclusiones:</b> destino <b>01:00:5E:2D:9D:5D</b>: primer byte 0x01 = 0000000<b>1</b> → I/G = 1 → <b>multicast</b> (prefijo de multicast IPv4). Origen <b>3C:52:82:9E:D4:17</b>: 0x3C = 001111<b>00</b> → I/G = 0, unicast y universal: <b>válida como origen</b>. Tipo <b>0x0800 = IPv4</b>. Tamaño sin preámbulo ni SFD: 6 + 6 + 2 + 46 + 4 = <b>64 bytes</b>, justo el mínimo. <b>No lleva 802.1Q</b>, porque tras la MAC de origen aparece 0x0800 y no 0x8100.</div>`};
$("#binReset").onclick=()=>{coloreado=false;$("#binTabla").innerHTML="";drawBin()};
drawBin();

/* ---------- preguntas ---------- */
Repaso.preguntas("tramas",[
 ["¿Cuál es el objetivo del nivel de enlace y cuál es su ámbito?","Transferir tramas entre dos nodos conectados directamente al mismo medio, para que la capa de red ignore el medio físico. Su ámbito es <b>salto a salto</b>: la trama solo existe dentro de la red local y cada router crea una nueva."],
 ["¿Ethernet corrige los errores de transmisión?","No. Con la FCS los <b>detecta</b> y descarta la trama dañada, pero no la corrige ni la retransmite; eso, si hace falta, lo hacen capas superiores (TCP)."],
 ["Para la MAC 5C-F9-DD-47-B2-8A indica OUI, bits I/G y U/L y tipo de trama como destino.","OUI 5C-F9-DD. 0x5C = 01011100: I/G = 0 (individual), U/L = 0 (universal). <b>Unicast</b>."],
 ["Para 02:42:AC:11:00:02 indica I/G, U/L y qué tipo de dirección es.","0x02 = 00000010: I/G = 0 (individual) y U/L = 1 (<b>local</b>, asignada por software, típica de Docker). Unicast."],
 ["Escribe 0c85.25a1.9f30 en formato Windows y Linux.","Windows: <b>0C-85-25-A1-9F-30</b>. Linux: <b>0c:85:25:a1:9f:30</b>."],
 ["¿Puede una trama llevar la dirección de broadcast como origen?","No. La MAC de origen identifica a quien envía, que siempre es un único equipo: el origen es siempre unicast."],
 ["Unos datos de 20 bytes: ¿cuánto relleno lleva la trama y cuánto mide?","Relleno 46 − 20 = <b>26 bytes</b>. Trama 6 + 6 + 2 + 46 + 4 = <b>64 bytes</b> (el mínimo)."],
 ["¿Es válida una trama con 1501 bytes de datos?","No: supera la MTU de 1500 bytes. El paquete tendría que dividirse en la capa de red antes de llegar a Ethernet."],
 ["¿Cuánto mide una trama con 1500 bytes de datos y etiqueta 802.1Q?","1518 + 4 = <b>1522 bytes</b>, el máximo con etiqueta."],
 ["Interpreta los valores 0x8100 y 0x002E en el campo tipo o longitud.","0x8100 ≥ 0x0600: EtherType, trama con etiqueta <b>802.1Q</b>. 0x002E = 46 ≤ 1500: <b>longitud</b> de 46 bytes (trama 802.3 con LLC)."],
 ["¿Por qué la trama Ethernet tiene un tamaño mínimo de 64 bytes?","Con CSMA/CD a 10/100 Mbps, el emisor debe seguir transmitiendo cuando le llega la señal de colisión. Si la trama fuera más corta acabaría antes de detectarla y no sabría que debe repetirla."],
 ["¿Por qué normalmente no se ve la FCS en Wireshark?","Porque la tarjeta de red la comprueba y la elimina antes de entregar la trama al sistema operativo."],
 ["¿Qué diferencia hay entre el modo normal y el promiscuo de una tarjeta de red? ¿Verías el unicast de otros con un switch?","Normal: acepta sus tramas, los broadcast y sus multicast. Promiscuo: acepta todo lo que le llega (Wireshark). Con un switch no verías el unicast ajeno, porque el switch no te lo envía; con un hub sí."]
]);
})();
