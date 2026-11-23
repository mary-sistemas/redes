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

  document.addEventListener("DOMContentLoaded", initTema);
  return { store, marcas, guardaMarcas, preguntas, test };
})();
