const test = require("node:test");
const assert = require("node:assert");
const { mezclar, hexARgb } = require("../mezcla.js");

// Valores de referencia generados con mezcla.py (misma lógica).
const CASOS_PYTHON = [
  { in: [["#141414", 50], ["#F2F2EE", 50]], out: "#B2B2AF" },
  { in: [["#FF0000", 1], ["#0000FF", 1]], out: "#BC00BC" },
  { in: [["#1F3A78", 30], ["#E0462B", 45], ["#E6D21E", 25]], out: "#C27C4B" },
  { in: [["#7A1F2B", 10], ["#1E8C8A", 90]], out: "#318684" },
  { in: [["#E9E4D4", 33], ["#B07A3A", 33], ["#2FD3C8", 34]], out: "#AEC2AF" },
];

test("coincide con la implementación Python", () => {
  for (const c of CASOS_PYTHON) assert.strictEqual(mezclar(c.in), c.out);
});

test("un solo color devuelve el mismo color", () => {
  assert.strictEqual(mezclar([["#1F3A78", 100]]), "#1F3A78");
});

test("los pesos se normalizan", () => {
  assert.strictEqual(mezclar([["#FF0000", 1], ["#0000FF", 1]]), mezclar([["#FF0000", 50], ["#0000FF", 50]]));
});

test("peso cero no influye", () => {
  assert.strictEqual(mezclar([["#FF0000", 100], ["#0000FF", 0]]), "#FF0000");
});

test("todo cero lanza error", () => {
  assert.throws(() => mezclar([["#FF0000", 0], ["#0000FF", 0]]));
});

test("hex inválido lanza error", () => {
  assert.throws(() => hexARgb("#FFF"));
});
