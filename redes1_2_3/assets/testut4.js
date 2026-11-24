/* Simulacro de los cuestionarios de la práctica UT4: 8 preguntas, 50 s, sin volver atrás.
   Cada pregunta: [enunciado, correcta, [incorrectas x3], explicación] */
(function(){
const $=s=>document.querySelector(s);
const B1=[
 ["Acabas de conectar los PC a un 2960 en Packet Tracer y los puntos de enlace se quedan en ámbar unos 30 s. ¿Por qué?","STP pasa los puertos por escucha y aprendizaje antes de reenviar",["Se está negociando la dirección IP por DHCP","El cable usado debería ser cruzado","El switch está cargando el IOS desde la flash"],"STP comprueba que el puerto no cree un bucle: 15 s de escucha + 15 s de aprendizaje."],
 ["En show mac address-table de SW1, las MAC de PC3 y PC4 (conectados a SW2) aparecen en Fa0/24. ¿Por qué?","Porque sus tramas entran a SW1 por el enlace con SW2",["Porque Fa0/24 es el puerto de administración","Porque se configuraron como entradas estáticas","Porque SW1 las inunda por ese puerto"],"El switch aprende la MAC de origen en el puerto por el que entra la trama."],
 ["Red del ejercicio 11: dos switches unidos, con dos PC cada uno. ¿Cuántos dominios de colisión y de broadcast hay?","5 de colisión y 1 de broadcast",["4 de colisión y 2 de broadcast","2 de colisión y 1 de broadcast","5 de colisión y 2 de broadcast"],"Uno de colisión por cada enlace de switch (4 PC + el enlace entre switches). Sin router, un único dominio de broadcast."],
 ["Escribes «show running-config» con el indicador Switch>. ¿Qué ocurre?","Sale % Invalid input detected at '^' marker.",["Muestra la configuración activa","Pide la contraseña de enable","Muestra la startup-config"],"En el modo EXEC de usuario no está disponible: hay que pasar a privilegiado con enable."],
 ["¿Qué parámetros usa el terminal para conectar por consola a un switch Cisco?","9600 baudios, 8 bits, sin paridad, 1 bit de parada, sin control de flujo",["115200 baudios, 8 bits, paridad par, 1 bit de parada","9600 baudios, 7 bits, sin paridad, 2 bits de parada","19200 baudios, 8 bits, sin paridad, control de flujo hardware"],"Son los valores estándar de la consola de Cisco."],
 ["En Switch(config)# escribes «hostname SW1». ¿Qué indicador aparece justo después?","SW1(config)#",["Switch(config)#, hasta que se guarde","SW1#","SW1>"],"El cambio se aplica a running-config al momento y sigues en configuración global."],
 ["Con interface range fastEthernet 0/1 - 2 haces shutdown. Desde PC3 haces ping a PC1. ¿Qué pasa?","El ping falla y los enlaces de PC1 y PC2 se ven en rojo",["El ping responde, porque solo se desactiva la gestión","Solo se desactiva Fa0/1","El ping responde con retraso por STP"],"Los dos puertos quedan administratively down."],
 ["Cambias el hostname a SW1-PRUEBA, haces reload y respondes «no» a guardar. ¿Cómo se llama al arrancar?","SW1",["SW1-PRUEBA","Switch","Pide el nombre al arrancar"],"Al arrancar se carga startup-config, que sigue teniendo SW1."],
 ["¿Qué hace copy running-config startup-config y por qué hace falta?","Copia la configuración de la RAM a la NVRAM para que sobreviva al reinicio",["Copia la configuración de la NVRAM a la RAM","Hace una copia de seguridad en el servidor TFTP","Actualiza la imagen de IOS de la flash"],"Los comandos cambian running-config (RAM), que se pierde al apagar."],
 ["Configuras la IP en interface vlan 1 con no shutdown, pero no hay ningún equipo conectado a ningún puerto. ¿Cómo está Vlan1?","down",["up","administratively down","err-disabled"],"La SVI solo sube si hay al menos un puerto con enlace activo en esa VLAN."],
 ["show ip interface brief muestra Vlan1 como «administratively down». ¿Qué falta?","no shutdown en interface vlan 1",["ip default-gateway","Conectar un cable cruzado","copy running-config startup-config"],"Administratively down = desactivada con shutdown (por defecto la Vlan1 lo está)."],
 ["Tras configurar enable secret y line console 0 con password y login, cierras la sesión de consola y vuelves a entrar. ¿Qué pasa?","Pide primero la contraseña de consola y luego, al hacer enable, la de enable secret",["Solo pide la contraseña de enable secret","Pide usuario y contraseña","No pide ninguna hasta guardar"],"login activa la comprobación de la contraseña de línea; enable secret protege el modo privilegiado."],
 ["En line console 0 pones password pero NO login. ¿Qué ocurre al conectar por consola?","Entra sin pedir contraseña",["Pide la contraseña igualmente","No deja entrar a nadie","Pide usuario y contraseña"],"Sin login, la contraseña de línea existe pero no se comprueba."],
 ["En line vty 0 15 pones login pero ninguna contraseña. Haces telnet desde PC3. ¿Qué pasa?","Se corta la conexión: Password required, but none set",["Entra directamente en SW1>","Entra directamente en SW1#","Pide usuario y contraseña locales"],"Con login sin contraseña, las VTY rechazan la conexión."],
 ["Ejecutas crypto key generate rsa con el hostname por defecto. ¿Qué mensaje sale?","% Please define a hostname other than Switch.",["% Please define a domain-name first.","% Invalid input detected at '^' marker.","Las claves se generan sin problema"],"El nombre de las claves se forma con hostname + dominio; Switch no vale."],
 ["Ya has cambiado el hostname, pero no has puesto ip domain-name. ¿Qué pasa con crypto key generate rsa?","% Please define a domain-name first.",["Genera las claves con el dominio local","% Please define a hostname other than Switch.","Command rejected"],"Hace falta el dominio para nombrar las claves (SW1.aula.local)."],
 ["Tras transport input ssh en las VTY, haces telnet 192.168.1.2 desde PC3. ¿Qué pasa?","La conexión es rechazada",["Entra pidiendo la contraseña de VTY","Entra pidiendo usuario y contraseña","Se convierte automáticamente en SSH"],"Las líneas virtuales solo aceptan SSH."],
 ["¿Qué hace login local en line vty 0 15?","Pide usuario y contraseña de los usuarios creados con username",["Solo permite conexiones desde la red local","Usa la contraseña de enable secret","Desactiva la contraseña de las VTY"],"Autentica contra la base de datos local de usuarios."],
 ["Tras service password-encryption, ¿cómo aparecen las contraseñas en show running-config?","enable secret como «secret 5» (hash) y las de línea como «password 7» (cifrado débil)",["Todas en texto claro","Todas como «secret 5»","Desaparecen de la configuración"],"El tipo 7 es reversible; solo evita que se lean a simple vista."],
 ["Ejecutas banner motd #Acceso restringido#. ¿Qué papel tiene el #?","Delimita el principio y el final del texto",["Es un comentario que IOS ignora","Hace que el aviso se muestre en negrita","Indica que el aviso es para el modo privilegiado"],"Puedes usar otro carácter como delimitador; lo importante es que abra y cierre."],
 ["Añades description PRUEBA-FUSION a Fa0/10 y luego haces copy tftp: running-config con una copia anterior. ¿Qué pasa con la descripción?","Se mantiene, porque la copia se fusiona con la configuración activa",["Desaparece, porque la copia sustituye la configuración","Se mueve a startup-config","Da error de conflicto"],"Copiar a running-config fusiona: añade comandos sin borrar los existentes."],
 ["Tras erase startup-config y reload (sin guardar), ¿qué indicador aparece?","Switch>",["SW1>","SW1#","rommon>"],"No hay configuración guardada, así que arranca de fábrica."],
 ["Quieres restaurar la configuración desde el TFTP tras borrar la del switch. ¿Qué hay que hacer antes?","Dar IP a interface vlan 1 y no shutdown",["Guardar con copy running-config startup-config","Ejecutar boot system flash:","Configurar las líneas VTY"],"Sin IP de administración, el switch no puede comunicarse con el servidor."],
 ["Además de startup-config, ¿qué hay que borrar para dejar el switch completamente de fábrica?","flash:vlan.dat, con delete flash:vlan.dat",["La imagen .bin de la flash","running-config con erase running-config","La tabla MAC con clear mac address-table"],"vlan.dat guarda las VLAN aparte de startup-config."],
 ["En un equipo real, antes de copiar una imagen de IOS, ¿qué se comprueba para saber que no está dañada?","Su suma de verificación MD5 o SHA",["Que tenga extensión .bin","Que sea la más reciente de la web","Que ocupe menos que la RAM"],"La suma de verificación confirma que el archivo es idéntico al del fabricante."],
 ["Has copiado la imagen nueva a la flash. ¿Qué falta para arrancar con ella?","boot system flash:<imagen>, guardar y reload",["Solo hacer reload","Borrar la imagen anterior","copy flash: running-config"],"Sin boot system guardado, el switch sigue arrancando con la imagen anterior."],
 ["Haces boot system flash:<imagen> pero reinicias sin guardar. ¿Con qué imagen arranca?","Con la anterior",["Con la nueva","Con ninguna: entra en rommon","Con la que haya más reciente en la flash"],"boot system estaba solo en running-config."],
 ["Justo después de clear mac address-table dynamic, ¿qué muestra show mac address-table?","Ninguna entrada dinámica (solo las estáticas que hubiera)",["Las mismas entradas, porque no se pueden borrar","Solo la MAC del propio switch","Error: el comando requiere VLAN"],"Borra solo las aprendidas; reaparecen cuando hay tráfico."],
 ["¿Cuál es el tiempo de envejecimiento predeterminado de la tabla MAC en un switch Cisco?","300 segundos",["60 segundos","600 segundos","No caduca"],"Tras ese tiempo sin tráfico, la entrada dinámica se borra."],
 ["Creas una entrada estática para PC2 y luego haces clear mac address-table dynamic. ¿Qué pasa con ella?","Se mantiene como STATIC",["Se borra con las demás","Pasa a DYNAMIC","Se borra al cabo de 300 s"],"Las estáticas no envejecen ni se borran con clear dynamic."],
 ["Escribes la MAC con guiones en mac address-table static 00-60-2F-22-22-02 vlan 1 interface fa0/2. ¿Qué pasa?","% Invalid input: hay que usar el formato Cisco xxxx.xxxx.xxxx",["Se acepta y la convierte","Se crea como DYNAMIC","Pide confirmación"],"IOS espera el formato con puntos: 0060.2f22.2202."],
 ["Estás en SW1(config)# y escribes show mac address-table. ¿Qué ocurre?","% Invalid input; habría que usar do show mac address-table",["Muestra la tabla","Pasa al modo privilegiado","Muestra solo las entradas estáticas"],"Los show son del modo privilegiado; en configuración se anteponen con do."]
];
const B2=[
 ["En Fa0/1 escribes switchport port-security sin haber puesto switchport mode access. ¿Qué sale?","Command rejected: FastEthernet0/1 is a dynamic port.",["% Invalid input detected at '^' marker.","Se activa sin problemas","% Incomplete command."],"Port security solo se aplica a puertos de acceso."],
 ["¿Valores por defecto de port security al activarla?","Máximo 1 MAC y modo shutdown",["Máximo 1 MAC y modo restrict","Máximo 132 MAC y modo protect","Ilimitadas y modo shutdown"],"Por eso, si no se cambia nada, un segundo equipo deja el puerto en err-disabled."],
 ["Fa0/1 con máximo 1, sticky y restrict, ya ha aprendido la MAC de PC1. Conectas PC5 y hace ping. ¿Qué ocurre?","El ping falla, el contador de violaciones sube y el puerto sigue activo",["El ping falla y el puerto pasa a err-disabled","El ping responde, porque sticky aprende la nueva MAC","El ping falla sin aviso ni contador"],"Restrict descarta y registra, pero no apaga el puerto."],
 ["Misma situación pero en modo shutdown. ¿Qué muestra show interfaces status para Fa0/1?","err-disabled",["disabled","notconnect","connected"],"Shutdown (el modo por defecto) desactiva el puerto por la violación."],
 ["¿Qué modo de violación descarta las tramas del intruso sin registro ni contador?","protect",["restrict","shutdown","sticky"],"Protect es silencioso; restrict avisa; shutdown apaga."],
 ["¿Cómo se recupera un puerto en err-disabled tras quitar al intruso?","shutdown y después no shutdown en la interfaz",["clear mac address-table dynamic","reload del switch obligatoriamente","no switchport port-security"],"Hay que reactivarlo a mano (salvo que esté configurada la recuperación automática)."],
 ["Con sticky, el puerto aprende la MAC de PC1 y reinicias sin guardar. ¿Qué pasa?","Se pierde: sticky la escribe en running-config",["Se conserva, porque sticky la guarda en NVRAM","Se convierte en estática permanente","Se guarda en vlan.dat"],"Hay que hacer copy running-config startup-config para conservarla."],
 ["¿Dónde ves el mensaje %PORT_SECURITY-2-PSECURE_VIOLATION?","En show logging (y en la consola)",["En show mac address-table","En show version","En show ip interface brief"],"Restrict y shutdown generan el aviso en el registro."],
 ["show interfaces status: Fa0/2 en notconnect. Diagnóstico más probable:","No hay enlace físico: cable desconectado o equipo apagado",["Puerto desactivado con shutdown","Violación de port security","Duplex mismatch"],"Notconnect = el puerto está activo pero no detecta enlace."],
 ["show interfaces status: Fa0/3 en disabled. ¿Qué haces?","no shutdown en la interfaz",["Cambiar el cable","Revisar port security","Cambiar el dúplex"],"Disabled = administratively down."],
 ["show interfaces status: Fa0/4 en err-disabled. ¿Qué comando miras primero?","show port-security interface fastEthernet 0/4",["show spanning-tree","show flash:","show ip interface brief"],"Lo más habitual es una violación de port security."],
 ["Fa0/5 está en half-duplex con miles de errores CRC y late collisions; el otro extremo está fijado en full. Diagnóstico:","Duplex mismatch",["Cable cruzado en vez de directo","Bucle de capa 2","Violación de port security"],"El extremo en automático cae en half si el otro está fijado en full."],
 ["La misma MAC aparece en Fa0/23 y, 5 segundos después, en Fa0/24, sin que el equipo se haya movido. ¿Qué indica?","Un bucle de capa 2",["Que el equipo tiene dos tarjetas","Que el aging time es muy corto","Que hay port security sticky"],"Las copias de sus tramas llegan por los dos caminos del bucle."],
 ["La red va muy lenta y los LED de todos los puertos parpadean a la vez. ¿Qué es lo más probable?","Una tormenta de broadcast por un bucle",["Un duplex mismatch","Un cable de consola mal conectado","Un aging time de 600 s"],"Los broadcast dan vueltas sin fin porque las tramas no tienen TTL."],
 ["Triángulo de tres 2960 con prioridad por defecto. ¿Cuál es el puente raíz?","El de MAC más baja",["El de MAC más alta","El primero que se encendió","El que tiene más puertos conectados"],"Gana el BID más bajo; con prioridades iguales, decide la MAC."],
 ["Tras converger el triángulo, ¿cuántos puertos quedan en ámbar y dónde?","Uno, en el enlace entre los dos no raíz, del switch de mayor BID",["Dos, los del puente raíz","Ninguno","Uno en cada switch"],"Ese puerto se bloquea (Altn BLK) para romper el bucle."],
 ["En show spanning-tree del puente raíz, ¿qué rol tienen sus puertos?","Todos designados (Desg FWD)",["Todos raíz (Root FWD)","Uno raíz y otro bloqueado","Todos alternativos (Altn BLK)"],"El puente raíz no tiene puerto raíz."],
 ["show spanning-tree muestra «Priority 32769». ¿Qué prioridad está configurada?","32768",["32769","4097","24577"],"Cisco suma el número de VLAN (1) a la prioridad."],
 ["¿Qué coste tiene en STP un enlace de 100 Mbps?","19",["4","100","2"],"10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2."],
 ["Apagas el puerto raíz de un switch no raíz. ¿Por qué estados pasa el puerto que estaba bloqueado y cuánto tarda?","Escucha, aprendizaje y reenvío, en unos 50 s",["Directamente a reenvío, en 2 s","Aprendizaje y reenvío, en 15 s","Escucha y reenvío, en 30 s"],"20 s de max age sin BPDU + 15 de escucha + 15 de aprendizaje."],
 ["¿Qué modo de STP muestra show spanning-tree summary en un 2960 por defecto?","pvst",["rstp","mstp","stp"],"PVST+: un árbol por VLAN, lo predeterminado en Cisco."],
 ["Ejecutas spanning-tree vlan 1 root primary en un switch no raíz (los demás en 32768). ¿Qué prioridad pone?","24576",["28672","4096","0"],"Y ese switch pasa a ser el puente raíz."],
 ["¿Qué prioridad pone spanning-tree vlan 1 root secondary y cuándo será raíz ese switch?","28672; si cae la raíz principal",["24576; siempre","32768; nunca","4096; inmediatamente"],"28672 está entre 24576 (primary) y 32768 (por defecto)."],
 ["En un tercer switch pones spanning-tree vlan 1 priority 4096. ¿Qué pasa?","Pasa a ser el puente raíz",["Nada, porque ya hay una raíz primary","Se convierte en raíz secundaria","Da error: 4096 no es válida"],"4096 es más baja que 24576 y 28672."],
 ["Escribes spanning-tree vlan 1 priority 5000. ¿Qué pasa?","Error: la prioridad debe ir en incrementos de 4096",["Se acepta y se redondea a 4096","Se acepta como 5000","Se interpreta como root secondary"],"Solo valen 0, 4096, 8192… hasta 61440."],
 ["¿Por qué conviene que el puente raíz sea un switch de distribución o núcleo?","Porque es central y tiene más capacidad, y el tráfico va por los mejores enlaces",["Porque los de acceso no tienen STP","Porque así no hay puertos bloqueados","Porque así STP converge en 2 segundos"],"Por defecto podría ganar el más antiguo, quizá uno de acceso en una esquina."]
];
const mezcla=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
let ronda=null,timer=null;
function empieza(n){
  clearInterval(timer);
  const banco=n===1?B1:B2;
  ronda={n,preg:mezcla(banco).slice(0,8).map(([q,ok,mal,exp])=>({q,ok,exp,ops:mezcla([ok,...mal])})),i:0,resp:[]};
  muestra();
}
function muestra(){
  const r=ronda,p=r.preg[r.i];let t=50;
  $("#simZona").innerHTML=`<div class="reto" style="display:grid;gap:12px">
    <div class="stepper" style="justify-content:space-between"><span class="eyebrow">Test ${r.n} · Pregunta ${r.i+1} de 8</span><span class="secuencia" id="reloj">50 s</span></div>
    <div class="barra" style="height:6px;border-radius:3px;background:var(--sunk);overflow:hidden"><i id="relojBar" style="display:block;height:100%;width:100%;background:var(--accent);transition:width 1s linear"></i></div>
    <div class="q" style="font-size:1.1rem">${p.q}</div>
    <div class="orden-list">${p.ops.map((o,k)=>`<button class="btn" data-k="${k}">${String.fromCharCode(97+k)}) ${o}</button>`).join("")}</div>
    <div class="stepper"><button class="btn" id="blanco">Dejar en blanco</button></div></div>`;
  $("#simZona").querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>siguiente(p.ops[+b.dataset.k]));
  $("#blanco").onclick=()=>siguiente(null);
  timer=setInterval(()=>{t--;$("#reloj").textContent=t+" s";$("#relojBar").style.width=(t/50*100)+"%";if(t<=10)$("#reloj").style.color="var(--bad)";if(t<=0)siguiente(null)},1000);
  $("#simZona").scrollIntoView({block:"nearest"});
}
function siguiente(r){
  clearInterval(timer);ronda.resp.push(r);ronda.i++;
  if(ronda.i<8)muestra();else fin();
}
function fin(){
  const r=ronda;let ok=0,mal=0,bl=0;
  r.preg.forEach((p,i)=>{const a=r.resp[i];if(a===null)bl++;else if(a===p.ok)ok++;else mal++});
  const nota=Math.max(0,ok*0.625-mal*0.21);
  $("#simZona").innerHTML=`<div class="resul"><div><span>Nota</span><b>${nota.toFixed(2).replace(".",",")} / 5</b></div><div><span>Aciertos</span><b>${ok}</b></div><div><span>Fallos</span><b>${mal}</b></div><div><span>En blanco</span><b>${bl}</b></div></div>
   <p>${nota>=4?"Muy bien: vas preparada.":nota>=2.5?"Aprobado: repasa las que has fallado.":"Repasa las explicaciones y vuelve a intentarlo: cada vez salen preguntas distintas."}</p>
   <div style="display:grid;gap:10px">${r.preg.map((p,i)=>{const a=r.resp[i],est=a===null?"en blanco":a===p.ok?"bien":"mal";
     return `<div class="panel" style="display:grid;gap:6px;border-left:5px solid var(${est==="bien"?"--ok":est==="mal"?"--bad":"--muted"})"><b>${i+1}. ${p.q}</b>
     ${a&&a!==p.ok?`<span class="fb mal">Tu respuesta: ${a}</span>`:""}<span class="fb ok">Correcta: ${p.ok}</span><span>${p.exp}</span></div>`}).join("")}</div>
   <div class="stepper"><button class="btn pri" data-test="1">Otro Test 1</button><button class="btn pri" data-test="2">Otro Test 2</button></div>`;
  $("#simZona").querySelectorAll("[data-test]").forEach(b=>b.onclick=()=>empieza(+b.dataset.test));
  try{const k="redes:simulacro";const h=JSON.parse(localStorage.getItem(k)||"[]");h.push({test:r.n,nota,fecha:Date.now()});localStorage.setItem(k,JSON.stringify(h.slice(-20)))}catch(e){}
  $("#sim").scrollIntoView({block:"start"});
}
document.querySelectorAll("#sim > .stepper [data-test]").forEach(b=>b.onclick=()=>empieza(+b.dataset.test));
try{const h=JSON.parse(localStorage.getItem("redes:simulacro")||"[]");if(h.length)$("#simZona").innerHTML=`<p class="marcador">Tus últimos simulacros: ${h.slice(-5).map(x=>`Test ${x.test}: ${x.nota.toFixed(2).replace(".",",")}`).join(" · ")}</p>`}catch(e){}
})();
