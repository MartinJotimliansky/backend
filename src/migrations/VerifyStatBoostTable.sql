-- Verify the stat boost table was created and populated correctly
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

-- Show some examples by level
SELECT 
    min_level,
    COUNT(*) as combinations_available,
    ARRAY_AGG(
        CASE 
            WHEN hp > 0 THEN 'HP +' || hp || ' '
            ELSE ''
        END ||
        CASE 
            WHEN strength > 0 THEN 'STR +' || strength || ' '
            ELSE ''
        END ||
        CASE 
            WHEN resistance > 0 THEN 'RES +' || resistance || ' '
            ELSE ''
        END ||
        CASE 
            WHEN speed > 0 THEN 'SPD +' || speed || ' '
            ELSE ''
        END ||
        CASE 
            WHEN intelligence > 0 THEN 'INT +' || intelligence || ' '
            ELSE ''
        END
    ) as example_combinations
FROM stat_boost_possibilities 
GROUP BY min_level
ORDER BY min_level;
