import json
import pathlib

import pandas as pd
import streamlit as st

from mezcla import mezclar

RUTA_DATOS = pathlib.Path(__file__).parent / "data" / "pinturas.json"
MIN_PINTURAS, MAX_PINTURAS = 2, 4


@st.cache_data
def cargar_datos() -> dict:
    return json.loads(RUTA_DATOS.read_text(encoding="utf-8"))


def texto_sobre(color_hex: str) -> str:
    r, g, b = (int(color_hex[i:i + 2], 16) for i in (1, 3, 5))
    brillo = (r * 299 + g * 587 + b * 114) / 1000
    return "#000000" if brillo > 150 else "#FFFFFF"


def etiqueta(p: dict) -> str:
    return f'{p["marca"]} {p["linea"]} · {p["codigo"]} {p["nombre"]}'


st.set_page_config(page_title="Mezclador de pinturas", page_icon="🎨", layout="centered")
st.title("🎨 Mezclador de pinturas")

datos = cargar_datos()
pinturas = datos["pinturas"]
por_id = {p["id"]: p for p in pinturas}

# ---- Filtros de búsqueda -------------------------------------------------
st.sidebar.header("Buscar pinturas")
marcas = st.sidebar.multiselect("Marcas", datos["marcas"], default=datos["marcas"])
texto = st.sidebar.text_input("Código o nombre", placeholder="ej. 70.950 o Black")
consulta = texto.strip().lower()


def coincide(p: dict) -> bool:
    if p["marca"] not in marcas:
        return False
    if not consulta:
        return True
    return consulta in p["codigo"].lower() or consulta in p["nombre"].lower()


ids_filtrados = [p["id"] for p in pinturas if coincide(p)]
seleccion_actual = st.session_state.get("seleccion", [])
# Las pinturas ya elegidas deben seguir visibles aunque el filtro cambie.
opciones = ids_filtrados + [i for i in seleccion_actual if i not in ids_filtrados]

st.sidebar.caption(f"{len(ids_filtrados)} pinturas encontradas")

# ---- Selección de pinturas ------------------------------------------------
ids = st.multiselect(
    f"Pinturas ({MIN_PINTURAS} a {MAX_PINTURAS})",
    options=opciones,
    format_func=lambda i: etiqueta(por_id[i]),
    max_selections=MAX_PINTURAS,
    key="seleccion",
)

if len(ids) < MIN_PINTURAS:
    st.info(f"Selecciona entre {MIN_PINTURAS} y {MAX_PINTURAS} pinturas para empezar.")
    st.stop()

# ---- Proporciones ---------------------------------------------------------
st.subheader("Proporciones")
valor_inicial = 100 // len(ids)
pesos = {}
for i in ids:
    p = por_id[i]
    pesos[i] = st.slider(
        f'{p["codigo"]} {p["nombre"]}',
        min_value=0,
        max_value=100,
        value=valor_inicial,
        key=f"peso_{i}",
    )

total = sum(pesos.values())
if total == 0:
    st.warning("Ajusta al menos un deslizador por encima de 0 %.")
    st.stop()

if total != 100:
    st.caption(f"Suma actual: {total} %. Las proporciones se normalizan a 100 %.")

# ---- Resultado --------------------------------------------------------------
color = mezclar([(por_id[i]["hex"], pesos[i]) for i in ids])
color_texto = texto_sobre(color)

st.subheader("Color resultante")
st.markdown(
    f"""
    <div style="background:{color};height:260px;border-radius:18px;
                border:2px solid #444;display:flex;align-items:flex-end;
                justify-content:center;padding-bottom:16px;
                color:{color_texto};font-family:monospace;font-size:1.4rem;">
        {color}
    </div>
    """,
    unsafe_allow_html=True,
)

st.subheader("Receta")
filas = []
for i in ids:
    p = por_id[i]
    filas.append(
        {
            "Marca": p["marca"],
            "Línea": p["linea"],
            "Código": p["codigo"],
            "Nombre": p["nombre"],
            "Proporción (%)": round(pesos[i] / total * 100, 1),
        }
    )
st.dataframe(pd.DataFrame(filas), hide_index=True, use_container_width=True)
