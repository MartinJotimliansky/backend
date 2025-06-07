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
