/* Tema: Ethernet, dominios y EtherChannel · animaciones y preguntas */
(function(){
const $=s=>document.querySelector(s);
const R=Repaso;
const PAL=["#d9485f","#2f5bd3","#23854a","#b5770d","#8a56c9","#2b8a9e","#e07a2e","#c23b8a","#5b6b1f","#3f6e9e","#a0522d","#008080","#6a5acd"];

/* ---------- red del ejercicio 5 ---------- */
const N={PC1:[40,60,"pc"],PC2:[40,135,"pc"],PC3:[40,210,"pc"],HUB1:[160,135,"hub"],SW1:[300,135,"sw"],PC4:[300,35,"pc"],
 SW2:[450,80,"sw"],PC5:[610,40,"pc"],PC6:[610,120,"pc"],R1:[300,250,"rt"],SW3:[450,250,"sw"],PC7:[610,190,"pc"],PC8:[610,250,"pc"],PC9:[610,310,"pc"]};
const L=[["PC1","HUB1"],["PC2","HUB1"],["PC3","HUB1"],["HUB1","SW1"],["SW1","PC4"],["SW1","SW2"],["SW2","PC5"],["SW2","PC6"],["SW1","R1"],["R1","SW3"],["SW3","PC7"],["SW3","PC8"],["SW3","PC9"]];
let hub=true,vista="nada",ocupado=false;
const tipo=n=>n==="HUB1"?(hub?"hub":"sw"):N[n][2];
const vec=n=>L.filter(l=>l.includes(n)).map(l=>l[0]===n?l[1]:l[0]);
function domColision(){ // índice de dominio para cada enlace
  const d=L.map((_,i)=>i);
  const raiz=i=>d[i]===i?i:(d[i]=raiz(d[i]));
  if(hub){const hl=L.map((l,i)=>l.includes("HUB1")?i:-1).filter(i=>i>=0);hl.forEach(i=>{d[raiz(i)]=raiz(hl[0])})}
  const ids=[...new Set(L.map((_,i)=>raiz(i)))];return L.map((_,i)=>ids.indexOf(raiz(i)));
}
function domBroadcast(){ // por nodo
  const dom={};let k=0;
  Object.keys(N).forEach(n=>{if(dom[n]!==undefined||tipo(n)==="rt")return;const pila=[n];
    while(pila.length){const v=pila.pop();if(dom[v]!==undefined)continue;dom[v]=k;vec(v).forEach(w=>{if(tipo(w)!=="rt")pila.push(w)})}k++});
  return {dom,total:k};
}
function dibuja(){
  const svg=$("#domSvg");svg.innerHTML="";
  const dc=domColision(),{dom:db,total:nb}=domBroadcast();
  L.forEach((l,i)=>{const[a,b]=l;let col="var(--muted)",cls="lnk";
    if(vista==="col"){col=PAL[dc[i]%PAL.length];cls+=" dom"}
    if(vista==="bro"){const n=tipo(a)==="rt"?b:a;col=PAL[db[n]%PAL.length];cls+=" dom"}
    R.el("line",{x1:N[a][0],y1:N[a][1],x2:N[b][0],y2:N[b][1],class:cls,style:`stroke:${col}`},svg)});
  Object.entries(N).forEach(([n,[x,y]])=>{const t=tipo(n),w=t==="pc"?44:58,h=t==="pc"?24:30;
    const r=R.el("rect",{x:x-w/2,y:y-h/2,width:w,height:h,rx:t==="rt"?14:5,class:`dev ${t}`,id:"n-"+n},svg);
    if(vista==="bro"&&t!=="rt")r.style.stroke=PAL[db[n]%PAL.length];
    const tx=R.el("text",{x,y:y+4,"text-anchor":"middle"},svg);tx.textContent=n==="HUB1"&&!hub?"SW-nuevo":n});
  const nc=new Set(dc).size;
  $("#domTxt").innerHTML=vista==="col"?`<b>${nc} dominios de colisión</b> (cada color es uno). ${hub?"El hub, sus 3 PC y el enlace hasta SW1 comparten <b>uno solo</b>: el hub no separa nada. ":"Al cambiar el hub por un switch, cada PC tiene su propio dominio: <b>de 10 a 13</b>. "}El resto: un dominio por cada enlace de switch o router.`:
    vista==="bro"?`<b>${nb} dominios de broadcast</b>: PC1–PC6 a un lado del router y PC7–PC9 al otro. Los switches${hub?" y el hub":""} no los separan; el router sí.`:
    "Elige una vista o lanza una trama.";
}
const pos=n=>[N[n][0],N[n][1]];
function marca(n,cls,ms=900){const r=$("#n-"+n);if(!r)return;r.classList.add(cls);setTimeout(()=>r.classList.remove(cls),ms)}
async function difunde(origen,{txt="FF:FF",color="#d9485f",unicast=null}={}){
  // recorre por oleadas; los routers no reenvían broadcast
  let frente=[[origen,null]],visto=new Set([origen]),camino=null;
  if(unicast){ // ruta más corta hasta el destino (los switches ya conocen la MAC)
    const prev={};const q=[origen];const v2=new Set([origen]);
    while(q.length){const a=q.shift();vec(a).forEach(b=>{if(!v2.has(b)){v2.add(b);prev[b]=a;q.push(b)}})}
    camino=new Set();let c=unicast;while(c){camino.add(c);c=prev[c]}
  }
  while(frente.length){
    const sig=[],anims=[];
    for(const[a] of frente){
      const t=tipo(a);if(a!==origen&&(t==="pc"))continue;
      if(t==="rt"&&a!==origen){continue}
      vec(a).forEach(b=>{if(visto.has(b))return;
        if(unicast&&t!=="hub"&&!camino.has(b))return; // un switch solo reenvía hacia el destino
        visto.add(b);anims.push(R.trama($("#domSvg"),[pos(a),pos(b)],{txt,color,dur:800}).then(()=>{
          if(tipo(b)==="pc"){marca(b,unicast&&b!==unicast?"no":"on")}
          if(tipo(b)==="rt"&&!unicast){marca(b,"no",1500)}
        }));sig.push([b,a])});
    }
    await Promise.all(anims);frente=sig;
  }
}
async function corre(fn){if(ocupado)return;ocupado=true;document.querySelectorAll("#red .stepper .btn").forEach(b=>b.disabled=true);
  try{await fn()}finally{ocupado=false;document.querySelectorAll("#red .stepper .btn").forEach(b=>b.disabled=false)}}
$("#aBro").onclick=()=>corre(async()=>{$("#domTxt").innerHTML="PC1 manda un <b>broadcast</b> (por ejemplo, una petición ARP)…";
  await difunde("PC1");$("#domTxt").innerHTML="Le llega a <b>PC2 a PC6</b> (en verde): todo su dominio de broadcast. <b>R1 no lo reenvía</b> (en rojo) y PC7–PC9 no se enteran. Así es como un router separa dominios de broadcast."});
$("#aUni").onclick=()=>corre(async()=>{$("#domTxt").innerHTML="PC1 manda una trama unicast a PC5 (los switches ya conocen las MAC)…";
  await difunde("PC1",{txt:"→PC5",color:"#2f5bd3",unicast:"PC5"});
  $("#domTxt").innerHTML=hub?"El <b>hub</b> la repite a PC2 y PC3 (la reciben y la descartan, en rojo): no sabe de direcciones. Los <b>switches</b> la mandan solo hacia PC5.":"Ahora solo viaja por el camino hacia PC5: ningún otro equipo la ve."});
$("#aCol").onclick=()=>corre(async()=>{
  $("#domTxt").innerHTML="PC1 y PC2 transmiten a la vez…";
  await Promise.all([R.trama($("#domSvg"),[pos("PC1"),pos("HUB1")],{txt:"PC1",color:"#2f5bd3"}),R.trama($("#domSvg"),[pos("PC2"),pos("HUB1")],{txt:"PC2",color:"#23854a"})]);
  if(hub){const r=$("#n-HUB1");r.style.fill="var(--bad)";
    await Promise.all(["PC1","PC2","PC3","SW1"].map(n=>R.trama($("#domSvg"),[pos("HUB1"),pos(n)],{txt:"¡choque!",color:"#c23b3b",dur:600}).then(()=>marca(n,"no",1500))));
    r.style.fill="";$("#domTxt").innerHTML="<b>¡Colisión!</b> Afecta a <b>PC1, PC2, PC3</b> y al puerto de SW1 que da al hub: todos comparten ese dominio. Aplican CSMA/CD y reintentan. El resto de la red no se entera, porque SW1 corta el dominio de colisión.";}
  else{$("#domTxt").innerHTML="Con un switch <b>no hay colisión</b>: cada PC tiene su propio enlace full-dúplex y el switch guarda las tramas en memoria y las envía por turno."}
});
$("#vCol").onclick=()=>{vista="col";dibuja()};$("#vBro").onclick=()=>{vista="bro";dibuja()};$("#vNada").onclick=()=>{vista="nada";dibuja()};
$("#vHub").onclick=()=>{hub=!hub;$("#vHub").textContent=hub?"Cambiar HUB1 por un switch":"Volver a poner el hub";if(vista==="nada")vista="col";dibuja()};
dibuja();

/* ---------- normas ---------- */
R.test("nor",[
 {q:"1000BASE-T",ok:"1 Gbps · banda base · par trenzado",exp:"1000 Mbps, BASE = banda base, T = par trenzado (Cat 5e)."},
 {q:"1000BASE-SX",ok:"1 Gbps · banda base · fibra multimodo",exp:"S = short (onda corta): fibra multimodo, hasta 550 m."},
 {q:"1000BASE-LX",ok:"1 Gbps · banda base · fibra monomodo",exp:"L = long (onda larga): fibra monomodo, hasta 5 km."},
 {q:"100BASE-FX",ok:"100 Mbps · banda base · fibra multimodo",exp:"F = fibra; multimodo hasta 2 km en full-dúplex."},
 {q:"100BASE-TX",ok:"100 Mbps · banda base · par trenzado",exp:"Fast Ethernet sobre Cat 5."}
],["1 Gbps · banda base · par trenzado","1 Gbps · banda base · fibra multimodo","1 Gbps · banda base · fibra monomodo","100 Mbps · banda base · fibra multimodo","100 Mbps · banda base · par trenzado"]);

/* ---------- EtherChannel ---------- */
const EY=[70,115,160],XA=120,XB=560;let activos=[true,true,true],ecOcup=false;
function drawEc(){
  const s=$("#ecSvg");s.innerHTML="";
  R.el("rect",{x:XA-110,y:EY[1]-90,width:110,height:180,rx:8,style:"fill:none;stroke:var(--line);stroke-dasharray:4 4"},s);
  EY.forEach((y,i)=>R.el("line",{x1:XA,y1:y,x2:XB,y2:y,class:"lnk",style:activos[i]?"stroke:var(--l4)":"stroke:var(--bad);stroke-dasharray:8 6"},s));
  R.el("rect",{x:XA+40,y:EY[0]-22,width:XB-XA-80,height:EY[2]-EY[0]+44,rx:22,style:"fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:6 4"},s);
  const t=R.el("text",{x:(XA+XB)/2,y:EY[0]-30,"text-anchor":"middle"},s);t.textContent=`Port-channel 1 · ${activos.filter(Boolean).length*100} Mbps`;
  [["SW-DIST1",XA],["SW-DIST2",XB]].forEach(([n,x])=>{R.el("rect",{x:x-40,y:EY[0]-15,width:80,height:EY[2]-EY[0]+30,rx:6,class:"dev sw"},s);const tx=R.el("text",{x,y:EY[1]+4,"text-anchor":"middle"},s);tx.textContent=n});
  [["PC (100 Mbps)",40,EY[0]],["Servidor",640,EY[2]]].forEach(([n,x,y])=>{const tx=R.el("text",{x,y:y+45,"text-anchor":"middle",class:"peq"},s);tx.textContent=n});
}
$("#ecPlay").onclick=async()=>{if(ecOcup)return;ecOcup=true;
  const conv=[["PC1","#d9485f"],["PC2","#2f5bd3"],["PC3","#23854a"],["PC4","#b5770d"],["PC5","#8a56c9"],["PC6","#2b8a9e"]];
  const vivos=EY.map((y,i)=>activos[i]?i:-1).filter(i=>i>=0);
  $("#ecTxt").innerHTML=`Cada conversación se reparte a <b>un</b> enlace (por un cálculo con sus direcciones). Con ${vivos.length} enlaces activos, la capacidad total es ${vivos.length*100} Mbps, pero cada conversación sigue limitada a 100 Mbps.`;
  for(let r=0;r<2;r++)await Promise.all(conv.map(([n,c],k)=>R.espera(k*180).then(()=>{const y=EY[vivos[k%vivos.length]];return R.trama($("#ecSvg"),[[XA+40,y],[XB-40,y]],{txt:n,color:c,dur:1300})})));
  ecOcup=false};
$("#ecCorta").onclick=()=>{const i=activos.indexOf(true);if(activos.filter(Boolean).length<=1){$("#ecTxt").textContent="Deja al menos un enlace vivo.";return}
  activos[activos.lastIndexOf(true)]=false;drawEc();$("#ecTxt").innerHTML="Un enlace ha caído (en rojo). El Port-channel <b>sigue funcionando</b> con los que quedan, con menos capacidad y sin que STP tenga que recalcular nada. Dale a ▶ para verlo.";};
$("#ecArregla").onclick=()=>{activos=[true,true,true];drawEc();$("#ecTxt").textContent="Los tres enlaces activos: 300 Mbps de capacidad total."};
drawEc();$("#ecTxt").textContent="Tres enlaces Fast Ethernet agrupados en un Port-channel. Pulsa ▶.";

/* ---------- preguntas ---------- */
R.preguntas("dominios",[
 ["Diferencia entre dominio de colisión y dominio de broadcast.","Colisión: equipos que comparten un medio y chocan si transmiten a la vez. Broadcast: equipos que reciben una trama de broadcast enviada por cualquiera de ellos."],
 ["¿Qué separa un switch y qué separa un router?","El switch separa dominios de <b>colisión</b> (uno por puerto) pero no de broadcast. El router separa los dos: uno por interfaz."],
 ["En la red del ejercicio 5, ¿cuántos dominios de colisión hay?","<b>10</b>: 1 del hub (PC1-PC3 + enlace a SW1), SW1–PC4, SW1–SW2, SW1–R1, SW2–PC5, SW2–PC6, R1–SW3 y SW3–PC7, PC8, PC9."],
 ["En esa red, ¿cuántos dominios de broadcast hay y qué equipos tiene cada uno?","<b>2</b>: PC1 a PC6 (con HUB1, SW1 y SW2) a un lado de R1, y PC7 a PC9 (con SW3) al otro."],
 ["PC1 envía un broadcast: ¿quién lo recibe? ¿Lo reenvía R1?","Lo reciben PC2 a PC6 (y R1 por su interfaz). <b>R1 no lo reenvía</b>: los routers no propagan broadcast, así que PC7-PC9 no lo reciben."],
 ["PC1 y PC2 transmiten a la vez: ¿a quién afecta la colisión?","A todo el dominio de colisión del hub: PC1, PC2, PC3 y el puerto de SW1 conectado al hub."],
 ["Si se cambia HUB1 por un switch, ¿cuántos dominios hay?","<b>13 de colisión</b> (los 3 PC tienen ya su propio dominio y el enlace con SW1 es otro) y siguen siendo <b>2 de broadcast</b>."],
 ["Descompón 1000BASE-LX.","1000 Mbps, transmisión en banda base, fibra <b>monomodo</b> (L = onda larga, hasta 5 km)."],
 ["Tres enlaces Fast Ethernet en un Port-channel: ¿qué capacidad tiene y qué pasa si falla uno?","300 Mbps. Si falla uno, el tráfico sigue por los otros dos (200 Mbps) sin interrupción."],
 ["Un PC con tarjeta de 100 Mbps copia un archivo al otro lado de un Port-channel de 300 Mbps. ¿A qué velocidad máxima?","A <b>100 Mbps</b>: cada conversación va por un solo enlace físico y además el PC está limitado por su propia tarjeta."],
 ["¿Bloquea STP alguno de los enlaces de un EtherChannel?","No: STP trata el grupo como un único enlace lógico, así que no ve bucle entre ellos."],
 ["¿Se puede añadir un enlace de 1 Gbps a un Port-channel de tres Fast Ethernet?","No: todos los puertos del grupo deben tener la misma velocidad, el mismo dúplex y la misma configuración."]
]);
})();
