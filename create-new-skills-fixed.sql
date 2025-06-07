-- Script para crear nuevas skills interesantes en NalgonWarriors - VERSIÓN CORREGIDA
-- Basado en las mecánicas del sistema de combate existente
-- Este script primero inserta las skills en la tabla skills, luego en gratifications
-- CORREGIDO: Uso de sintaxis PostgreSQL para arrays TEXT[] {item} en lugar de ["item"]

-- ==========================================
-- PASO 1: INSERTAR SKILLS EN TABLA SKILLS
-- ==========================================

-- Skills de combate básico (Nivel 1-3)
INSERT INTO skills (name, activation_triggers, effect_json, is_passive, power_value) VALUES
('Golpe Certero', '{"on_attack"}', '{"type": "accuracy_boost", "value": 25, "duration": 1}', false, 15),
('Contraataque Veloz', '{"on_being_attacked"}', '{"type": "counter", "value": 150, "chance": 30}', false, 20),
('Bloqueo Perfecto', '{"on_being_attacked"}', '{"type": "block", "value": 100, "chance": 25}', false, 18),
('Esquiva Sombría', '{"on_being_attacked"}', '{"type": "dodge", "value": 100, "chance": 35}', false, 22),

-- Skills de buff/debuff (Nivel 2-5)
('Grito de Guerra', '{"battle_start", "on_turn"}', '{"type": "damage_boost", "value": 20, "duration": 3}', false, 25),
('Intimidación', '{"battle_start"}', '{"type": "enemy_debuff", "value": -15, "stat": "agility", "duration": 5}', false, 30),
('Concentración Mental', '{"on_turn"}', '{"type": "intelligence_boost", "value": 30, "duration": 2}', false, 28),
('Adrenalina', '{"on_low_hp"}', '{"type": "multi_boost", "agility": 25, "strength": 15, "duration": 3}', false, 35),

-- Skills de combate avanzado (Nivel 5-8)
('Combo Devastador', '{"after_hit"}', '{"type": "combo_chain", "value": 175, "max_hits": 3, "chance": 40}', false, 45),
('Golpe Aturdidor', '{"on_attack"}', '{"type": "stun", "value": 1, "chance": 25}', false, 40),
('Absorción Vital', '{"on_damage_dealt"}', '{"type": "lifesteal", "value": 30, "percentage": true}', false, 50),
('Berserker', '{"on_low_hp"}', '{"type": "damage_taken_boost", "damage_boost": 50, "damage_taken": 25}', false, 55),

-- Skills defensivas (Nivel 3-6)
('Piel de Hierro', '{"passive"}', '{"type": "damage_reduction", "value": 12, "permanent": true}', true, 35),
('Regeneración', '{"end_turn"}', '{"type": "heal", "value": 8, "percentage": false}', true, 30),
('Escudo Mágico', '{"on_being_attacked"}', '{"type": "magic_shield", "value": 20, "duration": 2}', false, 38),
('Segunda Oportunidad', '{"on_death"}', '{"type": "revive", "hp_percentage": 25, "once_per_battle": true}', false, 80),

-- Skills de utilidad (Nivel 4-7)
('Velocidad Sobrenatural', '{"battle_start"}', '{"type": "double_turn_chance", "value": 25, "duration": 999}', true, 60),
('Maestría con Armas', '{"weapon_equipped"}', '{"type": "weapon_damage_boost", "value": 35, "permanent": true}', true, 45),
('Mente Táctica', '{"battle_start"}', '{"type": "skill_cooldown_reduction", "value": 1, "all_skills": true}', true, 50),
('Fortuna del Guerrero', '{"passive"}', '{"type": "critical_chance_boost", "value": 15, "permanent": true}', true, 40),

-- Skills de combate élite (Nivel 8-12)
('Tormenta de Acero', '{"on_turn"}', '{"type": "multi_attack", "hits": 3, "damage_per_hit": 80, "cooldown": 4}', false, 75),
('Furia Imparable', '{"on_turn"}', '{"type": "rage_mode", "damage_boost": 75, "speed_boost": 50, "duration": 3, "cooldown": 6}', false, 85),
('Golpe Ejecutor', '{"on_attack"}', '{"type": "execute", "hp_threshold": 25, "damage_multiplier": 300, "cooldown": 5}', false, 90),
('Tiempo Dilatado', '{"on_turn"}', '{"type": "time_control", "extra_turns": 2, "cooldown": 8}', false, 95),

-- Skills mágicas (Nivel 6-10)
('Rayo Cegador', '{"on_turn"}', '{"type": "magic_damage", "value": 120, "blind_chance": 40, "cooldown": 3}', false, 65),
('Curación Divina', '{"on_turn"}', '{"type": "powerful_heal", "value": 80, "cleanse_debuffs": true, "cooldown": 5}', false, 70),
('Barrera Arcana', '{"battle_start"}', '{"type": "magic_barrier", "absorb_damage": 150, "duration": 5}', false, 68),
('Drenar Energía', '{"on_attack"}', '{"type": "mana_drain", "damage": 60, "heal_self": 30, "cooldown": 3}', false, 55),

-- Skills legendarias (Nivel 12-15)
('Avatar de Guerra', '{"on_turn"}', '{"type": "transformation", "all_stats_boost": 50, "duration": 4, "cooldown": 10}', false, 120),
('Corte Dimensional', '{"on_attack"}', '{"type": "dimensional_strike", "ignore_armor": true, "damage": 200, "cooldown": 6}', false, 110),
('Phoenix Renacido', '{"on_death"}', '{"type": "phoenix_rebirth", "full_heal": true, "damage_aura": 50, "once_per_battle": true}', false, 150),
('Maestro del Tiempo', '{"battle_start"}', '{"type": "time_mastery", "reset_cooldowns": true, "speed_permanent": 100}', true, 140),

-- Skills de soporte (Nivel 5-9)
('Aura Inspiradora', '{"passive"}', '{"type": "aura", "nearby_allies_boost": 20, "radius": 2}', true, 45),
('Bendición del Anciano', '{"battle_start"}', '{"type": "blessing", "random_stat_boost": 40, "duration": 999}', false, 55),
('Maldición del Necromante', '{"on_enemy"}', '{"type": "curse", "all_stats_debuff": -25, "duration": 4, "cooldown": 7}', false, 65),
('Vínculo Espiritual', '{"passive"}', '{"type": "bond", "share_damage": 50, "share_healing": 75}', true, 60);

-- ==========================================
-- PASO 2: INSERTAR EN GRATIFICATIONS
-- ==========================================

-- Skills básicas para level-up (Nivel 1-3)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    1 as min_level,  -- Nivel mínimo ajustable
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Golpe Certero', 'Contraataque Veloz', 'Bloqueo Perfecto', 'Esquiva Sombría'
);

-- Skills de buff/debuff (Nivel 2)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    2 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Grito de Guerra', 'Intimidación', 'Concentración Mental', 'Adrenalina'
);

-- Skills defensivas (Nivel 3)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    3 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Piel de Hierro', 'Regeneración', 'Escudo Mágico', 'Segunda Oportunidad'
);

-- Skills de utilidad (Nivel 4)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    4 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Velocidad Sobrenatural', 'Maestría con Armas', 'Mente Táctica', 'Fortuna del Guerrero'
);

-- Skills de combate avanzado (Nivel 5)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    5 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Combo Devastador', 'Golpe Aturdidor', 'Absorción Vital', 'Berserker',
    'Aura Inspiradora', 'Bendición del Anciano'
);

-- Skills mágicas (Nivel 6)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    6 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Rayo Cegador', 'Curación Divina', 'Barrera Arcana', 'Drenar Energía'
);

-- Skills de soporte avanzado (Nivel 7)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    7 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Maldición del Necromante', 'Vínculo Espiritual'
);

-- Skills de combate élite (Nivel 8)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    8 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Tormenta de Acero', 'Furia Imparable', 'Golpe Ejecutor', 'Tiempo Dilatado'
);

-- Skills legendarias (Nivel 12)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    12 as min_level,
    json_build_object(
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN (
    'Avatar de Guerra', 'Corte Dimensional', 'Phoenix Renacido', 'Maestro del Tiempo'
);

-- ==========================================
-- PASO 3: VERIFICAR LOS RESULTADOS
-- ==========================================

-- Contar las nuevas skills
SELECT 
    'Skills insertadas' as tabla,
    COUNT(*) as cantidad
FROM skills 
WHERE name IN (
    'Golpe Certero', 'Contraataque Veloz', 'Bloqueo Perfecto', 'Esquiva Sombría',
    'Grito de Guerra', 'Intimidación', 'Concentración Mental', 'Adrenalina',
    'Combo Devastador', 'Golpe Aturdidor', 'Absorción Vital', 'Berserker',
    'Piel de Hierro', 'Regeneración', 'Escudo Mágico', 'Segunda Oportunidad',
    'Velocidad Sobrenatural', 'Maestría con Armas', 'Mente Táctica', 'Fortuna del Guerrero',
    'Tormenta de Acero', 'Furia Imparable', 'Golpe Ejecutor', 'Tiempo Dilatado',
    'Rayo Cegador', 'Curación Divina', 'Barrera Arcana', 'Drenar Energía',
    'Avatar de Guerra', 'Corte Dimensional', 'Phoenix Renacido', 'Maestro del Tiempo',
    'Aura Inspiradora', 'Bendición del Anciano', 'Maldición del Necromante', 'Vínculo Espiritual'
)

UNION ALL

-- Contar las nuevas gratifications
SELECT 
    'Gratifications insertadas' as tabla,
    COUNT(*) as cantidad
FROM gratifications 
WHERE type = 'skill' 
AND name IN (
    'Golpe Certero', 'Contraataque Veloz', 'Bloqueo Perfecto', 'Esquiva Sombría',
    'Grito de Guerra', 'Intimidación', 'Concentración Mental', 'Adrenalina',
    'Combo Devastador', 'Golpe Aturdidor', 'Absorción Vital', 'Berserker',
    'Piel de Hierro', 'Regeneración', 'Escudo Mágico', 'Segunda Oportunidad',
    'Velocidad Sobrenatural', 'Maestría con Armas', 'Mente Táctica', 'Fortuna del Guerrero',
    'Tormenta de Acero', 'Furia Imparable', 'Golpe Ejecutor', 'Tiempo Dilatado',
    'Rayo Cegador', 'Curación Divina', 'Barrera Arcana', 'Drenar Energía',
    'Avatar de Guerra', 'Corte Dimensional', 'Phoenix Renacido', 'Maestro del Tiempo',
    'Aura Inspiradora', 'Bendición del Anciano', 'Maldición del Necromante', 'Vínculo Espiritual'
);

-- Ver distribución por nivel mínimo
SELECT 
    min_level,
    COUNT(*) as skills_disponibles
FROM gratifications 
WHERE type = 'skill'
GROUP BY min_level 
ORDER BY min_level;

-- Mostrar algunas skills de ejemplo
SELECT 
    g.name,
    g.type,
    g.min_level,
    g.value_json->>'is_passive' as es_pasiva,
    g.value_json->>'power_value' as poder
FROM gratifications g
WHERE g.type = 'skill' 
AND g.name IN ('Golpe Certero', 'Berserker', 'Avatar de Guerra', 'Piel de Hierro')
ORDER BY g.min_level;
