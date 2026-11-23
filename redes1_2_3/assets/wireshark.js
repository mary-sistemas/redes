/* Tema: Wireshark y tramas · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);
const h2=n=>n.toString(16).padStart(2,"0");

/* ---------- construir la trama real byte a byte ---------- */
const macB=m=>m.split(":").map(x=>parseInt(x,16));
const ipB=ip=>ip.split(".").map(Number);
const u16=n=>[n>>8&255,n&255];
const u32=n=>[n>>>24&255,n>>>16&255,n>>>8&255,n&255];
const http="GET /index.html HTTP/1.1\r\nHost: 203.0.113.5\r\nUser-Agent: curl/8.5.0\r\nAccept: */*\r\n\r\n";
const httpB=[...http].map(c=>c.charCodeAt(0));
const ipLen=20+20+httpB.length;
let ipHdr=[0x45,0x00,...u16(ipLen),0x1c,0x46,0x40,0x00,128,6,0,0,...ipB("192.168.1.15"),...ipB("203.0.113.5")];
{let s=0;for(let i=0;i<20;i+=2)s+=(ipHdr[i]<<8)+ipHdr[i+1];while(s>>16)s=(s&0xffff)+(s>>16);const c=~s&0xffff;ipHdr[10]=c>>8;ipHdr[11]=c&255}
const ipCk="0x"+h2(ipHdr[10])+h2(ipHdr[11]);
const tcpHdr=[...u16(54321),...u16(80),...u32(0x5a3c1f01),...u32(0x00b81e45),0x50,0x18,...u16(64240),0x8c,0x2f,0,0];
const bytes=[...macB("BB:22:CC:11:11:11"),...macB("AA:11:BB:22:CC:11"),0x08,0x00,...ipHdr,...tcpHdr,...httpB];
const total=bytes.length;

/* capas y campos: [nombre visible, inicio, longitud, explicación] */
const capas=[
 {id:"f",c:"--l1",t:`Frame 4: ${total} bytes on wire (${total*8} bits)`,ini:0,len:total,campos:[],
  exp:`Capa 1. No es una cabecera: es el resumen de lo que viajó por el cable. ${total} bytes × 8 = ${total*8} bits. Es el dato de «longitud en el medio» de la práctica.`},
 {id:"e",c:"--l2",t:"Ethernet II, Src: AA:11:BB:22:CC:11, Dst: BB:22:CC:11:11:11",ini:0,len:14,cls:"l2",
  exp:"Capa 2, la trama. 14 bytes de cabecera. Ethernet II porque el campo Type vale más de 0x0600.",
  campos:[["Destination: BB:22:CC:11:11:11",0,6,"MAC de destino: la del router (eth0), no la del servidor. La MAC solo sirve para el tramo actual."],
   ["Source: AA:11:BB:22:CC:11",6,6,"MAC de origen: la tarjeta de red del Host A."],
   ["Type: IPv4 (0x0800)",12,2,"EtherType. Le dice a quien recibe la trama que dentro va un paquete IPv4."]]},
 {id:"i",c:"--l3",t:"Internet Protocol Version 4, Src: 192.168.1.15, Dst: 203.0.113.5",ini:14,len:20,cls:"l3",
  exp:"Capa 3, el paquete. Cabecera IPv4 de 20 bytes.",
  campos:[["0100 .... = Version: 4",14,1,"Versión de IP. El 4 del primer byte (0x45)."],
   [".... 0101 = Header Length: 20 bytes (5)",14,1,"Longitud de la cabecera en grupos de 4 bytes: 5 × 4 = 20."],
   [`Total Length: ${ipLen}`,16,2,`Tamaño del paquete entero (cabecera IP + TCP + datos): ${ipLen} bytes. Más los 14 de Ethernet dan los ${total} de la trama.`],
   ["Flags: 0x2, Don't fragment",20,2,"No fragmentar este paquete."],
   ["Time to Live: 128",22,1,"TTL. Cada router le resta 1; si llega a 0, el paquete se descarta. Windows empieza en 128 y Linux en 64."],
   ["Protocol: TCP (6)",23,1,"Indica qué va dentro: 6 = TCP, 17 = UDP, 1 = ICMP. Es la cuestión 1b de la práctica."],
   [`Header Checksum: ${ipCk}`,24,2,"Suma de comprobación solo de la cabecera IP. Como el TTL cambia, cada router la recalcula."],
   ["Source Address: 192.168.1.15",26,4,"IP de origen: el Host A. No cambia en todo el viaje (si no hay NAT)."],
   ["Destination Address: 203.0.113.5",30,4,"IP de destino: el servidor final. Tampoco cambia."]]},
 {id:"t",c:"--l4",t:"Transmission Control Protocol, Src Port: 54321, Dst Port: 80",ini:34,len:20,cls:"l4",
  exp:"Capa 4, el segmento. Cabecera TCP de 20 bytes.",
  campos:[["Source Port: 54321",34,2,"Puerto efímero que eligió el sistema operativo para esta conexión. Es alto y aleatorio."],
   ["Destination Port: 80",36,2,"Puerto conocido del servicio: 80 = HTTP. Así el servidor sabe a qué programa entregarlo."],
   ["Sequence Number (raw): 1513889537",38,4,"Número de secuencia: numera los bytes para poder reordenarlos en el destino (secuenciación)."],
   ["Acknowledgment Number (raw): 12066373",42,4,"Confirma hasta qué byte se ha recibido de la otra parte."],
   ["Flags: 0x018 (PSH, ACK)",47,1,"ACK = confirma; PSH = entrega ya estos datos a la aplicación. El SYN solo aparece en el saludo inicial."],
   ["Window: 64240",48,2,"Cuántos bytes puede recibir sin confirmar: es el control de flujo."]]},
 {id:"h",c:"--l7",t:"Hypertext Transfer Protocol",ini:54,len:httpB.length,cls:"l7",
  exp:"Capa 7, los datos. Al ser HTTP sin cifrar, se lee en claro en la columna de texto.",
  campos:[["GET /index.html HTTP/1.1\\r\\n",54,26,"Método GET, recurso pedido (/index.html) y versión de HTTP."],
   ["Host: 203.0.113.5\\r\\n",80,19,"Servidor al que va la petición."],
   ["User-Agent: curl/8.5.0\\r\\n",99,24,"Programa que hace la petición: aquí curl, como en la práctica."]]}
];
let hl=[0,0];
function drawHex(){
  const clsDe=i=>{for(const c of capas.slice(1))if(i>=c.ini&&i<c.ini+c.len)return c.cls;return""};
  let out="";
  for(let r=0;r<total;r+=16){
    let fila=`<div><span class="off">${r.toString(16).padStart(4,"0")}</span>`,asc="";
    for(let i=r;i<r+16;i++){
      if(i<total){const on=i>=hl[0]&&i<hl[0]+hl[1];fila+=`<span class="b ${clsDe(i)}${on?" hl":""}">${h2(bytes[i])}</span>${i===r+7?" ":""}`;
        const ch=bytes[i];asc+=ch>=32&&ch<127?(ch===60?"&lt;":ch===38?"&amp;":String.fromCharCode(ch)):".";}
      else fila+=`<span class="b"></span>`;
    }
    out+=fila+`<span class="asc">${asc}</span></div>`;
  }
  $("#hex").innerHTML=out;
}
function drawArbol(){
  $("#arbol").innerHTML=capas.map((c,ci)=>`<button class="capa" style="--c:var(${c.c})" data-c="${ci}">${c.t}</button>`+
    c.campos.map((f,fi)=>`<button class="campo-ws" style="--c:var(${c.c})" data-c="${ci}" data-f="${fi}">${f[0]}</button>`).join("")).join("");
  $("#arbol").querySelectorAll("button").forEach(b=>b.onclick=()=>{
    $("#arbol").querySelectorAll("button").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");
    const c=capas[+b.dataset.c];
    if(b.dataset.f!==undefined){const f=c.campos[+b.dataset.f];hl=[f[1],f[2]];$("#wsInfo").innerHTML=`<b>${f[0].replace(/\\r\\n/,"")}</b> · ${f[2]} byte${f[2]>1?"s":""} desde el ${f[1]}. ${f[3]}`}
    else{hl=[c.ini,c.len];$("#wsInfo").innerHTML=c.exp}
    drawHex()});
}
drawArbol();drawHex();$("#wsInfo").textContent="Pulsa una línea de la izquierda.";

/* ---------- Punto A / Punto B ---------- */
const filas=[["Puerto origen","po"],["Puerto destino","pd"],["IP origen","io"],["IP destino","id"],["MAC origen","mo"],["MAC destino","md"]];
const sol={A:{po:"54321",pd:"80",io:"192.168.1.15",id:"203.0.113.5",mo:"AA:11:BB:22:CC:11",md:"BB:22:CC:11:11:11"},
           B:{po:"54321",pd:"80",io:"192.168.1.15",id:"203.0.113.5",mo:"BB:22:CC:22:22:22",md:"CC:55:DD:33:44:55"}};
$("#rellena").innerHTML=`<thead><tr><th>Campo</th><th>Punto A · sale del PC</th><th>Punto B · sale del router</th></tr></thead><tbody>${
  filas.map(([n,k])=>`<tr><th>${n}</th><td><input data-p="A" data-k="${k}" autocomplete="off" spellcheck="false" aria-label="${n} en punto A"></td><td><input data-p="B" data-k="${k}" autocomplete="off" spellcheck="false" aria-label="${n} en punto B"></td></tr>`).join("")}</tbody>`;
const normV=s=>s.trim().toUpperCase().replace(/-/g,":").replace(/\s/g,"");
$("#rellOk").onclick=()=>{let ok=0,n=0,vacio=0;
  document.querySelectorAll("#rellena input").forEach(i=>{n++;i.classList.remove("ok","mal");if(!i.value.trim()){vacio++;return}
    const b=normV(i.value)===sol[i.dataset.p][i.dataset.k];i.classList.add(b?"ok":"mal");if(b)ok++});
  const malMac=[...document.querySelectorAll("#rellena input.mal")].some(i=>i.dataset.k[0]==="m");
  $("#rellFb").innerHTML=`<span class="fb ${ok===n?"ok":"mal"}">${ok} de ${n} bien${vacio?` (${vacio} sin rellenar)`:""}.</span> `+
   (ok===n?"Perfecto: IP y puertos no cambian en todo el camino, las MAC sí cambian en cada tramo.":
    malMac?"Pista: en cada tramo, la MAC de origen es la de quien envía la trama en ese tramo y la de destino, la del siguiente equipo del mismo tramo.":"Pista: las IP y los puertos son los del origen y destino final, en los dos puntos.")};
$("#rellSol").onclick=()=>{document.querySelectorAll("#rellena input").forEach(i=>{i.value=sol[i.dataset.p][i.dataset.k];i.classList.remove("ok","mal")});
  $("#rellFb").innerHTML="Solución puesta. Fíjate en las filas de MAC: son las únicas que cambian entre A y B."};
$("#rellBorra").onclick=()=>{document.querySelectorAll("#rellena input").forEach(i=>{i.value="";i.classList.remove("ok","mal")});$("#rellFb").textContent=""};

/* ---------- Ethernet II o 802.3 ---------- */
const types=[[0x0800,"IPv4"],[0x0806,"ARP"],[0x86DD,"IPv6"],[0x8100,"una etiqueta de VLAN 802.1Q"]];
const gen=()=>{
  if(Math.random()<.5){const[t,n]=types[Math.floor(Math.random()*types.length)];const hx="0x"+t.toString(16).toUpperCase().padStart(4,"0");
    return{q:`Justo después de la MAC de origen ves el valor <code>${hx}</code>.`,ok:"Ethernet II",exp:`${hx} = ${t} es mayor o igual que 0x0600 (1536), así que es un Type: dentro va ${n}.`}}
  const L=[38,46,64,100,300,512,1000,1500][Math.floor(Math.random()*8)],hx="0x"+L.toString(16).toUpperCase().padStart(4,"0");
  return{q:`Justo después de la MAC de origen ves el valor <code>${hx}</code>.`,ok:"IEEE 802.3",exp:`${hx} = ${L} en decimal, que es menor o igual que 1500: es un Length (${L} bytes de datos). Detrás vendrá la cabecera LLC para decir qué protocolo va dentro.`}};
Repaso.test("eth",[gen],["Ethernet II","IEEE 802.3"]);

/* ---------- filtros ---------- */
Repaso.test("fil",[
 {q:"Quieres ver solo las peticiones GET de HTTP, como en la práctica.",ok:'http.request.method == "GET"',exp:"Filtra por el método de la petición HTTP."},
 {q:"Quieres ver solo las consultas y respuestas de resolución de nombres.",ok:"dns",exp:"Escribir el nombre del protocolo muestra solo ese protocolo."},
 {q:"Quieres ver cómo tu PC averigua la MAC del router.",ok:"arp",exp:"Eso lo hace ARP: la petición «¿Quién tiene…?» y su respuesta."},
 {q:"Quieres ver los paquetes del ping que acabas de lanzar.",ok:"icmp",exp:"ping usa ICMP (Echo request y Echo reply)."},
 {q:"Quieres ver todo lo que va o viene del servidor DNS 8.8.8.8.",ok:"ip.addr == 8.8.8.8",exp:"ip.addr coincide tanto si es la IP de origen como la de destino."},
 {q:"Quieres ver todo el tráfico TCP del puerto 80.",ok:"tcp.port == 80",exp:"tcp.port coincide con el puerto de origen o el de destino."}
],['http.request.method == "GET"',"dns","arp","icmp","ip.addr == 8.8.8.8","tcp.port == 80"]);

/* ---------- preguntas ---------- */
Repaso.preguntas("wireshark",[
 ["En la cabecera Ethernet II de tu captura, ¿qué campo y qué valor indican que la carga útil es un paquete IPv4?","El campo <b>Type</b> (EtherType) con el valor <b>0x0800</b>."],
 ["En la cabecera IPv4, ¿qué campo indica qué protocolo de transporte va dentro y qué valor tiene en una petición HTTP?","El campo <b>Protocol</b>, con valor <b>6</b> (TCP). Si fuera UDP valdría 17."],
 ["¿A qué equipo pertenece la MAC de destino de la trama que sale de tu PC hacia una web? ¿Por qué no aparece la MAC del servidor?","Es la MAC de la <b>puerta de enlace</b> (el router). El servidor está en otra red y la MAC solo sirve dentro del tramo local; tu PC ni siquiera conoce la MAC del servidor. Cada router monta una trama nueva hacia el siguiente salto."],
 ["La trama atraviesa un switch antes de llegar al router. ¿Hasta qué capa abre la información el switch? ¿Modifica IP o puertos?","Hasta la <b>capa 2</b>: solo lee la MAC de destino para saber por qué puerto mandarla. No modifica ni las MAC, ni las IP, ni los puertos."],
 ["¿Hasta qué nivel abre el router el paquete para reenviarlo? ¿Llega a mirar el puerto 80 o el GET de HTTP?","Hasta la <b>capa 3</b>: le basta la IP de destino para decidir la ruta. No mira el puerto TCP ni el GET; eso es de las capas 4 y 7, que solo abre el servidor."],
 ["Encuentra el error: «El PC no añade la cabecera IP porque no sabe llegar a Internet; solo pone la MAC y es el router quien añade la IP de destino».","Falso. El PC encapsula completo: pone él mismo la cabecera IP con su IP de origen y la IP del servidor como destino. Lo que el PC no hace es llegar solo: manda la trama a la MAC del router, que solo se encarga de reenviarla."],
 ["Encuentra el error: «En una comunicación a través de varios routers, la MAC de origen del cliente llega intacta hasta el servidor para que sepa a qué dirección física contestar».","Falso. Cada router crea una trama nueva y pone su propia MAC como origen, así que al servidor le llega la MAC del último router. Para contestar, el servidor usa la <b>IP</b> de origen, que sí llega intacta."],
 ["Encuentra el error: «El switch leyó el puerto 80, comprobó que era tráfico web y lo mandó al router».","Falso. El switch trabaja en capa 2 y no lee puertos (capa 4). Lo mandó al router porque la <b>MAC de destino</b> de la trama era la del router."],
 ["Una captura muestra «Frame 4: 74 bytes on wire». ¿Cuántos bits son y a qué capa corresponde ese dato?","74 × 8 = <b>592 bits</b>. Es la información de la capa 1 (física): la longitud de lo que viajó por el medio."],
 ["Después de la MAC de origen ves 0x0026. ¿Es Ethernet II o 802.3? ¿Qué significa ese número?","0x0026 = 38, que es menor que 1500: es una trama <b>IEEE 802.3</b> y ese campo es la longitud (38 bytes de datos). Detrás irá la cabecera LLC."],
 ["¿Por qué en la práctica se usa HTTP y no HTTPS para analizar las cabeceras?","Porque con HTTPS, TLS cifra todo lo que va por encima de TCP y Wireshark solo vería «Application Data». Con HTTP la petición GET se lee en claro."],
 ["Ves un paquete ARP en la captura. ¿Qué EtherType tiene, a qué MAC va la petición y lleva cabecera IP?","EtherType <b>0x0806</b>. La petición va a la MAC de difusión <b>ff:ff:ff:ff:ff:ff</b> porque aún no se conoce la MAC buscada. No lleva cabecera IP: va directamente dentro de la trama Ethernet."]
]);
})();
