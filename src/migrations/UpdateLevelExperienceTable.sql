-- Migración para optimizar la tabla level_experiences
-- Eliminar la columna id redundante y usar level como primary key

-- Paso 1: Crear tabla temporal con la nueva estructura
CREATE TABLE level_experiences_new (
    level INT PRIMARY KEY,
    experience INT NOT NULL
);

-- Paso 2: Migrar datos existentes (usando level como nueva clave primaria)
INSERT INTO level_experiences_new (level, experience)
SELECT level, experience FROM level_experiences;

-- Paso 3: Eliminar tabla antigua
DROP TABLE level_experiences;

-- Paso 4: Renombrar tabla nueva
ALTER TABLE level_experiences_new RENAME TO level_experiences;

-- Opcional: Agregar índice en experience si necesitas consultas por experiencia
CREATE INDEX idx_level_experiences_experience ON level_experiences(experience);
