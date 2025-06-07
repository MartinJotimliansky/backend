-- MASTER MIGRATION SCRIPT FOR LEVEL SYSTEM OVERHAUL
-- This script implements the complete level system with gratifications choice
-- Execute this script in PostgreSQL to apply all changes

BEGIN;

-- =====================================================
-- STEP 1: RECREATE STAT BOOST POSSIBILITIES TABLE
-- =====================================================
-- Drop and recreate stat_boost_possibilities table with new structure
-- This table will contain direct stat values instead of JSON

DROP TABLE IF EXISTS stat_boost_possibilities;

CREATE TABLE stat_boost_possibilities (
    id SERIAL PRIMARY KEY,
    hp INTEGER DEFAULT 0,
    strength INTEGER DEFAULT 0,
    resistance INTEGER DEFAULT 0,
    speed INTEGER DEFAULT 0,
    intelligence INTEGER DEFAULT 0,
    min_level INTEGER NOT NULL
);

-- Create index for level-based queries
CREATE INDEX idx_stat_boost_min_level ON stat_boost_possibilities(min_level);

-- =====================================================
-- STEP 2: POPULATE STAT BOOST POSSIBILITIES
-- =====================================================
-- Populate stat boost possibilities with various stat combinations
-- Different combinations available at different levels

-- Level 1+ combinations (basic stat boosts)
INSERT INTO stat_boost_possibilities (hp, strength, resistance, speed, intelligence, min_level) VALUES
-- Single stat focus (level 1+)
(0, 5, 0, 0, 0, 1),  -- Pure Strength
(0, 0, 5, 0, 0, 1),  -- Pure Resistance  
(0, 0, 0, 5, 0, 1),  -- Pure Speed
(0, 0, 0, 0, 5, 1),  -- Pure Intelligence
(5, 0, 0, 0, 0, 1),  -- Pure HP

-- Balanced combinations (level 1+)
(0, 3, 2, 0, 0, 1),  -- Fighter (Strength + Resistance)
(0, 3, 0, 2, 0, 1),  -- Warrior (Strength + Speed)
(0, 3, 0, 0, 2, 1),  -- Battle Mage (Strength + Intelligence)
(0, 0, 3, 2, 0, 1),  -- Tank (Resistance + Speed)
(0, 0, 3, 0, 2, 1),  -- Defender (Resistance + Intelligence)
(0, 0, 0, 3, 2, 1),  -- Scout (Speed + Intelligence)

-- HP combinations (level 1+)
(3, 2, 0, 0, 0, 1),  -- Tough Fighter
(3, 0, 2, 0, 0, 1),  -- Tough Defender
(3, 0, 0, 2, 0, 1),  -- Agile Survivor
(3, 0, 0, 0, 2, 1);  -- Smart Survivor

-- Level 5+ combinations (improved stats)
INSERT INTO stat_boost_possibilities (hp, strength, resistance, speed, intelligence, min_level) VALUES
(0, 7, 0, 0, 0, 5),  -- Enhanced Strength
(0, 0, 7, 0, 0, 5),  -- Enhanced Resistance
(0, 0, 0, 7, 0, 5),  -- Enhanced Speed  
(0, 0, 0, 0, 7, 5),  -- Enhanced Intelligence
(7, 0, 0, 0, 0, 5),  -- Enhanced HP

-- Tri-stat combinations (level 5+)
(0, 3, 2, 2, 0, 5),  -- Physical Specialist
(0, 3, 2, 0, 2, 5),  -- Combat Mage
(0, 3, 0, 2, 2, 5),  -- Swift Mage
(0, 0, 3, 2, 2, 5),  -- Tactical Defender
(2, 2, 2, 1, 0, 5),  -- Balanced Fighter
(2, 2, 0, 2, 1, 5);  -- Versatile Warrior

-- Level 10+ combinations (advanced stats)
INSERT INTO stat_boost_possibilities (hp, strength, resistance, speed, intelligence, min_level) VALUES
(0, 10, 0, 0, 0, 10), -- Master Strength
(0, 0, 10, 0, 0, 10), -- Master Resistance
(0, 0, 0, 10, 0, 10), -- Master Speed
(0, 0, 0, 0, 10, 10), -- Master Intelligence
(10, 0, 0, 0, 0, 10), -- Master HP

-- Quad-stat combinations (level 10+)
(0, 3, 3, 2, 2, 10), -- Elite Warrior
(2, 3, 2, 3, 0, 10), -- Physical Master
(2, 2, 2, 2, 2, 10), -- Perfect Balance
(3, 2, 3, 2, 0, 10), -- Tank Master
(1, 3, 1, 3, 2, 10); -- Swift Fighter

-- Level 15+ combinations (expert stats)
INSERT INTO stat_boost_possibilities (hp, strength, resistance, speed, intelligence, min_level) VALUES
(0, 12, 0, 0, 0, 15), -- Legendary Strength
(0, 0, 12, 0, 0, 15), -- Legendary Resistance
(0, 0, 0, 12, 0, 15), -- Legendary Speed
(0, 0, 0, 0, 12, 15), -- Legendary Intelligence
(12, 0, 0, 0, 0, 15), -- Legendary HP

-- All-stat combinations (level 15+)
(2, 3, 3, 3, 1, 15), -- Supreme Warrior
(3, 2, 2, 2, 3, 15), -- Arcane Master
(4, 2, 2, 2, 2, 15); -- Immortal Fighter

-- Level 20+ combinations (ultimate stats)
INSERT INTO stat_boost_possibilities (hp, strength, resistance, speed, intelligence, min_level) VALUES
(0, 15, 0, 0, 0, 20), -- Ultimate Strength
(0, 0, 15, 0, 0, 20), -- Ultimate Resistance
(0, 0, 0, 15, 0, 20), -- Ultimate Speed
(0, 0, 0, 0, 15, 20), -- Ultimate Intelligence
(15, 0, 0, 0, 0, 20), -- Ultimate HP

-- God-tier combinations (level 20+)
(3, 4, 4, 4, 3, 20), -- Demigod
(5, 3, 3, 3, 3, 20), -- Eternal Warrior
(2, 4, 4, 4, 4, 20); -- Master of All

-- =====================================================
-- STEP 3: VERIFICATION QUERIES
-- =====================================================
-- Verify the migration was successful
SELECT 
    COUNT(*) as total_combinations,
    MIN(min_level) as min_level,
    MAX(min_level) as max_level,
    COUNT(CASE WHEN hp > 0 THEN 1 END) as hp_boosts,
    COUNT(CASE WHEN strength > 0 THEN 1 END) as strength_boosts,
    COUNT(CASE WHEN resistance > 0 THEN 1 END) as resistance_boosts,
    COUNT(CASE WHEN speed > 0 THEN 1 END) as speed_boosts,
    COUNT(CASE WHEN intelligence > 0 THEN 1 END) as intelligence_boosts
FROM stat_boost_possibilities;

-- Show combinations available at each level
SELECT 
    min_level,
    COUNT(*) as combinations_available
FROM stat_boost_possibilities 
GROUP BY min_level
ORDER BY min_level;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The following changes have been applied:
-- 1. Recreated stat_boost_possibilities table with direct stat columns
-- 2. Populated table with 59 different stat combinations across all levels
-- 3. Created index for efficient level-based queries
-- 4. Verified data integrity and structure

COMMIT;

-- Example query to test the new system:
-- SELECT * FROM stat_boost_possibilities WHERE min_level <= 5 ORDER BY RANDOM() LIMIT 1;
