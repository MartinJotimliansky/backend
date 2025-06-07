-- Populate stat boost possibilities with level-scaled combinations
-- Levels 1-9: 2 stats (5 points each)
-- Levels 10-19: 3 stats (5 points each) 
-- Levels 20+: 4 stats (5 points each)

-- Clear existing data
DELETE FROM stat_boost_possibilities;

-- LEVEL 1-9: 2 STATS COMBINATIONS (6 total combinations)
-- Strength + Agility
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Warrior''s Balance', 1, 9, '{"strength": 5, "agility": 5}', 10, 2);

-- Strength + Intellect  
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Battle Mage', 1, 9, '{"strength": 5, "intellect": 5}', 10, 2);

-- Strength + Endurance
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Berserker''s Might', 1, 9, '{"strength": 5, "endurance": 5}', 10, 2);

-- Agility + Intellect
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Swift Mind', 1, 9, '{"agility": 5, "intellect": 5}', 10, 2);

-- Agility + Endurance
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Nimble Survivor', 1, 9, '{"agility": 5, "endurance": 5}', 10, 2);

-- Intellect + Endurance
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Scholar''s Fortitude', 1, 9, '{"intellect": 5, "endurance": 5}', 10, 2);

-- LEVEL 10-19: 3 STATS COMBINATIONS (4 total combinations)
-- Strength + Agility + Intellect
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Versatile Warrior', 10, 19, '{"strength": 5, "agility": 5, "intellect": 5}', 15, 3);

-- Strength + Agility + Endurance
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Combat Specialist', 10, 19, '{"strength": 5, "agility": 5, "endurance": 5}', 15, 3);

-- Strength + Intellect + Endurance
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Arcane Guardian', 10, 19, '{"strength": 5, "intellect": 5, "endurance": 5}', 15, 3);

-- Agility + Intellect + Endurance
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Tactical Survivor', 10, 19, '{"agility": 5, "intellect": 5, "endurance": 5}', 15, 3);

-- LEVEL 20+: 4 STATS COMBINATION (1 combination - all stats)
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Master of All', 20, 999, '{"strength": 5, "agility": 5, "intellect": 5, "endurance": 5}', 20, 4);

-- Alternative 4-stat combinations for variety at high levels
INSERT INTO stat_boost_possibilities (name, min_level, max_level, stat_values, total_points, stats_count) VALUES
('Physical Dominance', 20, 999, '{"strength": 8, "agility": 7, "intellect": 3, "endurance": 7}', 25, 4),
('Mental Superiority', 20, 999, '{"strength": 3, "agility": 7, "intellect": 8, "endurance": 7}', 25, 4),
('Ultimate Balance', 20, 999, '{"strength": 6, "agility": 6, "intellect": 6, "endurance": 6}', 24, 4);
