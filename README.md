# Mezclador de pinturas (miniaturas)

App local en Streamlit para elegir de 2 a 4 pinturas, ajustar su proporción con deslizadores y ver el color resultante en tiempo real, junto con la receta exacta.

## Puesta en marcha

```bash
cd pintura-mezclas
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

## Usarla desde el móvil (misma red Wi-Fi)

```bash
streamlit run app.py --server.address 0.0.0.0
```

Después abre en el móvil `http://<IP-del-ordenador>:8501`.

## Tests

```bash
python -m unittest test_mezcla -v
```

## Estructura de datos

`data/pinturas.json`:

- `marcas`: lista de marcas que aparecen en el filtro.
- `pinturas`: cada entrada tiene `id` (único), `marca`, `linea`, `codigo`, `nombre`, `hex` y opcionalmente `notas`.

Para añadir pinturas (Citadel, AK, más referencias de Vallejo) basta con añadir entradas al array. Las pinturas nuevas aparecen en la búsqueda sin tocar el código.

### Advertencias sobre los datos

- Los códigos y nombres iniciales proceden de listados de tiendas, no de la carta oficial. Verifícalos con el bote.
- Los valores `hex` son aproximaciones visuales, no colores oficiales.
- El cálculo es un promedio ponderado en espacio lineal. No simula la mezcla sustractiva real de pigmentos, así que el resultado es orientativo.
