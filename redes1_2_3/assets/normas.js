/* Tema: Normalización e IEEE 802 · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);

/* ---------- sintaxis / semántica / temporización ---------- */
Repaso.test("pro",[
 {q:"La trama Ethernet lleva primero 6 bytes de MAC destino, luego 6 de MAC origen y luego 2 de tipo.",ok:"Sintaxis",exp:"Habla del formato y el orden de los campos: es la estructura."},
 {q:"Si el campo Protocol de IP vale 6, el sistema tiene que entregar el contenido a TCP.",ok:"Semántica",exp:"Dice qué significa un valor y qué acción provoca."},
 {q:"El emisor no puede mandar más datos hasta que el receptor confirme que tiene sitio en su memoria.",ok:"Temporización",exp:"Regula el ritmo para que el receptor no se desborde (buffer overflow)."},
 {q:"Un mensaje con el bit SYN activado significa «quiero abrir una conexión».",ok:"Semántica",exp:"Es el significado de un patrón de bits concreto."},
 {q:"La cabecera IPv4 mide 20 bytes y la dirección de origen ocupa los bytes 12 a 15.",ok:"Sintaxis",exp:"Es la estructura de la cabecera: tamaños y posiciones de los campos."},
 {q:"Emisor y receptor se sincronizan para saber a qué velocidad llegan los bits.",ok:"Temporización",exp:"Sincronización y velocidad de transmisión."},
 {q:"Primero se hace el saludo SYN, SYN-ACK, ACK y solo después se mandan datos.",ok:"Temporización",exp:"Fija el orden secuencial de los intercambios."}
],["Sintaxis","Semántica","Temporización"]);

/* ---------- organismos ---------- */
Repaso.test("org",[
 {q:"Publicó el modelo de referencia OSI.",ok:"ISO",exp:"Norma ISO/IEC 7498, de 1984."},
 {q:"Tiene un comité llamado 802 que define Ethernet y Wi-Fi.",ok:"IEEE",exp:"El IEEE normaliza las capas física y de enlace de las LAN."},
 {q:"Publica los protocolos de Internet (TCP, IP, DNS, HTTP) en documentos llamados RFC.",ok:"IETF",exp:"Internet Engineering Task Force: los RFC son públicos."},
 {q:"Hace las normas de cableado estructurado, como la 568 de los colores T568A y T568B.",ok:"TIA",exp:"Serie ANSI/TIA-568, junto con ANSI."},
 {q:"Elabora los estándares europeos de telefonía móvil: GSM, 4G y 5G.",ok:"ETSI",exp:"European Telecommunications Standards Institute."},
 {q:"Publica en España las normas europeas e internacionales como normas UNE.",ok:"AENOR",exp:"AENOR / UNE es el organismo español."},
 {q:"Regula la telefonía y las telecomunicaciones internacionales (por ejemplo, recomendaciones para DSL).",ok:"ITU-T",exp:"Unión Internacional de Telecomunicaciones, sector de normalización."},
 {q:"Supervisa el desarrollo de los estándares voluntarios en Estados Unidos.",ok:"ANSI",exp:"American National Standards Institute."},
 {q:"Hace las normas EN, de obligado cumplimiento en proyectos de la Unión Europea.",ok:"CEN/CENELEC",exp:"Comités Europeos de Normalización."}
],["ISO","IEEE","IETF","ITU-T","ANSI","TIA","ETSI","CEN/CENELEC","AENOR"]);

/* ---------- segmentación ---------- */
const A=n=>({t:"A"+n,c:"--l2"}),B=n=>({t:"B"+n,c:"--l7"});
const pasos=[
 {o:[{t:"foto.jpg · 4 GB entera",c:"--l2"}],k:[],d:[],txt:"Tu PC quiere mandar un archivo enorme. Si lo mandase de un tirón ocuparía el cable todo el rato y, si fallase un bit al final, habría que repetir los 4 GB."},
 {o:[A(1),A(2),A(3),A(4),A(5)],k:[],d:[],txt:"<b>Segmentación:</b> la capa de transporte divide los datos en bloques pequeños y numera cada uno (A1, A2…). Ese número es el número de secuencia."},
 {o:[A(1),A(2),A(3),A(4),A(5)],k:[A(1),B(1),A(2),B(2),A(3),A(4),B(3),A(5)],d:[],txt:"<b>Multiplexación:</b> como los bloques son pequeños, el canal puede intercalarlos con los de otras aplicaciones o usuarios (B = la música que estás escuchando). Nadie se queda bloqueado esperando."},
 {o:[],k:[],d:[A(3),A(1),A(5),A(2)],txt:"Cada bloque puede ir por una ruta distinta, así que llegan <b>desordenados</b>. Y el A4 se ha perdido por el camino."},
 {o:[],k:[A(4)],d:[A(3),A(1),A(5),A(2),A(4)],txt:"Ventaja de segmentar: solo se <b>retransmite el A4</b>, no el archivo entero."},
 {o:[],k:[],d:[A(1),A(2),A(3),A(4),A(5)],txt:"<b>Secuenciación:</b> el receptor usa los números de secuencia para ponerlos en orden y reconstruir el archivo exacto."}
];
let p=0;
const fila=l=>l.map(s=>`<span class="seg" style="--c:var(${s.c})">${s.t}</span>`).join("")||'<span class="marcador">—</span>';
function drawSeg(){const s=pasos[p];$("#segOrig").innerHTML=fila(s.o);$("#segCanal").innerHTML=fila(s.k);$("#segDest").innerHTML=fila(s.d);$("#segTxt").innerHTML=s.txt;
  $("#segPrev").disabled=p===0;$("#segNext").disabled=p===pasos.length-1;$("#segDots").innerHTML=pasos.map((_,i)=>`<i class="${i<=p?"on":""}"></i>`).join("")}
$("#segPrev").onclick=()=>{if(p>0){p--;drawSeg()}};$("#segNext").onclick=()=>{if(p<pasos.length-1){p++;drawSeg()}};drawSeg();

/* ---------- nomenclatura 802.3 ---------- */
const vars={
 "100BASE-TX":[["100","--l2","100 Mbps"],["BASE","--l4","Banda base: señal digital, un solo canal en el cable"],["TX","--l7","Par trenzado de cobre (Cat 5)"],"Fast Ethernet: 100 Mbps sobre cobre Cat 5."],
 "1000BASE-T":[["1000","--l2","1000 Mbps = 1 Gbps"],["BASE","--l4","Banda base"],["T","--l7","Par trenzado de cobre (Cat 5e/6)"],"Gigabit Ethernet sobre cobre Cat 5e o Cat 6."],
 "10GBASE-T":[["10G","--l2","10 Gbps"],["BASE","--l4","Banda base"],["T","--l7","Par trenzado de cobre (Cat 6A)"],"10 Gigabit sobre Cat 6A hasta 100 m."],
 "10GBASE-SR":[["10G","--l2","10 Gbps"],["BASE","--l4","Banda base"],["SR","--l3","Short Range: fibra multimodo"],"10 Gigabit sobre fibra multimodo, distancias cortas."],
 "10GBASE-LR":[["10G","--l2","10 Gbps"],["BASE","--l4","Banda base"],["LR","--l3","Long Range: fibra monomodo"],"10 Gigabit sobre fibra monomodo, distancias largas."]
};
function ponVar(n){const v=vars[n];
  $("#varBtns").querySelectorAll(".chip").forEach(b=>b.classList.toggle("on",b.dataset.v===n));
  $("#varPartes").innerHTML=v.slice(0,3).map(([t,c,d])=>`<div class="grupo" style="--c:var(${c});justify-items:start;max-width:240px"><b>${t}</b><span style="font-size:.85rem">${d}</span></div>`).join("");
  $("#varTxt").innerHTML=`<b>${n}:</b> ${v[3]} El número es la velocidad, BASE es el tipo de señal y lo del final, el medio.`}
$("#varBtns").innerHTML=Object.keys(vars).map(n=>`<button class="chip" data-v="${n}">${n}</button>`).join("");
$("#varBtns").querySelectorAll(".chip").forEach(b=>b.onclick=()=>ponVar(b.dataset.v));ponVar("100BASE-TX");

/* ---------- familia ---------- */
Repaso.test("fam",[
 {q:"Separar la red de la oficina en VLAN etiquetando las tramas.",ok:"802.1Q",exp:"802.1Q añade una etiqueta a la trama con el número de VLAN."},
 {q:"Pedir usuario y contraseña antes de dejar usar un puerto del switch.",ok:"802.1X",exp:"802.1X es el control de acceso y autenticación de puertos."},
 {q:"La subcapa común que da a IP la misma interfaz sobre cualquier medio.",ok:"802.2",exp:"802.2 es la LLC."},
 {q:"Gigabit Ethernet por cable de cobre (1000BASE-T).",ok:"802.3",exp:"Todo Ethernet cableado es 802.3."},
 {q:"Wi-Fi 6 en las bandas de 2,4 y 5 GHz.",ok:"802.11",exp:"Wi-Fi 6 es 802.11ax, dentro de la familia 802.11."},
 {q:"Unos auriculares Bluetooth.",ok:"802.15",exp:"Bluetooth se basa en 802.15.1, de las redes personales (WPAN)."},
 {q:"Sensores de domótica Zigbee de muy bajo consumo.",ok:"802.15",exp:"Zigbee se basa en 802.15.4 (WPAN)."}
],["802.1Q","802.1X","802.2","802.3","802.11","802.15"]);

/* ---------- preguntas ---------- */
Repaso.preguntas("normas",[
 ["¿Qué tres aspectos define un protocolo? Explica cada uno con un ejemplo.","<b>Sintaxis</b>: formato y orden de los campos (la MAC destino va antes que la de origen). <b>Semántica</b>: qué significa cada valor y qué hay que hacer (Protocol = 6 → entregar a TCP). <b>Temporización</b>: velocidad, sincronización y orden de los intercambios (el saludo de TCP antes de los datos)."],
 ["Diferencia entre estándar de facto y formal, con un ejemplo de cada.","De facto: se impone por uso masivo sin aprobación oficial (TCP/IP, USB, Ethernet al principio). Formal: lo aprueba y publica un organismo oficial (OSI de la ISO, IEEE 802.3)."],
 ["¿Qué hace el IETF y cómo se llaman los documentos que publica?","Desarrolla y mantiene los protocolos de Internet (TCP, IP, DNS, HTTP). Los publica en documentos públicos llamados <b>RFC</b> (Request for Comments)."],
 ["Asocia cada organismo con su campo: IEEE, TIA, ETSI, AENOR.","IEEE: LAN, comité 802 (Ethernet, Wi-Fi). TIA: cableado estructurado (ANSI/TIA-568). ETSI: telefonía móvil europea (GSM, 4G, 5G). AENOR: normas UNE en España."],
 ["Cita tres ventajas de diseñar las redes en capas.","Interoperabilidad entre fabricantes; evolución independiente de cada capa (cambias cobre por fibra sin tocar el navegador); y diagnóstico más fácil, porque los fallos se aíslan capa a capa."],
 ["Explica segmentación, secuenciación y multiplexación.","<b>Segmentación</b>: dividir los datos en bloques pequeños; si uno se pierde, solo se reenvía ese. <b>Secuenciación</b>: numerar los bloques para reordenarlos en el destino, porque pueden llegar desordenados. <b>Multiplexación</b>: intercalar bloques de varias aplicaciones o usuarios en el mismo canal."],
 ["Verdadero o falso, y explica: «El modelo OSI es la pila de protocolos que usan Windows y Linux».","Falso. OSI es un marco teórico de referencia para estudiar y comparar tecnologías. Los sistemas usan TCP/IP, que es el estándar de facto."],
 ["¿En qué dos subcapas divide IEEE 802 la capa de enlace? ¿Cuál cambia según el medio?","<b>LLC</b> (802.2), arriba, común a todas las tecnologías, y <b>MAC</b>, abajo, específica de cada medio. La que cambia es la <b>MAC</b> (una para Ethernet y otra para Wi-Fi)."],
 ["¿De qué se encarga la subcapa MAC?","De la dirección MAC de 48 bits, de delimitar la trama y añadir el FCS/CRC para detectar errores, y del control de acceso al medio (CSMA/CD o CSMA/CA)."],
 ["¿Por qué Wi-Fi usa CSMA/CA y no CSMA/CD?","Porque en el aire una antena no puede escuchar a las demás mientras transmite, así que no puede detectar una colisión. Lo que hace es intentar evitarla esperando un tiempo aleatorio (backoff) antes de transmitir."],
 ["¿Qué regulan 802.1Q y 802.1X?","802.1Q: el etiquetado de tramas para crear <b>VLAN</b>. 802.1X: el <b>control de acceso y autenticación</b> en los puertos."],
 ["Descompón el nombre 10GBASE-LR.","<b>10G</b>: 10 Gbps. <b>BASE</b>: transmisión en banda base. <b>LR</b>: Long Range, fibra monomodo. Es una variante de Ethernet, 802.3."],
 ["Según la tabla comparativa, ¿qué capas de OSI quedan fuera de IEEE 802?","De la 3 a la 7 (red, transporte, sesión, presentación y aplicación). IEEE 802 solo normaliza la física y la de enlace (LLC + MAC)."]
]);
})();
