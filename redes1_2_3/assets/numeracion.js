/* Tema: Sistemas de numeración · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);
const SUB=b=>`<sub>${b}</sub>`;
const DIG="0123456789ABCDEF";
const pad=(s,n)=>s.padStart(n,"0");

/* ---------- tabla 0-15 ---------- */
$("#tabla16 tbody").innerHTML=Array.from({length:16},(_,i)=>
  `<tr><td class="n">${i}</td><td class="n">${pad(i.toString(2),4)}</td><td class="n">${i.toString(8)}</td><td class="n">${i.toString(16).toUpperCase()}</td></tr>`).join("");

/* ---------- bits ---------- */
let bits=[0,0,0,1,1,0,0,1]; // 25
function drawBits(){
  const v=parseInt(bits.join(""),2);
  $("#bitrow").innerHTML=bits.map((b,i)=>{const w=2**(7-i);
    return `<button class="bit${b?" on":""}" data-i="${i}" aria-pressed="${!!b}" aria-label="Bit de peso ${w}"><b>${b}</b><small>${w}</small></button>`}).join("");
  $("#bitrow").querySelectorAll(".bit").forEach(x=>x.onclick=()=>{bits[+x.dataset.i]^=1;drawBits()});
  const on=bits.map((b,i)=>b?2**(7-i):0).filter(Boolean);
  $("#bitSuma").textContent=on.length?`${bits.slice(0,4).join("")} ${bits.slice(4).join("")}₂ = ${on.join(" + ")} = ${v}`:"Todos los bits apagados = 0";
  $("#bDec").textContent=v;
  $("#bHex").textContent=v.toString(16).toUpperCase();
  $("#bOct").textContent=v.toString(8);
}
$("#bitTodos").onclick=()=>{bits=bits.map(()=>1);drawBits()};
$("#bitNinguno").onclick=()=>{bits=bits.map(()=>0);drawBits()};
$("#bitMas").onclick=()=>{const v=(parseInt(bits.join(""),2)+1)%256;bits=pad(v.toString(2),8).split("").map(Number);drawBits()};
drawBits();

/* ---------- TFN: a decimal ---------- */
function drawTfn(){
  const base=+$("#tfnBase").value, txt=$("#tfnNum").value.trim().toUpperCase();
  const tabla=$("#tfnTabla"), res=$("#tfnRes");
  if(!txt){tabla.innerHTML="";res.textContent="Escribe un número.";return}
  const mal=[...txt].find(c=>{const d=DIG.indexOf(c);return d<0||d>=base});
  if(mal!==undefined){tabla.innerHTML="";
    res.innerHTML=`<span class="fb mal">«${mal}» no existe en base ${base}.</span> En base ${base} solo valen las cifras ${DIG.slice(0,base).split("").join(", ")}.`;return}
  const ds=[...txt];let total=0;
  const filas=ds.map((c,i)=>{const p=ds.length-1-i,d=DIG.indexOf(c),val=d*base**p;total+=val;
    return `<tr><td>${c}${c!==String(d)?` (=${d})`:""}</td><td>${base}<sup>${p}</sup> = ${base**p}</td><td class="r">${val}</td></tr>`});
  tabla.innerHTML=`<thead><tr><th>Cifra</th><th>Peso</th><th>Cifra × peso</th></tr></thead><tbody>${filas.join("")}</tbody>`;
  res.innerHTML=`(${txt})${SUB(base)} = ${ds.map((c,i)=>`${DIG.indexOf(c)}×${base}<sup>${ds.length-1-i}</sup>`).join(" + ")} = <b>${total}</b>${SUB(10)}`;
}
$("#tfnNum").oninput=drawTfn;$("#tfnBase").onchange=drawTfn;drawTfn();

/* ---------- divisiones sucesivas ---------- */
let pasos=[],hechos=0;
function prepDiv(){
  const n=parseInt($("#divNum").value,10),b=+$("#divBase").value;pasos=[];hechos=0;
  if(!(n>=0)||n>1e9){$("#divTabla").innerHTML="";$("#divRes").textContent="Escribe un número decimal entero (hasta 1 000 000 000).";$("#divNext").disabled=$("#divTodo").disabled=true;return}
  let q=n;do{pasos.push({div:q,q:Math.floor(q/b),r:q%b});q=Math.floor(q/b)}while(q>0);
  $("#divNext").disabled=$("#divTodo").disabled=false;drawDiv();
}
function drawDiv(){
  const b=+$("#divBase").value,n=parseInt($("#divNum").value,10);
  const filas=pasos.slice(0,hechos).map((p,i)=>`<tr class="${i===hechos-1?"nuevo":""}"><td>${p.div} : ${b}</td><td>${p.q}</td><td class="r">${p.r}${p.r>9?` (${DIG[p.r]})`:""}</td></tr>`);
  $("#divTabla").innerHTML=`<thead><tr><th>División</th><th>Cociente</th><th>Resto</th></tr></thead><tbody>${filas.join("")}</tbody>`;
  const fin=hechos===pasos.length;
  $("#divNext").disabled=$("#divTodo").disabled=fin;
  if(!hechos)$("#divRes").textContent="Pulsa «Siguiente división».";
  else if(!fin)$("#divRes").textContent=`El cociente aún no es 0: sigue dividiendo ${pasos[hechos-1].q} entre ${b}.`;
  else{const r=pasos.map(p=>DIG[p.r]).reverse().join("");
    $("#divRes").innerHTML=`Cociente 0, se acabó. Restos de abajo arriba: <b class="mono">${r}</b> → ${n}${SUB(10)} = <b>${r}</b>${SUB(b)}`}
}
$("#divNext").onclick=()=>{if(hechos<pasos.length){hechos++;drawDiv()}};
$("#divTodo").onclick=()=>{hechos=pasos.length;drawDiv()};
$("#divNum").oninput=prepDiv;$("#divBase").onchange=prepDiv;prepDiv();

/* ---------- grupos ---------- */
let g=4;
const colores=["--l2","--l4","--l7","--l3","--l6","--l1","--l5"];
function drawGrp(){
  const t=$("#grpNum").value.replace(/\s/g,"");
  if(!/^[01]+$/.test(t)){$("#grupos").innerHTML="";$("#grpRes").innerHTML=t?`<span class="fb mal">Un número binario solo tiene 0 y 1.</span>`:"Escribe un número binario.";return}
  const falta=(g-t.length%g)%g,full="0".repeat(falta)+t,gs=[];
  for(let i=0;i<full.length;i+=g)gs.push(full.slice(i,i+g));
  $("#grupos").innerHTML=gs.map((x,i)=>{const pd=i===0?falta:0;
    return `<div class="grupo" style="--c:var(${colores[(gs.length-1-i)%colores.length]})"><span class="mono"><span class="pad">${x.slice(0,pd)}</span>${x.slice(pd)}</span><b>${DIG[parseInt(x,2)]}</b></div>`}).join("");
  const r=gs.map(x=>DIG[parseInt(x,2)]).join("");
  $("#grpRes").innerHTML=`${falta?`Se añaden ${falta} cero${falta>1?"s":""} a la izquierda (en gris) para completar el grupo. `:""}Resultado: (${t})${SUB(2)} = <b class="mono">${r}</b>${SUB(g===4?16:8)}`;
}
$("#grpNum").oninput=drawGrp;
document.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{g=+b.dataset.g;document.querySelectorAll("[data-g]").forEach(x=>x.classList.toggle("on",x===b));drawGrp()});
drawGrp();

/* ---------- ASCII ---------- */
function drawAscii(){
  const t=[...$("#asciiTxt").value].filter(c=>c.charCodeAt(0)<128);
  $("#asciiTabla").innerHTML=t.length?`<thead><tr><th>Carácter</th><th>Decimal</th><th>Binario</th><th>Hex</th><th>Octal</th></tr></thead><tbody>${
    t.map(c=>{const n=c.charCodeAt(0),b=pad(n.toString(2),8);return `<tr><td class="n">${c===" "?"(espacio)":c}</td><td class="n">${n}</td><td class="n">${b.slice(0,4)} ${b.slice(4)}</td><td class="n">${n.toString(16).toUpperCase()}</td><td class="n">${n.toString(8)}</td></tr>`}).join("")}</tbody>`
    :`<tbody><tr><td>Escribe letras sin tildes ni ñ: no están en el ASCII básico de 7 bits.</td></tr></tbody>`;
}
$("#asciiTxt").oninput=drawAscii;drawAscii();

/* ---------- práctica ---------- */
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const norm=s=>{s=String(s).toUpperCase().replace(/[\s_.]/g,"").replace(/^0+(?=.)/,"");return s};
let tipo="todo",reto=null;
function nuevoReto(){
  const t=tipo==="todo"?pick(["adec","desdec","corto"]):tipo;let r;
  if(t==="adec"){const b=pick([2,8,16]),v=b===2?rnd(9,255):rnd(20,4095),s=v.toString(b).toUpperCase();
    const ds=[...s];
    r={q:`(${s})${SUB(b)} → decimal`,sol:String(v),exp:`${ds.map((c,i)=>`${DIG.indexOf(c)}×${b}<sup>${ds.length-1-i}</sup>`).join(" + ")} = ${v}`};}
  else if(t==="desdec"){const b=pick([2,8,16]),v=b===2?rnd(9,255):rnd(20,2000),s=v.toString(b).toUpperCase();
    let q=v,ps=[];do{ps.push(`${q}:${b} = ${Math.floor(q/b)} resto ${DIG[q%b]}`);q=Math.floor(q/b)}while(q>0);
    r={q:`(${v})${SUB(10)} → base ${b}`,sol:s,exp:`${ps.join(" · ")}. Restos de abajo arriba: ${s}`};}
  else{const k=pick(["b16","b8","16b","8b"]),v=rnd(40,4095),bin=v.toString(2);
    const gr=(n)=>{const f="0".repeat((n-bin.length%n)%n)+bin;return f.match(new RegExp(`.{${n}}`,"g"))};
    if(k==="b16")r={q:`(${bin})${SUB(2)} → hexadecimal`,sol:v.toString(16).toUpperCase(),exp:`Grupos de 4 desde la derecha: ${gr(4).map(x=>`${x}=${DIG[parseInt(x,2)]}`).join(" · ")}`};
    else if(k==="b8")r={q:`(${bin})${SUB(2)} → octal`,sol:v.toString(8),exp:`Grupos de 3 desde la derecha: ${gr(3).map(x=>`${x}=${parseInt(x,2)}`).join(" · ")}`};
    else if(k==="16b"){const h=v.toString(16).toUpperCase();r={q:`(${h})${SUB(16)} → binario`,sol:bin,exp:`Cada cifra hex son 4 bits: ${[...h].map(c=>`${c}=${pad(parseInt(c,16).toString(2),4)}`).join(" · ")} (los ceros de la izquierda del todo se pueden quitar)`}}
    else{const o=v.toString(8);r={q:`(${o})${SUB(8)} → binario`,sol:bin,exp:`Cada cifra octal son 3 bits: ${[...o].map(c=>`${c}=${pad((+c).toString(2),3)}`).join(" · ")} (los ceros de la izquierda del todo se pueden quitar)`}}}
  reto=r;$("#retoQ").innerHTML=r.q;$("#retoR").value="";$("#retoFb").innerHTML="";$("#retoOk").disabled=false;
}
function comprobar(){
  if(!reto)return;const v=$("#retoR").value;if(!v.trim()){$("#retoFb").textContent="Escribe primero tu resultado.";return}
  if(norm(v)===norm(reto.sol))$("#retoFb").innerHTML=`<span class="fb ok">¡Bien!</span> ${reto.exp}`;
  else $("#retoFb").innerHTML=`<span class="fb mal">No. Era ${reto.sol}.</span> ${reto.exp}`;
  $("#retoOk").disabled=true;
}
$("#retoOk").onclick=comprobar;
$("#retoR").addEventListener("keydown",e=>{if(e.key==="Enter")comprobar()});
$("#retoOtro").onclick=nuevoReto;
document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{tipo=b.dataset.t;document.querySelectorAll("[data-t]").forEach(x=>x.classList.toggle("on",x===b));nuevoReto()});
nuevoReto();

/* ---------- preguntas ---------- */
Repaso.preguntas("numeracion",[
 ["Convierte 2E<sub>(16</sub> a decimal y explica el procedimiento.","E vale 14. Aplicando el TFN: 2×16¹ + 14×16⁰ = 32 + 14 = <b>46</b>."],
 ["Convierte 77<sub>(8</sub> a decimal.","7×8¹ + 7×8⁰ = 56 + 7 = <b>63</b>. Truco: 77<sub>8</sub> es el número más alto de 2 cifras en octal, igual que 99 en decimal es 10² − 1; aquí es 8² − 1 = 63."],
 ["Pasa 1319<sub>(10</sub> a binario.","Por divisiones sucesivas entre 2 (o restando potencias de 2: 1024 + 256 + 32 + 4 + 2 + 1) = <b>10100100111</b><sub>2</sub>."],
 ["Pasa D24B<sub>(16</sub> a binario usando el método corto.","Cada cifra hex son 4 bits: D = 1101, 2 = 0010, 4 = 0100, B = 1011 → <b>1101 0010 0100 1011</b><sub>2</sub>."],
 ["Pasa 1207<sub>(8</sub> a binario usando el método corto.","Cada cifra octal son 3 bits: 1 = 001, 2 = 010, 0 = 000, 7 = 111 → 001 010 000 111 = <b>1010000111</b><sub>2</sub> (los ceros de la izquierda se pueden quitar)."],
 ["Pasa 110111000<sub>(2</sub> a hexadecimal y a octal directamente.","Hex, grupos de 4 desde la derecha: 0001 1011 1000 = <b>1B8</b><sub>16</sub>. Octal, grupos de 3: 110 111 000 = <b>670</b><sub>8</sub>. Los dos valen 440 en decimal."],
 ["Expresa 176<sub>(10</sub> en octal y después pásalo a hexadecimal.","176 : 8 = 22 resto 0; 22 : 8 = 2 resto 6; 2 : 8 = 0 resto 2 → <b>260</b><sub>8</sub>. A hex por binario: 010 110 000 → 1011 0000 = <b>B0</b><sub>16</sub>."],
 ["¿Cuántos números distintos se pueden representar con 16 bits? ¿Cuál es el mayor?","2¹⁶ = <b>65 536</b> números distintos, del 0 al <b>65 535</b> (2¹⁶ − 1). Es justo el rango de los puertos TCP/UDP."],
 ["¿Cuál es mayor, 01001000 o 01000100? Razónalo sin pasarlos a decimal.","<b>01001000</b>. Los dos tienen 8 bits; leyendo de izquierda a derecha, el primer bit distinto es el 5.º (peso 8): el primero tiene un 1 y el segundo un 0. Ese bit pesa más que todos los de su derecha juntos (4+2+1 = 7), así que gana el primero (72 frente a 68)."],
 ["Un compañero escribe 1092<sub>(8</sub>. ¿Qué le dirías?","Que no es un número octal válido: en base 8 solo existen las cifras del 0 al 7, y el 9 no está. En base N los símbolos van del 0 al N−1."],
 ["Verdadero o falso, y explica: «Añadir un 0 a la derecha de un número binario lo multiplica por 2».","Verdadero. Cada cifra se desplaza una posición a la izquierda y su peso se duplica, igual que en decimal añadir un 0 multiplica por 10. Ejemplo: 101 (5) → 1010 (10)."],
 ["¿Por qué las direcciones MAC se escriben en hexadecimal y no en binario o decimal?","Una MAC tiene 48 bits. En binario serían 48 cifras imposibles de leer. Como una cifra hex son exactamente 4 bits, cada byte se escribe con 2 cifras hex y la MAC queda en 12 (00:1A:2B:3C:4D:5E). Además se puede volver a binario de cabeza, cosa que con el decimal no pasa."]
]);
})();
