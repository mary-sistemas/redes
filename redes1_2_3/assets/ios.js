/* Tema: Cisco IOS · terminal simulado y ejercicios */
(function(){
const $=s=>document.querySelector(s);
const R=Repaso;

/* ---------- terminal ---------- */
const term=$("#term"),inp=$("#tIn");
const esc=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;");
function salida(t,cls){const d=document.createElement("div");if(cls&&cls!=="eco")d.className=cls;d.innerHTML=esc(t);term.appendChild(d);term.scrollTop=term.scrollHeight}
let vioPriv=false;
function actualiza(){
  $("#tPrompt").textContent=CLI.prompt();inp.type=CLI.oculto()?"password":"text";
  const e=CLI.estado(),c=e.cfg;if(e.mode!=="user")vioPriv=true;
  const f1=c.ifs["FastEthernet0/1"];
  const retos=[
   ["Entra en el modo privilegiado",vioPriv],
   ["Llama al switch SW1",c.host==="SW1"],
   ["Pon la descripción PC1-Acceso a Fa0/1",f1.desc==="PC1-Acceso"],
   ["Da la IP 192.168.1.2/24 a la Vlan1 y que esté up",c.vlan1.ip==="192.168.1.2"&&e.vlanUp],
   ["Protege el modo privilegiado con enable secret",!!c.enableSecret],
   ["Contraseña de consola con login",!!(c.con.pw&&c.con.login)],
   ["Telnet en las VTY (password + login)",!!(c.vty.pw&&(c.vty.login||c.vty.local))],
   ["SSH: usuario, dominio, claves RSA, transport input ssh y login local",c.rsa&&Object.keys(c.users).length&&c.vty.local&&c.vty.transport==="ssh"],
   ["Cifra las contraseñas y pon un banner",c.pwEnc&&!!c.banner],
   ["Guarda la configuración",!!e.startup&&JSON.stringify(e.startup)===JSON.stringify(c)],
   ["Port security en Fa0/1: máx. 1, sticky, restrict",f1.ps.on&&f1.ps.sticky&&f1.ps.viol==="restrict"]];
  $("#retos").innerHTML=retos.map(([t,ok])=>`<div class="${ok?"hecho":""}">${ok?"✔":"○"} ${t}</div>`).join("");
}
const hist=[];let hi=0;
inp.addEventListener("keydown",e=>{
  if(e.key==="Enter"){const v=inp.value;inp.value="";if(v.trim()&&!CLI.oculto()){hist.push(v);hi=hist.length}CLI.linea(v);actualiza()}
  else if(e.key==="Tab"){e.preventDefault();inp.value=CLI.completa(inp.value)}
  else if(e.key==="ArrowUp"){if(hi>0){hi--;inp.value=hist[hi];e.preventDefault()}}
  else if(e.key==="ArrowDown"){if(hi<hist.length-1){hi++;inp.value=hist[hi]}else{hi=hist.length;inp.value=""}e.preventDefault()}
  else if(e.key==="z"&&e.ctrlKey){e.preventDefault();CLI.linea("end");actualiza()}
});
term.addEventListener("click",()=>inp.focus());
CLI.init(salida,()=>actualiza());actualiza();
$("#tReset").onclick=()=>location.reload();

/* tráfico */
document.querySelectorAll("#trafico [data-t]").forEach(b=>b.onclick=()=>{const[o,d]=b.dataset.t.split(",");$("#trafTxt").innerHTML=CLI.trafico(o,d);actualiza()});
document.querySelectorAll("#trafico [data-c]").forEach(b=>b.onclick=()=>{CLI.conecta(b.dataset.c);$("#trafTxt").innerHTML=b.dataset.c==="PC5"?"PC1 desconectado. PC5 (MAC 00e0.f766.6605) está ahora en Fa0/1. Haz que PC5 haga ping.":"PC1 vuelve a estar en Fa0/1. Si el puerto está err-disabled, recupéralo con shutdown y no shutdown."});

/* remoto */
$("#rTel").onclick=()=>{$("#rOut").textContent="C:\\> telnet 192.168.1.2\n"+CLI.remoto("telnet")};
$("#rSsh").onclick=()=>{$("#rOut").textContent="C:\\> ssh -l admin 192.168.1.2\n"+CLI.remoto("ssh")};

/* ---------- archivos ---------- */
const BX={RAM:[90,60,"running-config","--l7"],NVRAM:[300,60,"startup-config","--l2"],FLASH:[300,170,"IOS .bin · vlan.dat","--l4"],TFTP:[560,115,"Servidor TFTP 192.168.1.50","--l3"]};
function drawAr(){const s=$("#arSvg");s.innerHTML="";
  Object.entries(BX).forEach(([n,[x,y,t,c]])=>{R.el("rect",{x:x-80,y:y-30,width:160,height:60,rx:8,class:"dev",style:`fill:color-mix(in srgb,var(${c}) 18%,var(--surface));stroke:var(${c})`,id:"ar-"+n},s);
    let tx=R.el("text",{x,y:y-4,"text-anchor":"middle"},s);tx.textContent=n==="TFTP"?"TFTP":n;tx=R.el("text",{x,y:y+14,"text-anchor":"middle",class:"peq"},s);tx.textContent=t});}
const centro=n=>[BX[n][0],BX[n][1]];
const ops=[
 ["copy running-config startup-config",["RAM","NVRAM"],"Guarda la configuración activa para que sobreviva al reinicio."],
 ["copy running-config tftp:",["RAM","TFTP"],"Copia de seguridad en el servidor (pide IP y nombre: SW1-confg)."],
 ["copy tftp: running-config",["TFTP","RAM"],"<b>Fusiona</b> el archivo con la configuración activa: lo que ya había y no está en el archivo se mantiene."],
 ["copy tftp: startup-config",["TFTP","NVRAM"],"<b>Sustituye</b> la configuración guardada; se aplicará en el próximo arranque."],
 ["copy tftp: flash:",["TFTP","FLASH"],"Copia una imagen nueva de IOS a la flash. Después: <code>boot system flash:&lt;imagen&gt;</code>, guardar y reload."],
 ["reload",["NVRAM","RAM"],"Reinicia: el IOS pasa de la flash a la RAM y startup-config se copia a RAM como running-config. Lo no guardado se pierde."],
 ["erase startup-config",["NVRAM",null],"Borra la configuración guardada. Al reiniciar, el switch arranca de fábrica (salvo vlan.dat, que se borra aparte)."]];
$("#arBtns").innerHTML=ops.map((o,i)=>`<button class="chip" data-i="${i}">${o[0]}</button>`).join("");
let arOcup=false;
$("#arBtns").querySelectorAll(".chip").forEach(b=>b.onclick=async()=>{if(arOcup)return;arOcup=true;const[c,[a,d],t]=ops[+b.dataset.i];
  $("#arBtns").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));$("#arTxt").innerHTML=`<code>${c}</code> — ${t}`;
  if(d){const anims=[R.trama($("#arSvg"),[centro(a),centro(d)],{txt:a==="TFTP"&&d==="FLASH"?"IOS":"config",color:"#2f5bd3",dur:1300})];
    if(c==="reload")anims.push(R.trama($("#arSvg"),[centro("FLASH"),centro("RAM")],{txt:"IOS",color:"#23854a",dur:1300}));await Promise.all(anims)}
  else{const r=$("#ar-NVRAM");r.style.stroke="var(--bad)";r.style.strokeDasharray="6 4";await R.espera(1500);r.style.stroke="";r.style.strokeDasharray=""}
  arOcup=false});
drawAr();

R.ordena("act",["show version y show flash: (versión y espacio libre)","Descargar la imagen del fabricante y comprobar MD5/SHA","copy running-config tftp: (copia de la configuración)","copy tftp: flash: (copiar la imagen)","boot system flash:<imagen> y guardar","reload y show version"]);

/* ---------- port security ---------- */
R.test("ps",[
 {q:"Fa0/1 con port security por defecto. Se conecta un segundo equipo con otra MAC.",ok:"err-disabled",exp:"Por defecto: máximo 1 MAC y modo shutdown. El puerto pasa a err-disabled."},
 {q:"Modo restrict, máximo 1 MAC ya aprendida. Conectas PC5 y hace ping.",ok:"Descarta y cuenta",exp:"Restrict descarta, registra el aviso e incrementa el contador. El puerto sigue activo."},
 {q:"Modo protect, máximo 1 MAC ya aprendida. Conectas PC5 y hace ping.",ok:"Descarta en silencio",exp:"Protect descarta las tramas sin aviso ni contador."},
 {q:"Escribes switchport port-security en un puerto que no está en modo access.",ok:"Command rejected",exp:"«Command rejected: FastEthernet0/1 is a dynamic port.» Antes hace falta switchport mode access."},
 {q:"Un puerto está err-disabled por una violación. Ya has quitado al intruso. ¿Qué haces?",ok:"shutdown y no shutdown",exp:"En la interfaz: shutdown y después no shutdown."},
 {q:"Usas sticky, el puerto aprende la MAC de PC1 y reinicias sin guardar.",ok:"Se pierde la MAC",exp:"Sticky escribe la MAC en running-config (RAM). Sin copy running-config startup-config, se pierde al reiniciar."}
],["err-disabled","Descarta y cuenta","Descarta en silencio","Command rejected","shutdown y no shutdown","Se pierde la MAC"]);

/* ---------- incidencias (ej. 19) ---------- */
R.test("inc",[
 {q:"Fa0/2 (Impresora) en <b>notconnect</b>.",ok:"Sin enlace físico",exp:"Cable desconectado o roto, impresora apagada o cable incorrecto. Revisar el cable y el equipo."},
 {q:"Fa0/3 (Servidor) en <b>disabled</b>.",ok:"Desactivado con shutdown",exp:"Está administratively down. Solución: no shutdown en la interfaz."},
 {q:"Fa0/4 (PC-Invitados) en <b>err-disabled</b>.",ok:"Violación de port security",exp:"Se desactivó solo, normalmente por port security. show port-security interface fa0/4 y show logging; quitar al intruso y shutdown + no shutdown."},
 {q:"Fa0/5 conectado en <b>half</b>, con miles de errores CRC y late collisions; SW2 está fijado en full.",ok:"Duplex mismatch",exp:"Desajuste de dúplex. Poner los dos extremos en automático o los dos fijados igual (duplex full en Fa0/5)."},
 {q:"La misma MAC cambia de Fa0/23 a Fa0/24 en 5 segundos sin que el equipo se mueva.",ok:"Bucle de capa 2",exp:"Las copias de las tramas dan vueltas por los enlaces redundantes. Revisar STP con show spanning-tree."},
 {q:"La red va lentísima y los LED de todos los puertos parpadean a la vez.",ok:"Bucle de capa 2",exp:"Tormenta de broadcast por un bucle. Revisar STP y los enlaces redundantes."}
],["Sin enlace físico","Desactivado con shutdown","Violación de port security","Duplex mismatch","Bucle de capa 2"]);

/* ---------- preguntas ---------- */
R.preguntas("ios",[
 ["Escribes show running-config en Switch> y da error. ¿Por qué y qué haces?","En el modo EXEC de usuario no están los show de configuración. Hay que pasar al privilegiado con <code>enable</code>."],
 ["¿Cuáles son los parámetros de la conexión de consola?","9600 baudios, 8 bits de datos, sin paridad, 1 bit de parada y sin control de flujo."],
 ["Cambias el hostname, reinicias y el switch vuelve a llamarse como antes. ¿Qué ha pasado?","El cambio solo estaba en <b>running-config</b> (RAM). Faltaba <code>copy running-config startup-config</code>."],
 ["¿Qué hace interface range fastEthernet 0/1 - 2 seguido de shutdown?","Desactiva a la vez los puertos 1 y 2: sus enlaces se apagan y los equipos conectados pierden la conexión."],
 ["Configuras interface vlan 1 con IP pero sigue down. ¿Qué dos cosas pueden faltar?","El <code>no shutdown</code> en la interfaz, o que no haya ningún puerto con enlace activo en la VLAN 1."],
 ["Diferencia entre enable secret y service password-encryption.","enable secret guarda la contraseña del privilegiado con un hash. service password-encryption cifra las contraseñas de línea con un cifrado débil y reversible (tipo 7), solo para que no se lean a simple vista."],
 ["crypto key generate rsa da «% Please define a hostname other than Switch». ¿Qué falta? ¿Y si el error habla del domain-name?","Falta cambiar el nombre con <code>hostname</code>. Si habla del dominio, falta <code>ip domain-name</code>. Los dos son necesarios para generar las claves."],
 ["Tras configurar SSH con transport input ssh, ¿qué pasa al hacer telnet al switch?","Se rechaza la conexión: las líneas VTY solo aceptan SSH."],
 ["¿Para qué sirve login local en las VTY?","Para pedir usuario y contraseña de la base local (creada con username), en vez de solo una contraseña de línea."],
 ["Diferencia entre copy tftp: running-config y copy tftp: startup-config.","La primera <b>fusiona</b> el archivo con la configuración activa (no borra lo que ya había). La segunda <b>sustituye</b> la configuración guardada para el próximo arranque."],
 ["Después de erase startup-config y reload, ¿qué indicador aparece y por qué?","<code>Switch&gt;</code>: no hay startup-config, así que arranca con la configuración de fábrica."],
 ["¿Qué hay que borrar, además de startup-config, para dejar el switch de fábrica?","<code>delete flash:vlan.dat</code> (la base de datos de VLAN) y luego reload."],
 ["Antes de copiar una imagen de IOS, ¿qué se comprueba y por qué?","El espacio libre (show flash:), que la imagen sea compatible con el modelo y su suma de verificación MD5 o SHA, para asegurar que no está dañada. Y conviene conservar la imagen anterior."],
 ["Una entrada estática de la tabla MAC, ¿desaparece con clear mac address-table dynamic? ¿Y con el aging time?","No: las estáticas no envejecen y el clear dynamic solo borra las dinámicas. Se quita con <code>no mac address-table static …</code>."],
 ["Compara protect, restrict y shutdown en port security.","Los tres descartan las tramas del intruso. Protect: sin aviso. Restrict: aviso y contador, puerto activo. Shutdown (por defecto): aviso y el puerto pasa a err-disabled."],
 ["Un puerto muestra half-duplex, miles de CRC y late collisions, y el otro extremo está en full. ¿Diagnóstico?","Duplex mismatch: el extremo en automático cayó en half porque el otro estaba fijado en full. Se configuran los dos igual."]
]);
})();
