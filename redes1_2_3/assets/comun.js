/* Repaso de Redes · utilidades comunes (tema claro/oscuro y progreso guardado en el navegador) */
window.Repaso = (function () {
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // Botón de tema: alterna claro / oscuro y lo recuerda
  function initTema() {
    const btn = document.getElementById("temaBtn");
    if (!btn) return;
    const actual = () => document.documentElement.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const pinta = () => { btn.textContent = actual() === "dark" ? "Modo claro" : "Modo oscuro"; };
    btn.addEventListener("click", () => {
      const nuevo = actual() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nuevo;
      store.set("redes:tema", nuevo);
      pinta();
    });
    pinta();
  }

  // Progreso de un tema: { "0": "ok", "3": "mal", ... }
  const clave = id => "redes:marcas:" + id;
  const marcas = id => store.get(clave(id), {});
  const guardaMarcas = (id, m) => store.set(clave(id), m);

  // Bloque de preguntas tipo examen: respuesta propia, ver solución, autoevaluación,
  // botón para ver todas las respuestas de golpe y marcador guardado.
  function preguntas(tema, pregs) {
    const $ = s => document.querySelector(s);
    let m = marcas(tema), todas = false;
    const pintaMarcador = () => {
      const v = Object.values(m), ok = v.filter(x => x === "ok").length;
      $("#marcador").textContent = v.length
        ? `Te has marcado ${v.length} de ${pregs.length}: ${ok} bien, ${v.length - ok} por repasar.`
        : `${pregs.length} preguntas. Aún no te has marcado ninguna.`;
    };
    const pintaTodas = () => { $("#verTodas").textContent = todas ? "Ocultar todas las respuestas" : "Ver todas las respuestas"; };
    function dibuja() {
      $("#preguntas").innerHTML = pregs.map(([q, a], i) => `<div class="panel preg"><h3>${q}</h3>
       <label class="eyebrow" for="r${i}">Tu respuesta</label><textarea id="r${i}"></textarea>
       <div class="stepper"><button class="btn" data-ver="${i}">Ver respuesta</button></div>
       <div class="resp" id="s${i}" hidden>${a}</div>
       <div class="autoev" id="e${i}" hidden>¿La tenías bien?
        <button class="btn okb${m[i] === "ok" ? " on" : ""}" data-m="${i}" data-v="ok">Sí</button>
        <button class="btn badb${m[i] === "mal" ? " on" : ""}" data-m="${i}" data-v="mal">No, a repasar</button></div></div>`).join("");
      document.querySelectorAll("[data-ver]").forEach(b => b.onclick = () => {
        const i = b.dataset.ver; $("#s" + i).hidden = false; $("#e" + i).hidden = false; b.disabled = true; });
      document.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
        m[b.dataset.m] = b.dataset.v; guardaMarcas(tema, m);
        b.parentNode.querySelectorAll("[data-m]").forEach(x => x.classList.toggle("on", x === b)); pintaMarcador(); });
    }
    $("#verTodas").onclick = () => {
      todas = !todas;
      pregs.forEach((_, i) => { $("#s" + i).hidden = !todas; $("#e" + i).hidden = !todas;
        document.querySelector(`[data-ver="${i}"]`).disabled = todas; });
      pintaTodas();
    };
    $("#borrar").onclick = () => { m = {}; guardaMarcas(tema, m); todas = false; dibuja(); pintaMarcador(); pintaTodas(); };
    dibuja(); pintaMarcador(); pintaTodas();
  }

  // Mini test de opciones: #preQ (enunciado), #preOps, #preFb, #preOtra, #preCuenta.
  // Cada caso: {q, ok, exp, ops?}; si el caso no trae ops, se usan las comunes.
  function test(pre, casos, opsComunes) {
    const $ = s => document.querySelector(s);
    let actual = null, bien = 0, total = 0;
    function otro() {
      let c; do { c = casos[Math.floor(Math.random() * casos.length)]; } while (casos.length > 1 && c === actual);
      actual = typeof c === "function" ? c() : c;
      $(`#${pre}Q`).innerHTML = actual.q; $(`#${pre}Fb`).innerHTML = "";
      const ops = actual.ops || opsComunes;
      $(`#${pre}Ops`).innerHTML = ops.map(o => `<button class="btn" data-o="${o.replace(/"/g, "&quot;")}">${o}</button>`).join("");
      $(`#${pre}Ops`).querySelectorAll("button").forEach(b => b.onclick = () => responde(b));
    }
    function responde(b) {
      const ok = b.dataset.o === actual.ok; total++; if (ok) bien++;
      $(`#${pre}Ops`).querySelectorAll("button").forEach(x => { x.disabled = true; if (x.dataset.o === actual.ok) x.classList.add("ok"); });
      if (!ok) b.classList.add("mal");
      $(`#${pre}Fb`).innerHTML = `<span class="fb ${ok ? "ok" : "mal"}">${ok ? "¡Bien!" : "No: es " + actual.ok + "."}</span> ${actual.exp}`;
      $(`#${pre}Cuenta`).textContent = `${bien} de ${total} bien`;
    }
    $(`#${pre}Otra`).onclick = otro; otro();
  }

  // Ordenar pasos: #preLista (botones desordenados), #preFb, #preReset.
  function ordena(pre, pasos) {
    const $ = s => document.querySelector(s);
    let sig = 0, fallos = 0;
    function pinta() {
      sig = 0; fallos = 0;
      const mezcla = pasos.map((t, i) => ({ t, i })).sort(() => Math.random() - .5);
      $(`#${pre}Lista`).innerHTML = mezcla.map(p => `<button class="btn" data-i="${p.i}">${p.t}</button>`).join("");
      $(`#${pre}Fb`).textContent = "Pulsa los pasos en el orden correcto.";
      $(`#${pre}Lista`).querySelectorAll("button").forEach(b => b.onclick = () => {
        if (+b.dataset.i === sig) {
          b.classList.add("ok"); b.disabled = true; b.textContent = (sig + 1) + ". " + pasos[sig]; sig++;
          $(`#${pre}Lista`).appendChild(b);
          [...$(`#${pre}Lista`).querySelectorAll("button:not(.ok)")].forEach(x => $(`#${pre}Lista`).appendChild(x));
          $(`#${pre}Fb`).innerHTML = sig === pasos.length
            ? `<span class="fb ok">¡Completo!</span> ${fallos ? fallos + " fallo" + (fallos > 1 ? "s" : "") + " por el camino." : "Sin ningún fallo."}`
            : "Bien. Sigue.";
        } else { fallos++; $(`#${pre}Fb`).innerHTML = `<span class="fb mal">Ese no va ahora.</span> Piensa qué hace falta antes.`; }
      });
    }
    $(`#${pre}Reset`).onclick = pinta; pinta();
  }

  // Animaciones SVG: mueve una "trama" por una lista de puntos. Devuelve una promesa.
  const NS = "http://www.w3.org/2000/svg";
  const sinMov = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let velocidad = 1;
  function el(tag, attrs, padre) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function trama(svg, pts, { color = "var(--accent)", txt = "", dur = 900 } = {}) {
    return new Promise(res => {
      const g = el("g", { class: "pkt" }, svg);
      const w = Math.max(30, txt.length * 6.4 + 10);
      el("rect", { x: -w / 2, y: -9, width: w, height: 18, rx: 4, style: `fill:${color}` }, g);
      const t = el("text", { x: 0, y: 4, "text-anchor": "middle" }, g); t.textContent = txt;
      const seg = []; let L = 0;
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
      const pon = p => g.setAttribute("transform", `translate(${p[0]},${p[1]})`);
      if (sinMov() || L === 0) { pon(pts[pts.length - 1]); setTimeout(() => { g.remove(); res(); }, 150); return; }
      const t0 = performance.now(), D = dur / velocidad;
      (function paso(ahora) {
        let f = Math.min(1, (ahora - t0) / D), d = f * L, i = 0;
        while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
        const a = pts[i], b = pts[i + 1], k = seg[i] ? d / seg[i] : 1;
        pon([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
        if (f < 1) requestAnimationFrame(paso); else { setTimeout(() => { g.remove(); res(); }, 120); }
      })(t0);
    });
  }
  const espera = ms => new Promise(r => setTimeout(r, sinMov() ? 0 : ms / velocidad));

  document.addEventListener("DOMContentLoaded", initTema);
  return { store, marcas, guardaMarcas, preguntas, test, ordena, el, trama, espera,
           setVelocidad: v => { velocidad = v; } };
})();
