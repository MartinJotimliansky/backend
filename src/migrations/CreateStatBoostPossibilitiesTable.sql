-- Create stat_boost_possibilities table
-- This table defines the available stat boost combinations by level ranges

CREATE TABLE IF NOT EXISTS stat_boost_possibilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    min_level INTEGER NOT NULL,
    max_level INTEGER NOT NULL,
    stat_values JSON NOT NULL, -- JSON object with stat boosts: {"strength": 5, "agility": 5}
    total_points INTEGER NOT NULL, -- Sum of all stat points
    stats_count INTEGER NOT NULL -- Number of different stats affected
);

-- Create index for efficient level-based queries
CREATE INDEX IF NOT EXISTS idx_stat_boost_level_range 
ON stat_boost_possibilities(min_level, max_level);

-- Create index for stats count queries
CREATE INDEX IF NOT EXISTS idx_stat_boost_stats_count 
ON stat_boost_possibilities(stats_count);
