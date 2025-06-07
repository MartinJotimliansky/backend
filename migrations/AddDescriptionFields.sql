-- Add description fields to skills and weapons tables
-- This migration adds description fields to improve UI tooltips

-- Add description field to skills table
ALTER TABLE skills ADD COLUMN description TEXT;

-- Add description field to weapons table  
ALTER TABLE weapons ADD COLUMN description TEXT;

-- Update skills with descriptions based on their effects
UPDATE skills SET description = CASE 
    WHEN name = 'Golpe Certero' THEN 'Aumenta la precisión de tus ataques en un 25% y causa 15 puntos de daño extra'
    WHEN name = 'Contraataque Veloz' THEN 'Al recibir un ataque, tienes 20% de probabilidad de contraatacar con 150% de velocidad'
    WHEN name = 'Bloqueo Perfecto' THEN 'Aumenta tu fuerza en 40% al bloquear y tienes 15% más probabilidad de bloquear ataques'
    WHEN name = 'Esquiva Sombría' THEN 'Aumenta tu agilidad en 35% y tienes 20% de probabilidad de esquivar ataques'
    WHEN name = 'Grito de Guerra' THEN 'Al inicio del combate, aumenta tu daño en 25% y reduce la resistencia del enemigo en 20%'
    WHEN name = 'Intimidación' THEN 'Al inicio del combate, debilita al enemigo reduciendo su defensa en 30% y causando miedo'
    WHEN name = 'Concentración Mental' THEN 'Aumenta tu eficiencia de maná en 25% y potencia tus habilidades mágicas en 30%'
    WHEN name = 'Piel de Hierro' THEN 'Aumenta tu resistencia en 25% y reduce el daño recibido de ataques físicos'
    WHEN name = 'Regeneración' THEN 'Regenera 20 puntos de vida por turno y aumenta tu resistencia en 15%'
    WHEN name = 'Escudo Mágico' THEN 'Reduce el daño mágico recibido en 100% y aumenta tu inteligencia en 15%'
    WHEN name = 'Maestría Marcial' THEN 'Aumenta el daño base de tus armas en 20% y mejora tu dominio de armas'
    WHEN name = 'Mente Táctica' THEN 'Aumenta tu eficiencia de turno en 20% y proporciona bonificaciones tácticas en combate'
    WHEN name = 'Absorción Vital' THEN 'Regenera 35 puntos de vida al causar daño y tiene 10% de probabilidad de drenar vida'
    WHEN name = 'Combo Devastador' THEN 'Al acertar un golpe crítico, tienes 30% de probabilidad de realizar un ataque extra'
    WHEN name = 'Adrenalina' THEN 'Aumenta tu velocidad en 35% y causa 40 puntos de daño extra cuando tu vida está baja'
    WHEN name = 'Golpe Aturdidor' THEN 'Tus ataques tienen 30% de probabilidad de aturdir al enemigo y causar debilidad'
    WHEN name = 'Rayo Cegador' THEN 'Lanza un rayo que ciega al enemigo en 45% y causa 90 puntos de daño mágico'
    WHEN name = 'Curación Divina' THEN 'Restaura completamente tu vida con 100% de probabilidad de curación total'
    WHEN name = 'Barrera Arcana' THEN 'Crea un escudo mágico que refleja 150 puntos de daño y devuelve 2 puntos por daño bloqueado'
    WHEN name = 'Drenar Energía' THEN 'Drena 25 puntos de vida del enemigo y reduce sus estadísticas en 15%'
    WHEN name = 'Fortuna del Guerrero' THEN 'Aumenta tu probabilidad de golpe crítico en 20% y otorga bonificaciones de combate'
    WHEN name = 'Berserker Salvaje' THEN 'Drena 20 puntos de tu vida pero aumenta tu daño en 30% y velocidad de ataque'
    WHEN name = 'Tormenta de Acero' THEN 'Realiza múltiples ataques con 30% de efectividad cada uno'
    WHEN name = 'Segunda Oportunidad' THEN 'Al morir, tienes 100% de probabilidad de revivir con curación completa'
    WHEN name = 'Furia Imparable' THEN 'Aumenta tu daño en 60% pero reduces tu inmunidad al aturdimiento'
    WHEN name = 'Velocidad Sobrenatural' THEN 'Aumenta tu velocidad en 40% y mejora tu capacidad de evasión'
    WHEN name = 'Phoenix Renacido' THEN 'Al recibir daño mortal, renaces con 30% de aura y curación completa'
    WHEN name = 'Maestro del Tiempo' THEN 'Controla el tiempo del combate, aumentando tu eficiencia y ralentizando enemigos'
    WHEN name = 'Señor de la Guerra' THEN 'Domina el campo de batalla con 50% más daño y maestría en armas'
    WHEN name = 'Dios de la Tormenta' THEN 'Controla los elementos con 25% de aura de quemadura y control temporal divino'
    WHEN name = 'Alma Inmortal' THEN 'Alcanza la inmortalidad temporal, siendo inmune a efectos de estado negativos'
    ELSE 'Habilidad especial que otorga ventajas únicas en combate'
END;

-- Update weapons with descriptions
UPDATE weapons SET description = CASE 
    WHEN name = 'Espada Básica' THEN 'Una espada simple pero confiable. Daño: 10, Velocidad: 5'
    WHEN name = 'Hacha de Guerra' THEN 'Hacha pesada que causa gran daño. Daño: 15, Velocidad: 3'
    WHEN name = 'Daga Rápida' THEN 'Arma ligera y veloz para ataques rápidos. Daño: 8, Velocidad: 8'
    WHEN name = 'Martillo Pesado' THEN 'Martillo devastador de dos manos. Daño: 18, Velocidad: 2'
    WHEN name = 'Arco Élfico' THEN 'Arco de precisión para ataques a distancia. Daño: 12, Velocidad: 6'
    WHEN name = 'Bastón Mágico' THEN 'Bastón que amplifica el poder mágico. Daño: 6, Velocidad: 4, +Magia'
    WHEN name = 'Katana' THEN 'Espada ceremonial de gran precisión. Daño: 14, Velocidad: 7'
    WHEN name = 'Lanza' THEN 'Arma de alcance medio con buen equilibrio. Daño: 11, Velocidad: 5'
    WHEN name = 'Maza' THEN 'Arma contundente efectiva contra armaduras. Daño: 13, Velocidad: 4'
    WHEN name = 'Puñales Gemelos' THEN 'Par de dagas para combate dual. Daño: 7x2, Velocidad: 9'
    ELSE CONCAT('Arma con ', damage, ' de daño y ', speed, ' de velocidad')
END;

-- Verify the updates
SELECT 'Skills with descriptions:' as info;
SELECT name, description FROM skills WHERE description IS NOT NULL LIMIT 5;

SELECT 'Weapons with descriptions:' as info;  
SELECT name, description FROM weapons WHERE description IS NOT NULL LIMIT 5;
