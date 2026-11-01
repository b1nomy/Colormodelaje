(function () {
  "use strict";

  const MIN = 2;
  const MAX = 4;

  const $ = (id) => document.getElementById(id);

  const estado = {
    datos: null,
    porId: new Map(),
    seleccion: [], // ids en orden de selección
    pesos: new Map(), // id -> peso (0-100)
    marcasActivas: new Set(),
  };

  function etiquetaCorta(p) {
    return p.codigo + " " + p.nombre;
  }

  function el(tag, attrs, ...hijos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "text") e.textContent = v;
      else if (k === "class") e.className = v;
      else e.setAttribute(k, v);
    }
    for (const h of hijos) e.append(h);
    return e;
  }

  function textoSobre(hex) {
    const [r, g, b] = Mezcla.hexARgb(hex);
    const brillo = (r * 299 + g * 587 + b * 114) / 1000;
    return brillo > 150 ? "#000" : "#fff";
  }

  // ---- Marcas ------------------------------------------------------------
  function pintarMarcas() {
    const cont = $("marcas");
    cont.replaceChildren();
    for (const marca of estado.datos.marcas) {
      const input = el("input", { type: "checkbox", value: marca });
      input.checked = estado.marcasActivas.has(marca);
      input.addEventListener("change", () => {
        input.checked ? estado.marcasActivas.add(marca) : estado.marcasActivas.delete(marca);
        pintarLista();
      });
      cont.append(el("label", {}, input, document.createTextNode(marca)));
    }
  }

  // ---- Lista de pinturas ---------------------------------------------------
  function pintarLista() {
    const consulta = $("busqueda").value.trim().toLowerCase();
    const lista = $("lista");
    lista.replaceChildren();

    const visibles = estado.datos.pinturas.filter((p) => {
      if (!estado.marcasActivas.has(p.marca)) return false;
      if (!consulta) return true;
      return p.codigo.toLowerCase().includes(consulta) || p.nombre.toLowerCase().includes(consulta);
    });

    // Las elegidas siempre aparecen, aunque el filtro las oculte.
    const idsVisibles = new Set(visibles.map((p) => p.id));
    const elegidasOcultas = estado.seleccion
      .map((id) => estado.porId.get(id))
      .filter((p) => !idsVisibles.has(p.id));
    const todas = [...visibles, ...elegidasOcultas];

    const lleno = estado.seleccion.length >= MAX;
    for (const p of todas) {
      const marcada = estado.pesos.has(p.id);
      const bloqueada = lleno && !marcada;
      const input = el("input", { type: "checkbox", value: p.id });
      input.checked = marcada;
      input.disabled = bloqueada;
      input.addEventListener("change", () => alternar(p.id, input.checked));

      const etiqueta = el(
        "label",
        { "aria-disabled": String(bloqueada) },
        input,
        el("span", { class: "chip", style: "background:" + p.hex, "aria-hidden": "true" }),
        el("span", { class: "codigo", text: p.codigo }),
        el("span", {},
          document.createTextNode(p.nombre + " "),
          el("span", { class: "linea", text: "· " + p.marca + " " + p.linea })
        )
      );
      lista.append(el("li", {}, etiqueta));
    }

    if (todas.length === 0) {
      lista.append(el("li", { class: "ayuda", text: "Ninguna pintura coincide con la búsqueda." }));
    }

    $("contador").textContent =
      estado.seleccion.length + " de " + MAX + " elegidas · " + visibles.length + " visibles";
  }

  function alternar(id, activar) {
    if (activar) {
      if (estado.seleccion.length >= MAX) return;
      estado.seleccion.push(id);
      estado.pesos.set(id, Math.floor(100 / estado.seleccion.length));
    } else {
      estado.seleccion = estado.seleccion.filter((x) => x !== id);
      estado.pesos.delete(id);
    }
    pintarLista();
    pintarDeslizadores();
    actualizar();
  }

  // ---- Deslizadores --------------------------------------------------------
  function pintarDeslizadores() {
    const cont = $("deslizadores");
    cont.replaceChildren();
    if (estado.seleccion.length < MIN) {
      cont.append(el("p", { class: "ayuda", text: "Elige al menos 2 pinturas para ajustar proporciones." }));
      return;
    }
    for (const id of estado.seleccion) {
      const p = estado.porId.get(id);
      const salida = el("output", { text: estado.pesos.get(id) + " %" });
      const rango = el("input", { type: "range", min: "0", max: "100", step: "1", value: String(estado.pesos.get(id)) });
      rango.setAttribute("aria-label", etiquetaCorta(p));
      rango.addEventListener("input", () => {
        estado.pesos.set(id, Number(rango.value));
        salida.textContent = rango.value + " %";
        actualizar();
      });
      cont.append(
        el("div", { class: "deslizador" },
          el("div", { class: "cabeza" },
            el("span", { text: p.marca + " " + etiquetaCorta(p) }),
            salida
          ),
          rango
        )
      );
    }
  }

  // ---- Resultado -----------------------------------------------------------
  function actualizar() {
    const muestra = $("muestra");
    const estadoTxt = $("estado");
    const tabla = $("receta");
    tabla.replaceChildren();

    if (estado.seleccion.length < MIN) {
      muestra.style.background = "#ddd";
      muestra.style.color = "#000";
      muestra.textContent = "Elige de 2 a 4 pinturas";
      estadoTxt.textContent = "";
      return;
    }

    const total = estado.seleccion.reduce((s, id) => s + estado.pesos.get(id), 0);
    if (total === 0) {
      muestra.textContent = "—";
      estadoTxt.className = "estado error";
      estadoTxt.textContent = "Ajusta al menos un deslizador por encima de 0 %.";
      return;
    }

    const componentes = estado.seleccion.map((id) => [estado.porId.get(id).hex, estado.pesos.get(id)]);
    const color = Mezcla.mezclar(componentes);
    muestra.style.background = color;
    muestra.style.color = textoSobre(color);
    muestra.textContent = color;

    estadoTxt.className = "estado";
    estadoTxt.textContent =
      total === 100 ? "" : "Suma actual: " + total + " %. Se normaliza a 100 %.";

    for (const id of estado.seleccion) {
      const p = estado.porId.get(id);
      const porcentaje = Math.round((estado.pesos.get(id) / total) * 1000) / 10;
      tabla.append(
        el("tr", {},
          el("td", { text: p.marca }),
          el("td", { text: p.linea }),
          el("td", { text: p.codigo }),
          el("td", { text: p.nombre }),
          el("td", { text: String(porcentaje) })
        )
      );
    }
  }

  // ---- Arranque ------------------------------------------------------------
  function iniciar(datos) {
    estado.datos = datos;
    estado.porId = new Map(datos.pinturas.map((p) => [p.id, p]));
    estado.marcasActivas = new Set(datos.marcas);
    $("busqueda").addEventListener("input", pintarLista);
    pintarMarcas();
    pintarLista();
    pintarDeslizadores();
    actualizar();
  }

  fetch("data/pinturas.json")
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(iniciar)
    .catch((e) => {
      $("estado").className = "estado error";
      $("estado").textContent = "No se pudieron cargar las pinturas: " + e.message;
    });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
