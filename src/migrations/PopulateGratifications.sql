-- Script para popular la tabla gratifications con datos iniciales
-- Diferentes tipos de gratificaciones disponibles para subir de nivel

INSERT INTO gratifications (name, type, min_level, value_json) VALUES

-- Mejoras de estadísticas (disponibles desde nivel 1)
('Fortaleza del Guerrero', 'stat_boost', 1, '{"strength": 2, "endurance": 1}'),
('Agilidad del Cazador', 'stat_boost', 1, '{"agility": 2, "intellect": 1}'),
('Mente Brillante', 'stat_boost', 1, '{"intellect": 2, "agility": 1}'),
('Resistencia Férrea', 'stat_boost', 1, '{"endurance": 2, "strength": 1}'),
('Equilibrio Perfecto', 'stat_boost', 2, '{"strength": 1, "agility": 1, "intellect": 1}'),
('Poder Absoluto', 'stat_boost', 5, '{"strength": 3}'),
('Velocidad Suprema', 'stat_boost', 5, '{"agility": 3}'),
('Sabiduría Ancestral', 'stat_boost', 5, '{"intellect": 3}'),
('Vitalidad Infinita', 'stat_boost', 5, '{"endurance": 3}'),

-- Armas básicas (disponibles desde nivel 1)
('Espada de Hierro', 'weapon', 1, '{"damage": 15, "type": "sword", "special": null}'),
('Martillo de Guerra', 'weapon', 1, '{"damage": 18, "type": "hammer", "special": "stun_chance"}'),
('Arco Élfico', 'weapon', 1, '{"damage": 12, "type": "bow", "special": "critical_chance"}'),
('Daga Venenosa', 'weapon', 1, '{"damage": 10, "type": "dagger", "special": "poison"}'),

-- Armas avanzadas (nivel 3+)
('Espada Flamígera', 'weapon', 3, '{"damage": 25, "type": "sword", "special": "fire_damage"}'),
('Hacha del Berserker', 'weapon', 3, '{"damage": 28, "type": "axe", "special": "rage_mode"}'),
('Bastón Arcano', 'weapon', 3, '{"damage": 20, "type": "staff", "special": "mana_boost"}'),

-- Armas legendarias (nivel 10+)
('Excalibur', 'weapon', 10, '{"damage": 40, "type": "sword", "special": "holy_light"}'),
('Mjolnir', 'weapon', 10, '{"damage": 45, "type": "hammer", "special": "lightning"}'),
('Arco de los Vientos', 'weapon', 10, '{"damage": 35, "type": "bow", "special": "wind_arrows"}'),

-- Habilidades básicas (disponibles desde nivel 2)
('Golpe Poderoso', 'skill', 2, '{"effect": "damage_boost", "value": 25, "cooldown": 3}'),
('Curación Menor', 'skill', 2, '{"effect": "heal", "value": 30, "cooldown": 4}'),
('Escudo Mágico', 'skill', 2, '{"effect": "defense_boost", "value": 20, "cooldown": 5}'),
('Velocidad Felina', 'skill', 2, '{"effect": "agility_boost", "value": 15, "cooldown": 3}'),

-- Habilidades intermedias (nivel 5+)
('Golpe Crítico', 'skill', 5, '{"effect": "critical_strike", "value": 50, "cooldown": 5}'),
('Regeneración', 'skill', 5, '{"effect": "heal_over_time", "value": 15, "duration": 3}'),
('Furia Berserker', 'skill', 5, '{"effect": "damage_agility_boost", "value": 30, "cooldown": 6}'),
('Teletransporte', 'skill', 5, '{"effect": "dodge_next_attack", "value": 100, "cooldown": 7}'),

-- Habilidades avanzadas (nivel 10+)
('Tormenta de Fuego', 'skill', 10, '{"effect": "area_damage", "value": 60, "cooldown": 8}'),
('Curación Divina', 'skill', 10, '{"effect": "full_heal", "value": 100, "cooldown": 10}'),
('Tiempo Ralentizado', 'skill', 10, '{"effect": "time_manipulation", "value": 50, "cooldown": 12}'),
('Invocación de Dragón', 'skill', 15, '{"effect": "summon_ally", "value": 80, "cooldown": 15}'),

-- Habilidades legendarias (nivel 20+)
('Poder Divino', 'skill', 20, '{"effect": "god_mode", "value": 200, "cooldown": 20}'),
('Resurreción', 'skill', 25, '{"effect": "revive_on_death", "value": 50, "cooldown": 25}'),
('Dominación Mental', 'skill', 30, '{"effect": "control_enemy", "value": 100, "cooldown": 30}');

-- Comentarios sobre las gratificaciones:
-- - stat_boost: Mejora permanente de estadísticas
-- - weapon: Nueva arma que se añade al inventario
-- - skill: Nueva habilidad activa con cooldown
-- - min_level: Nivel mínimo requerido para que aparezca la gratificación
-- - value_json: Contiene los valores específicos de la gratificación
-- - El sistema elige 2 gratificaciones aleatorias del pool disponible para el nivel
