/* Tema: Cables y categorías · simuladores y preguntas */
(function(){
const $=s=>document.querySelector(s);

/* ---------- tramos (ejercicio 4) ---------- */
const ESTS=["10BASE-T","100BASE-TX","1000BASE-T","2.5GBASE-T","10GBASE-T","25GBASE-T"];
const CATS=["Cat 3","Cat 5","Cat 5e","Cat 6","Cat 6A","Cat 8"];
const tramos=[
 {n:"Despacho",v:"1 Gbps",c:"Cat 5e",d:70,e:"1000BASE-T",m:"Cat 5e",ok:"Sí",exp:"Cat 5e basta para 1 Gbps y 70 m está por debajo de 90 m."},
 {n:"Servidores",v:"10 Gbps",c:"Cat 6",d:70,e:"10GBASE-T",m:"Cat 6A",ok:"No",exp:"Cat 6 solo da 10 Gbps hasta unos 55 m. Corrección: Cat 6A en todo el canal."},
 {n:"Aula",v:"100 Mbps",c:"Cat 5",d:40,e:"100BASE-TX",m:"Cat 5",ok:"Sí",exp:"Cumple, aunque Cat 5 está obsoleta: en una reforma se pondría como mínimo Cat 5e."},
 {n:"Planta alta",v:"1 Gbps",c:"Cat 6",d:95,e:"1000BASE-T",m:"Cat 5e",ok:"No",exp:"La categoría sobra, pero 95 m supera los 90 m del cableado permanente. Corrección: acercar el armario o poner un switch intermedio para que ningún tramo pase de 90 m."},
 {n:"Rack de datos",v:"25 Gbps",c:"Cat 6A",d:20,e:"25GBASE-T",m:"Cat 8",ok:"No",exp:"25GBASE-T exige Cat 8 (hasta 30 m). Los 20 m valen; lo que falla es la categoría."},
 {n:"Biblioteca",v:"2,5 Gbps",c:"Cat 5e",d:85,e:"2.5GBASE-T",m:"Cat 5e",ok:"Sí",exp:"2.5GBASE-T funciona sobre Cat 5e a 100 m y 85 m está por debajo de 90 m."}
];
const sel=(id,ops)=>`<select id="${id}"><option value="">—</option>${ops.map(o=>`<option>${o}</option>`).join("")}</select>`;
$("#tramTabla").innerHTML=`<thead><tr><th>Tramo</th><th>Pide</th><th>Instalado</th><th>Estándar</th><th>Cat. mínima</th><th>¿Cumple?</th></tr></thead><tbody>${
 tramos.map((t,i)=>`<tr><th>${t.n}</th><td>${t.v}</td><td>${t.c} · ${t.d} m</td><td>${sel("te"+i,ESTS)}</td><td>${sel("tm"+i,CATS)}</td><td>${sel("tk"+i,["Sí","No"])}</td></tr>`).join("")}</tbody>`;
document.querySelectorAll("#tramTabla select").forEach(s=>{s.style.cssText="font:inherit;font-family:var(--f-mono);font-size:.82rem;padding:5px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg)"});
function corrige(mostrar){
  let bien=0,out=[];
  tramos.forEach((t,i)=>{
    const pares=[["te"+i,t.e],["tm"+i,t.m],["tk"+i,t.ok]];let fila=true;
    pares.forEach(([id,v])=>{const s=$("#"+id);if(mostrar)s.value=v;const ok=s.value===v;if(ok)bien++;else fila=false;
      s.style.borderColor=s.value?(ok?"var(--ok)":"var(--bad)"):"var(--line)"});
    out.push(`<p><b>${t.n}</b> ${fila?'<span class="fb ok">✓</span>':'<span class="fb mal">✗</span>'} ${t.exp}</p>`);
  });
  $("#tramFb").innerHTML=(mostrar?"":`<p class="fb ${bien===18?"ok":"mal"}">${bien} de 18 casillas bien.</p>`)+out.join("");
}
$("#tramOk").onclick=()=>corrige(false);$("#tramSol").onclick=()=>corrige(true);

/* ---------- preguntas ---------- */
Repaso.preguntas("cables",[
 ["¿Por qué se trenzan los hilos de un par y por qué cada par tiene un paso de trenzado distinto?","Cada par transmite de forma diferencial (señal y su inversa). El trenzado hace que una interferencia afecte casi igual a los dos hilos, y al restarlos en el receptor se anula. El paso distinto en cada par reduce la diafonía entre pares vecinos."],
 ["¿Qué significa la notación S/FTP?","La letra antes de la barra es el apantallado global y la de después, el de cada par. S/FTP: <b>malla</b> global (S) y <b>lámina</b> en cada par (F)."],
 ["Un enlace tiene cable Cat 6A, panel Cat 6A y un latiguillo Cat 5e. ¿Qué categoría tiene el canal?","<b>Cat 5e</b>. La categoría la determina el componente más bajo de todo el canal."],
 ["Necesitas 10 Gbps a 80 m sobre cobre. ¿Qué estándar y qué categoría mínima?","<b>10GBASE-T</b> sobre <b>Cat 6A</b>. Cat 6 solo llega a 10 Gbps hasta unos 37–55 m."],
 ["Explica la regla de los 90 + 10 metros.","El canal completo de par trenzado es de 100 m: hasta <b>90 m de cable horizontal fijo</b> (roseta ↔ panel) y hasta <b>10 m de latiguillos</b> entre los dos extremos."],
 ["¿Cuántos pares usan 100BASE-TX y 1000BASE-T?","100BASE-TX usa <b>2 pares</b> (pines 1-2 y 3-6). 1000BASE-T usa los <b>4 pares</b>."],
 ["¿Qué es PoE y qué ventaja tiene? ¿Puede usarse con fibra?","Alimentación eléctrica por el mismo cable de red (802.3af/at/bt): permite poner AP, cámaras IP o teléfonos sin enchufe cerca. Con fibra no, porque la fibra no conduce electricidad."],
 ["Compara multimodo y monomodo: núcleo, fuente de luz, distancia y color de cubierta.","Multimodo: 50 o 62,5 µm, LED o VCSEL, 300–550 m, naranja/aguamarina/verde lima. Monomodo: 9 µm, láser, de 10 km a más de 100 km, amarilla."],
 ["¿Por qué la fibra llega más lejos que el cobre y es inmune a interferencias?","Transmite luz, no electricidad: su atenuación es muy baja y las interferencias electromagnéticas no le afectan porque no hay conductor metálico que las capte."],
 ["Cita dos inconvenientes de la fibra frente al cobre.","Equipos más caros e instalación delicada (curvas, limpieza, fusionadora). Además no transporta energía, así que no hay PoE."],
 ["¿Qué conector de fibra pondrías en un switch moderno y cuál verías en la fibra de casa?","<b>LC</b> en el switch o el módulo SFP. <b>SC</b> en la instalación de casa (FTTH)."],
 ["¿Por qué dejó de usarse Ethernet sobre coaxial y dónde sigue el coaxial hoy?","Iba en bus y un solo corte tiraba toda la red; lo sustituyó el par trenzado en estrella. Hoy el coaxial se usa en el cablemódem (HFC), la TV, el CCTV y las antenas."]
]);
})();
