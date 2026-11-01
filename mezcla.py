"""Cálculo del color resultante de mezclar pinturas.

Aproximación: promedio ponderado en espacio lineal (gamma removida).
No simula la mezcla sustractiva real de pigmentos; sirve como referencia visual.
"""


def hex_a_rgb(color: str) -> tuple[int, int, int]:
    h = color.lstrip("#")
    if len(h) != 6:
        raise ValueError(f"Color hex no válido: {color!r}")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_a_hex(rgb) -> str:
    return "#%02X%02X%02X" % tuple(max(0, min(255, round(c))) for c in rgb)


def _a_lineal(c: float) -> float:
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _a_srgb(l: float) -> float:
    v = 12.92 * l if l <= 0.0031308 else 1.055 * (l ** (1 / 2.4)) - 0.055
    return v * 255.0


def mezclar(componentes: list[tuple[str, float]]) -> str:
    """componentes: lista de (hex, peso). Los pesos se normalizan a 100 %."""
    activos = [(h, p) for h, p in componentes if p > 0]
    total = sum(p for _, p in activos)
    if not activos or total <= 0:
        raise ValueError("Ninguna pintura tiene proporción mayor que 0")

    acumulado = [0.0, 0.0, 0.0]
    for color, peso in activos:
        w = peso / total
        lineal = [_a_lineal(c) for c in hex_a_rgb(color)]
        acumulado = [a + w * l for a, l in zip(acumulado, lineal)]

    return rgb_a_hex([_a_srgb(c) for c in acumulado])
