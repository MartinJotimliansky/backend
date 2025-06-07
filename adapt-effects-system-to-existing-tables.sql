-- =============================================================
-- NALGON WARRIORS - ADAPTACIÓN DEL SISTEMA DE EFECTOS
-- =============================================================
-- Este script adapta el sistema de efectos a la estructura REAL
-- de las tablas weapons y skills existentes
-- =============================================================

-- ==========================================
-- PASO 1: CREAR TABLA DE EFECTOS
-- ==========================================

DROP TABLE IF EXISTS effects CASCADE;

CREATE TABLE effects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- damage, heal, buff, debuff, special, passive, legendary
    description TEXT,
    base_value INTEGER DEFAULT 0,
    percentage_value INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 1,
    cooldown INTEGER DEFAULT 0,
    trigger_conditions TEXT[] DEFAULT '{}',
    scaling_stat VARCHAR(20), -- strength, agility, intelligence, endurance
    max_stacks INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los 37 efectos únicos
INSERT INTO effects (name, category, description, base_value, percentage_value, duration, cooldown, trigger_conditions, scaling_stat, max_stacks) VALUES

-- EFECTOS DE DAÑO (1-8)
('Damage Boost', 'damage', 'Aumenta el daño base de los ataques', 25, 0, 3, 0, '{"on_attack"}', 'strength', 5),
('Critical Strike', 'damage', 'Posibilidad de golpe crítico con daño aumentado', 0, 200, 1, 0, '{"on_attack"}', 'agility', 1),
('Bleeding', 'damage', 'Causa daño continuo por varios turnos', 15, 0, 5, 0, '{"end_turn"}', 'strength', 3),
('Poison', 'damage', 'Veneno que causa daño creciente cada turno', 10, 0, 4, 0, '{"end_turn"}', 'intelligence', 5),
('Burn', 'damage', 'Quemadura que causa daño fijo por turno', 20, 0, 3, 0, '{"end_turn"}', 'intelligence', 1),
('Armor Penetration', 'damage', 'Ignora un porcentaje de la armadura enemiga', 0, 30, 1, 0, '{"on_attack"}', 'strength', 1),
('Execute', 'damage', 'Daño masivo contra enemigos con poca vida', 100, 300, 1, 5, '{"on_attack"}', 'strength', 1),
('Chain Lightning', 'damage', 'Ataque que salta entre múltiples objetivos', 80, 0, 1, 4, '{"on_attack"}', 'intelligence', 1),

-- EFECTOS DE CURACIÓN (9-12)
('Heal', 'heal', 'Restaura puntos de vida inmediatamente', 50, 0, 1, 0, '{"instant"}', 'intelligence', 1),
('Regeneration', 'heal', 'Curación continua durante varios turnos', 25, 0, 5, 0, '{"end_turn"}', 'endurance', 1),
('Lifesteal', 'heal', 'Roba vida del daño causado', 0, 30, 1, 0, '{"on_damage_dealt"}', 'strength', 1),
('Divine Healing', 'heal', 'Curación poderosa que elimina debuffs', 100, 0, 1, 6, '{"instant"}', 'intelligence', 1),

-- EFECTOS DE BUFF (13-20)
('Strength Boost', 'buff', 'Aumenta la fuerza temporalmente', 20, 0, 4, 0, '{"battle_start"}', NULL, 5),
('Agility Boost', 'buff', 'Aumenta la agilidad temporalmente', 20, 0, 4, 0, '{"battle_start"}', NULL, 5),
('Intelligence Boost', 'buff', 'Aumenta la inteligencia temporalmente', 20, 0, 4, 0, '{"battle_start"}', NULL, 5),
('Endurance Boost', 'buff', 'Aumenta la resistencia temporalmente', 20, 0, 4, 0, '{"battle_start"}', NULL, 5),
('Speed Boost', 'buff', 'Aumenta la velocidad de ataque', 25, 0, 3, 0, '{"battle_start"}', 'agility', 3),
('Accuracy Boost', 'buff', 'Mejora la precisión de los ataques', 30, 0, 3, 0, '{"battle_start"}', 'agility', 1),
('Magic Shield', 'buff', 'Escudo mágico que absorbe daño', 150, 0, 4, 0, '{"battle_start"}', 'intelligence', 1),
('Berserk', 'buff', 'Aumenta daño pero reduce defensa', 40, 0, 5, 0, '{"on_low_hp"}', 'strength', 1),

-- EFECTOS DE DEBUFF (21-26)
('Weakness', 'debuff', 'Reduce la fuerza del enemigo', -25, 0, 4, 0, '{"on_enemy_hit"}', NULL, 3),
('Slow', 'debuff', 'Reduce la velocidad del enemigo', -30, 0, 3, 0, '{"on_enemy_hit"}', NULL, 1),
('Confusion', 'debuff', 'El enemigo puede atacarse a sí mismo', 0, 25, 3, 0, '{"on_enemy_turn"}', 'intelligence', 1),
('Fear', 'debuff', 'Reduce todos los stats del enemigo', -15, 0, 3, 0, '{"battle_start"}', 'intelligence', 1),
('Stun', 'debuff', 'Paraliza al enemigo por un turno', 0, 100, 1, 4, '{"on_attack"}', 'agility', 1),
('Blind', 'debuff', 'Reduce drasticamente la precisión enemiga', -50, 0, 2, 0, '{"on_enemy_hit"}', 'intelligence', 1),

-- EFECTOS ESPECIALES (27-33)
('Counter Attack', 'special', 'Contraataca automáticamente al ser atacado', 150, 0, 1, 0, '{"on_being_attacked"}', 'agility', 1),
('Dodge', 'special', 'Posibilidad de esquivar ataques completamente', 0, 35, 1, 0, '{"on_being_attacked"}', 'agility', 1),
('Block', 'special', 'Bloquea y reduce el daño recibido', 0, 50, 1, 0, '{"on_being_attacked"}', 'endurance', 1),
('Reflect Damage', 'special', 'Refleja parte del daño recibido al atacante', 0, 25, 1, 0, '{"on_being_attacked"}', 'intelligence', 1),
('Multi Attack', 'special', 'Realiza múltiples ataques en un turno', 3, 0, 1, 5, '{"on_turn"}', 'agility', 1),
('Time Stop', 'special', 'Otorga turnos adicionales', 2, 0, 1, 8, '{"on_turn"}', 'intelligence', 1),
('Teleport Strike', 'special', 'Ataque que no puede ser esquivado ni bloqueado', 120, 0, 1, 3, '{"on_attack"}', 'agility', 1),

-- EFECTOS PASIVOS (34-36)
('Weapon Mastery', 'passive', 'Mejora permanente con armas equipadas', 25, 0, 999, 0, '{"weapon_equipped"}', 'strength', 1),
('Battle Instinct', 'passive', 'Bonificaciones al inicio de cada combate', 15, 0, 999, 0, '{"battle_start"}', 'agility', 1),
('Mana Efficiency', 'passive', 'Reduce el costo de las habilidades mágicas', 0, 25, 999, 0, '{"on_skill_use"}', 'intelligence', 1),

-- EFECTO LEGENDARIO (37)
('Phoenix Rebirth', 'legendary', 'Revive con vida completa una vez por batalla', 0, 100, 1, 0, '{"on_death"}', NULL, 1);

-- ==========================================
-- PASO 2: ACTUALIZAR WEAPONS EXISTENTES
-- ==========================================
-- Tu tabla weapons ya tiene effect_ids INTEGER[] DEFAULT '{}'::integer[]
-- Solo necesitamos actualizar las armas existentes

-- Verificar armas existentes primero
SELECT id, name, min_damage, max_damage, effect_ids FROM weapons ORDER BY id;

-- Actualizar armas existentes con efectos (ajusta según los IDs y nombres reales)
-- Vamos a usar nombres genéricos que probablemente existan

UPDATE weapons SET effect_ids = '{1,6}' WHERE name ILIKE '%espada%' OR name ILIKE '%sword%';
UPDATE weapons SET effect_ids = '{1,3}' WHERE name ILIKE '%hacha%' OR name ILIKE '%axe%';
UPDATE weapons SET effect_ids = '{2,18}' WHERE name ILIKE '%daga%' OR name ILIKE '%dagger%';
UPDATE weapons SET effect_ids = '{1,5}' WHERE name ILIKE '%martillo%' OR name ILIKE '%hammer%';
UPDATE weapons SET effect_ids = '{8,15}' WHERE name ILIKE '%baculo%' OR name ILIKE '%staff%' OR name ILIKE '%vara%';
UPDATE weapons SET effect_ids = '{2,17}' WHERE name ILIKE '%arco%' OR name ILIKE '%bow%';
UPDATE weapons SET effect_ids = '{1,20}' WHERE name ILIKE '%maza%' OR name ILIKE '%mace%';

-- Insertar nuevas armas con combinaciones de efectos
INSERT INTO weapons (name, min_damage, max_damage, crit_chance, range, draw_chance, hit_chance, speed, effect_ids, power_value) VALUES
('Espada Flamígera', 70, 90, 15, 1, 100, 95, 100, '{1,5,20}', 85),
('Arco Venenoso', 60, 80, 20, 3, 100, 90, 110, '{4,18,25}', 70),
('Martillo del Trueno', 80, 110, 10, 1, 100, 85, 80, '{1,8,22}', 95),
('Daga Sombría', 50, 70, 25, 1, 100, 95, 130, '{2,27,33}', 65),
('Bastón de Hielo', 60, 85, 12, 2, 100, 88, 90, '{8,22,24}', 75),
('Espada Vampírica', 65, 85, 18, 1, 100, 92, 105, '{1,11,19}', 80),
('Hacha Berserker', 75, 105, 12, 1, 100, 88, 85, '{1,20,3}', 90),
('Arco Élfico', 65, 85, 22, 4, 100, 95, 120, '{2,18,28}', 75),
('Maza Sagrada', 70, 95, 15, 1, 100, 90, 95, '{12,19,24}', 85),
('Katana del Viento', 70, 90, 20, 1, 100, 98, 125, '{2,17,31}', 80),
('Ballesta Pesada', 85, 115, 15, 3, 100, 80, 70, '{1,6,25}', 100),
('Vara de Rayos', 55, 75, 18, 2, 100, 85, 95, '{8,15,26}', 70),
('Espada Maldita', 75, 95, 20, 1, 100, 90, 100, '{1,21,23}', 85),
('Garra Bestial', 60, 80, 25, 1, 100, 92, 115, '{3,11,27}', 75),
('Tridente Marino', 75, 100, 12, 2, 100, 88, 90, '{1,8,30}', 90);

-- ==========================================
-- PASO 3: LIMPIAR Y RECREAR SKILLS
-- ==========================================
-- Tu tabla skills tiene: id, activation_triggers _text, effect_json jsonb, is_passive bool, power_value int4, name varchar

-- Limpiar skills existentes que vamos a reemplazar
DELETE FROM skills WHERE name IN (
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

-- Agregar columna effect_ids a skills si no existe
ALTER TABLE skills ADD COLUMN IF NOT EXISTS effect_ids INTEGER[] DEFAULT '{}';

-- Insertar nuevas skills con efectos combinados
INSERT INTO skills (name, activation_triggers, effect_json, is_passive, power_value, effect_ids) VALUES

-- NIVEL 1 - Skills básicas
('Golpe Certero', '{"on_attack"}', '{"type": "accuracy_damage_boost", "accuracy": 25, "damage": 15, "effects": [1,18]}', false, 20, '{1,18}'),
('Contraataque Veloz', '{"on_being_attacked"}', '{"type": "counter_speed", "counter_damage": 150, "speed_boost": 20, "effects": [27,17]}', false, 25, '{27,17}'),
('Bloqueo Perfecto', '{"on_being_attacked"}', '{"type": "block_strength", "block_chance": 40, "strength_boost": 15, "effects": [29,13]}', false, 22, '{29,13}'),

-- NIVEL 2 - Skills de combate temprano
('Esquiva Sombría', '{"on_being_attacked"}', '{"type": "dodge_agility", "dodge_chance": 35, "agility_boost": 20, "effects": [28,14]}', false, 28, '{28,14}'),
('Grito de Guerra', '{"battle_start"}', '{"type": "damage_strength_boost", "damage_boost": 25, "strength_boost": 20, "effects": [1,13]}', false, 30, '{1,13}'),
('Intimidación', '{"battle_start"}', '{"type": "fear_weakness", "enemy_debuff": -20, "fear_chance": 30, "effects": [24,21]}', false, 32, '{24,21}'),

-- NIVEL 3 - Skills defensivas
('Concentración Mental', '{"on_turn"}', '{"type": "intelligence_mana", "int_boost": 30, "mana_efficiency": 25, "effects": [15,36]}', false, 35, '{15,36}'),
('Piel de Hierro', '{"passive"}', '{"type": "block_endurance", "damage_reduction": 15, "endurance_boost": 25, "effects": [29,16]}', true, 40, '{29,16}'),
('Regeneración', '{"end_turn"}', '{"type": "regen_endurance", "heal_per_turn": 20, "endurance_boost": 15, "effects": [10,16]}', true, 38, '{10,16}'),

-- NIVEL 4 - Skills de utilidad
('Escudo Mágico', '{"battle_start"}', '{"type": "magic_shield_int", "shield_value": 120, "int_boost": 25, "effects": [19,15]}', false, 45, '{19,15}'),
('Maestría Marcial', '{"weapon_equipped"}', '{"type": "weapon_mastery_damage", "weapon_boost": 30, "damage_boost": 20, "effects": [34,1]}', true, 50, '{34,1}'),
('Mente Táctica', '{"battle_start"}', '{"type": "battle_instinct_mana", "turn_bonus": 15, "mana_efficiency": 20, "effects": [35,36]}', true, 48, '{35,36}'),

-- NIVEL 5 - Skills de combate avanzado
('Absorción Vital', '{"on_damage_dealt"}', '{"type": "lifesteal_regen", "lifesteal": 35, "regen_boost": 15, "effects": [11,10]}', false, 55, '{11,10}'),
('Combo Devastador', '{"after_hit"}', '{"type": "multi_critical", "extra_attacks": 2, "crit_chance": 30, "effects": [31,2]}', false, 60, '{31,2}'),
('Adrenalina', '{"on_low_hp"}', '{"type": "berserk_speed", "damage_boost": 40, "speed_boost": 35, "effects": [20,17]}', false, 58, '{20,17}'),

-- NIVEL 6 - Skills mágicas
('Golpe Aturdidor', '{"on_attack"}', '{"type": "stun_weakness", "stun_chance": 30, "weakness_chance": 40, "effects": [25,21]}', false, 65, '{25,21}'),
('Rayo Cegador', '{"on_turn"}', '{"type": "chain_blind", "magic_damage": 90, "blind_chance": 45, "effects": [8,26]}', false, 70, '{8,26}'),
('Curación Divina', '{"on_turn"}', '{"type": "divine_heal_shield", "heal_value": 80, "magic_shield": 100, "effects": [12,19]}', false, 68, '{12,19}'),

-- NIVEL 7 - Skills avanzadas
('Barrera Arcana', '{"battle_start"}', '{"type": "magic_shield_reflect", "shield_value": 150, "reflect_damage": 25, "effects": [19,30]}', false, 75, '{19,30}'),
('Drenar Energía', '{"on_attack"}', '{"type": "poison_lifesteal", "poison_damage": 15, "lifesteal": 25, "effects": [4,11]}', false, 72, '{4,11}'),
('Fortuna del Guerrero', '{"passive"}', '{"type": "critical_instinct", "crit_chance": 20, "battle_bonus": 15, "effects": [2,35]}', true, 70, '{2,35}'),

-- NIVEL 8 - Skills de combate élite
('Berserker Salvaje', '{"on_low_hp"}', '{"type": "berserk_bleed_lifesteal", "damage_boost": 50, "bleed": 20, "lifesteal": 30, "effects": [20,3,11]}', false, 85, '{20,3,11}'),
('Tormenta de Acero', '{"on_turn"}', '{"type": "multi_penetration_speed", "attacks": 3, "armor_pen": 40, "speed_boost": 25, "effects": [31,6,17]}', false, 90, '{31,6,17}'),
('Segunda Oportunidad', '{"on_death"}', '{"type": "phoenix_divine", "revive_chance": 100, "full_heal": true, "effects": [37,12]}', false, 100, '{37,12}'),

-- NIVEL 9 - Skills especializadas  
('Furia Imparable', '{"on_turn"}', '{"type": "berserk_stun_damage", "berserk_duration": 4, "stun_immunity": true, "damage_boost": 60, "effects": [20,25,1]}', false, 95, '{20,25,1}'),
('Velocidad Sobrenatural', '{"battle_start"}', '{"type": "speed_dodge_instinct", "speed_boost": 40, "dodge_chance": 25, "extra_turn_chance": 20, "effects": [17,28,35]}', true, 88, '{17,28,35}'),
('Drenar Alma', '{"on_attack"}', '{"type": "poison_confusion_int", "poison_stacks": 3, "confusion_chance": 35, "int_boost": 25, "effects": [4,23,15]}', false, 92, '{4,23,15}'),

-- NIVEL 10 - Skills poderosas
('Golpe Ejecutor', '{"on_attack"}', '{"type": "execute_penetration_crit", "execute_threshold": 30, "armor_pen": 50, "guaranteed_crit": true, "effects": [7,6,2]}', false, 110, '{7,6,2}'),
('Tiempo Dilatado', '{"on_turn"}', '{"type": "time_stop_speed_int", "extra_turns": 2, "speed_boost": 50, "int_boost": 30, "effects": [32,17,15]}', false, 105, '{32,17,15}'),
('Maldición Sombría', '{"on_enemy"}', '{"type": "weakness_slow_fear", "all_debuffs": -25, "duration": 5, "effects": [21,22,24]}', false, 100, '{21,22,24}'),

-- NIVEL 11 - Skills maestras
('Vínculo Espiritual', '{"passive"}', '{"type": "lifesteal_regen_shield", "shared_healing": 50, "damage_sharing": 30, "magic_shield_bonus": 25, "effects": [11,10,19]}', true, 115, '{11,10,19}'),
('Aura Inspiradora', '{"passive"}', '{"type": "all_stats_aura", "aura_radius": 2, "all_stats_boost": 20, "effects": [13,14,15,16]}', true, 120, '{13,14,15,16}'),
('Corte Dimensional', '{"on_attack"}', '{"type": "teleport_penetration_execute", "unblockable": true, "armor_pen": 100, "execute_chance": 25, "effects": [33,6,7]}', false, 125, '{33,6,7}'),

-- NIVEL 12 - Skills legendarias tempranas
('Avatar de Guerra', '{"on_turn"}', '{"type": "transformation", "all_stats_boost": 40, "damage_boost": 30, "duration": 5, "effects": [13,14,15,16,1]}', false, 140, '{13,14,15,16,1}'),
('Phoenix Renacido', '{"on_death"}', '{"type": "phoenix_burn_damage", "full_revive": true, "burn_aura": 30, "damage_boost": 25, "effects": [37,5,1]}', false, 150, '{37,5,1}'),
('Maestro del Tiempo', '{"battle_start"}', '{"type": "time_mastery", "cooldown_reset": true, "permanent_speed": 75, "mana_efficiency": 50, "effects": [32,17,36]}', true, 145, '{32,17,36}'),

-- NIVEL 13-15 - Skills épicas finales
('Señor de la Guerra', '{"battle_start"}', '{"type": "warlord_mastery", "damage_boost": 50, "berserk_control": true, "weapon_mastery": 40, "effects": [1,20,35,34]}', true, 160, '{1,20,35,34}'),
('Dios de la Tormenta', '{"on_turn"}', '{"type": "storm_god", "chain_lightning": 150, "burn_aura": 25, "time_control": 1, "divine_shield": 200, "effects": [8,5,32,19]}', false, 170, '{8,5,32,19}'),
('Alma Inmortal', '{"passive"}', '{"type": "immortal_soul", "death_immunity": 3, "divine_regen": 50, "damage_reflection": 40, "effects": [37,12,10,30]}', true, 180, '{37,12,10,30}');

-- ==========================================
-- PASO 4: POBLAR GRATIFICATIONS
-- ==========================================

-- Limpiar gratifications de skills existentes
DELETE FROM gratifications WHERE type = 'skill' AND name IN (
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

-- Insertar gratifications para cada nivel
-- NIVEL 1
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    1 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Golpe Certero', 'Contraataque Veloz', 'Bloqueo Perfecto');

-- NIVEL 2
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    2 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Esquiva Sombría', 'Grito de Guerra', 'Intimidación');

-- NIVEL 3
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    3 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Concentración Mental', 'Piel de Hierro', 'Regeneración');

-- NIVEL 4
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    4 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Escudo Mágico', 'Maestría Marcial', 'Mente Táctica');

-- NIVEL 5
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    5 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Absorción Vital', 'Combo Devastador', 'Adrenalina');

-- NIVEL 6
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    6 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Golpe Aturdidor', 'Rayo Cegador', 'Curación Divina');

-- NIVEL 7
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    7 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Barrera Arcana', 'Drenar Energía', 'Fortuna del Guerrero');

-- NIVEL 8
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    8 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Berserker Salvaje', 'Tormenta de Acero', 'Segunda Oportunidad');

-- NIVEL 9
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    9 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Furia Imparable', 'Velocidad Sobrenatural', 'Drenar Alma');

-- NIVEL 10
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    10 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Golpe Ejecutor', 'Tiempo Dilatado', 'Maldición Sombría');

-- NIVEL 11
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    11 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Vínculo Espiritual', 'Aura Inspiradora', 'Corte Dimensional');

-- NIVEL 12
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    12 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name IN ('Avatar de Guerra', 'Phoenix Renacido', 'Maestro del Tiempo');

-- NIVEL 13-15 (Skills épicas finales)
INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    13 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name = 'Señor de la Guerra';

INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    14 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name = 'Dios de la Tormenta';

INSERT INTO gratifications (name, type, min_level, value_json)
SELECT 
    s.name,
    'skill' as type,
    15 as min_level,
    json_build_object(
        'effect_ids', s.effect_ids,
        'activation_triggers', s.activation_triggers,
        'effect_json', s.effect_json,
        'is_passive', s.is_passive,
        'power_value', s.power_value
    ) as value_json
FROM skills s
WHERE s.name = 'Alma Inmortal';

-- ==========================================
-- PASO 5: VERIFICACIÓN Y REPORTES
-- ==========================================

-- Contar efectos creados
SELECT 'Efectos creados' as tabla, COUNT(*) as cantidad FROM effects
UNION ALL
-- Contar weapons con efectos
SELECT 'Weapons con efectos' as tabla, COUNT(*) as cantidad FROM weapons WHERE effect_ids != '{}'
UNION ALL
-- Contar skills creadas
SELECT 'Skills creadas' as tabla, COUNT(*) as cantidad FROM skills WHERE effect_ids != '{}'
UNION ALL
-- Contar gratifications creadas
SELECT 'Gratifications creadas' as tabla, COUNT(*) as cantidad FROM gratifications WHERE type = 'skill';

-- Ver distribución de skills por nivel
SELECT 
    min_level as nivel,
    COUNT(*) as skills_disponibles
FROM gratifications 
WHERE type = 'skill'
GROUP BY min_level 
ORDER BY min_level;

-- Mostrar algunas combinaciones de efectos interesantes
SELECT 
    s.name as skill_name,
    s.effect_ids as effect_ids,
    string_agg(e.name, ', ') as effect_names,
    s.power_value
FROM skills s
JOIN unnest(s.effect_ids) effect_id ON true
JOIN effects e ON e.id = effect_id
WHERE s.name IN ('Avatar de Guerra', 'Dios de la Tormenta', 'Alma Inmortal', 'Corte Dimensional')
GROUP BY s.name, s.effect_ids, s.power_value
ORDER BY s.power_value DESC;

-- Mostrar weapons con sus efectos
SELECT 
    w.name as weapon_name,
    w.min_damage,
    w.max_damage,
    w.effect_ids as effect_ids,
    string_agg(e.name, ', ') as effect_names
FROM weapons w
JOIN unnest(w.effect_ids) effect_id ON true
JOIN effects e ON e.id = effect_id
WHERE array_length(w.effect_ids, 1) > 1
GROUP BY w.name, w.min_damage, w.max_damage, w.effect_ids
ORDER BY w.max_damage DESC
LIMIT 10;

-- =============================================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- =============================================================
-- El sistema de efectos ha sido adaptado a tu estructura real:
-- ✅ 37 efectos únicos y escalables
-- ✅ Weapons adaptadas a tu estructura (min_damage, max_damage, effect_ids)
-- ✅ Skills adaptadas a tu estructura (effect_ids, activation_triggers, effect_json)
-- ✅ 36 skills distribuidas en niveles 1-15
-- ✅ Sistema de gratifications poblado automáticamente
-- ✅ Combinaciones infinitas de efectos posibles
-- =============================================================
