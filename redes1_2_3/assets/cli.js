/* Terminal simulado de un Cisco Catalyst 2960 (subconjunto de IOS para practicar la UT4).
   No es un emulador completo: reproduce los comandos, los indicadores, las preguntas y los
   mensajes de error de los ejercicios 11 a 18. */
window.CLI=(function(){
const PORTS=[...Array.from({length:24},(_,i)=>`FastEthernet0/${i+1}`),"GigabitEthernet0/1","GigabitEthernet0/2"];
const corto=n=>n.replace("FastEthernet","Fa").replace("GigabitEthernet","Gi");
const CONECT={"FastEthernet0/1":"PC1","FastEthernet0/2":"PC2","FastEthernet0/3":"SERVIDOR","FastEthernet0/24":"SW2"};
const HOSTMAC={PC1:"00d0.ba11.1101",PC2:"0060.2f22.2202",PC3:"0002.1633.3303",PC4:"0090.0c44.4404",SERVIDOR:"0030.a355.5050",PC5:"00e0.f766.6605"};
const IMG_ACT="c2960-lanbasek9-mz.150-2.SE4.bin",IMG_SRV=["c2960-lanbasek9-mz.150-2.SE4.bin","c2960-lanbase-mz.122-25.FX.bin","c2960-lanbasek9-mz.150-2.SE10a.bin"];
const def=()=>({host:"Switch",enableSecret:null,enablePw:null,con:{pw:null,login:false},vty:{pw:null,login:false,local:false,transport:"all"},
  users:{},domain:null,rsa:false,sshv2:false,pwEnc:false,banner:null,gw:null,aging:300,statics:[],stpPri:32768,boot:null,
  ifs:Object.fromEntries(PORTS.map(p=>[p,{desc:"",shut:false,access:false,ps:{on:false,max:1,sticky:false,viol:"shutdown",macs:[]}}])),
  vlan1:{ip:null,mask:null,shut:true}});
const clon=o=>JSON.parse(JSON.stringify(o));
let cfg=def(),startup=null,mode="user",ctx=null,pend=null,dyn={},errdis={},violCount={},logs=[],flash=[IMG_ACT,"vlan.dat"],tftp={},imgRun=IMG_ACT,out=null,onChange=()=>{},sesion=true;
const PROMPT={user:">",priv:"#",config:"(config)#",if:"(config-if)#",range:"(config-if-range)#",line:"(config-line)#"};
const prompt=()=>cfg.host+PROMPT[mode];
const hash=s=>{let h=5381;for(const c of s)h=((h<<5)+h+c.charCodeAt(0))>>>0;return h.toString(36)};
const secret=s=>"$1$mERr$"+(hash(s)+hash(s+"x")).slice(0,22);
const tipo7=s=>[...s].map((c,i)=>((c.charCodeAt(0)^(0x47+i*7))&255).toString(16).toUpperCase().padStart(2,"0")).join("").replace(/^/,"08");
function log(m){logs.push(m);escribe(m,"dim")}
function escribe(t,cls){out(t,cls)}
const ERR_INV=(linea,pos)=>{escribe(" ".repeat(prompt().length+pos)+"^","err");escribe("% Invalid input detected at '^' marker.","err")};

/* ---------- interfaces ---------- */
function parseIf(toks,i){ // devuelve {names, next} o null
  let s=toks.slice(i).join(" ").toLowerCase();
  const m=s.match(/^(f|fa|fas|fast|fastethernet|fastether|g|gi|gig|gigabitethernet)\s*(\d)\/(\d+)(\s*-\s*(\d+))?/);
  if(m){const base=m[1][0]==="f"?"FastEthernet":"GigabitEthernet";const a=+m[3],b=m[5]?+m[5]:a;
    const names=[];for(let k=a;k<=b;k++)names.push(`${base}${m[2]}/${k}`);
    if(!names.every(n=>PORTS.includes(n)))return {err:true};
    const usados=m[0].split(/\s+/).length;return {names,next:i+usados,range:!!m[4]}}
  const v=s.match(/^(v|vl|vla|vlan)\s*(\d+)/);if(v)return {names:["Vlan"+v[2]],next:i+v[0].split(/\s+/).length,vlan:+v[2]};
  return null;
}
/* ---------- coincidencia de palabras clave ---------- */
function kw(tok,opciones){ // prefijo único
  if(!tok)return {inc:true};const t=tok.toLowerCase();const c=opciones.filter(o=>o.startsWith(t));
  if(c.includes(t))return {ok:t};if(c.length===1)return {ok:c[0]};if(c.length>1)return {amb:true};return {bad:true};
}

/* ---------- generadores de salida ---------- */
function runningConfig(c=cfg){
  const L=["Building configuration...","","Current configuration : "+(1100+JSON.stringify(c).length%900)+" bytes","!","version 15.0","no service timestamps log datetime msec","no service timestamps debug datetime msec",c.pwEnc?"service password-encryption":"no service password-encryption","!","hostname "+c.host,"!"];
  if(c.enableSecret)L.push("enable secret 5 "+secret(c.enableSecret));
  if(c.enablePw)L.push("enable password "+(c.pwEnc?"7 "+tipo7(c.enablePw):c.enablePw));
  if(c.enableSecret||c.enablePw)L.push("!");
  Object.entries(c.users).forEach(([u,p])=>L.push(`username ${u} secret 5 ${secret(p)}`));
  if(c.domain)L.push("ip domain-name "+c.domain);
  if(c.sshv2)L.push("ip ssh version 2");
  L.push("!","spanning-tree mode pvst","spanning-tree extend system-id");
  if(c.stpPri!==32768)L.push("spanning-tree vlan 1 priority "+c.stpPri);
  L.push("!");
  PORTS.forEach(p=>{const f=c.ifs[p];L.push("interface "+p);if(f.desc)L.push(" description "+f.desc);if(f.access)L.push(" switchport mode access");
    if(f.ps.on){L.push(" switchport port-security");if(f.ps.max!==1)L.push(" switchport port-security maximum "+f.ps.max);if(f.ps.sticky)L.push(" switchport port-security mac-address sticky");
      if(f.ps.sticky)f.ps.macs.forEach(m=>L.push(` switchport port-security mac-address sticky ${m}`));if(f.ps.viol!=="shutdown")L.push(" switchport port-security violation "+f.ps.viol)}
    if(f.shut)L.push(" shutdown");L.push("!")});
  L.push("interface Vlan1",c.vlan1.ip?` ip address ${c.vlan1.ip} ${c.vlan1.mask}`:" no ip address");if(c.vlan1.shut)L.push(" shutdown");L.push("!");
  if(c.gw)L.push("ip default-gateway "+c.gw,"!");
  if(c.aging!==300)L.push("mac address-table aging-time "+c.aging);
  c.statics.forEach(s=>L.push(`mac address-table static ${s.mac} vlan 1 interface ${s.iface}`));
  if(c.boot)L.push("boot system flash:"+c.boot);
  if(c.banner)L.push("banner motd ^C"+c.banner+"^C");
  L.push("!","line con 0");if(c.con.pw)L.push(" password "+(c.pwEnc?"7 "+tipo7(c.con.pw):c.con.pw));if(c.con.login)L.push(" login");
  L.push("!","line vty 0 4");if(c.vty.pw)L.push(" password "+(c.pwEnc?"7 "+tipo7(c.vty.pw):c.vty.pw));if(c.vty.local)L.push(" login local");else if(c.vty.login)L.push(" login");
  if(c.vty.transport!=="all")L.push(" transport input "+c.vty.transport);
  L.push("line vty 5 15");if(c.vty.pw)L.push(" password "+(c.pwEnc?"7 "+tipo7(c.vty.pw):c.vty.pw));if(c.vty.local)L.push(" login local");else if(c.vty.login)L.push(" login");
  if(c.vty.transport!=="all")L.push(" transport input "+c.vty.transport);
  L.push("!","end");return L.join("\n");
}
function estadoPuerto(p){if(cfg.ifs[p].shut)return "disabled";if(errdis[p])return "err-disabled";return CONECT[p]?"connected":"notconnect"}
function vlanUp(){return !cfg.vlan1.shut&&PORTS.some(p=>estadoPuerto(p)==="connected")}
function macTable(filtro){
  const filas=[];
  cfg.statics.forEach(s=>filas.push([s.mac,"STATIC",corto(s.iface)]));
  if(filtro!=="static")Object.entries(dyn).forEach(([m,p])=>{if(!cfg.statics.some(s=>s.mac===m))filas.push([m,"DYNAMIC",corto(p)])});
  PORTS.forEach(p=>cfg.ifs[p].ps.macs.forEach(m=>{if(!filas.some(f=>f[0]===m))filas.push([m,"STATIC",corto(p)])}));
  return ["          Mac Address Table","-------------------------------------------","","Vlan    Mac Address       Type        Ports","----    -----------       --------    -----",
    ...filas.filter(f=>filtro!=="dynamic"||f[1]==="DYNAMIC").map(f=>`   1    ${f[0]}    ${f[1].padEnd(8)}    ${f[2]}`)].join("\n");
}

/* ---------- show ---------- */
function show(toks){
  const sub=kw(toks[1],["running-config","startup-config","version","interfaces","ip","mac","flash:","port-security","logging","spanning-tree","history"]);
  if(sub.inc){escribe("% Incomplete command.","err");return}if(sub.amb){escribe(`% Ambiguous command: "${toks.join(" ")}"`,"err");return}if(sub.bad){ERR_INV(toks.join(" "),toks[0].length+1);return}
  switch(sub.ok){
  case "running-config":escribe(runningConfig());break;
  case "startup-config":if(!startup){escribe("startup-config is not present","err");break}escribe(runningConfig(startup).replace("Current configuration","Using "+(1100+JSON.stringify(startup).length%900)+" out of 65536 bytes\nCurrent configuration"));break;
  case "version":escribe(`Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version ${imgRun.includes("122-25")?"12.2(25)FX":imgRun.includes("SE10a")?"15.0(2)SE10a":"15.0(2)SE4"}, RELEASE SOFTWARE (fc1)\nTechnical Support: http://www.cisco.com/techsupport\n\nROM: Bootstrap program is C2960 boot loader\n\n${cfg.host} uptime is 12 minutes\nSystem returned to ROM by power-on\nSystem image file is "flash:${imgRun}"\n\ncisco WS-C2960-24TT-L (PowerPC405) processor with 65536K bytes of memory.\n24 FastEthernet interfaces\n2 Gigabit Ethernet interfaces\n64K bytes of flash-simulated non-volatile configuration memory.\nBase ethernet MAC Address       : 00:0A:41:8C:2B:00\nModel number                    : WS-C2960-24TT-L\n\nConfiguration register is 0xF`);break;
  case "interfaces":{
    const s2=kw(toks[2],["status"]);
    if(toks[2]&&s2.ok==="status"){escribe("Port      Name               Status       Vlan       Duplex  Speed Type\n"+PORTS.map(p=>`${corto(p).padEnd(10)}${cfg.ifs[p].desc.slice(0,18).padEnd(19)}${estadoPuerto(p).padEnd(13)}1          ${estadoPuerto(p)==="connected"?"a-full  a-100":"auto    auto "} ${p.startsWith("Fast")?"10/100BaseTX":"10/100/1000BaseTX"}`).join("\n"));break}
    const r=parseIf(toks,2);if(!r||r.err||r.vlan){escribe("% Incomplete command.","err");break}
    const p=r.names[0],e=estadoPuerto(p);
    escribe(`${p} is ${e==="disabled"?"administratively down":e==="connected"?"up":"down"}, line protocol is ${e==="connected"?"up (connected)":"down ("+(e==="err-disabled"?"err-disabled":e)+")"}\n  Hardware is Lance, address is 000a.418c.2b${(PORTS.indexOf(p)+1).toString(16).padStart(2,"0")}\n${cfg.ifs[p].desc?"  Description: "+cfg.ifs[p].desc+"\n":""}  ${e==="connected"?"Full-duplex, 100Mb/s":"Auto-duplex, Auto-speed"}\n     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored\n     0 late collision, 0 deferred`);break}
  case "ip":{const s2=kw(toks[2],["interface"]);if(s2.ok!=="interface"||!(toks[3]||"").toLowerCase().startsWith("b")){escribe("% Incomplete command.","err");break}
    escribe("Interface              IP-Address      OK? Method Status                Protocol\n"+PORTS.map(p=>{const e=estadoPuerto(p);return `${p.padEnd(23)}unassigned      YES manual ${(e==="disabled"?"administratively down":e==="connected"?"up":"down").padEnd(22)}${e==="connected"?"up":"down"}`}).join("\n")+
      `\nVlan1                  ${(cfg.vlan1.ip||"unassigned").padEnd(16)}YES manual ${(cfg.vlan1.shut?"administratively down":vlanUp()?"up":"down").padEnd(22)}${vlanUp()?"up":"down"}`);break}
  case "mac":{const s2=kw(toks[2],["address-table"]);if(!s2.ok){escribe("% Incomplete command.","err");break}
    const s3=kw(toks[3],["dynamic","static","aging-time"]);
    if(s3.ok==="aging-time"){escribe(`Global Aging Time:  ${cfg.aging}\nVlan    Aging Time\n----    ----------`);break}
    escribe(macTable(s3.ok));break}
  case "flash:":escribe("Directory of flash:/\n\n"+flash.map((f,i)=>`    ${i+1}  -rw-   ${f.endsWith(".bin")?"4670455":"616"}          <no date>  ${f}`).join("\n")+`\n\n64016384 bytes total (${64016384-flash.filter(f=>f.endsWith(".bin")).length*4670455-616} bytes free)`);break;
  case "port-security":{
    const s2=kw(toks[2],["interface","address"]);
    if(s2.ok==="address"){escribe("               Secure Mac Address Table\n-----------------------------------------------------------------------------\nVlan    Mac Address       Type                          Ports   Remaining Age\n----    -----------       ----                          -----   -------------\n"+
      PORTS.flatMap(p=>cfg.ifs[p].ps.macs.map(m=>`   1    ${m}    ${(cfg.ifs[p].ps.sticky?"SecureSticky":"SecureConfigured").padEnd(30)}${corto(p).padEnd(8)}-`)).join("\n")+"\n-----------------------------------------------------------------------------");break}
    if(s2.ok==="interface"){const r=parseIf(toks,3);if(!r||r.err){escribe("% Incomplete command.","err");break}const p=r.names[0],f=cfg.ifs[p];
      escribe(`Port Security              : ${f.ps.on?"Enabled":"Disabled"}\nPort Status                : ${errdis[p]?"Secure-shutdown":f.ps.on?"Secure-up":"Secure-down"}\nViolation Mode             : ${f.ps.viol[0].toUpperCase()+f.ps.viol.slice(1)}\nAging Time                 : 0 mins\nMaximum MAC Addresses      : ${f.ps.max}\nTotal MAC Addresses        : ${f.ps.macs.length}\nConfigured MAC Addresses   : 0\nSticky MAC Addresses       : ${f.ps.sticky?f.ps.macs.length:0}\nLast Source Address:Vlan   : ${f.ps.macs[0]||"0000.0000.0000"}:1\nSecurity Violation Count   : ${violCount[p]||0}`);break}
    escribe("Secure Port MaxSecureAddr CurrentAddr SecurityViolation Security Action\n               (Count)       (Count)        (Count)\n--------------------------------------------------------------------\n"+
      PORTS.filter(p=>cfg.ifs[p].ps.on).map(p=>`${corto(p).padStart(9)}        ${cfg.ifs[p].ps.max}          ${cfg.ifs[p].ps.macs.length}                 ${violCount[p]||0}         ${cfg.ifs[p].ps.viol[0].toUpperCase()+cfg.ifs[p].ps.viol.slice(1)}`).join("\n")+"\n----------------------------------------------------------------------");break}
  case "logging":escribe("Syslog logging: enabled (0 messages dropped)\n\nLog Buffer (4096 bytes):\n"+(logs.join("\n")||""));break;
  case "spanning-tree":escribe(`VLAN0001\n  Spanning tree enabled protocol ieee\n  Root ID    Priority    ${cfg.stpPri+1}\n             Address     000A.418C.2B00\n             This bridge is the root\n             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec\n\n  Bridge ID  Priority    ${cfg.stpPri+1}  (priority ${cfg.stpPri} sys-id-ext 1)\n             Address     000A.418C.2B00\n\nInterface        Role Sts Cost      Prio.Nbr Type\n---------------- ---- --- --------- -------- --------------------------------\n`+
     PORTS.filter(p=>estadoPuerto(p)==="connected").map(p=>`${corto(p).padEnd(17)}Desg FWD 19        128.${PORTS.indexOf(p)+1}    P2p`).join("\n")+"\n\n(En este simulador hay un solo switch: para ver puertos raíz y bloqueados usa el tema STP.)");break;
  case "history":escribe(hist.slice(-10).join("\n"));break;
  }
}

/* ---------- comandos por modo ---------- */
function noCmd(toks){ // no <...>
  const t=toks.slice(1);
  if(mode==="if"||mode==="range"){const k=kw(t[0],["shutdown","description","switchport","ip"]);
    if(k.ok==="shutdown"){ctx.forEach(p=>{if(p==="Vlan1"){cfg.vlan1.shut=false;setTimeout(()=>{if(vlanUp())log(`%LINK-5-CHANGED: Interface Vlan1, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface Vlan1, changed state to up`)},0)}else{if(cfg.ifs[p].shut){cfg.ifs[p].shut=false;delete errdis[p];if(CONECT[p])log(`%LINK-5-CHANGED: Interface ${p}, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ${p}, changed state to up`)}}});return}
    if(k.ok==="description"){ctx.forEach(p=>{if(cfg.ifs[p])cfg.ifs[p].desc=""});return}
    if(k.ok==="switchport"&&/port-security/.test(t.join(" "))){ctx.forEach(p=>{cfg.ifs[p].ps={on:false,max:1,sticky:false,viol:"shutdown",macs:[]}});return}
    if(k.ok==="ip"){cfg.vlan1.ip=null;cfg.vlan1.mask=null;return}
  }
  if(mode==="config"){const s=t.join(" ").toLowerCase();
    let m=s.match(/^mac address-table static ([0-9a-f.]+) vlan 1 interface (.+)$/);
    if(m){const r=parseIf(m[2].split(/\s+/),0);const n=cfg.statics.length;cfg.statics=cfg.statics.filter(x=>!(x.mac===m[1]&&r&&x.iface===r.names[0]));if(cfg.statics.length===n)escribe("% Entry not found","err");return}
    if(/^service password-encryption/.test(s)){cfg.pwEnc=false;return}
    if(/^banner motd/.test(s)){cfg.banner=null;return}
    if(/^enable secret/.test(s)){cfg.enableSecret=null;return}
    if(/^ip domain-name/.test(s)){cfg.domain=null;return}
    if(/^ip default-gateway/.test(s)){cfg.gw=null;return}
    if(/^spanning-tree vlan 1 priority/.test(s)){cfg.stpPri=32768;return}
    if(/^hostname/.test(s)){cfg.host="Switch";return}
  }
  if(mode==="line"){const k=kw(t[0],["login","password"]);const L=ctx==="con"?cfg.con:cfg.vty;if(k.ok==="login"){L.login=false;if(L.local!==undefined)L.local=false;return}if(k.ok==="password"){L.pw=null;return}}
  ERR_INV(toks.join(" "),3);
}
function ejecuta(linea){
  const toks=linea.trim().split(/\s+/).filter(Boolean);if(!toks.length)return;
  if(toks[0]==="?"||linea.trim().endsWith("?")){ayuda(toks);return}
  const t0=toks[0].toLowerCase();
  if(t0==="do"&&["config","if","range","line"].includes(mode)){const m=mode;mode="priv";ejecuta(toks.slice(1).join(" "));if(mode==="priv")mode=m;return}
  const listas={user:["enable","exit","logout","ping","show"],priv:["enable","disable","configure","show","copy","erase","reload","clear","ping","exit","write"],
    config:["hostname","interface","line","enable","username","ip","crypto","service","banner","mac","spanning-tree","no","end","exit","do","boot"],
    if:["description","shutdown","no","ip","switchport","end","exit","interface","spanning-tree"],range:["description","shutdown","no","switchport","end","exit","interface"],line:["password","login","transport","end","exit","no","exec-timeout"]};
  const k=kw(t0,listas[mode]);
  if(k.amb){escribe(`% Ambiguous command: "${linea.trim()}"`,"err");return}
  if(k.bad){
    if(mode==="user"&&["configure","copy","reload","erase","clear"].some(c=>c.startsWith(t0))){ERR_INV(linea,0);return}
    ERR_INV(linea,0);return}
  const c=k.ok;
  const sinArgs=["shutdown","end","exit","disable","logout"];
  if(sinArgs.includes(c)&&toks.length>1){ERR_INV(linea,linea.indexOf(toks[1]));return}
  if(c==="enable"&&mode==="user"&&toks.length>1){ERR_INV(linea,linea.indexOf(toks[1]));return}
  switch(mode){
  case "user":
    if(c==="enable"){if(cfg.enableSecret||cfg.enablePw){pend={tipo:"enable"};escribe("Password:")}else mode="priv";return}
    if(c==="show"){ERR_INV(linea,0);escribe("(En modo usuario no se pueden usar estos show: entra con enable.)","dim");return}
    if(c==="exit"||c==="logout"){salir();return}
    if(c==="ping"){ping(toks[1]);return}
    break;
  case "priv":
    if(c==="enable")return;
    if(c==="disable"){mode="user";return}
    if(c==="exit"){salir();return}
    if(c==="configure"){const k2=kw(toks[1],["terminal"]);if(k2.inc){escribe("Configuring from terminal, memory, or network [terminal]? ");pend={tipo:"conf"};return}if(!k2.ok){ERR_INV(linea,toks[0].length+1);return}
      escribe("Enter configuration commands, one per line.  End with CNTL/Z.");mode="config";return}
    if(c==="show"){show(toks);return}
    if(c==="write"){toks.length===1||kw(toks[1],["memory"]).ok?guarda():ERR_INV(linea,6);return}
    if(c==="copy"){copia(toks,linea);return}
    if(c==="erase"){const k2=kw(toks[1],["startup-config","nvram:"]);if(!k2.ok){escribe("% Incomplete command.","err");return}
      escribe("Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]");pend={tipo:"erase"};return}
    if(c==="reload"){if(startup===null||JSON.stringify(startup)!==JSON.stringify(cfg)){escribe("System configuration has been modified. Save? [yes/no]:");pend={tipo:"reloadSave"}}else{escribe("Proceed with reload? [confirm]");pend={tipo:"reload"}}return}
    if(c==="clear"){if(/^cl\S* m\S* a\S*( d\S*)?$/i.test(linea.trim())){dyn={};return}escribe("% Incomplete command.","err");return}
    if(c==="ping"){ping(toks[1]);return}
    break;
  case "config":
    if(c==="end"){mode="priv";log(`%SYS-5-CONFIG_I: Configured from console by console`);return}
    if(c==="exit"){mode="priv";return}
    if(c==="no"){noCmd(toks);return}
    if(c==="hostname"){if(!toks[1]){escribe("% Incomplete command.","err");return}cfg.host=toks[1];return}
    if(c==="interface"){entraIf(toks,linea);return}
    if(c==="line"){const k2=kw(toks[1],["console","vty"]);if(k2.ok==="console"&&toks[2]==="0"){mode="line";ctx="con";return}if(k2.ok==="vty"&&toks[2]!==undefined){mode="line";ctx="vty";return}escribe("% Incomplete command.","err");return}
    if(c==="enable"){const k2=kw(toks[1],["secret","password"]);if(!toks[2]){escribe("% Incomplete command.","err");return}if(k2.ok==="secret")cfg.enableSecret=toks.slice(2).join(" ");else if(k2.ok==="password")cfg.enablePw=toks.slice(2).join(" ");else ERR_INV(linea,7);return}
    if(c==="username"){if(toks.length<4||!["secret","password"].includes(toks[2].toLowerCase())){escribe("% Incomplete command.","err");return}cfg.users[toks[1]]=toks.slice(3).join(" ");return}
    if(c==="ip"){const k2=kw(toks[1],["domain-name","ssh","default-gateway","http"]);
      if(k2.ok==="domain-name"){if(!toks[2]){escribe("% Incomplete command.","err");return}cfg.domain=toks[2];return}
      if(k2.ok==="ssh"){if(/^v/i.test(toks[2]||"")&&toks[3]==="2"){if(!cfg.rsa){escribe("Please create RSA keys (of at least 768 bits size) to enable SSH v2.","err");return}cfg.sshv2=true;return}escribe("% Incomplete command.","err");return}
      if(k2.ok==="default-gateway"){cfg.gw=toks[2]||null;return}
      if(k2.ok==="http")return;
      ERR_INV(linea,3);return}
    if(c==="crypto"){if(!/^cr\S* k\S* g\S* r\S*/i.test(linea.trim())){escribe("% Incomplete command.","err");return}
      if(cfg.host==="Switch"){escribe("% Please define a hostname other than Switch.","err");return}
      if(!cfg.domain){escribe("% Please define a domain-name first.","err");return}
      const mod=(linea.match(/modulus\s+(\d+)/i)||[])[1];
      escribe(`The name for the keys will be: ${cfg.host}.${cfg.domain}`);
      if(!mod){escribe("Choose the size of the key modulus in the range of 360 to 4096 for your\n  General Purpose Keys. Choosing a key modulus greater than 512 may take\n  a few minutes.\n\nHow many bits in the modulus [512]: ");pend={tipo:"rsa"};return}
      rsaHecho(+mod);return}
    if(c==="service"){if(/^pass/i.test(toks[1]||"")){cfg.pwEnc=true;return}ERR_INV(linea,8);return}
    if(c==="banner"){const m=linea.match(/motd\s+(.)(.*)\1/i);if(!m){escribe("% Incomplete command.","err");return}cfg.banner=m[2];return}
    if(c==="mac"){const s=toks.map(x=>x.toLowerCase());
      if(/^address-table$/.test(kw(s[1],["address-table"]).ok||"")){
        if((s[2]||"").startsWith("ag")){const n=+s[3];if(!(n>=0)){escribe("% Incomplete command.","err");return}cfg.aging=n;return}
        if((s[2]||"").startsWith("st")){const mac=s[3];if(!/^[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}$/.test(mac||"")){escribe("% Invalid input detected at '^' marker. (Formato Cisco: xxxx.xxxx.xxxx)","err");return}
          const ii=s.indexOf("interface");if(s[4]!=="vlan"||ii<0){escribe("% Incomplete command.","err");return}const r=parseIf(toks,ii+1);if(!r||r.err){escribe("% Incomplete command.","err");return}
          cfg.statics=cfg.statics.filter(x=>x.mac!==mac);cfg.statics.push({mac,iface:r.names[0]});return}}
      escribe("% Incomplete command.","err");return}
    if(c==="spanning-tree"){const s=linea.toLowerCase();let m;
      if((m=s.match(/vlan 1 priority (\d+)/))){const n=+m[1];if(n%4096||n>61440){escribe("% Bridge Priority must be in increments of 4096.\n% Allowed values are:\n  0     4096  8192  12288 16384 20480 24576 28672\n  32768 36864 40960 45056 49152 53248 57344 61440","err");return}cfg.stpPri=n;return}
      if(/vlan 1 root primary/.test(s)){cfg.stpPri=24576;return}if(/vlan 1 root secondary/.test(s)){cfg.stpPri=28672;return}
      escribe("% Incomplete command.","err");return}
    if(c==="boot"){const m=linea.match(/flash:(\S+)/);if(!m){escribe("% Incomplete command.","err");return}cfg.boot=m[1];if(!flash.includes(m[1]))escribe(`%Warning: ${m[1]} not found in flash:`,"err");return}
    break;
  case "if":case "range":
    if(c==="end"){mode="priv";log(`%SYS-5-CONFIG_I: Configured from console by console`);return}
    if(c==="exit"){mode="config";return}
    if(c==="interface"){entraIf(toks,linea);return}
    if(c==="no"){noCmd(toks);return}
    if(c==="description"){ctx.forEach(p=>{if(cfg.ifs[p])cfg.ifs[p].desc=toks.slice(1).join(" ")});return}
    if(c==="shutdown"){ctx.forEach(p=>{if(p==="Vlan1"){cfg.vlan1.shut=true;return}if(!cfg.ifs[p].shut){cfg.ifs[p].shut=true;if(CONECT[p]||errdis[p])log(`%LINK-5-CHANGED: Interface ${p}, changed state to administratively down`)}});return}
    if(c==="ip"){if(ctx[0]!=="Vlan1"){escribe("% IP addresses may not be configured on L2 links.","err");return}const k2=kw(toks[1],["address"]);
      if(k2.ok!=="address"||!/^\d+\.\d+\.\d+\.\d+$/.test(toks[2]||"")||!/^\d+\.\d+\.\d+\.\d+$/.test(toks[3]||"")){escribe("% Incomplete command.","err");return}cfg.vlan1.ip=toks[2];cfg.vlan1.mask=toks[3];return}
    if(c==="switchport"){switchport(toks,linea);return}
    break;
  case "line":
    if(c==="end"){mode="priv";return}if(c==="exit"){mode="config";return}if(c==="no"){noCmd(toks);return}
    {const L=ctx==="con"?cfg.con:cfg.vty;
    if(c==="password"){if(!toks[1]){escribe("% Incomplete command.","err");return}L.pw=toks.slice(1).join(" ");return}
    if(c==="login"){if((toks[1]||"").toLowerCase().startsWith("l")){if(ctx==="vty"){cfg.vty.local=true;cfg.vty.login=false}else cfg.con.login=true;return}
      if(!L.pw&&ctx==="vty"){escribe("% Login disabled on line 1, until 'password' is set","err")}L.login=true;if(ctx==="vty")cfg.vty.local=false;return}
    if(c==="transport"){const m=(toks[2]||"").toLowerCase();if(!/^in/i.test(toks[1]||"")||!["ssh","telnet","all","none"].includes(m)){escribe("% Incomplete command.","err");return}if(ctx!=="vty"){ERR_INV(linea,0);return}cfg.vty.transport=m;return}
    if(c==="exec-timeout")return;}
    break;
  }
}
function entraIf(toks,linea){
  const rango=(toks[1]||"").toLowerCase().startsWith("ra");
  const r=parseIf(toks,rango?2:1);
  if(!r){escribe("% Incomplete command.","err");return}if(r.err){ERR_INV(linea,toks[0].length+1);return}
  if(r.vlan&&r.vlan!==1){escribe("(En este simulador solo existe la VLAN 1; las VLAN se ven en la UT5.)","dim");return}
  if(r.range&&!rango){ERR_INV(linea,linea.indexOf("-"));return}
  ctx=r.names;mode=rango?"range":"if";
}
function switchport(toks,linea){
  const s=toks.map(x=>x.toLowerCase()).join(" ");
  if(/^sw\S* mo\S* ac/.test(s)){ctx.forEach(p=>cfg.ifs[p].access=true);return}
  if(/^sw\S* port-s/.test(s)){
    const sinAcc=ctx.find(p=>!cfg.ifs[p].access);if(sinAcc){escribe(`Command rejected: ${sinAcc} is a dynamic port.`,"err");return}
    const rest=toks.slice(2).map(x=>x.toLowerCase());
    ctx.forEach(p=>{const ps=cfg.ifs[p].ps;
      if(!rest.length){ps.on=true;return}
      if(rest[0].startsWith("ma")&&rest[0].length>2&&rest[0].startsWith("max")){ps.max=+rest[1]||1;return}
      if(rest[0].startsWith("mac")){if(rest[1]==="sticky"){ps.sticky=true;if(rest[2]&&!ps.macs.includes(rest[2]))ps.macs.push(rest[2]);return}if(rest[1]&&!ps.macs.includes(rest[1]))ps.macs.push(rest[1]);return}
      if(rest[0].startsWith("vi")){const v=rest[1];if(!["protect","restrict","shutdown"].includes(v)){escribe("% Incomplete command.","err");return}ps.viol=v;return}
      escribe("% Invalid input detected at '^' marker.","err")});return}
  escribe("% Incomplete command.","err");
}
function rsaHecho(bits){cfg.rsa=true;escribe(`% Generating ${bits} bit RSA keys, keys will be non-exportable...[OK]`,"ok");log("%SSH-5-ENABLED: SSH 1.99 has been enabled")}
function guarda(){escribe("Building configuration...\n[OK]","ok");startup=clon(cfg)}
function ping(ip){
  if(!ip){escribe("% Incomplete command.","err");return}
  const red=cfg.vlan1.ip&&cfg.vlan1.ip.split(".").slice(0,3).join(".")===ip.split(".").slice(0,3).join(".");
  const existe=["192.168.1.11","192.168.1.12","192.168.1.13","192.168.1.14","192.168.1.50"].includes(ip);
  escribe(`Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${ip}, timeout is 2 seconds:`);
  if(vlanUp()&&red&&existe){escribe("!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 0/0/1 ms","ok")}
  else{escribe(".....\nSuccess rate is 0 percent (0/5)","err");if(!cfg.vlan1.ip)escribe("(El switch no tiene IP: configura interface vlan 1.)","dim");else if(!vlanUp())escribe("(La interfaz Vlan1 no está up: ¿falta no shutdown?)","dim")}
}
function copia(toks,linea){
  const a=(toks[1]||"").toLowerCase(),b=(toks[2]||"").toLowerCase();
  const es=(x,full)=>x&&full.startsWith(x.replace(/:$/,""))&&x.length>=2;
  if(es(a,"running-config")&&es(b,"startup-config")){escribe("Destination filename [startup-config]? ");pend={tipo:"copyRS"};return}
  if(es(a,"running-config")&&b.startsWith("tftp")){escribe("Address or name of remote host []? ");pend={tipo:"tftpUp",paso:0};return}
  if(es(a,"startup-config")&&es(b,"running-config")){Object.assign(cfg,clon(startup||cfg));escribe("Destination filename [running-config]? ");pend={tipo:"nada"};return}
  if(a.startsWith("tftp")&&(es(b,"running-config")||es(b,"startup-config")||b.startsWith("flash"))){escribe("Address or name of remote host []? ");pend={tipo:"tftpDown",paso:0,dest:b.startsWith("fl")?"flash":es(b,"running-config")?"run":"start"};return}
  escribe("% Invalid input detected at '^' marker.","err");
}
function salir(){
  sesion=false;mode="user";escribe(`\n${cfg.host} con0 is now available\n\n\n\n\nPress RETURN to get started.`,"dim");pend={tipo:"return"};
}
function entrada(){
  if(cfg.banner)escribe(cfg.banner);
  if(cfg.con.login&&cfg.con.pw){escribe("\nUser Access Verification\n\nPassword:");pend={tipo:"conPw"};return}
  sesion=true;
}
function arranca(){
  escribe("C2960 Boot Loader (C2960-HBOOT-M) Version 12.2(25r)FX, RELEASE SOFTWARE (fc4)\nInitializing flash...\nLoading \"flash:"+(cfg.boot&&flash.includes(cfg.boot)?cfg.boot:IMG_ACT)+"\"...\n########################################## [OK]\n\nPress RETURN to get started!","dim");
  imgRun=cfg.boot&&flash.includes(cfg.boot)?cfg.boot:IMG_ACT;dyn={};errdis={};
  pend={tipo:"return"};
}
function pendiente(v){
  const p=pend;pend=null;const vv=v.trim();
  switch(p.tipo){
  case "enable":if(vv===(cfg.enableSecret||cfg.enablePw)){mode="priv"}else{p.n=(p.n||0)+1;if(p.n<3){escribe("Password:");pend=p}else escribe("% Bad secrets","err")}break;
  case "conPw":if(vv===cfg.con.pw){sesion=true;mode="user"}else{escribe("% Login invalid\n\nPassword:","err");pend=p}break;
  case "return":entrada();break;
  case "conf":if(!vv||"terminal".startsWith(vv.toLowerCase())){escribe("Enter configuration commands, one per line.  End with CNTL/Z.");mode="config"}else escribe("?Must be \"terminal\", \"memory\" or \"network\"","err");break;
  case "copyRS":if(vv===""||vv==="startup-config")guarda();else escribe("%Error: nombre de destino no válido.","err");break;
  case "nada":escribe("[OK]","ok");break;
  case "erase":escribe("[OK]\nErase of nvram: complete","ok");startup=null;log("%SYS-7-NV_BLOCK_INIT: Initialized the geometry of nvram");break;
  case "reloadSave":if(/^y/i.test(vv)){guarda();}else if(!/^n/i.test(vv)){escribe("% Please answer 'yes' or 'no'.\nSystem configuration has been modified. Save? [yes/no]:","err");pend=p;break}
    escribe("Proceed with reload? [confirm]");pend={tipo:"reload"};break;
  case "reload":if(vv&&!/^y/i.test(vv)){break}cfg=startup?clon(startup):def();mode="user";arranca();break;
  case "rsa":rsaHecho(+vv||512);break;
  case "tftpUp":if(p.paso===0){p.ip=vv;escribe(`Destination filename [${cfg.host.toLowerCase()==="switch"?"switch":cfg.host}-confg]? `);p.paso=1;pend=p;break}
    {const nom=vv||`${cfg.host}-confg`;if(p.ip!=="192.168.1.50"||!vlanUp()||!cfg.vlan1.ip){escribe(`\nWriting running-config....\n%Error opening tftp://${p.ip}/${nom} (Timed out)`,"err");break}
     tftp[nom]=clon(cfg);escribe(`\nWriting running-config....!!\n[OK - ${1100+JSON.stringify(cfg).length%900} bytes]`,"ok");onChange("tftp")}break;
  case "tftpDown":if(p.paso===0){p.ip=vv;escribe("Source filename []? ");p.paso=1;pend=p;break}
    if(p.paso===1){p.src=vv;escribe(`Destination filename [${p.dest==="flash"?vv:p.dest==="run"?"running-config":"startup-config"}]? `);p.paso=2;pend=p;break}
    {const ok=p.ip==="192.168.1.50"&&vlanUp()&&cfg.vlan1.ip;
     if(p.dest==="flash"){if(!ok||!IMG_SRV.includes(p.src)){escribe(`%Error opening tftp://${p.ip}/${p.src} (${ok?"No such file or directory":"Timed out"})`,"err");break}
       if(flash.includes(p.src)){escribe(`%Warning: There is a file already existing with this name\nDo you want to over write? [confirm]`);pend={tipo:"sobrescribe",src:p.src};break}
       escribe(`Accessing tftp://${p.ip}/${p.src}...\nLoading ${p.src} from ${p.ip}: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n[OK - 4670455 bytes]\n\n4670455 bytes copied in 5.3 secs`,"ok");flash.push(p.src);break}
     if(!ok||!tftp[p.src]){escribe(`%Error opening tftp://${p.ip}/${p.src} (${ok?"No such file or directory":"Timed out"})`,"err");break}
     escribe(`Accessing tftp://${p.ip}/${p.src}...\nLoading ${p.src} from ${p.ip}: !\n[OK - ${1100+JSON.stringify(tftp[p.src]).length%900} bytes]`,"ok");
     if(p.dest==="start"){startup=clon(tftp[p.src]);break}
     fusiona(tftp[p.src]);}break;
  case "sobrescribe":if(vv&&!/^y/i.test(vv))break;escribe("Loading ... [OK]\n4670455 bytes copied","ok");break;
  }
}
function fusiona(s){ // copy tftp: running-config fusiona: no borra lo que ya existe
  const c=clon(s);
  ["host","enableSecret","enablePw","domain","rsa","sshv2","pwEnc","banner","gw","boot"].forEach(k=>{if(c[k])cfg[k]=c[k]});
  if(c.aging!==300)cfg.aging=c.aging;if(c.stpPri!==32768)cfg.stpPri=c.stpPri;
  ["con","vty"].forEach(l=>Object.keys(c[l]).forEach(k=>{if(c[l][k]&&c[l][k]!=="all")cfg[l][k]=c[l][k]}));
  Object.assign(cfg.users,c.users);
  PORTS.forEach(p=>{const a=cfg.ifs[p],b=c.ifs[p];if(b.desc)a.desc=b.desc;if(b.access)a.access=true;if(b.shut)a.shut=true;if(b.ps.on)a.ps=b.ps});
  if(c.vlan1.ip){cfg.vlan1.ip=c.vlan1.ip;cfg.vlan1.mask=c.vlan1.mask}if(!c.vlan1.shut)cfg.vlan1.shut=false;
  c.statics.forEach(x=>{if(!cfg.statics.some(y=>y.mac===x.mac))cfg.statics.push(x)});
}
const AYUDA={user:[["enable","Turn on privileged commands"],["exit","Exit from the EXEC"],["ping","Send echo messages"],["show","(solo en modo privilegiado en este curso)"]],
 priv:[["clear","Reset functions"],["configure","Enter configuration mode"],["copy","Copy from one file to another"],["disable","Turn off privileged commands"],["erase","Erase a filesystem"],["exit","Exit from the EXEC"],["ping","Send echo messages"],["reload","Halt and perform a cold restart"],["show","Show running system information"],["write","Write running configuration to memory"]],
 config:[["banner","Define a login banner"],["boot","Boot Commands"],["crypto","Encryption module"],["do","To run exec commands in config mode"],["enable","Modify enable password parameters"],["end","Exit from configure mode"],["exit","Exit from configure mode"],["hostname","Set system's network name"],["interface","Select an interface to configure"],["ip","Global IP configuration subcommands"],["line","Configure a terminal line"],["mac","MAC configuration"],["no","Negate a command or set its defaults"],["service","Modify use of network based services"],["spanning-tree","Spanning Tree Subsystem"],["username","Establish User Name Authentication"]],
 if:[["description","Interface specific description"],["exit","Exit from interface configuration mode"],["ip","Interface Internet Protocol config commands"],["no","Negate a command or set its defaults"],["shutdown","Shutdown the selected interface"],["switchport","Set switching mode characteristics"]],
 line:[["exit","Exit from line configuration mode"],["login","Enable password checking"],["no","Negate a command or set its defaults"],["password","Set a password"],["transport","Define transport protocols for line"]]};
AYUDA.range=AYUDA.if;
function ayuda(toks){
  if(toks.length>=2&&/^int/i.test(toks[0])&&mode==="config"){escribe("  Ethernet         IEEE 802.3\n  FastEthernet     FastEthernet IEEE 802.3\n  GigabitEthernet  GigabitEthernet IEEE 802.3z\n  Port-channel     Ethernet Channel of interfaces\n  Vlan             Catalyst Vlans\n  range            interface range command");return}
  if(toks.length>=2&&/^sh/i.test(toks[0])){escribe("  flash:          display information about flash: file system\n  interfaces      Interface status and configuration\n  ip              IP information\n  logging         Show the contents of logging buffers\n  mac             MAC configuration\n  port-security   Show secure port information\n  running-config  Current operating configuration\n  spanning-tree   Spanning tree topology\n  startup-config  Contents of startup configuration\n  version         System hardware and software status");return}
  escribe("Exec commands:\n"+AYUDA[mode].map(([c,d])=>"  "+c.padEnd(15)+d).join("\n"));
}
const hist=[];
/* ---------- API ---------- */
return {
  init(salida,cambio){out=salida;onChange=cambio||onChange;escribe("Switch con0 is now available\n\nPress RETURN to get started.","dim");pend={tipo:"return"}},
  prompt:()=>pend?(pend.tipo==="return"?"":""):prompt(),
  oculto:()=>pend&&["enable","conPw"].includes(pend.tipo),
  linea(v){
    if(pend){const tipo=pend.tipo;out((this.oculto()?"":v),"eco");pendiente(v);onChange(tipo);return}
    out(prompt()+v,"eco");if(v.trim())hist.push(v);ejecuta(v);onChange("cmd");
  },
  completa(v){ // tabulador: completa la última palabra si es única
    const toks=v.split(/\s+/);const ult=toks.pop();if(!ult)return v;
    const dic=["enable","configure","terminal","interface","fastEthernet","gigabitEthernet","range","vlan","hostname","description","shutdown","running-config","startup-config","show","copy","mac","address-table","dynamic","static","aging-time","switchport","port-security","maximum","mac-address","sticky","violation","restrict","protect","line","console","vty","password","login","local","transport","input","username","secret","domain-name","crypto","generate","rsa","modulus","service","password-encryption","banner","motd","spanning-tree","priority","root","primary","secondary","version","interfaces","status","brief","flash:","logging","reload","erase","tftp:","clear","access","mode","address","ssh"];
    const c=dic.filter(d=>d.toLowerCase().startsWith(ult.toLowerCase()));return c.length===1?[...toks,c[0]].join(" ")+" ":v;
  },
  historial:()=>hist,
  estado:()=>({cfg,startup,mode,vlanUp:vlanUp(),tftp,flash,errdis,violCount}),
  // eventos externos (botones)
  trafico(origen,destino){ // los PC hablan: el switch aprende
    const puerto={PC1:"FastEthernet0/1",PC2:"FastEthernet0/2",PC3:"FastEthernet0/24",PC4:"FastEthernet0/24",PC5:"FastEthernet0/1"};
    const p=puerto[origen];if(cfg.ifs[p].shut||errdis[p])return "El puerto de "+origen+" está desactivado: el ping no llega.";
    if(origen==="PC5"&&CONECT["FastEthernet0/1"]!=="PC5")return "PC5 no está conectado.";
    const f=cfg.ifs[p],mac=HOSTMAC[origen];
    if(f.ps.on&&!f.ps.macs.includes(mac)){
      if(f.ps.macs.length<f.ps.max){f.ps.macs.push(mac);if(!f.ps.sticky){} }
      else{ // violación
        if(f.ps.viol==="protect")return `Violación en modo protect: las tramas de ${origen} se descartan en silencio. El ping falla, no hay aviso ni contador.`;
        violCount[p]=(violCount[p]||0)+1;
        log(`%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${mac} on port ${p}.`);
        if(f.ps.viol==="shutdown"){errdis[p]=true;log(`%PM-4-ERR_DISABLE: psecure-violation error detected on ${corto(p)}, putting ${corto(p)} in err-disable state\n%LINK-3-UPDOWN: Interface ${p}, changed state to down`);onChange("cmd");return `Violación en modo shutdown: el puerto pasa a <b>err-disabled</b> (enlace en rojo). El ping falla.`}
        onChange("cmd");return `Violación en modo restrict: se descartan las tramas, se registra el aviso y sube el contador (${violCount[p]}). El puerto sigue activo. El ping falla.`}
    }
    dyn[mac]=p;
    const d={PC1:"FastEthernet0/1",PC2:"FastEthernet0/2",PC3:"FastEthernet0/24",PC4:"FastEthernet0/24"}[destino];
    if(d&&!cfg.ifs[d].shut&&!errdis[d])dyn[HOSTMAC[destino]]=d;
    onChange("cmd");return `${origen} → ${destino}: el ping responde y el switch aprende las MAC de los dos.`;
  },
  conecta(pc){CONECT["FastEthernet0/1"]=pc;onChange("cmd")},
  remoto(tipo){ // pruebas desde PC3
    if(!cfg.vlan1.ip||!vlanUp())return "% Connection timed out; remote host not responding (el switch no tiene IP de administración activa).";
    if(tipo==="telnet"){
      if(cfg.vty.transport==="ssh")return "% Connection refused by remote host (las líneas VTY solo aceptan SSH).";
      if(!cfg.vty.pw&&!cfg.vty.local)return "[Connection to 192.168.1.2 closed by foreign host]\n(Password required, but none set: falta password en line vty.)";
      if(!cfg.vty.login&&!cfg.vty.local)return "Trying 192.168.1.2 ...Open\n"+(cfg.banner||"")+"\n"+cfg.host+">   (¡sin pedir contraseña! falta login)";
      return "Trying 192.168.1.2 ...Open\n"+(cfg.banner?cfg.banner+"\n":"")+"\nUser Access Verification\n\n"+(cfg.vty.local?"Username: admin\n":"")+"Password: ********\n"+cfg.host+">   (la contraseña ha viajado sin cifrar)";}
    if(cfg.vty.transport==="telnet")return "% Connection refused by remote host (las VTY solo aceptan Telnet).";
    if(!cfg.rsa)return "% Connection refused by remote host (no hay claves RSA: SSH no está activo).";
    if(!cfg.vty.local||!Object.keys(cfg.users).length)return "% Connection refused (SSH necesita login local y un usuario creado con username).";
    return "Password: ********\n"+(cfg.banner?cfg.banner+"\n":"")+cfg.host+">   (sesión cifrada con SSH)";
  }
};
})();
