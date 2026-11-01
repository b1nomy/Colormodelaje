import unittest

from mezcla import hex_a_rgb, mezclar


class TestMezclar(unittest.TestCase):
    def test_un_solo_color_devuelve_el_mismo(self):
        self.assertEqual(mezclar([("#1F3A78", 100)]), "#1F3A78")

    def test_blanco_y_negro_al_50_dan_gris_neutro(self):
        r, g, b = hex_a_rgb(mezclar([("#FFFFFF", 50), ("#000000", 50)]))
        self.assertEqual(r, g)
        self.assertEqual(g, b)
        self.assertTrue(100 < r < 200)

    def test_los_pesos_se_normalizan(self):
        self.assertEqual(
            mezclar([("#FF0000", 1), ("#0000FF", 1)]),
            mezclar([("#FF0000", 50), ("#0000FF", 50)]),
        )

    def test_peso_cero_no_influye(self):
        self.assertEqual(
            mezclar([("#FF0000", 100), ("#0000FF", 0)]),
            "#FF0000",
        )

    def test_todo_cero_lanza_error(self):
        with self.assertRaises(ValueError):
            mezclar([("#FF0000", 0), ("#0000FF", 0)])

    def test_hex_invalido_lanza_error(self):
        with self.assertRaises(ValueError):
            hex_a_rgb("#FFF")


if __name__ == "__main__":
    unittest.main()
