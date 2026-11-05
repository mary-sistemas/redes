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

  document.addEventListener("DOMContentLoaded", initTema);
  return { store, marcas, guardaMarcas };
})();
