/* Tema: Wi-Fi · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);

/* ---------- canales 2,4 GHz ---------- */
const X=f=>20+(f-2398)/(2486-2398)*600;
const cols=["--l2","--l7","--l4","--l6","--l3","--l1"];
let activos=[1,6,11];
$("#chBtns").innerHTML=Array.from({length:13},(_,i)=>`<button class="chip" data-ch="${i+1}">${i+1}</button>`).join("")+
  `<button class="chip" data-pre="1,6,11">1-6-11</button><button class="chip" data-pre="1,3,6">1-3-6</button>`;
function drawCh(){
  document.querySelectorAll("[data-ch]").forEach(b=>b.classList.toggle("on",activos.includes(+b.dataset.ch)));
  let s=`<line class="eje" x1="20" y1="140" x2="620" y2="140"/>`;
  for(let n=1;n<=13;n++){const f=2412+5*(n-1),x=X(f);s+=`<line class="eje" x1="${x}" y1="136" x2="${x}" y2="144"/><text x="${x-4}" y="158">${n}</text>`}
  s+=`<text x="20" y="168">2400 MHz</text><text x="560" y="168">2483,5</text>`;
  const orden=[...activos].sort((a,b)=>a-b);
  orden.forEach((n,i)=>{const f=2412+5*(n-1),x1=X(f-10),x2=X(f+10),xc=X(f),c=cols[i%cols.length];
    s+=`<path d="M${x1},140 Q${xc},${-10+ (i%2)*18} ${x2},140" style="fill:color-mix(in srgb,var(${c}) 18%,transparent);stroke:var(${c});stroke-width:2"/><text x="${xc-10}" y="${40+(i%2)*18}" style="fill:var(${c});font-weight:600">ch ${n}</text>`});
  $("#chSvg").innerHTML=s;
  const pis=[];for(let i=0;i<orden.length;i++)for(let j=i+1;j<orden.length;j++)if(orden[j]-orden[i]<5)pis.push(`${orden[i]} y ${orden[j]}`);
  $("#chTxt").innerHTML=!orden.length?"Activa algún canal.":pis.length?`<span class="fb mal">Se solapan: ${pis.join(", ")}.</span> Sus centros están a menos de 20 MHz (menos de 5 canales de distancia) y se interfieren entre sí.`:
    orden.length>1?`<span class="fb ok">Ninguno se solapa.</span> Entre cada par hay al menos 5 canales (25 MHz). En 2,4 GHz caben como mucho 3 así: 1, 6 y 11.`:"Un solo canal: activa otro para comparar.";
}
document.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{const n=+b.dataset.ch;activos=activos.includes(n)?activos.filter(x=>x!==n):[...activos,n];drawCh()});
document.querySelectorAll("[data-pre]").forEach(b=>b.onclick=()=>{activos=b.dataset.pre.split(",").map(Number);drawCh()});
drawCh();

/* ---------- escoger canal (ej. 12) ---------- */
const esc={"1":"El 1 tiene Biblioteca con señal 64: bastante fuerte, compartirías el canal con ella.","6":"El 6 es el peor: ya hay dos redes (Aula-Redes con 78 y Cafetería con 55).",
 "11":"El 11 solo tiene Taller y con la señal más débil (40). Es el canal no solapado menos ocupado.","3":"El 3 no es uno de los canales no solapados: interferiría a la vez con el 1 y con el 6."};
$("#escOps").innerHTML=["1","3","6","11"].map(c=>`<button class="btn" data-c="${c}">Canal ${c}</button>`).join("");
$("#escOps").querySelectorAll("button").forEach(b=>b.onclick=()=>{
  $("#escOps").querySelectorAll("button").forEach(x=>{x.classList.remove("ok","mal");if(x.dataset.c==="11")x.classList.add("ok")});
  if(b.dataset.c!=="11")b.classList.add("mal");
  $("#escFb").innerHTML=`<span class="fb ${b.dataset.c==="11"?"ok":"mal"}">${b.dataset.c==="11"?"¡Bien!":"No es la mejor."}</span> ${esc[b.dataset.c]}${b.dataset.c!=="11"?" "+esc["11"]:""}`});

/* ---------- normas ---------- */
Repaso.test("nor",[
 {q:"Wi-Fi 4, la primera que usa 2,4 y 5 GHz, hasta 600 Mbps.",ok:"802.11n",exp:"802.11n (2009) = Wi-Fi 4."},
 {q:"Wi-Fi 5, solo en 5 GHz.",ok:"802.11ac",exp:"802.11ac (2013) = Wi-Fi 5."},
 {q:"Wi-Fi 6 y 6E; la 6E añade la banda de 6 GHz.",ok:"802.11ax",exp:"802.11ax = Wi-Fi 6/6E, 9,6 Gbps."},
 {q:"Wi-Fi 7, hasta ~46 Gbps y canales de 320 MHz.",ok:"802.11be",exp:"802.11be (2024) = Wi-Fi 7."},
 {q:"54 Mbps en 2,4 GHz (Wi-Fi 3).",ok:"802.11g",exp:"802.11g (2003)."},
 {q:"54 Mbps pero en 5 GHz (Wi-Fi 2).",ok:"802.11a",exp:"802.11a (1999)."},
 {q:"11 Mbps; si se conecta un equipo así, frena a toda la celda.",ok:"802.11b",exp:"802.11b (1999), Wi-Fi 1."},
 {q:"Un aula con 30 portátiles modernos proyectando vídeo. ¿Qué norma recomiendas?",ok:"802.11ax",exp:"Wi-Fi 6 en 5 GHz: más velocidad y mucho más eficiente con muchos equipos a la vez."}
],["802.11a","802.11b","802.11g","802.11n","802.11ac","802.11ax","802.11be"]);

/* ---------- conexión ---------- */
Repaso.ordena("con",["Descubrimiento (beacon o probe request)","Autenticación 802.11 abierta","Asociación (el AP da un AID)","Negociación de claves (WPA2/WPA3)","Transmisión de datos cifrados","Roaming o desasociación"]);

/* ---------- seguridad ---------- */
Repaso.test("seg",[
 {q:"Ocultar el SSID para que no vean la red.",ok:"No protege",exp:"El SSID sigue viajando en las probe y en la asociación: cualquier analizador lo ve."},
 {q:"Filtrar por dirección MAC.",ok:"No protege",exp:"Las MAC viajan en claro y se pueden suplantar (MAC spoofing). Como mucho, es una capa extra."},
 {q:"Usar WPA3-Personal con una clave de 16 caracteres.",ok:"Protege",exp:"Es la recomendación actual."},
 {q:"Desactivar WPS.",ok:"Protege",exp:"Evita los ataques al PIN de WPS."},
 {q:"Usar WEP porque los equipos antiguos solo entienden eso.",ok:"No protege",exp:"WEP está roto: se descifra en minutos. Nunca usarlo."},
 {q:"Poner a los invitados en otra red o VLAN.",ok:"Protege",exp:"Separa los equipos no confiables de la red interna."},
 {q:"Cambiar el usuario y la contraseña admin/admin del router.",ok:"Protege",exp:"Imprescindible: es lo primero que prueba un atacante."},
 {q:"En una empresa, autenticación individual con 802.1X y RADIUS.",ok:"Protege",exp:"WPA2/WPA3-Enterprise: cada usuario con sus credenciales y se puede revocar a uno solo."}
],["Protege","No protege"]);

/* ---------- preguntas ---------- */
Repaso.preguntas("wifi",[
 ["Cita tres diferencias entre Ethernet y Wi-Fi.","Wi-Fi comparte el aire entre todos (Ethernet tiene un cable por enlace); es half-dúplex (Ethernet con switch es full-dúplex); usa CSMA/CA con ACK (Ethernet usó CSMA/CD); la señal sale del edificio, así que el cifrado es imprescindible; permite movilidad."],
 ["¿Por qué en 2,4 GHz se recomiendan solo los canales 1, 6 y 11?","Los canales están separados 5 MHz pero cada uno ocupa unos 20 MHz, así que casi todos se pisan. 1, 6 y 11 están a 25 MHz entre sí y son los únicos que no se solapan."],
 ["¿Qué es DFS y por qué los canales 36–48 son los más estables en 5 GHz?","DFS obliga al AP a dejar el canal si detecta un radar, lo que provoca cortes breves. Lo aplican los canales 52–64 y 100–140; los 36–48 no, por eso son más estables."],
 ["Diferencia entre SSID y BSSID.","El SSID es el <b>nombre</b> de la red (texto, hasta 32 caracteres). El BSSID es la <b>MAC del AP</b> que da servicio a esa celda. En un ESS todos los AP tienen el mismo SSID pero cada uno su BSSID."],
 ["Diferencia entre modo ad-hoc e infraestructura.","Ad-hoc: los equipos hablan directamente entre sí, sin AP. Infraestructura: todo pasa por el AP, que hace de centro de la estrella; es el habitual."],
 ["¿Qué es el roaming y qué hace falta para que funcione bien?","Que un equipo pase de un AP a otro sin cortarse. Hacen falta varios AP con el mismo SSID unidos por cable, celdas que se solapen un 10–20 % y canales distintos en celdas vecinas."],
 ["¿Por qué Wi-Fi no puede usar CSMA/CD? Explica el problema del nodo oculto.","Porque mientras transmite, la propia señal tapa a las demás y no se puede detectar la colisión. Nodo oculto: dos estaciones llegan al AP pero no se oyen entre sí; ambas ven el canal libre y chocan en el AP. Se soluciona con RTS/CTS."],
 ["Ordena los pasos de conexión de una estación a un AP.","Descubrimiento (beacons o probe request) → autenticación 802.11 → asociación (AID) → negociación de claves WPA2/WPA3 → datos → roaming o desasociación."],
 ["¿Por qué ocultar el SSID o filtrar por MAC no son medidas de seguridad reales?","El SSID oculto sigue viajando en las tramas de sondeo y asociación, y las MAC van en claro y se pueden suplantar. Cualquier analizador los descubre."],
 ["Diferencia entre WPA2/WPA3-Personal y Enterprise.","Personal: una contraseña común para todos. Enterprise: cada usuario se autentica con sus credenciales mediante 802.1X y un servidor RADIUS; se puede revocar a uno sin cambiar la clave de todos."],
 ["netsh wlan show interfaces muestra: 802.11n, 2,4 GHz, canal 6, señal 41 %, 72,2 Mbps. Propón dos mejoras.","Acercar el equipo o reubicar el AP (más alto y central, lejos de metal y paredes gruesas); conectarse a la banda de 5 GHz si hay cobertura; cambiar a un canal menos ocupado (1 u 11) si el 6 está saturado."],
 ["Un equipo obtiene la IP 169.254.23.7. ¿Qué significa?","Que no ha respondido ningún servidor DHCP y el sistema se ha asignado una dirección automática (APIPA). No es una IP válida de la red."],
 ["nmcli dice «Wi-Fi is disabled». ¿Cómo lo compruebas y lo arreglas?","Con <code>rfkill list</code> se ve si la radio está bloqueada (por software o hardware) y con <code>rfkill unblock wifi</code> se desbloquea. Si es un bloqueo físico, hay que usar el interruptor o la tecla Fn."],
 ["Al configurar un router doméstico para que funcione solo como AP, ¿qué hay que cambiar?","Conectarlo por un puerto LAN (no WAN), desactivar el DHCP y el NAT, y darle una IP fija dentro de la red existente."]
]);
})();
