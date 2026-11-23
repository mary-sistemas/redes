/* Tema: Señal y modulación · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);
const W=640,H=120,X0=100,HI=30,LO=95,MID=62;

/* ---------- clasificar ---------- */
Repaso.test("cla",[
 {q:"La TDT: la antena de casa solo recibe, nunca envía.",ok:"Simplex",exp:"Un solo sentido, siempre del mismo emisor al mismo receptor."},
 {q:"Un walkie-talkie: los dos hablan, pero hay que soltar el botón para escuchar.",ok:"Half-dúplex",exp:"Dos sentidos, pero por turnos."},
 {q:"Un PC conectado a un switch por cable, enviando y recibiendo a la vez.",ok:"Full-dúplex",exp:"Ethernet conmutada: los dos sentidos a la vez y sin colisiones."},
 {q:"Wi-Fi: el portátil y el punto de acceso comparten el mismo canal de radio.",ok:"Half-dúplex",exp:"En Wi-Fi el aire es compartido y se turnan (CSMA/CA)."},
 {q:"Un hub con varios PC conectados.",ok:"Half-dúplex",exp:"El hub comparte el medio: hay colisiones y se usa CSMA/CD."},
 {q:"La TV por cable: muchos canales a la vez por el mismo coaxial, cada uno en su frecuencia.",ok:"Banda ancha",exp:"El medio se divide en canales de frecuencia."},
 {q:"Ethernet por par trenzado: una sola señal digital usa todo el cable.",ok:"Banda base",exp:"Por eso los nombres llevan BASE: 100BASE-TX, 1000BASE-T…"},
 {q:"ADSL: voz y datos por el mismo par telefónico en frecuencias distintas.",ok:"Banda ancha",exp:"Varias señales repartidas por frecuencia en el mismo medio."}
],["Simplex","Half-dúplex","Full-dúplex","Banda base","Banda ancha"]);

/* ---------- ondas ---------- */
function marco(bits,titulo){
  const bw=(W-X0-10)/bits.length;
  let s=`<svg viewBox="0 0 ${W} ${H+20}" role="img" aria-label="${titulo}"><text x="0" y="${MID+4}">${titulo}</text>`;
  s+=`<line class="eje" x1="${X0}" y1="${MID}" x2="${W-10}" y2="${MID}" stroke-dasharray="3 4"/>`;
  bits.forEach((b,i)=>{const x=X0+i*bw;s+=`<line class="eje" x1="${x}" y1="12" x2="${x}" y2="${H+4}" stroke-dasharray="2 4"/><text x="${x+bw/2-4}" y="${H+18}">${b}</text>`});
  s+=`<line class="eje" x1="${W-10}" y1="12" x2="${W-10}" y2="${H+4}" stroke-dasharray="2 4"/>`;
  return {s,bw};
}
function bitsVal(){return ($("#bitsIn").value.replace(/[^01]/g,"")||"0").slice(0,16).split("").map(Number)}
function drawLinea(){
  const bits=bitsVal();
  let {s,bw}=marco(bits,"NRZ");let pts=[];
  bits.forEach((b,i)=>{const y=b?HI:LO,x=X0+i*bw;pts.push(`${x},${y}`,`${x+bw},${y}`)});
  $("#ondaNRZ").innerHTML=s+`<polyline class="sig" stroke="var(--l2)" points="${pts.join(" ")}"/></svg>`;
  ({s,bw}=marco(bits,"Manchester"));pts=[];
  bits.forEach((b,i)=>{const x=X0+i*bw,a=b?LO:HI,c=b?HI:LO;pts.push(`${x},${a}`,`${x+bw/2},${a}`,`${x+bw/2},${c}`,`${x+bw},${c}`)});
  $("#ondaMan").innerHTML=s+`<polyline class="sig" stroke="var(--l7)" points="${pts.join(" ")}"/></svg>`;
}
$("#bitsIn").oninput=drawLinea;drawLinea();

const modTxt={ask:"<b>ASK</b>: cambia la <b>altura</b> (amplitud) de la onda. Un 1 = onda alta, un 0 = onda baja. Sencilla pero muy sensible al ruido, que justo afecta a la amplitud.",
 fsk:"<b>FSK</b>: cambia la <b>frecuencia</b> (lo rápido que oscila). Un 1 = más ciclos en el mismo tiempo, un 0 = menos ciclos.",
 psk:"<b>PSK</b>: cambia la <b>fase</b>. Fíjate en el paso de un 1 a un 0: la onda «da la vuelta» de golpe y empieza al revés."};
let mod="ask";
function drawMod(){
  const bits=bitsVal().slice(0,10),{s,bw}=marco(bits,mod.toUpperCase());let pts=[];
  bits.forEach((b,i)=>{for(let k=0;k<=40;k++){const t=k/40,x=X0+(i+t)*bw;
    let amp=32,cic=2,fase=0;
    if(mod==="ask")amp=b?32:9;if(mod==="fsk")cic=b?4:2;if(mod==="psk")fase=b?0:Math.PI;
    pts.push(`${x.toFixed(1)},${(MID-amp*Math.sin(2*Math.PI*cic*t+fase)).toFixed(1)}`)}});
  $("#ondaMod").innerHTML=s+`<polyline class="sig" stroke="var(--l3)" points="${pts.join(" ")}"/></svg>`;
  $("#modTxt").innerHTML=modTxt[mod];
}
document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{mod=b.dataset.m;document.querySelectorAll("[data-m]").forEach(x=>x.classList.toggle("on",x===b));drawMod()});
$("#bitsIn").addEventListener("input",drawMod);drawMod();

/* ---------- bits y bytes ---------- */
const num=v=>parseFloat(String(v).replace(",","."));
const f=n=>n.toLocaleString("es-ES",{maximumFractionDigits:2});
function drawVel(){
  const v=num($("#velMb").value),t=num($("#tamMB").value);
  if(!(v>0)||!(t>0)){$("#velRes").textContent="Escribe números mayores que 0.";return}
  const mbs=v/8,seg=t*8/v;
  const tiempo=seg<60?`${f(seg)} s`:seg<3600?`${Math.floor(seg/60)} min ${Math.round(seg%60)} s`:`${f(seg/3600)} h`;
  $("#velRes").innerHTML=`${f(v)} Mbps ÷ 8 = <b>${f(mbs)} MB/s</b> como máximo teórico. Un archivo de ${f(t)} MB son ${f(t*8)} Mb → tardaría al menos <b>${tiempo}</b>. En la práctica algo más, porque las cabeceras y retransmisiones también ocupan el enlace (throughput &lt; ancho de banda).`;
}
$("#velMb").oninput=drawVel;$("#tamMB").oninput=drawVel;drawVel();

/* ---------- preguntas ---------- */
Repaso.preguntas("senal",[
 ["¿Cuál es el objetivo del nivel físico y cuál es su PDU?","Transmitir bits «en bruto» por un medio, de forma que lo que llega sea lo mismo que se envió. Su PDU son los <b>bits</b>."],
 ["Diferencia entre señal analógica y digital, con una ventaja de cada una.","Analógica: valores continuos (una onda); aprovecha mejor medios como la radio. Digital: valores discretos (0 y 1); se puede regenerar sin acumular ruido."],
 ["Diferencia entre codificación de línea y modulación. ¿Dónde se usa cada una?","Codificación de línea: los bits se convierten directamente en niveles de voltaje en el cable (Ethernet). Modulación: se modifica una onda portadora (amplitud, frecuencia o fase) según los bits (Wi-Fi, 4G/5G, ADSL)."],
 ["¿Qué problema tiene NRZ y cómo lo soluciona Manchester? ¿Qué coste tiene?","Con muchos bits iguales seguidos la señal NRZ no cambia y el receptor pierde el reloj. Manchester obliga a un cambio a mitad de cada bit, que sirve de sincronización, pero la señal cambia el doble de rápido y necesita más ancho de banda."],
 ["¿Qué es QAM y por qué la usan Wi-Fi y 4G/5G?","Combina a la vez cambios de amplitud y de fase, creando muchos estados distintos. Cada estado transporta varios bits, así que se consigue mucha velocidad en el mismo ancho de canal."],
 ["Clasifica Ethernet con switch según todos los criterios de transmisión.","Digital, serie, síncrona, full-dúplex, en banda base y por medio guiado."],
 ["¿Qué es un duplex mismatch y cómo se evita?","Un extremo fijado a mano en full-dúplex y el otro en automático, que cae en half-dúplex. Provoca colisiones, errores CRC y muy bajo rendimiento aunque el enlace aparezca activo. Se evita dejando los dos en automático o fijando los dos igual."],
 ["¿Qué factores aumentan la atenuación?","La distancia, la frecuencia de la señal, la mala calidad del medio (conectores sucios, empalmes, curvas cerradas), el calor y, en radio, los obstáculos."],
 ["¿Qué es la diafonía y cómo se combate?","La interferencia que un par produce en el par contiguo del mismo cable. Se combate con el trenzado (paso distinto en cada par), el apantallamiento, el separador en cruz y no destrenzando más de lo necesario."],
 ["Diferencia entre ancho de banda, throughput y goodput.","Ancho de banda: el máximo teórico del enlace. Throughput: lo que se transfiere de verdad, incluyendo cabeceras y retransmisiones. Goodput: solo los datos útiles de la aplicación. Siempre goodput ≤ throughput ≤ ancho de banda."],
 ["Tienes 300 Mbps contratados. ¿A cuántos MB/s descargarás como máximo y cuánto tardará un archivo de 1500 MB?","300 ÷ 8 = <b>37,5 MB/s</b>. 1500 MB × 8 = 12 000 Mb; 12 000 ÷ 300 = <b>40 s</b> como mínimo teórico."],
 ["¿Por qué un hub forma un único dominio de colisión y un switch no?","El hub es de capa 1: no entiende tramas ni direcciones, repite la señal por todos los puertos. El switch es de capa 2: manda cada trama solo al puerto de destino, así que cada puerto es su propio dominio de colisión."]
]);
})();
