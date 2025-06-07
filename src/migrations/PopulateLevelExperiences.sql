-- Script para popular la tabla level_experiences con datos iniciales
-- Sistema de niveles personalizado:
-- - Ganar combate: +2 experiencia
-- - Perder combate: +1 experiencia
-- - Nivel 1→2: 5 puntos
-- - Cada nivel siguiente necesita 1 punto más que el anterior

INSERT INTO level_experiences (level, experience) VALUES
(1, 0),        -- Nivel 1: Sin experiencia (inicial)
(2, 5),        -- Nivel 2: 5 exp (3 victorias o 5 derrotas)
(3, 11),       -- Nivel 3: 11 exp total (6 exp para subir: 3 victorias)
(4, 18),       -- Nivel 4: 18 exp total (7 exp para subir)
(5, 26),       -- Nivel 5: 26 exp total (8 exp para subir)
(6, 35),       -- Nivel 6: 35 exp total (9 exp para subir)
(7, 45),       -- Nivel 7: 45 exp total (10 exp para subir)
(8, 56),       -- Nivel 8: 56 exp total (11 exp para subir)
(9, 68),       -- Nivel 9: 68 exp total (12 exp para subir)
(10, 81),      -- Nivel 10: 81 exp total (13 exp para subir)
(11, 95),      -- Nivel 11: 95 exp total (14 exp para subir)
(12, 110),     -- Nivel 12: 110 exp total (15 exp para subir)
(13, 126),     -- Nivel 13: 126 exp total (16 exp para subir)
(14, 143),     -- Nivel 14: 143 exp total (17 exp para subir)
(15, 161),     -- Nivel 15: 161 exp total (18 exp para subir)
(16, 180),     -- Nivel 16: 180 exp total (19 exp para subir)
(17, 200),     -- Nivel 17: 200 exp total (20 exp para subir)
(18, 221),     -- Nivel 18: 221 exp total (21 exp para subir)
(19, 243),     -- Nivel 19: 243 exp total (22 exp para subir)
(20, 266),     -- Nivel 20: 266 exp total (23 exp para subir)
(21, 290),     -- Nivel 21: 290 exp total (24 exp para subir)
(22, 315),     -- Nivel 22: 315 exp total (25 exp para subir)
(23, 341),     -- Nivel 23: 341 exp total (26 exp para subir)
(24, 368),     -- Nivel 24: 368 exp total (27 exp para subir)
(25, 396),     -- Nivel 25: 396 exp total (28 exp para subir)
(26, 425),     -- Nivel 26: 425 exp total (29 exp para subir)
(27, 455),     -- Nivel 27: 455 exp total (30 exp para subir)
(28, 486),     -- Nivel 28: 486 exp total (31 exp para subir)
(29, 518),     -- Nivel 29: 518 exp total (32 exp para subir)
(30, 551),     -- Nivel 30: 551 exp total (33 exp para subir)
(31, 585),     -- Nivel 31: 585 exp total (34 exp para subir)
(32, 620),     -- Nivel 32: 620 exp total (35 exp para subir)
(33, 656),     -- Nivel 33: 656 exp total (36 exp para subir)
(34, 693),     -- Nivel 34: 693 exp total (37 exp para subir)
(35, 731),     -- Nivel 35: 731 exp total (38 exp para subir)
(36, 770),     -- Nivel 36: 770 exp total (39 exp para subir)
(37, 810),     -- Nivel 37: 810 exp total (40 exp para subir)
(38, 851),     -- Nivel 38: 851 exp total (41 exp para subir)
(39, 893),     -- Nivel 39: 893 exp total (42 exp para subir)
(40, 936),     -- Nivel 40: 936 exp total (43 exp para subir)
(41, 980),     -- Nivel 41: 980 exp total (44 exp para subir)
(42, 1025),    -- Nivel 42: 1025 exp total (45 exp para subir)
(43, 1071),    -- Nivel 43: 1071 exp total (46 exp para subir)
(44, 1118),    -- Nivel 44: 1118 exp total (47 exp para subir)
(45, 1166),    -- Nivel 45: 1166 exp total (48 exp para subir)
(46, 1215),    -- Nivel 46: 1215 exp total (49 exp para subir)
(47, 1265),    -- Nivel 47: 1265 exp total (50 exp para subir)
(48, 1316),    -- Nivel 48: 1316 exp total (51 exp para subir)
(49, 1368),    -- Nivel 49: 1368 exp total (52 exp para subir)
(50, 1421);    -- Nivel 50: 1421 exp total (53 exp para subir)

-- Comentarios sobre la progresión:
-- - Nivel 1→2: 5 exp (3 victorias o 2 victorias + 1 derrota)
-- - Nivel 2→3: 6 exp (3 victorias)
-- - Nivel 3→4: 7 exp (4 victorias o 3 victorias + 1 derrota)
-- - La progresión es lineal: cada nivel requiere 1 punto más que el anterior
-- - Esto mantiene el juego accesible pero con progresión constante
-- - Aproximadamente 3-4 victorias por nivel en promedio
-- - Los primeros niveles son más rápidos para engagement inicial
-- - La progresión se mantiene constante y predecible
