/* Tema: STP · animaciones y preguntas */
(function(){
const $=s=>document.querySelector(s);
const R=Repaso;

/* ---------- tormenta ---------- */
const T={SW1:[320,60],SW2:[150,230],SW3:[490,230],PC1:[60,310],PC2:[580,310]};
const TL=[["SW1","SW2","Fa0/1"],["SW1","SW3","Fa0/2"],["SW2","SW3",""],["SW2","PC1",""],["SW3","PC2",""]];
let corriendo=false,parar=false,bloqueado=null;
function drawT(){const s=$("#tSvg");s.innerHTML="";
  TL.forEach(([a,b])=>{const bl=bloqueado&&((a===bloqueado[0]&&b===bloqueado[1])||(a===bloqueado[1]&&b===bloqueado[0]));
    R.el("line",{x1:T[a][0],y1:T[a][1],x2:T[b][0],y2:T[b][1],class:"lnk",style:bl?"stroke:var(--warn);stroke-dasharray:6 6":""},s)});
  if(bloqueado){const[a,b]=bloqueado;const x=T[b][0]+(T[a][0]-T[b][0])*0.2,y=T[b][1]+(T[a][1]-T[b][1])*0.2;
    R.el("circle",{cx:x,cy:y,r:11,style:"fill:var(--warn)"},s);const t=R.el("text",{x,y:y+4,"text-anchor":"middle",style:"fill:#fff;font-weight:700"},s);t.textContent="B"}
  Object.entries(T).forEach(([n,[x,y]])=>{const pc=n.startsWith("PC");R.el("rect",{x:x-(pc?26:36),y:y-(pc?14:18),width:pc?52:72,height:pc?28:36,rx:6,class:"dev "+(pc?"pc":"sw"),id:"t-"+n},s);
    const t=R.el("text",{x,y:y+4,"text-anchor":"middle"},s);t.textContent=n});
  [["Fa0/1",280,95],["Fa0/2",345,95]].forEach(([n,x,y])=>{const t=R.el("text",{x,y,class:"peq"},s);t.textContent=n});
}
const vecT=n=>TL.filter(l=>l[0]===n||l[1]===n).map(l=>l[0]===n?l[1]:l[0]);
const linkBloq=(a,b)=>bloqueado&&((a===bloqueado[0]&&b===bloqueado[1])||(a===bloqueado[1]&&b===bloqueado[0]));
async function tormenta(conSTP){
  if(corriendo)return;corriendo=true;parar=false;bloqueado=conSTP?["SW2","SW3"]:null;drawT();
  let copias=0,rec=0,id=0;const vivas=new Set();
  const pinta=()=>{$("#tCop").textContent=vivas.size;$("#tRec").textContent=rec};
  const macSW1=p=>{$("#tMac").innerHTML=`<tr class="renueva"><td>PC1 · 0001.aaaa</td><td>${p}</td></tr>`};
  $("#tTxt").innerHTML=conSTP?"Con STP, el puerto de SW3 hacia SW2 está <b>bloqueado</b> (B). PC1 manda un ARP…":"PC1 manda un ARP (broadcast). Los switches lo inundan por todos los puertos menos el de entrada…";
  async function viaja(desde,hasta,miId){
    if(parar)return;vivas.add(miId);pinta();
    await R.trama($("#tSvg"),[T[desde],T[hasta]],{txt:"ARP",color:conSTP?"#23854a":"#d9485f",dur:900});
    vivas.delete(miId);pinta();if(parar)return;
    if(hasta==="PC2"){rec++;pinta();return}if(hasta.startsWith("PC"))return;
    if(hasta==="SW1")macSW1(desde==="SW2"?"Fa0/1":"Fa0/2");
    const sig=vecT(hasta).filter(n=>n!==desde&&!linkBloq(hasta,n));
    await Promise.all(sig.map(n=>viaja(hasta,n,++id)));
  }
  if(conSTP){await viaja("PC1","SW2",++id);
    $("#tTxt").innerHTML="El broadcast llega <b>una sola vez</b> a cada equipo y se acaba: el puerto bloqueado no lo deja volver a dar la vuelta. PC2 lo ha recibido <b>1 vez</b>.";}
  else{const t0=performance.now();const lanza=async k=>{if(parar)return;await viaja("PC1","SW2",++id)};
    const lanzador=(async()=>{for(let k=0;k<4&&!parar;k++){lanza(k);await R.espera(3800);
      $("#tTxt").innerHTML=`Las copias <b>no mueren nunca</b> (no hay TTL) y cada nuevo broadcast añade más. PC2 recibe la misma trama una y otra vez y la tabla de SW1 cambia el puerto de PC1 entre Fa0/1 y Fa0/2. ${k>=2?"<b>Así nace una tormenta de broadcast.</b> Pulsa «Parar».":""}`}})();
    await lanzador;while(!parar&&vivas.size)await R.espera(300);}
  corriendo=false;
}
$("#tSin").onclick=()=>{if(corriendo){parar=true;setTimeout(()=>tormenta(false),1200)}else tormenta(false)};
$("#tCon").onclick=()=>{if(corriendo){parar=true;setTimeout(()=>tormenta(true),1200)}else tormenta(true)};
$("#tStop").onclick=()=>{parar=true;$("#tTxt").innerHTML+=" <b>(Parado.)</b> En una red real no hay botón de parar: hay que quitar el bucle o tener STP."};
drawT();$("#tTxt").textContent="Pulsa ▶ Sin STP.";

/* ---------- elección ---------- */
const POS={SW1:[320,70],SW2:[140,300],SW3:[500,300]};
const COSTE={"10":100,"100":19,"1000":4};
const def=()=>({sw:{SW1:{pri:32768,mac:"000A.F3B1.0001"},SW2:{pri:32768,mac:"0030.F2A1.0002"},SW3:{pri:32768,mac:"0060.4752.0003"}},
  links:[{a:"SW1",pa:"Fa0/1",b:"SW2",pb:"Fa0/1",vel:"100",up:true},{a:"SW1",pa:"Fa0/2",b:"SW3",pb:"Fa0/1",vel:"100",up:true},{a:"SW2",pa:"Fa0/2",b:"SW3",pb:"Fa0/2",vel:"100",up:true}]});
let E=def();
const bidK=n=>[E.sw[n].pri,E.sw[n].mac.replace(/\W/g,"").toLowerCase()];
const menor=(x,y)=>{const a=bidK(x),b=bidK(y);return a[0]!==b[0]?a[0]<b[0]:a[1]<b[1]};
function calcula(){
  const nodos=Object.keys(E.sw);let raiz=nodos.reduce((m,n)=>menor(n,m)?n:m);
  const dist={};nodos.forEach(n=>dist[n]=Infinity);dist[raiz]=0;
  for(let k=0;k<3;k++)E.links.forEach(l=>{if(!l.up)return;const c=COSTE[l.vel];if(dist[l.a]+c<dist[l.b])dist[l.b]=dist[l.a]+c;if(dist[l.b]+c<dist[l.a])dist[l.a]=dist[l.b]+c});
  const rol={};const rp={};
  nodos.filter(n=>n!==raiz).forEach(n=>{let best=null;
    E.links.forEach((l,i)=>{if(!l.up||(l.a!==n&&l.b!==n))return;const o=l.a===n?l.b:l.a,c=dist[o]+COSTE[l.vel];
      const cand={i,o,c};if(!best||c<best.c||(c===best.c&&menor(o,best.o)))best=cand});
    if(best)rp[n]=best});
  E.links.forEach((l,i)=>{if(!l.up){rol[i]={[l.a]:"-",[l.b]:"-"};return}
    const r={};
    if(rp[l.a]&&rp[l.a].i===i)r[l.a]="R";if(rp[l.b]&&rp[l.b].i===i)r[l.b]="R";
    // designado: el extremo con menor coste a la raíz (empate: menor BID)
    const des=dist[l.a]!==dist[l.b]?(dist[l.a]<dist[l.b]?l.a:l.b):(menor(l.a,l.b)?l.a:l.b);
    [l.a,l.b].forEach(n=>{if(r[n])return;r[n]=n===des?"D":"B"});rol[i]=r});
  return {raiz,dist,rol,rp};
}
function drawE(){
  const s=$("#eSvg");s.innerHTML="";const {raiz,dist,rol,rp}=calcula();
  E.links.forEach((l,i)=>{const[a,b]=[POS[l.a],POS[l.b]];
    const bl=Object.values(rol[i]).includes("B");
    R.el("line",{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:"lnk",style:!l.up?"stroke:var(--bad);stroke-dasharray:4 6":bl?"stroke:var(--warn);stroke-dasharray:8 6":"stroke:var(--ok)"},s);
    const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;let t=R.el("text",{x:mx+(i===2?0:i===0?-60:20),y:my+(i===2?22:0),class:"peq","text-anchor":"middle"},s);
    t.textContent=l.up?`${l.vel} Mbps · coste ${COSTE[l.vel]}`:"enlace caído";
    [[l.a,l.pa,a,b],[l.b,l.pb,b,a]].forEach(([n,p,P,Q])=>{const x=P[0]+(Q[0]-P[0])*0.24,y=P[1]+(Q[1]-P[1])*0.24,r=rol[i][n];
      const col=r==="R"?"var(--l2)":r==="D"?"var(--ok)":r==="B"?"var(--warn)":"var(--muted)";
      R.el("circle",{cx:x,cy:y,r:13,style:`fill:${col}`},s);t=R.el("text",{x,y:y+4,"text-anchor":"middle",style:"fill:#fff;font-weight:700"},s);t.textContent=r;
      t=R.el("text",{x:x+(x<P[0]?-30:16),y:y-14,class:"peq"},s);t.textContent=p});
  });
  Object.entries(POS).forEach(([n,[x,y]])=>{R.el("rect",{x:x-62,y:y-30,width:124,height:60,rx:8,class:"dev sw",style:n===raiz?"stroke:var(--warn);stroke-width:4":""},s);
    let t=R.el("text",{x,y:y-8,"text-anchor":"middle"},s);t.textContent=(n===raiz?"★ ":"")+n;
    t=R.el("text",{x,y:y+8,"text-anchor":"middle",class:"peq"},s);t.textContent=`${E.sw[n].pri} · ${E.sw[n].mac}`;
    t=R.el("text",{x,y:y+22,"text-anchor":"middle",class:"peq"},s);t.textContent=n===raiz?"puente raíz":`coste a la raíz: ${dist[n]===Infinity?"∞":dist[n]}`});
  // explicación
  const nodos=Object.keys(E.sw),empate=nodos.every(n=>E.sw[n].pri===E.sw[raiz].pri);
  let txt=`<b>1. Raíz: ${raiz}</b> (BID ${E.sw[raiz].pri} + ${E.sw[raiz].mac}). ${empate?"Todos tienen la misma prioridad, así que gana la <b>MAC más baja</b>.":"Gana por tener la <b>prioridad más baja</b>."} Todos sus puertos son designados. `;
  nodos.filter(n=>n!==raiz).forEach(n=>{const b=rp[n];if(b){const l=E.links[b.i];txt+=`<b>2. ${n}</b>: puerto raíz ${l.a===n?l.pa:l.pb} (coste ${b.c} hasta la raíz). `}else txt+=`<b>${n}</b> está aislado. `});
  E.links.forEach((l,i)=>{const r=rol[i];if(Object.values(r).includes("B")){const bq=Object.keys(r).find(k=>r[k]==="B"),dq=Object.keys(r).find(k=>r[k]==="D");
    txt+=`<b>3-4. Enlace ${l.a}–${l.b}</b>: los dos están a coste ${dist[l.a]===dist[l.b]?dist[l.a]+" (empate), gana el de menor BID":"distinto, gana el de menor coste"}: designado en <b>${dq}</b> y <b>bloqueado en ${bq} (${l.a===bq?l.pa:l.pb})</b>.`}});
  if(!E.links.some((l,i)=>Object.values(rol[i]).includes("B")))txt+="<b>No hay ningún puerto bloqueado</b>: sin bucle, no hace falta.";
  $("#eTxt").innerHTML=txt;
}
function drawCtl(){
  const pris=Array.from({length:16},(_,i)=>i*4096);
  $("#eCtl").innerHTML=Object.entries(E.sw).map(([n,v])=>`<div style="display:grid;gap:4px"><b>${n}</b><div class="campo"><label>Prioridad<select data-n="${n}" data-k="pri">${pris.map(p=>`<option ${p===v.pri?"selected":""}>${p}</option>`).join("")}</select></label><label>MAC<input data-n="${n}" data-k="mac" value="${v.mac}" style="width:100%;min-width:15ch"></label></div></div>`).join("")+
   `<b>Enlaces</b>`+E.links.map((l,i)=>`<div class="campo"><span style="min-width:80px">${l.a}–${l.b}</span><select data-l="${i}">${["10","100","1000"].map(x=>`<option value="${x}" ${x===l.vel?"selected":""}>${x} Mbps</option>`).join("")}</select><label style="flex-direction:row;display:flex;gap:4px;align-items:center"><input type="checkbox" data-up="${i}" ${l.up?"checked":""}> activo</label></div>`).join("");
  $("#eCtl").querySelectorAll("[data-k]").forEach(x=>x.oninput=()=>{E.sw[x.dataset.n][x.dataset.k]=x.dataset.k==="pri"?+x.value:x.value;drawE()});
  $("#eCtl").querySelectorAll("[data-l]").forEach(x=>x.onchange=()=>{E.links[+x.dataset.l].vel=x.value;drawE()});
  $("#eCtl").querySelectorAll("[data-up]").forEach(x=>x.onchange=()=>{E.links[+x.dataset.up].up=x.checked;drawE()});
}
$("#eAtajos").querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const a=+b.dataset.a;
  if(a===0)E=def();if(a===1)E.sw.SW3.pri=24576;if(a===2)E.sw.SW1.pri=28672;if(a===3)E.sw.SW2.pri=4096;drawCtl();drawE()});
drawCtl();drawE();

/* ---------- estados ---------- */
const ESC={nuevo:[["Escucha",15,"--warn"],["Aprendizaje",15,"--warn"],["Reenvío",10,"--ok"]],fallo:[["Bloqueo (max age, sin BPDU)",20,"--bad"],["Escucha",15,"--warn"],["Aprendizaje",15,"--warn"],["Reenvío",10,"--ok"]]};
const TXT={"Escucha":"Procesa BPDU, pero no aprende MAC ni reenvía datos.","Aprendizaje":"Ya aprende direcciones MAC, pero todavía no reenvía datos.","Reenvío":"¡Reenvía datos! El LED pasa a verde.","Bloqueo (max age, sin BPDU)":"El camino principal ha caído. El puerto bloqueado espera 20 s sin recibir BPDU antes de reaccionar."};
let esc="nuevo",stT=0,stRun=false;
function drawSt(t){const f=ESC[esc],tot=f.reduce((a,x)=>a+x[1],0);let acc=0,act=f[0];
  $("#stTL").innerHTML=f.map(([n,d,c])=>{const ini=acc;acc+=d;if(t>=ini)act=[n,d,c];const w=Math.max(0,Math.min(d,t-ini))/d;
    return `<div class="fila"><span>${n}</span><div class="barra"><i style="--c:var(${c});width:${w*100}%"></i><small>${n==="Reenvío"?"estable":d+" s"}</small></div></div>`}).join("");
  $("#stReloj").textContent=Math.floor(Math.min(t,tot-10))+" s";$("#stEstado").textContent=act[0];
  const led=$("#stLed");led.className="led"+(act[0]==="Reenvío"?" on":"");led.style.background=act[0]==="Reenvío"?"":"var(--warn)";
  $("#stTxt").innerHTML=TXT[act[0]]+(act[0]==="Reenvío"?` Total: <b>${esc==="nuevo"?"30":"50"} s</b>.`:"");}
$("#stPlay").onclick=()=>{if(stRun)return;stRun=true;const tot=ESC[esc].reduce((a,x)=>a+x[1],0),t0=performance.now(),k=matchMedia("(prefers-reduced-motion: reduce)").matches?1000:6;
  (function p(n){const t=(n-t0)/1000*k;drawSt(Math.min(t,tot));if(t<tot)requestAnimationFrame(p);else stRun=false})(t0)};
document.querySelectorAll("[data-esc]").forEach(b=>b.onclick=()=>{if(stRun)return;esc=b.dataset.esc;document.querySelectorAll("[data-esc]").forEach(x=>x.classList.toggle("on",x===b));drawSt(0)});
drawSt(0);

/* ---------- leer show spanning-tree ---------- */
R.test("sh",[
 {q:"En esa salida, ¿es SW2 el puente raíz?",ok:"No",exp:"No aparece «This bridge is the root» y el Root ID (0060.4752.0003, prioridad 24577) no coincide con su Bridge ID."},
 {q:"¿Qué prioridad se configuró en el puente raíz?",ok:"24576",exp:"Muestra 24577 = 24576 + 1 (la VLAN). 24576 es la que pone root primary."},
 {q:"¿Qué puerto de SW2 lleva hacia la raíz?",ok:"Fa0/2",exp:"Es el Root (puerto raíz), en FWD, con coste 19."},
 {q:"¿Qué hace ahora mismo el puerto Fa0/1 de SW2?",ok:"Está bloqueado",exp:"Altn BLK: alternativo bloqueado. No reenvía datos pero sigue recibiendo BPDU."},
 {q:"¿Qué prioridad tiene SW2?",ok:"32768",exp:"La de por defecto: 32769 = 32768 + 1."}
],["Sí","No","24576","32768","Fa0/2","Está bloqueado"]);

/* ---------- preguntas ---------- */
R.preguntas("stp",[
 ["¿Por qué un bucle en capa 2 es tan grave y en capa 3 no?","Las tramas Ethernet no tienen TTL, así que un broadcast puede circular para siempre. Los paquetes IP sí tienen TTL y mueren al llegar a 0."],
 ["Cita los tres problemas que provoca un bucle de capa 2.","Tormenta de broadcast, inestabilidad de la tabla MAC (el mismo equipo cambia de puerto) y tramas duplicadas."],
 ["¿Qué es el BID y quién gana la elección del puente raíz?","Prioridad + MAC del switch. Gana el BID más bajo: primero la prioridad más baja y, si empatan, la MAC más baja."],
 ["Tres switches con prioridad por defecto. ¿Quién es raíz?","El de <b>MAC más baja</b>, porque todos tienen 32768."],
 ["¿Cómo se elige el puerto raíz y el designado?","Raíz: en cada switch no raíz, el puerto con menor coste hasta la raíz. Designado: en cada segmento, el del switch con menor coste a la raíz; si empatan, el de menor BID. El resto se bloquea."],
 ["En el triángulo, ¿en qué enlace queda el puerto bloqueado y en qué switch?","En el enlace entre los dos switches no raíz, en el puerto del switch con <b>mayor BID</b> (los dos tienen el mismo coste)."],
 ["¿Qué costes tienen los enlaces de 10 Mbps, 100 Mbps, 1 Gbps y 10 Gbps en 802.1D?","100, 19, 4 y 2."],
 ["¿Qué hace un puerto en estado de bloqueo? ¿Y en aprendizaje?","Bloqueo: solo recibe BPDU; ni aprende MAC ni reenvía datos. Aprendizaje: aprende MAC pero aún no reenvía datos."],
 ["¿Cuánto tarda en reenviar un puerto recién conectado y por qué el LED está ámbar?","30 s: 15 de escucha + 15 de aprendizaje. Mientras tanto no reenvía, y el LED queda ámbar."],
 ["Cae el camino principal. ¿Cuánto tarda el puerto bloqueado en reenviar?","50 s: 20 sin recibir BPDU (max age) + 15 de escucha + 15 de aprendizaje."],
 ["¿Qué prioridad ponen root primary y root secondary?","Primary: 24576 (o 4096 menos que la raíz actual si es menor). Secondary: 28672."],
 ["Configuras priority 4096 en un switch. ¿Qué pasa?","Si es la más baja de la red, pasa a ser el puente raíz y STP recalcula los roles de los puertos."],
 ["show spanning-tree muestra «Priority 24577». ¿Qué prioridad se configuró?","24576: Cisco suma el número de VLAN (1) a la prioridad."],
 ["¿Por qué conviene elegir a mano el puente raíz?","Por defecto gana la MAC más baja, que suele ser el switch más antiguo, quizá de acceso. Interesa que sea el de distribución o núcleo, mejor situado y con más capacidad."],
 ["¿Qué diferencias hay entre STP, RSTP, PVST+ y MSTP?","STP (802.1D): lento, 30–50 s. RSTP (802.1w): pocos segundos. PVST+ (Cisco): un árbol por VLAN, por defecto en Cisco. MSTP (802.1s): agrupa VLAN en pocas instancias."],
 ["¿Qué ventaja tiene un switch de nivel 3 frente a un router para enrutar entre redes internas?","Enruta a velocidad de conmutación por hardware (ASIC). Por eso se usa en distribución y núcleo; el router se queda para la salida a Internet y la WAN."]
]);
})();
