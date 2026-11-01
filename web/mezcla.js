/*
 * Cálculo del color resultante de mezclar pinturas.
 * Mismo algoritmo que mezcla.py: promedio ponderado en espacio lineal.
 * Aproximación visual; no simula la mezcla sustractiva real de pigmentos.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.Mezcla = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Redondeo "banker's" igual que round() de Python, para resultados idénticos.
  function redondearParPar(x) {
    const f = Math.floor(x);
    const d = x - f;
    if (d > 0.5) return f + 1;
    if (d < 0.5) return f;
    return f % 2 === 0 ? f : f + 1;
  }

  function hexARgb(color) {
    const h = String(color).replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(h)) {
      throw new Error("Color hex no válido: " + color);
    }
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }

  function rgbAHex(rgb) {
    return (
      "#" +
      rgb
        .map((c) => Math.max(0, Math.min(255, redondearParPar(c))).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }

  function aLineal(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function aSrgb(l) {
    const v = l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
    return v * 255;
  }

  /** componentes: array de [hex, peso]. Los pesos se normalizan a 100 %. */
  function mezclar(componentes) {
    const activos = componentes.filter(([, p]) => p > 0);
    const total = activos.reduce((s, [, p]) => s + p, 0);
    if (activos.length === 0 || total <= 0) {
      throw new Error("Ninguna pintura tiene proporción mayor que 0");
    }
    let acc = [0, 0, 0];
    for (const [color, peso] of activos) {
      const w = peso / total;
      const lineal = hexARgb(color).map(aLineal);
      acc = acc.map((a, i) => a + w * lineal[i]);
    }
    return rgbAHex(acc.map(aSrgb));
  }

  return { hexARgb, rgbAHex, mezclar };
});
